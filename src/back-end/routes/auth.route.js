const express = require('express');
const router = express.Router();

// Import the `changePassword` function
const {
    register,
    activateAccount,
    login,
    staffLogin,
    logout,
    changePassword,
    forgotPassword,
    staffForgotPassword,
    resetPassword,
} = require('../controllers/auth.controller.js');
const { protect } = require('../middlewares/auth.middleware.js');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/activate/:token', activateAccount);

// Staff authentication routes
router.post('/staff/login', staffLogin);
router.post('/staff/forgot-password', staffForgotPassword);

// Routes requiring login (protected by `protect`)
router.post('/logout', protect, logout);
router.post('/change-password', protect, changePassword);

module.exports = router;
