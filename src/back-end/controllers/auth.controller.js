const User = require('../models/User.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passwordValidator = require('password-validator');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Create a reusable password validation schema
const passwordSchema = new passwordValidator();
passwordSchema
    .is().min(8)                                    // Must have at least 8 characters
    .has().uppercase()                              // Must have uppercase letters
    .has().lowercase()                              // Must have lowercase letters
    .has().digits()                                 // Must have digits
    .has().symbols();                               // Must have special characters

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 */
const register = async (req, res) => {
    try {
        const { name, email, password, retypePassword, phone, birthday, gender } = req.body;

        if (!name || !email || !password || !phone) {
            return res.status(400).json({ message: 'Please fill in all required fields.' });
        }

        // Use schema to validate password strength during registration
        if (!passwordSchema.validate(password)) {
            return res.status(400).json({
                message: 'Password is not strong enough.',
                details: 'Password must have at least 8 characters, including uppercase, lowercase, numbers and special characters.'
            });
        }

        if (password !== retypePassword) {
            return res.status(400).json({ message: 'Password confirmation does not match.' });
        }

        const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            return res.status(409).json({ message: 'Email or phone number already exists.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            name,
            email,
            hashedPassword,
            phone,
            birthday,
            gender: gender?.toLowerCase(),
        });

        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
            expiresIn: '1d',
        });

        res.status(201).json({
            message: 'Account registration successful!',
            token: token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
            }
        });

    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ message: 'A server error occurred.' });
    }
};

/**
 * @desc    Customer login
 * @route   POST /api/auth/login
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please enter email and password.' });
        }

        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.hashedPassword))) {
            return res.status(401).json({ message: 'Email or password is incorrect.' });
        }

        // Check if user is a customer (only customers can login through /login)
        if (!user.roles.includes('customer')) {
            return res.status(401).json({ message: 'Email or password is incorrect.' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1d',
        });

        res.status(200).json({
            message: 'Login successful!',
            token: token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                roles: user.roles
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'A server error occurred.' });
    }
};

/**
 * @desc    Staff login
 * @route   POST /api/auth/staff/login
 */
const staffLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please enter email and password.' });
        }

        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.hashedPassword))) {
            return res.status(401).json({ message: 'Email or password is incorrect.' });
        }

        // Check if user has any staff role
        const staffRoles = ['cashier', 'checkincounter', 'branchmanager', 'administrator'];
        const hasStaffRole = user.roles.some(role => staffRoles.includes(role));
        
        if (!hasStaffRole) {
            return res.status(401).json({ message: 'Email or password is incorrect.' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1d',
        });

        res.status(200).json({
            message: 'Login successful!',
            token: token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                roles: user.roles
            }
        });

    } catch (error) {
        console.error('Staff Login Error:', error);
        res.status(500).json({ message: 'A server error occurred.' });
    }
};

/**
 * @desc    User logout
 * @route   POST /api/auth/logout
 */
const logout = (req, res) => {
    res.status(200).json({ message: 'Logout successful.' });
};

/**
 * @desc    Change password
 * @route   POST /api/auth/change-password
 */
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, retypeNewPassword } = req.body;
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.hashedPassword);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect.' });
        }

        // Reuse schema to validate new password strength
        if (!passwordSchema.validate(newPassword)) {
            return res.status(400).json({
                message: 'New password is not strong enough.',
                details: 'Password must have at least 8 characters, including uppercase, lowercase, numbers and special characters.'
            });
        }

        if (newPassword !== retypeNewPassword) {
            return res.status(400).json({ message: 'New password confirmation does not match.' });
        }

        const salt = await bcrypt.genSalt(10);
        user.hashedPassword = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({ message: 'Password changed successfully.' });

    } catch (error) {
        console.error('Change Password Error:', error);
        res.status(500).json({ message: 'A server error occurred.' });
    }
};

