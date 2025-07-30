const Movie = require('../models/Movie.js');
const Schedule = require('../models/Schedule.js');
const MovieRating = require('../models/MovieRating.js');
// Import Redis client for caching
const { redisClient } = require('../config/redis.config.js');

// Default cache expiration time (in seconds) - 10 minutes
const DEFAULT_EXPIRATION = 600;
const DETAIL_CACHE_EXPIRATION = 3600;

/**
 * @desc    Get list of now showing movies (optimized with Redis & Projection)
 * @route   GET /api/movies/now-showing
 */
const getNowShowingMovies = async (req, res) => {
    const cacheKey = 'movies:now-showing';

    try {
        // 1. Check cache first
        const cachedMovies = await redisClient.get(cacheKey);
        if (cachedMovies) {
            // Cache hit
            return res.status(200).json(JSON.parse(cachedMovies));
        }        // 2. Cache miss - fetch from database
        // Use date-based query instead of status field
        const now = new Date();
        // Use the same logic as virtual property for consistency
        const movies = await Movie.find({ 
            isHidden: false
        });
        
        // Filter in JavaScript to match virtual property logic exactly
        const nowShowingMovies = movies.filter(movie => {
            const releaseDate = new Date(movie.releaseDate);
            return !movie.isHidden && releaseDate <= now;
        })
        .sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate))
        .map(movie => ({
            _id: movie._id,
            title: movie.title,
            posterURL: movie.posterURL,
            duration: movie.duration,
            genre: movie.genre,
            ageRating: movie.ageRating,
            ratingsAverage: movie.ratingsAverage,
            releaseDate: movie.releaseDate
        }));        // 3. Save result to cache for next time
        await redisClient.set(cacheKey, JSON.stringify(nowShowingMovies), {
            EX: DEFAULT_EXPIRATION,
        });

        res.status(200).json(nowShowingMovies);

    } catch (error) {
        console.error('Get Now Showing Movies Error:', error);
        res.status(500).json({ message: 'Server error occurred.' });
    }
};

/**
 * @desc    Get list of upcoming movies (optimized with Redis)
 * @route   GET /api/movies/upcoming
 * @access  Public
 */

const getUpcomingMovies = async (req, res) => {
    // Define unique cache key for "upcoming"
    const cacheKey = 'movies:upcoming';

    try {
        // 1. Check cache first
        const cachedMovies = await redisClient.get(cacheKey);
        if (cachedMovies) {
            // Cache hit
            return res.status(200).json(JSON.parse(cachedMovies));
        }        // 2. Cache miss - fetch from database
        // Use date-based query instead of status field
        const now = new Date();
        // Use the same logic as virtual property for consistency
        const movies = await Movie.find({ 
            isHidden: false
        });
        
        // Filter in JavaScript to match virtual property logic exactly
        const upcomingMovies = movies.filter(movie => {
            const releaseDate = new Date(movie.releaseDate);
            return !movie.isHidden && releaseDate > now;
        })
        .sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate))
        .map(movie => ({
            _id: movie._id,
            title: movie.title,
            posterURL: movie.posterURL,
            releaseDate: movie.releaseDate,
            genre: movie.genre
        }));        // 3. Save to cache
        await redisClient.set(cacheKey, JSON.stringify(upcomingMovies), {
            EX: DEFAULT_EXPIRATION,
        });

        res.status(200).json(upcomingMovies);
    } catch (error) {
        console.error('Get Upcoming Movies Error:', error);
        res.status(500).json({ message: 'Server error occurred.' });
    }
};

/**
 * @desc    Get movie details by ID (optimized with Redis)
 * @route   GET /api/movies/:id
 * @access  Public
 */
