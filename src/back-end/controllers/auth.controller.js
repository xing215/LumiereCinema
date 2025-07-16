const User = require('../models/User.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passwordValidator = require('password-validator');

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
            gender,
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
 * @desc    User login
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

module.exports = {
    register,
    login,
    logout,
    changePassword,
};
