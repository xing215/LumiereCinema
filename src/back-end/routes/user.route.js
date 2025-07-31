const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  rateMovie,
  getRatingMovie,
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  getWatchHistory,
  removeFromWatchHistory,
  getUserTickets
} = require('../controllers/user.controller');

const { protect, restrictTo } = require('../middlewares/auth.middleware.js');

// // Profile
router.get('/me', protect, restrictTo('customer'), getProfile);
router.patch('/me', protect, restrictTo('customer'), updateProfile);
router.put('/me', protect, restrictTo('customer'), updateProfile);

// // Movie rating
router.post('/rate', protect, restrictTo('customer'), rateMovie);
router.get('/rating/:movieId', protect, restrictTo('customer'), getRatingMovie);

// Wishlist
router.post('/wishlist/:movieId', protect, restrictTo('customer'), addToWishlist);
router.delete('/wishlist/:movieId', protect, restrictTo('customer'), removeFromWishlist);
router.get('/wishlist', protect, restrictTo('customer'), getWishlist);

// Watch history
router.get('/watch-history', protect, restrictTo('customer'), getWatchHistory);
router.delete('/watch-history/:ticketId', protect, restrictTo('administrator'), removeFromWatchHistory);

// Movie tickets
router.get('/tickets', protect, restrictTo('customer'), getUserTickets);

module.exports = router;