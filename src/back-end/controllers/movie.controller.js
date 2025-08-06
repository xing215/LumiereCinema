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
        // Use the same logic as virtual property for consistency
        const movies = await Movie.find({ 
            isHidden: false
        });

        // For each movie, find the closest schedule and remaining seats
        const SeatHold = require('../models/SeatHold');
        const nowShowingMovies = await Promise.all(
            movies
                .filter(movie => {
                    const releaseDate = new Date(movie.releaseDate);
                    return !movie.isHidden && releaseDate <= now;
                })
                .sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate))
                .map(async (movie) => {
                    // Find the closest upcoming schedule for this movie
                    const closestSchedule = await Schedule.findOne({
                        movie: movie._id,
                        startTime: { $gte: now }
                    })
                    .sort({ startTime: 1 })
                    .populate('screen', 'screenName size branch');

                    let remainingSeats = null;
                    if (closestSchedule && closestSchedule.screen && closestSchedule.screen.size) {
                        // Calculate total seats from screen size
                        const { rows, columns } = closestSchedule.screen.size;
                        const totalSeats = rows * columns;
                        // Occupied seats
                        const occupiedSeatsCount = Array.isArray(closestSchedule.OccupiedSeat) ? closestSchedule.OccupiedSeat.length : 0;
                        // Held seats (not expired)
                        const heldSeatsCount = await SeatHold.countDocuments({
                            schedule: closestSchedule._id,
                            expiresAt: { $gt: new Date() }
                        });
                        remainingSeats = totalSeats - (occupiedSeatsCount + heldSeatsCount);
                    }

                    // Find all schedules for this movie to collect branch IDs
                    const allSchedules = await Schedule.find({ movie: movie._id }).populate({ path: 'screen', select: 'branch', populate: { path: 'branch', select: '_id' } });
                    const branchSet = new Set();
                    allSchedules.forEach(sch => {
                        const branchId = sch.screen && sch.screen.branch && sch.screen.branch._id ? String(sch.screen.branch._id) : null;
                        if (branchId) branchSet.add(branchId);
                    });
                    const branches = Array.from(branchSet);

                    return {
                        _id: movie._id,
                        title: movie.title,
                        description: movie.description,
                        posterURL: movie.posterURL,
                        duration: movie.duration,
                        genre: movie.genre,
                        ageRating: movie.ageRating,
                        ratingsAverage: movie.ratingsAverage,
                        releaseDate: movie.releaseDate,
                        closestSchedule: closestSchedule ? {
                            _id: closestSchedule._id,
                            startTime: closestSchedule.startTime
                        } : null,
                        remainingSeats,
                        branches,
                        status: movie.status
                    };
                })
        );
        // 3. Save result to cache for next time
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
        // Use the same logic as virtual property for consistency
        const movies = await Movie.find({ 
            isHidden: false
        });

        // For each upcoming movie, find the closest schedule and remaining seats
        const SeatHold = require('../models/SeatHold');
        const upcomingMovies = await Promise.all(
            movies
                .filter(movie => {
                    const releaseDate = new Date(movie.releaseDate);
                    return !movie.isHidden && releaseDate > now;
                })
                .sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate))
                .map(async (movie) => {
                    // Find the closest upcoming schedule for this movie
                    const closestSchedule = await Schedule.findOne({
                        movie: movie._id,
                        startTime: { $gte: now }
                    })
                    .sort({ startTime: 1 })
                    .populate('screen', 'screenName size branch');

                    let remainingSeats = null;
                    if (closestSchedule && closestSchedule.screen && closestSchedule.screen.size) {
                        // Calculate total seats from screen size
                        const { rows, columns } = closestSchedule.screen.size;
                        const totalSeats = rows * columns;
                        // Occupied seats
                        const occupiedSeatsCount = Array.isArray(closestSchedule.OccupiedSeat) ? closestSchedule.OccupiedSeat.length : 0;
                        // Held seats (not expired)
                        const heldSeatsCount = await SeatHold.countDocuments({
                            schedule: closestSchedule._id,
                            expiresAt: { $gt: new Date() }
                        });
                        remainingSeats = totalSeats - (occupiedSeatsCount + heldSeatsCount);
                    }

                    // Find all schedules for this movie to collect branch IDs
                    const allSchedules = await Schedule.find({ movie: movie._id }).populate({ path: 'screen', select: 'branch', populate: { path: 'branch', select: '_id' } });
                    const branchSet = new Set();
                    allSchedules.forEach(sch => {
                        const branchId = sch.screen && sch.screen.branch && sch.screen.branch._id ? String(sch.screen.branch._id) : null;
                        if (branchId) branchSet.add(branchId);
                    });
                    const branches = Array.from(branchSet);

                    return {
                        _id: movie._id,
                        title: movie.title,
                        description: movie.description,
                        posterURL: movie.posterURL,
                        releaseDate: movie.releaseDate,
                        genre: movie.genre,
                        closestSchedule: closestSchedule ? {
                            _id: closestSchedule._id,
                            startTime: closestSchedule.startTime
                        } : null,
                        remainingSeats,
                        branches,
                        status: movie.status
                    };
                })
        );
        // 3. Save to cache
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
 * @desc    Search movies using simple regex search with caching
 * @route   GET /api/movies/search?q=...&page=1&limit=10
 * @access  Public
 */