const getMovieDetails = async (req, res) => {
    // Cache key will be unique for each movie, e.g., 'movie:6860b11d3d13366261a33aca'
    const cacheKey = `movie:${req.params.movieId}`;

    try {
        const cachedMovie = await redisClient.get(cacheKey);
        if (cachedMovie) {
            // Cache hit
            return res.status(200).json(JSON.parse(cachedMovie));
        }

        // Cache miss - fetch from database
        const movie = await Movie.findById(req.params.movieId);

        
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found.' });
        }

        // Check if movie is hidden (soft deleted)
        if (movie.isHidden) {
            return res.status(404).json({ message: 'Movie not found.' });
        }

        // Save to cache with 1 hour expiration
        await redisClient.set(cacheKey, JSON.stringify(movie), {
            EX: DETAIL_CACHE_EXPIRATION,
        });

        res.status(200).json(movie);
    } catch (error) {
        console.error('Get Movie Details Error:', error);
        res.status(500).json({ message: 'Server error occurred.' });
    }
};


/**
 * @desc    Search movies using Atlas Search
 * @route   GET /api/movies/search?q=...
 * @access  Public
 */
const searchMovies = async (req, res) => {
    try {
        const keyword = req.query.q;
        if (!keyword) {
            return res.status(400).json({ message: 'Please provide search keyword.' });
        }

        // Use aggregation pipeline with $search stage
        const movies = await Movie.aggregate([
            {
                $search: {
                    index: 'movie_search_index', // Index name created on MongoDB Atlas
                    text: {
                        query: keyword,
                        path: {
                            'wildcard': '*' // Search across all indexed fields (title, description, cast, director)
                        },
                        fuzzy: {
                            maxEdits: 1 // Allow 1 character difference (handle typos)
                        }
                    }
                }
            },
            {
                $match: {
                    isHidden: false // Only show non-hidden movies
                }
            },
            {
                $project: { // Similar to .select(), only get necessary fields
                    title: 1,
                    posterURL: 1,
                    duration: 1,
                    genre: 1,
                    ageRating: 1,
                    ratingsAverage: 1,
                    releaseDate: 1,
                    isHidden: 1,
                    score: { $meta: "searchScore" } // Get relevance score from Atlas Search
                }
            },
            {
                $sort: { score: -1 } // Sort by highest relevance score
            },
            {
                $limit: 10 // Limit results to avoid overload
            },
        ]);

        res.status(200).json(movies);

    } catch (error) {
        console.error('Search Movies Error:', error);
        res.status(500).json({ message: 'Server error occurred.' });
    }
};

/**
 * @desc    Get all movies for management
 * @route   GET /api/movies/all
 * @access  Administrator
 */
const getAllMovies = async (req, res) => {
    try {
        const movies = await Movie.find({})
            .sort({ createdAt: -1 })
            .select('title posterURL duration genre isHidden ageRating ratingsAverage releaseDate createdAt');
        
        res.status(200).json(movies);
    } catch (error) {
        console.error('Get All Movies Error:', error);
        res.status(500).json({ message: 'Server error occurred.' });
    }
};

/**
 * @desc    Add new movie
 * @route   POST /api/movies
 * @access  Administrator
 */
const addMovie = async (req, res) => {
    try {
        const movieData = req.body;
        
        // Check if movie already exists
        const existingMovie = await Movie.findOne({ title: movieData.title });
        if (existingMovie) {
            return res.status(400).json({ message: 'Movie with this title already exists.' });
        }

        const newMovie = new Movie(movieData);
        await newMovie.save();
        
        // Clear cache to update with new data
        await redisClient.del('movies:now-showing');
        await redisClient.del('movies:upcoming');
        
        res.status(201).json({
            message: 'Movie added successfully.',
            movie: newMovie
        });
    } catch (error) {
        console.error('Add Movie Error:', error);
        // MongoDB duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Movie with this title already exists.' });
        }
        res.status(500).json({ message: 'Server error occurred.' });
    }
};

/**
 * @desc    Update movie (PUT/PATCH - full or partial update)
 * @route   PUT /api/movies/:movieId
 * @route   PATCH /api/movies/:movieId
 * @access  Administrator
 */
