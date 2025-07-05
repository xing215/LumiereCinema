const express = require('express');
const router = express.Router();

// Import thêm hàm `changePassword`
const { register, login, logout, changePassword } = require('../controllers/auth.controller.js');
const { protect } = require('../middlewares/auth.middleware.js');

// Route công khai
router.post('/register', register);
router.post('/login', login);

// Route cần đăng nhập (được bảo vệ bởi `protect`)
router.post('/logout', protect, logout);
router.post('/change-password', protect, changePassword);

module.exports = router;