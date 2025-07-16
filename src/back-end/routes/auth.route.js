const express = require('express');
const router = express.Router();

// Import the `changePassword` function
const { register, login, logout, changePassword } = require('../controllers/auth.controller.js');
const { protect } = require('../middlewares/auth.middleware.js');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Routes requiring login (protected by `protect`)
router.post('/logout', protect, logout);
router.post('/change-password', protect, changePassword);

module.exports = router;