/**
 * @desc    Customer forgot password - send reset email
 * @route   POST /api/auth/forgot-password
 */
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            // Don't reveal if user exists or not for security
            return res.status(200).json({ 
                message: 'If the email exists in our system, a password reset link has been sent.' 
            });
        }

        // Check if user is a customer (only customers can use /forgot-password)
        if (!user.roles.includes('customer')) {
            return res.status(200).json({ 
                message: 'If the email exists in our system, a password reset link has been sent.' 
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

        // Save token to user
        user.passwordResetToken = resetToken;
        user.passwordResetExpires = resetTokenExpiry;
        await user.save();

        // Create reset URL
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/confirm?token=${resetToken}`;

        // Email configuration
        const transporter = nodemailer.createTransport({
            service: 'gmail', // or your email service
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const fs = require('fs');
        const path = require('path');
        const templatePath = path.join(__dirname, '../templates/resetPasswordEmail.html');
        let emailHtml = fs.readFileSync(templatePath, 'utf8');
        emailHtml = emailHtml.replace(/\{\{resetUrl\}\}/g, resetUrl);
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset Request - Lumiere Cinema',
            html: emailHtml
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ 
            message: 'If the email exists in our system, a password reset link has been sent.' 
        });

    } catch (error) {
        console.error('Forgot Password Error:', error);
        res.status(500).json({ message: 'A server error occurred.' });
    }
};

/**
 * @desc    Staff forgot password - send reset email
 * @route   POST /api/auth/staff/forgot-password
 */
const staffForgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            // Don't reveal if user exists or not for security
            return res.status(200).json({ 
                message: 'If the email exists in our system, a password reset link has been sent.' 
            });
        }

        // Check if user has any staff role
        const staffRoles = ['cashier', 'checkincounter', 'branchmanager', 'administrator'];
        const hasStaffRole = user.roles.some(role => staffRoles.includes(role));
        
        if (!hasStaffRole) {
            return res.status(200).json({ 
                message: 'If the email exists in our system, a password reset link has been sent.' 
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

        // Save token to user
        user.passwordResetToken = resetToken;
        user.passwordResetExpires = resetTokenExpiry;
        await user.save();

        // Create reset URL for staff
        const resetUrl = `${process.env.FRONTEND_URL}/staff/reset-password/confirm?token=${resetToken}`;

        // Email configuration
        const transporter = nodemailer.createTransport({
            service: 'gmail', // or your email service
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset Request - Lumiere Cinema Staff',
            html: `
                <h2>Staff Password Reset Request</h2>
                <p>You requested a password reset for your Lumiere Cinema staff account.</p>
                <p>Click the link below to reset your password:</p>
                <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ 
            message: 'If the email exists in our system, a password reset link has been sent.' 
        });

    } catch (error) {
        console.error('Staff Forgot Password Error:', error);
        res.status(500).json({ message: 'A server error occurred.' });
    }
};

/**
 * @desc    Reset password with token
 * @route   POST /api/auth/reset-password
 */
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword, retypeNewPassword } = req.body;

        if (!token || !newPassword || !retypeNewPassword) {
            return res.status(400).json({ message: 'Token and passwords are required.' });
        }

        if (newPassword !== retypeNewPassword) {
            return res.status(400).json({ message: 'Passwords do not match.' });
        }

        // Find user with valid token
        const user = await User.findOne({
            passwordResetToken: token,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token.' });
        }

        // Validate new password strength
        if (!passwordSchema.validate(newPassword)) {
            return res.status(400).json({
                message: 'New password is not strong enough.',
                details: 'Password must have at least 8 characters, including uppercase, lowercase, numbers and special characters.'
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.hashedPassword = await bcrypt.hash(newPassword, salt);

        // Clear reset token fields
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        await user.save();

        res.status(200).json({ message: 'Password reset successful.' });

    } catch (error) {
        console.error('Reset Password Error:', error);
        res.status(500).json({ message: 'A server error occurred.' });
    }
};

module.exports = {
    register,
    login,
    staffLogin,
    logout,
    changePassword,
    forgotPassword,
    staffForgotPassword,
    resetPassword,
};
