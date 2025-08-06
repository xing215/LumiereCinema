const express = require('express');
const router = express.Router();

// Import authentication middleware
const { protect, restrictTo } = require('../middlewares/auth.middleware.js');

// Import controller functions
const {
    getNowShowingMovies,
    getUpcomingMovies,
    getMovieDetails,
    searchMovies,
    getSearchSuggestions,
    clearSearchCache,
    getAllMovies,
    addMovie,
    updateMovie,
    deleteMovie,
    getMovieShowtimes,
    getMovieRatingSummary,
} = require('../controllers/movie.controller.js');

// Public routes (no authentication required)
router.get('/now-showing', getNowShowingMovies);
router.get('/upcoming', getUpcomingMovies);
router.get('/search', searchMovies);
router.get('/search/suggest', getSearchSuggestions);

// Administrator only routes
router.post('/', protect, restrictTo('administrator'), addMovie);
router.delete('/search/cache', protect, restrictTo('administrator'), clearSearchCache);

// Administrator only routes for movie management
router.get('/all', protect, restrictTo('administrator'), getAllMovies); // Warning: Bao gồm cả phim Archived, nên chỉ dùng manage
router.put('/:movieId', protect, restrictTo('administrator'), updateMovie);
router.patch('/:movieId', protect, restrictTo('administrator'), updateMovie);
router.delete('/:movieId', protect, restrictTo('administrator'), deleteMovie);

// Route động phải đặt ở cuối (public route)
router.get('/:movieId/showscreen', getMovieShowtimes);
router.get('/:movieId/get-ratings', getMovieRatingSummary);
router.get('/:movieId', getMovieDetails);

module.exports = router;
