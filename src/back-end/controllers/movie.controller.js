const Movie = require('../models/Movie.js');
const Schedule = require('../models/Schedule.js');
const MovieRating = require('../models/MovieRating.js');
// Import redisClient already initialized from your config file
const { redisClient } = require('../config/redis.config.js');

// Default cache expiration time (in seconds), here is 10 minutes
const DEFAULT_EXPIRATION = 600;
const DETAIL_CACHE_EXPIRATION = 3600;

/**
 * @desc    Get now showing movies list (optimized with Redis & Projection)
 * @route   GET /api/movies/now-showing
 */
const getNowShowingMovies = async (req, res) => {
    const cacheKey = 'movies:now-showing';

    try {
        // 1. CHECK CACHE FIRST
        const cachedMovies = await redisClient.get(cacheKey);
        if (cachedMovies) {
            console.log('Cache Hit for now-showing movies!');
            return res.status(200).json(JSON.parse(cachedMovies));
        }

        // 2. IF NOT IN CACHE (CACHE MISS) -> QUERY DATABASE
        console.log('Cache Miss! Fetching from DB...');
        // Use .select() to only fetch required fields, reducing data transmission
        const movies = await Movie.find({ status: 'Now Showing' })
            .sort({ releaseDate: -1 })
            .select('title posterURL duration genre ageRating ratingsAverage');

        // 3. SAVE RESULT TO CACHE FOR NEXT USE
        await redisClient.set(cacheKey, JSON.stringify(movies), {
            EX: DEFAULT_EXPIRATION,
        });

        res.status(200).json(movies);

    } catch (error) {
        console.error('Get Now Showing Movies Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

/**
 * @desc    Get upcoming movies list (optimized with Redis)
 * @route   GET /api/movies/upcoming
 * @access  Public
 */

const getUpcomingMovies = async (req, res) => {
    // Define a separate cache key for "upcoming"
    const cacheKey = 'movies:upcoming';

    try {
        // 1. Check cache first
        const cachedMovies = await redisClient.get(cacheKey);
        if (cachedMovies) {
            console.log('Cache Hit for upcoming movies!');
            return res.status(200).json(JSON.parse(cachedMovies));
        }

        // 2. If cache miss, query DB
        console.log('Cache Miss! Fetching upcoming movies from DB...');
        const movies = await Movie.find({ status: 'Upcoming' })
            .sort({ releaseDate: 1 }) // Sort by nearest release date
            .select('title posterURL releaseDate genre');

        // 3. Save to cache
        await redisClient.set(cacheKey, JSON.stringify(movies), {
            EX: DEFAULT_EXPIRATION,
        });

        res.status(200).json(movies);
    } catch (error) {
        console.error('Get Upcoming Movies Error:', error);
        res.status(500).json({ message: 'A server error occurred.' });
    }
};

/**
 * @desc    Get movie details by ID (optimized with Redis)
 * @route   GET /api/movies/:id
 * @access  Public
 */
const getMovieDetails = async (req, res) => {
    // Cache key will be unique for each movie, example: 'movie:6860b11d3d13366261a33aca'
    const cacheKey = `movie:${req.params.id}`;

    try {
        const cachedMovie = await redisClient.get(cacheKey);
        if (cachedMovie) {
            console.log(`Cache Hit for movie ID: ${req.params.id}!`);
            return res.status(200).json(JSON.parse(cachedMovie));
        }

        console.log(`Cache Miss! Fetching movie ID: ${req.params.id} from DB...`);
        const movie = await Movie.findById(req.params.id);

        if (!movie) {
            return res.status(404).json({ message: 'Movie not found.' });
        }

        // Save to cache with 1 hour expiration as backup
        await redisClient.set(cacheKey, JSON.stringify(movie), {
            EX: DETAIL_CACHE_EXPIRATION,
        });

        res.status(200).json(movie);
    } catch (error) {
        console.error('Get Movie Details Error:', error);
        res.status(500).json({ message: 'A server error occurred.' });
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
            return res.status(400).json({ message: 'Please provide a search keyword.' });
        }

        // Use aggregation pipeline with $search stage
        const movies = await Movie.aggregate([
            {
                $search: {
                    index: 'movie_search_index', // Index name you created on MongoDB Atlas
                    text: {
                        query: keyword,
                        path: {
                            'wildcard': '*' // Search on all indexed fields (title, description, cast, director)
                        },
                        fuzzy: {
                            maxEdits: 1 // Allow 1 character difference (handle typos)
                        }
                    }
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
                    score: { $meta: "searchScore" } // Get relevance score from Atlas Search
                }
            },
            {
                $sort: { score: -1 } // Sort by highest relevance score
            },
            {
                $limit: 5 // Limit results to avoid overload
            },
        ]);

        res.status(200).json(movies);

    } catch (error) {
        console.error('Search Movies Error:', error);
        res.status(500).json({ message: 'A server error occurred.' });
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
            .select('title posterURL duration genre status ageRating ratingsAverage createdAt');
        
        res.status(200).json(movies);
    } catch (error) {
        console.error('Get All Movies Error:', error);
        res.status(500).json({ message: 'A server error occurred.' });
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
            return res.status(400).json({ message: 'A movie with this title already exists.' });
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
            return res.status(400).json({ message: 'A movie with this title already exists.' });
        }
        res.status(500).json({ message: 'A server error occurred.' });
    }
};

/**
 * @desc    Update movie (PUT/PATCH - full or partial)
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
        res.status(500).json({ message: 'A server error occurred.' });
    }
};

/**
 * @desc    Delete movie
 * @route   DELETE /api/movies/:movieId
 * @access  Administrator
 */
const deleteMovie = async (req, res) => {
    try {
        const { movieId } = req.params;
        
        // Check if movie has any schedules
        const hasSchedules = await Schedule.findOne({ movie: movieId });
        if (hasSchedules) {
            // Before returning response, need to get movie information
            const movie = await Movie.findById(movieId);
            if (!movie) {
                return res.status(404).json({ message: 'Movie not found.' });
            }
            
            // If has schedules, don't allow deletion - use status code 400 instead of 200
            return res.status(400).json({
                message: 'This movie has schedules, cannot be deleted.',
                movie
            });
        }
        
        // If no schedules, delete completely
        const movie = await Movie.findByIdAndDelete(movieId);
        
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found.' });
        }
        
        // Clear related cache
        await redisClient.del('movies:now-showing');
        await redisClient.del('movies:upcoming');
        await redisClient.del(`movie:${movieId}`);
        
        res.status(200).json({
            message: 'Movie has been deleted from the system.',
            movie
        });
    } catch (error) {
        console.error('Delete Movie Error:', error);
        res.status(500).json({ message: 'A server error occurred.' });
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
        
        // Check if movie exists
        const movie = await Movie.findById(movieId);
        if (!movie) {
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
        res.status(500).json({ message: 'A server error occurred.' });
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
        const { page = 1, limit = 10 } = req.query;
        
        // Check if movie exists
        const movie = await Movie.findById(movieId);
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found.' });
        }
        
        const skip = (page - 1) * limit;
        
        const ratings = await MovieRating.find({ movie: movieId })
            .populate('user', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
        
        const totalRatings = await MovieRating.countDocuments({ movie: movieId });
        
        res.status(200).json({
            ratings,
            totalRatings,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalRatings / limit),
            ratingsAverage: movie.ratingsAverage,
            ratingsQuantity: movie.ratingsQuantity
        });
    } catch (error) {
        console.error('Get Movie Rating Summary Error:', error);
        res.status(500).json({ message: 'A server error occurred.' });
    }
};

// Update module.exports to include new functions
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