const updateMovie = async (req, res) => {
    try {
        const { movieId } = req.params;
        const updateData = req.body;
        
        // Use $set to update only provided fields
        // Works for both PUT and PATCH
        const movie = await Movie.findByIdAndUpdate(
            movieId,
            { $set: updateData },
            { new: true, runValidators: true }
        );
        
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found.' });
        }
        
        // Clear related cache
        await redisClient.del('movies:now-showing');
        await redisClient.del('movies:upcoming');
        await redisClient.del(`movie:${movieId}`);
        
        res.status(200).json({
            message: 'Movie updated successfully.',
            movie
        });
    } catch (error) {
        console.error('Update Movie Error:', error);
        res.status(500).json({ message: 'Server error occurred.' });
    }
};

/**
 * @desc    Delete movie (soft delete by setting isHidden to true)
 * @route   DELETE /api/movies/:movieId
 * @access  Administrator
 */
const deleteMovie = async (req, res) => {
    try {
        const { movieId } = req.params;
        
        // Check if movie has any schedules
        const hasSchedules = await Schedule.findOne({ movie: movieId });
        if (hasSchedules) {
            // Get movie info before response
            const movie = await Movie.findById(movieId);
            if (!movie) {
                return res.status(404).json({ message: 'Movie not found.' });
            }            
            // If movie has schedules, soft delete by setting isHidden to true
            return res.status(200).json({
                message: 'Movie has active schedules. Performing soft delete by hiding movie.',
                action: 'soft_delete'
            });
        }
        
        // If no schedules, perform soft delete by setting isHidden to true
        const movie = await Movie.findByIdAndUpdate(
            movieId, 
            { isHidden: true }, 
            { new: true }
        );
        
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found.' });
        }
        
        // Clear related cache
        await redisClient.del('movies:now-showing');
        await redisClient.del('movies:upcoming');
        await redisClient.del(`movie:${movieId}`);
        
        res.status(200).json({
            message: 'Movie has been soft deleted (hidden).',
            movie
        });
    } catch (error) {
        console.error('Delete Movie Error:', error);
        res.status(500).json({ message: 'Server error occurred.' });
    }
};

/**
 * @desc    Get movie showtimes
 * @route   GET /api/movies/:movieId/showscreen
 * @access  Customer
 */
const getMovieShowtimes = async (req, res) => {
    try {
        const { movieId } = req.params;
        const { date } = req.query;
        
        // Check if movie exists and is not hidden
        const movie = await Movie.findById(movieId);
        if (!movie || movie.isHidden) {
            return res.status(404).json({ message: 'Movie not found.' });
        }
        
        let query = { movie: movieId };
        
        // If filtering by date
        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);
            
            query.startTime = {
                $gte: startDate,
                $lt: endDate
            };
        } else {
            // Only get showtimes from current time onwards
            query.startTime = { $gte: new Date() };
        }
        
        const schedules = await Schedule.find(query)
            .populate('screen', 'screenName capacity')
            .populate('movie', 'title duration')
            .sort({ startTime: 1 });
        
        res.status(200).json(schedules);
    } catch (error) {
        console.error('Get Movie Showtimes Error:', error);
        res.status(500).json({ message: 'Server error occurred.' });
    }
};

/**
 * @desc    Get movie rating summary
 * @route   GET /api/movies/:movieId/get-ratings
 * @access  Customer
 */
const getMovieRatingSummary = async (req, res) => {
    try {
        const { movieId } = req.params;
        
        // Check if movie exists and is not hidden
        const movie = await Movie.findById(movieId);
        if (!movie || movie.isHidden) {
            return res.status(404).json({ message: 'Movie not found.' });
        }
                
        const ratings = await MovieRating.find({ movieId: movieId })
            .populate('userId', 'name')
            .sort({ createdAt: -1 });
        
        res.status(200).json({
            ratings,
            totalRatings,
            ratingsAverage: movie.ratingsAverage,
            ratingsQuantity: movie.ratingsQuantity
        });
    } catch (error) {
        console.error('Get Movie Rating Summary Error:', error);
        res.status(500).json({ message: 'Server error occurred.' });
    }
};

// Export all movie controller functions
module.exports = {
    getNowShowingMovies,
    getUpcomingMovies,
    getMovieDetails,
    searchMovies,
    getAllMovies,
    addMovie,
    updateMovie,
    deleteMovie,
    getMovieShowtimes,
    getMovieRatingSummary,
};