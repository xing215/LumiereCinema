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
        }
        // 2. Cache miss - fetch from database
        const now = new Date();
        const movies = await Movie.find({ isHidden: false });
        // Filter in JavaScript to match virtual property logic exactly
        const nowShowingMovies = movies.filter(movie => {
            const releaseDate = new Date(movie.releaseDate);
            return !movie.isHidden && releaseDate <= now;
        })
        .sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));

        // For each movie, find all schedules and collect unique branch IDs
        const movieIds = nowShowingMovies.map(m => m._id);
        // Get all schedules for these movies, populate screen.branch
        const schedules = await Schedule.find({ movie: { $in: movieIds } })
            .populate({ path: 'screen', select: 'branch', populate: { path: 'branch', select: '_id' } });

        // Map: movieId -> Set of branchIds
        const movieToBranches = {};
        schedules.forEach(sch => {
            const mId = String(sch.movie);
            const branchId = sch.screen && sch.screen.branch && sch.screen.branch._id ? String(sch.screen.branch._id) : null;
            if (branchId) {
                if (!movieToBranches[mId]) movieToBranches[mId] = new Set();
                movieToBranches[mId].add(branchId);
            }
        });

        // Add branches array to each movie
        const result = nowShowingMovies.map(movie => {
            const mId = String(movie._id);
            const branches = movieToBranches[mId] ? Array.from(movieToBranches[mId]) : [];
            return {
                _id: movie._id,
                title: movie.title,
                posterURL: movie.posterURL,
                duration: movie.duration,
                genre: movie.genre,
                ageRating: movie.ageRating,
                ratingsAverage: movie.ratingsAverage,
                releaseDate: movie.releaseDate,
                status: movie.status,
                branches
            };
        });

        await redisClient.set(cacheKey, JSON.stringify(result), { EX: DEFAULT_EXPIRATION });
        res.status(200).json(result);
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
    const cacheKey = 'movies:upcoming';

    try {
        // 1. Check cache first
        const cachedMovies = await redisClient.get(cacheKey);
        if (cachedMovies) {
            // Cache hit
            return res.status(200).json(JSON.parse(cachedMovies));
        }
        // 2. Cache miss - fetch from database
        const now = new Date();
        const movies = await Movie.find({ isHidden: false });
        // Filter in JavaScript to match virtual property logic exactly
        const upcomingMovies = movies.filter(movie => {
            const releaseDate = new Date(movie.releaseDate);
            return !movie.isHidden && releaseDate > now;
        })
        .sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate));

        // For each movie, find all schedules and collect unique branch IDs
        const movieIds = upcomingMovies.map(m => m._id);
        const schedules = await Schedule.find({ movie: { $in: movieIds } })
            .populate({ path: 'screen', select: 'branch', populate: { path: 'branch', select: '_id' } });

        // Map: movieId -> Set of branchIds
        const movieToBranches = {};
        schedules.forEach(sch => {
            const mId = String(sch.movie);
            const branchId = sch.screen && sch.screen.branch && sch.screen.branch._id ? String(sch.screen.branch._id) : null;
            if (branchId) {
                if (!movieToBranches[mId]) movieToBranches[mId] = new Set();
                movieToBranches[mId].add(branchId);
            }
        });

        // Add branches array to each movie
        const result = upcomingMovies.map(movie => {
            const mId = String(movie._id);
            const branches = movieToBranches[mId] ? Array.from(movieToBranches[mId]) : [];
            return {
                _id: movie._id,
                title: movie.title,
                posterURL: movie.posterURL,
                releaseDate: movie.releaseDate,
                genre: movie.genre,
                status: movie.status,
                branches
            };
        });

        await redisClient.set(cacheKey, JSON.stringify(result), { EX: DEFAULT_EXPIRATION });
        res.status(200).json(result);
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

        // Calculate ratingsAverage and ratingsQuantity from MovieRating
        const ratingStats = await MovieRating.aggregate([
            { $match: { movie: movie._id } },
            {
                $group: {
                    _id: '$movie',
                    ratingsQuantity: { $sum: 1 },
                    ratingsAverage: { $avg: '$star' }
                }
            }
        ]);

        let ratingsAverage = 0;
        let ratingsQuantity = 0;
        if (ratingStats.length > 0) {
            ratingsAverage = ratingStats[0].ratingsAverage || 0;
            ratingsQuantity = ratingStats[0].ratingsQuantity || 0;
        }

        // Find all schedules for this movie, populate screen.branch
        const schedules = await Schedule.find({ movie: movie._id })
            .populate({ path: 'screen', select: 'branch', populate: { path: 'branch', select: '_id' } });

        // Collect unique branch IDs
        const branchSet = new Set();
        schedules.forEach(sch => {
            const branchId = sch.screen && sch.screen.branch && sch.screen.branch._id ? String(sch.screen.branch._id) : null;
            if (branchId) branchSet.add(branchId);
        });
        const branches = Array.from(branchSet);

        // Build response object (keep all movie fields, add branches, ratingsAverage, ratingsQuantity)
        const movieObj = movie.toObject();
        movieObj.branches = branches;
        movieObj.ratingsAverage = ratingsAverage;
        movieObj.ratingsQuantity = ratingsQuantity;

        // Save to cache with 1 hour expiration
        await redisClient.set(cacheKey, JSON.stringify(movieObj), {
            EX: DETAIL_CACHE_EXPIRATION,
        });
        console.log('Movie details cached:', movieObj);
        res.status(200).json(movieObj);
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
        // Get all movies including isHidden field for management
        const movies = await Movie.find({})
            .sort({ createdAt: -1 })
            .select('title description posterURL trailerURL duration genre ageRating director cast language ratingsAverage releaseDate isHidden createdAt');
        
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

        // Prepare movie data with defaults
        const movieToAdd = {
            title: movieData.title,
            description: movieData.description,
            posterURL: movieData.posterURL,
            trailerURL: movieData.trailerURL || '',
            releaseDate: movieData.releaseDate,
            duration: movieData.duration,
            genre: movieData.genre || [],
            director: movieData.director || '',
            cast: movieData.cast || [],
            language: movieData.language || '',
            ageRating: movieData.ageRating || 'P',
            // Set default values
            ratingsAverage: 0,
            ratingsQuantity: 0,
            isHidden: movieData.isHidden !== undefined ? movieData.isHidden : true
        };

        const newMovie = new Movie(movieToAdd);
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
        // Validation error
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                message: 'Validation failed.',
                errors: validationErrors
            });
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
 * @desc    Delete movie (hard delete - permanently remove from database)
 * @route   DELETE /api/movies/:movieId
 * @access  Administrator
 */
const deleteMovie = async (req, res) => {
    try {
        const { movieId } = req.params;
        
        // Check if movie exists first
        const movie = await Movie.findById(movieId);
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found.' });
        }
        
        // Check if movie has any active schedules
        const hasSchedules = await Schedule.findOne({ movie: movieId });
        if (hasSchedules) {
            return res.status(400).json({ 
                message: 'Cannot delete movie. Movie has active schedules. Please remove all schedules first.',
                action: 'delete_blocked'
            });
        }
        
        // Check if movie has any ratings
        const hasRatings = await MovieRating.findOne({ movieId: movieId });
        if (hasRatings) {
            // Delete all ratings for this movie first
            await MovieRating.deleteMany({ movieId: movieId });
        }
        
        // Perform hard delete - permanently remove from database
        await Movie.findByIdAndDelete(movieId);
        
        // Clear related cache
        await redisClient.del('movies:now-showing');
        await redisClient.del('movies:upcoming');
        await redisClient.del(`movie:${movieId}`);
        
        res.status(200).json({
            message: 'Movie has been permanently deleted from database.',
            action: 'hard_delete',
            deletedMovie: {
                id: movie._id,
                title: movie.title
            }
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