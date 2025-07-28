const jwt = require('jsonwebtoken');
const User = require('../models/User.js'); // Ensure correct path to model

/**
 * Middleware to protect routes that require authentication.
 * It will check the token in the request header.
 */
const protect = async (req, res, next) => {
    let token;

    // 1. Check if 'Authorization' header exists and starts with 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 2. Extract token from header (remove 'Bearer ')
            token = req.headers.authorization.split(' ')[1];

            // 3. Verify token with secret key
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 4. Get user information from ID in token and attach to request
            // We exclude hashedPassword field for security
            req.user = await User.findById(decoded.id).select('-hashedPassword');

            // 5. If everything is valid, allow request to proceed
            next();
        } catch (error) {
            // If token is invalid (expired, wrong signature, etc.)
            return res.status(401).json({ message: 'Authentication failed, invalid token.' });
        }
    }

    // If no token found in header
    if (!token) {
        return res.status(401).json({ message: 'Authentication failed, no token found.' });
    }
};

// Không cần protected cx có thể lấy được user.id nếu có
const getUser = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-hashedPassword');
            next();
        } catch (error) {
            req.user = { id: null }; // If token is invalid, set user to null
            next();
        }
    }

    if (!token) {
        req.user = { id: null }; // If no token, set user to null
        next();
    }
};

/**
 * Middleware to check user roles
 * @param {...string} roles - Roles allowed to access
 */
const restrictTo = (...roles) => {
    return (req, res, next) => {
        // Check if user exists (from protect middleware)
        if (!req.user) {
            return res.status(401).json({ message: 'Please log in to access.' });
        }

        // Check if user has at least one allowed role
        const hasPermission = req.user.roles.some(role => roles.includes(role));
        
        if (!hasPermission) {
            return res.status(403).json({ 
                message: 'You do not have permission to access this resource.' 
            });
        }

        next();
    };
};

module.exports = { protect, restrictTo, getUser };