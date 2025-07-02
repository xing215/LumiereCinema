const User = require('../models/User.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// Import thư viện password-validator
const passwordValidator = require('password-validator');

// Tạo một schema quy tắc cho mật khẩu để tái sử dụng
const passwordSchema = new passwordValidator();
passwordSchema
    .is().min(8)                                    // Phải có ít nhất 8 ký tự
    .has().uppercase()                              // Phải có chữ hoa
    .has().lowercase()                              // Phải có chữ thường
    .has().digits()                                 // Phải có chữ số
    .has().symbols();                               // Phải có ký tự đặc biệt

/**
 * @desc    Đăng ký người dùng mới
 * @route   POST /api/auth/register
 */
const register = async (req, res) => {
    try {
        const { name, email, password, retypePassword, phone, birthday, gender } = req.body;

        if (!name || !email || !password || !phone) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ các trường bắt buộc.' });
        }

        // Sử dụng schema để kiểm tra độ mạnh của mật khẩu đăng ký
        if (!passwordSchema.validate(password)) {
            return res.status(400).json({
                message: 'Mật khẩu không đủ mạnh.',
                details: 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.'
            });
        }

        if (password !== retypePassword) {
            return res.status(400).json({ message: 'Mật khẩu nhập lại không khớp.' });
        }

        const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            return res.status(409).json({ message: 'Email hoặc số điện thoại đã tồn tại.' });
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
            message: 'Đăng ký tài khoản thành công!',
            token: token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
            }
        });

    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ message: 'Đã có lỗi xảy ra ở máy chủ.' });
    }
};

/**
 * @desc    Đăng nhập người dùng
 * @route   POST /api/auth/login
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu.' });
        }

        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.hashedPassword))) {
            return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác.' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1d',
        });

        res.status(200).json({
            message: 'Đăng nhập thành công!',
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
        res.status(500).json({ message: 'Đã có lỗi xảy ra ở máy chủ.' });
    }
};

/**
 * @desc    Đăng xuất người dùng
 * @route   POST /api/auth/logout
 */
const logout = (req, res) => {
    res.status(200).json({ message: 'Đăng xuất thành công.' });
};

/**
 * @desc    Đổi mật khẩu
 * @route   POST /api/auth/change-password
 */
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, retypeNewPassword } = req.body;
        const userId = req.user.id;
        const user = await User.findById(userId);

        const isMatch = await bcrypt.compare(currentPassword, user.hashedPassword);
        if (!isMatch) {
            return res.status(401).json({ message: 'Mật khẩu hiện tại không chính xác.' });
        }

        // Sử dụng lại schema để kiểm tra độ mạnh của mật khẩu mới
        if (!passwordSchema.validate(newPassword)) {
            return res.status(400).json({
                message: 'Mật khẩu mới không đủ mạnh.',
                details: 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.'
            });
        }

        if (newPassword !== retypeNewPassword) {
            return res.status(400).json({ message: 'Mật khẩu mới nhập lại không khớp.' });
        }

        const salt = await bcrypt.genSalt(10);
        user.hashedPassword = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({ message: 'Đổi mật khẩu thành công.' });

    } catch (error) {
        console.error('Change Password Error:', error);
        res.status(500).json({ message: 'Đã có lỗi xảy ra ở máy chủ.' });
    }
};

module.exports = {
    register,
    login,
    logout,
    changePassword,
};