const searchMovies = async (req, res) => {
    try {
        const keyword = req.query.q?.trim();
        if (!keyword) {
            return res.status(400).json({ 
                message: 'Search keyword is required.',
                results: [],
                totalResults: 0,
                currentPage: 1,
                totalPages: 0
            });
        }

        // Pagination parameters
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
        const skip = (page - 1) * limit;

        // Create cache key based on search parameters
        const cacheKey = `search:movies:${keyword.toLowerCase()}:${page}:${limit}`;

        try {
            // Check cache first
            const cachedResults = await redisClient.get(cacheKey);
            if (cachedResults) {
                return res.status(200).json(JSON.parse(cachedResults));
            }
        } catch (cacheError) {
            console.warn('Cache read error:', cacheError);
        }

        // Build search query using regex (case-insensitive)
        const searchRegex = new RegExp(keyword, 'i');
        
        const searchQuery = {
            isHidden: false,
            $or: [
                { title: { $regex: searchRegex } },
                { description: { $regex: searchRegex } },
                { director: { $regex: searchRegex } },
                { cast: { $in: [searchRegex] } },
                { genre: { $in: [searchRegex] } }
            ]
        };

        // Get total count for pagination
        const totalResults = await Movie.countDocuments(searchQuery);
        const totalPages = Math.ceil(totalResults / limit);        // Execute search query with sorting and pagination
        const movies = await Movie.find(searchQuery)
            .select('_id title description posterURL duration genre ageRating director cast releaseDate ratingsAverage')
            .sort({ ratingsAverage: -1, releaseDate: -1, title: 1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // Add status to each movie
        const moviesWithStatus = movies.map(movie => ({
            ...movie,
            status: new Date(movie.releaseDate) > new Date() ? 'Upcoming' : 'Now Showing'
        }));

        const response = {
            keyword: keyword,
            results: moviesWithStatus,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalResults: totalResults,
                limit: limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        };

        // Cache the results for 5 minutes (search results can change frequently)
        try {
            await redisClient.setEx(cacheKey, 300, JSON.stringify(response));
        } catch (cacheError) {
            console.warn('Cache write error:', cacheError);
        }

        res.status(200).json(response);

    } catch (error) {
        console.error('Search Movies Error:', error);
        res.status(500).json({ 
            message: 'Server error occurred.',
            results: [],
            totalResults: 0,
            currentPage: 1,
            totalPages: 0
        });
    }
};

/**
 * @desc    Get search suggestions (autocomplete) using simple regex search
 * @route   GET /api/movies/search/suggest?q=...&limit=5
 * @access  Public
 */
const getSearchSuggestions = async (req, res) => {
    try {
        const keyword = req.query.q?.trim();
        if (!keyword || keyword.length < 2) {
            return res.status(400).json({ 
                message: 'Search keyword must be at least 2 characters.',
                suggestions: []
            });
        }

        const limit = Math.min(10, Math.max(1, parseInt(req.query.limit) || 5));
        
        // Create cache key for suggestions
        const cacheKey = `suggest:movies:${keyword.toLowerCase()}:${limit}`;

        try {
            // Check cache first (shorter cache time for suggestions)
            const cachedSuggestions = await redisClient.get(cacheKey);
            if (cachedSuggestions) {
                return res.status(200).json(JSON.parse(cachedSuggestions));
            }
        } catch (cacheError) {
            console.warn('Suggestions cache read error:', cacheError);
        }

        // Build search query using regex (case-insensitive)
        const searchRegex = new RegExp(keyword, 'i');
        
        // Prioritize title matches first
        const titleMatches = await Movie.find({
            isHidden: false,
            title: { $regex: searchRegex }
        })
        .select('_id title posterURL genre ageRating director cast releaseDate ratingsAverage')
        .sort({ ratingsAverage: -1, title: 1 })
        .limit(Math.ceil(limit / 2))
        .lean();

        // Then get matches from other fields
        const otherMatches = await Movie.find({
            isHidden: false,
            title: { $not: { $regex: searchRegex } }, // Exclude title matches (already got them)
            $or: [
                { director: { $regex: searchRegex } },
                { cast: { $in: [searchRegex] } },
                { genre: { $in: [searchRegex] } }
            ]
        })
        .select('_id title posterURL genre ageRating director cast releaseDate ratingsAverage')
        .sort({ ratingsAverage: -1, title: 1 })
        .limit(limit - titleMatches.length)
        .lean();

        // Combine results
        const allSuggestions = [...titleMatches, ...otherMatches];

        // Add status to each movie
        const suggestionsWithStatus = allSuggestions.map(movie => ({
            ...movie,
            status: new Date(movie.releaseDate) > new Date() ? 'Upcoming' : 'Now Showing'
        }));

        const response = {
            keyword: keyword,
            suggestions: suggestionsWithStatus.slice(0, limit)
        };

        // Cache suggestions for 2 minutes
        try {
            await redisClient.setEx(cacheKey, 120, JSON.stringify(response));
        } catch (cacheError) {
            console.warn('Suggestions cache write error:', cacheError);
        }

        res.status(200).json(response);

    } catch (error) {
        console.error('Get Search Suggestions Error:', error);
        res.status(500).json({ 
            message: 'Server error occurred.',
            suggestions: []
        });
    }
};

/**
 * @desc    Clear search cache (admin utility)
 * @route   DELETE /api/movies/search/cache
 * @access  Administrator
 */
const clearSearchCache = async (req, res) => {
    try {
        // Get all search-related cache keys
        const searchKeys = await redisClient.keys('search:movies:*');
        const suggestKeys = await redisClient.keys('suggest:movies:*');
        
        const allKeys = [...searchKeys, ...suggestKeys];
        
        if (allKeys.length > 0) {
            await redisClient.del(allKeys);
        }

        res.status(200).json({
            message: 'Search cache cleared successfully.',
            clearedKeys: allKeys.length
        });
    } catch (error) {
        console.error('Clear Search Cache Error:', error);
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
        
        // Clear search cache as well
        const searchKeys = await redisClient.keys('search:movies:*');
        const suggestKeys = await redisClient.keys('suggest:movies:*');
        const allSearchKeys = [...searchKeys, ...suggestKeys];
        if (allSearchKeys.length > 0) {
            await redisClient.del(allSearchKeys);
        }
        
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
        
        // Clear search cache as well
        const searchKeys = await redisClient.keys('search:movies:*');
        const suggestKeys = await redisClient.keys('suggest:movies:*');
        const allSearchKeys = [...searchKeys, ...suggestKeys];
        if (allSearchKeys.length > 0) {
            await redisClient.del(allSearchKeys);
        }
        
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
        
        // Clear search cache as well
        const searchKeys = await redisClient.keys('search:movies:*');
        const suggestKeys = await redisClient.keys('suggest:movies:*');
        const allSearchKeys = [...searchKeys, ...suggestKeys];
        if (allSearchKeys.length > 0) {
            await redisClient.del(allSearchKeys);
        }
        
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
    getSearchSuggestions,
    clearSearchCache,
    getAllMovies,
    addMovie,
    updateMovie,
    deleteMovie,
    getMovieShowtimes,
    getMovieRatingSummary,
};