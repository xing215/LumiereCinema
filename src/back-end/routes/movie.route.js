const express = require('express');
const router = express.Router();

// Import thêm hàm searchMovies
const {
    getNowShowingMovies,
    getUpcomingMovies,
    getMovieDetails,
    searchMovies, 
} = require('../controllers/movie.controller.js');

// Các route tĩnh
router.get('/now-showing', getNowShowingMovies);
router.get('/upcoming', getUpcomingMovies);
router.get('/search', searchMovies); 

// Route động phải đặt ở cuối
router.get('/:id', getMovieDetails);

module.exports = router;
