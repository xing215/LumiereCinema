const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const Schedule = require('../models/Schedule');
const { generateQueryEmbedding } = require('./embeddingService');

/**
 * Movie Retriever Service
 * Handles vector-based search for movies using MongoDB Atlas Vector Search
 */
class MovieRetrieverService {
  /**
   * Initialize the service
   */
  constructor() {
    this.collectionName = 'movies';
    this.vectorFieldName = 'textEmbedding';
    this.indexName = 'vector_index_movies';
  }

  /**
   * Perform semantic search for movies
   * @param {string} query - User query
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Search results
   */
  async searchMovies(query, options = {}) {
    const {
      limit = 10,
      includeUpcoming = true,
      includeNowShowing = true,
      genreFilter = null,
      minRating = 0
    } = options;

    try {
      // Generate query embedding
      const queryEmbedding = await generateQueryEmbedding(query);
      
      if (!queryEmbedding || queryEmbedding.length === 0) {
        console.warn('Failed to generate query embedding for:', query);
        return [];
      }

      // Build aggregation pipeline
      const pipeline = [
        // Vector search stage
        {
          $vectorSearch: {
            index: this.indexName,
            path: this.vectorFieldName,
            queryVector: queryEmbedding,
            numCandidates: Math.max(limit * 10, 100),
            limit: limit * 2 // Get more results for filtering
          }
        },
        // Add similarity score
        {
          $addFields: {
            searchScore: { $meta: 'vectorSearchScore' }
          }
        },
        // Apply filters
        {
          $match: {
            isHidden: false,
            ...(genreFilter && { genre: { $in: [genreFilter] } }),
            ...(minRating > 0 && { ratingsAverage: { $gte: minRating } }),
            // Status filter based on release date
            ...(includeUpcoming && !includeNowShowing && { releaseDate: { $gt: new Date() } }),
            ...(includeNowShowing && !includeUpcoming && { releaseDate: { $lte: new Date() } })
          }
        },
        // Add computed status field
        {
          $addFields: {
            status: {
              $cond: {
                if: { $gt: ['$releaseDate', new Date()] },
                then: 'Upcoming',
                else: 'Now Showing'
              }
            }
          }
        },
        // Project relevant fields
        {
          $project: {
            _id: 1,
            title: 1,
            description: 1,
            posterURL: 1,
            duration: 1,
            genre: 1,
            ageRating: 1,
            director: 1,
            cast: 1,
            language: 1,
            releaseDate: 1,
            ratingsAverage: 1,
            ratingsQuantity: 1,
            status: 1,
            searchScore: 1,
            // Add formatted fields for better display
            genreString: {
              $cond: {
                if: { $isArray: '$genre' },
                then: { $reduce: { input: '$genre', initialValue: '', in: { $concat: ['$$value', { $cond: { if: { $eq: ['$$value', ''] }, then: '', else: ', ' } }, '$$this'] } } },
                else: '$genre'
              }
            },
            castString: {
              $cond: {
                if: { $isArray: '$cast' },
                then: { 
                  $reduce: { 
                    input: { $slice: ['$cast', 3] }, 
                    initialValue: '', 
                    in: { $concat: ['$$value', { $cond: { if: { $eq: ['$$value', ''] }, then: '', else: ', ' } }, '$$this'] } 
                  } 
                },
                else: '$cast'
              }
            },
            durationFormatted: {
              $concat: [
                { $toString: { $floor: { $divide: ['$duration', 60] } } },
                'h ',
                { $toString: { $mod: ['$duration', 60] } },
                'm'
              ]
            }
          }
        },
        // Sort by relevance score and rating
        {
          $sort: {
            searchScore: -1,
            ratingsAverage: -1,
            releaseDate: -1
          }
        },
        // Limit final results
        {
          $limit: limit
        }
      ];

      const movies = await Movie.aggregate(pipeline);
      
      console.log(`Found ${movies.length} movies for query: "${query}"`);
      return movies;
      
    } catch (error) {
      console.error('Error in movie vector search:', error);
      // Fallback to regular search if vector search fails
      return await this.fallbackMovieSearch(query, options);
    }
  }

  /**
   * Fallback search using regular text search
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Search results
   */
  async fallbackMovieSearch(query, options = {}) {
    const {
      limit = 10,
      includeUpcoming = true,
      includeNowShowing = true,
      genreFilter = null,
      minRating = 0
    } = options;

    try {
      const searchRegex = new RegExp(query, 'i');
      
      const matchConditions = {
        isHidden: false,
        $or: [
          { title: { $regex: searchRegex } },
          { description: { $regex: searchRegex } },
          { director: { $regex: searchRegex } },
          { cast: { $in: [searchRegex] } },
          { genre: { $in: [searchRegex] } }
        ],
        ...(genreFilter && { genre: { $in: [genreFilter] } }),
        ...(minRating > 0 && { ratingsAverage: { $gte: minRating } }),
        ...(includeUpcoming && !includeNowShowing && { releaseDate: { $gt: new Date() } }),
        ...(includeNowShowing && !includeUpcoming && { releaseDate: { $lte: new Date() } })
      };

      const movies = await Movie.find(matchConditions)
        .select('title description posterURL duration genre ageRating director cast language releaseDate ratingsAverage ratingsQuantity')
        .sort({ ratingsAverage: -1, releaseDate: -1, title: 1 })
        .limit(limit)
        .lean();

      // Add computed fields
      const moviesWithStatus = movies.map(movie => ({
        ...movie,
        status: new Date(movie.releaseDate) > new Date() ? 'Upcoming' : 'Now Showing',
        searchScore: 1, // Default score for fallback
        searchMethod: 'fallback',
        genreString: Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre,
        castString: Array.isArray(movie.cast) ? movie.cast.slice(0, 3).join(', ') : movie.cast,
        durationFormatted: movie.duration ? `${Math.floor(movie.duration / 60)}h ${movie.duration % 60}m` : ''
      }));

      console.log(`Fallback search found ${moviesWithStatus.length} movies for query: "${query}"`);
      return moviesWithStatus;
      
    } catch (error) {
      console.error('Error in fallback movie search:', error);
      return [];
    }
  }

  /**
   * Get movies by specific criteria (helper method)
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} Filtered movies
   */
  async getMoviesByFilters(filters = {}) {
    const {
      status = null, // 'now-showing' or 'upcoming'
      genre = null,
      minRating = 0,
      limit = 20
    } = filters;

    try {
      const now = new Date();
      const matchConditions = {
        isHidden: false,
        ...(genre && { genre: { $in: [genre] } }),
        ...(minRating > 0 && { ratingsAverage: { $gte: minRating } }),
        ...(status === 'now-showing' && { releaseDate: { $lte: now } }),
        ...(status === 'upcoming' && { releaseDate: { $gt: now } })
      };

      const movies = await Movie.find(matchConditions)
        .select('title description posterURL duration genre ageRating director cast language releaseDate ratingsAverage ratingsQuantity')
        .sort({ ratingsAverage: -1, releaseDate: status === 'upcoming' ? 1 : -1, title: 1 })
        .limit(limit)
        .lean();

      // Add computed fields
      const moviesWithStatus = movies.map(movie => ({
        ...movie,
        status: new Date(movie.releaseDate) > now ? 'Upcoming' : 'Now Showing',
        genreString: Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre,
        castString: Array.isArray(movie.cast) ? movie.cast.slice(0, 3).join(', ') : movie.cast,
        durationFormatted: movie.duration ? `${Math.floor(movie.duration / 60)}h ${movie.duration % 60}m` : ''
      }));

      return moviesWithStatus;
      
    } catch (error) {
      console.error('Error getting movies by filters:', error);
      return [];
    }
  }

  /**
   * Get movie with schedules information
   * @param {string} movieId - Movie ID
   * @param {Object} options - Options
   * @returns {Promise<Object>} Movie with schedule info
   */
  async getMovieWithSchedules(movieId, options = {}) {
    const { branchId = null, date = null, limit = 10 } = options;

    try {
      // Get movie details
      const movie = await Movie.findById(movieId)
        .select('title description posterURL duration genre ageRating director cast language releaseDate ratingsAverage ratingsQuantity')
        .lean();

      if (!movie) {
        return null;
      }

      // Get schedules for this movie
      const scheduleQuery = {
        movie: new mongoose.Types.ObjectId(movieId),
        startTime: { $gte: new Date() }
      };

      if (date) {
        const startOfDay = new Date(date + 'T00:00:00.000Z');
        const endOfDay = new Date(date + 'T23:59:59.999Z');
        scheduleQuery.startTime = { $gte: startOfDay, $lte: endOfDay };
      }

      const pipeline = [
        { $match: scheduleQuery },
        {
          $lookup: {
            from: 'screens',
            localField: 'screen',
            foreignField: '_id',
            as: 'screenData'
          }
        },
        {
          $lookup: {
            from: 'branches',
            localField: 'screenData.branch',
            foreignField: '_id',
            as: 'branchData'
          }
        },
        {
          $unwind: '$screenData'
        },
        {
          $unwind: '$branchData'
        },
        {
          $match: {
            'branchData.isActive': true,
            'screenData.isActive': true,
            ...(branchId && { 'branchData._id': new mongoose.Types.ObjectId(branchId) })
          }
        },
        {
          $project: {
            _id: 1,
            startTime: 1,
            endTime: 1,
            OccupiedSeat: 1,
            screen: {
              _id: '$screenData._id',
              screenName: '$screenData.screenName',
              totalSeats: '$screenData.totalSeats'
            },
            branch: {
              _id: '$branchData._id',
              name: '$branchData.name',
              address: '$branchData.address'
            },
            availableSeats: {
              $subtract: [
                '$screenData.totalSeats',
                { $size: { $ifNull: ['$OccupiedSeat', []] } }
              ]
            }
          }
        },
        { $sort: { startTime: 1 } },
        { $limit: limit }
      ];

      const schedules = await Schedule.aggregate(pipeline);

      // Add status and formatted fields to movie
      movie.status = new Date(movie.releaseDate) > new Date() ? 'Upcoming' : 'Now Showing';
      movie.genreString = Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre;
      movie.castString = Array.isArray(movie.cast) ? movie.cast.slice(0, 3).join(', ') : movie.cast;
      movie.durationFormatted = movie.duration ? `${Math.floor(movie.duration / 60)}h ${movie.duration % 60}m` : '';

      return {
        movie,
        schedules,
        scheduleCount: schedules.length
      };
      
    } catch (error) {
      console.error('Error getting movie with schedules:', error);
      return null;
    }
  }

  /**
   * Format movie results for chatbot response
   * @param {Array} movies - Movie results
   * @param {Object} context - Additional context
   * @returns {Object} Formatted response
   */
  formatMovieResults(movies, context = {}) {
    if (!movies || movies.length === 0) {
      return {
        type: 'no_results',
        message: 'Không tìm thấy phim phù hợp.',
        suggestions: [
          { text: 'Phim đang chiếu', action: 'get_now_showing' },
          { text: 'Phim sắp chiếu', action: 'get_upcoming' },
          { text: 'Thay đổi từ khóa tìm kiếm', action: 'search_movies' }
        ]
      };
    }

    const formattedMovies = movies.map(movie => ({
      id: movie._id,
      title: movie.title,
      description: movie.description,
      poster: movie.posterURL,
      details: {
        duration: movie.durationFormatted || movie.duration,
        genre: movie.genreString || movie.genre,
        ageRating: movie.ageRating,
        director: movie.director,
        cast: movie.castString || movie.cast,
        rating: movie.ratingsAverage,
        releaseDate: movie.releaseDate,
        status: movie.status
      },
      relevanceScore: movie.searchScore
    }));

    return {
      type: 'movie_results',
      count: movies.length,
      results: formattedMovies,
      context: context,
      summary: `Tìm thấy ${movies.length} phim phù hợp`,
      suggestions: [
        { text: 'Xem lịch chiếu', action: 'find_schedules' },
        { text: 'Chi tiết phim', action: 'movie_details' },
        { text: 'Tìm phim khác', action: 'search_movies' }
      ]
    };
  }
}

module.exports = MovieRetrieverService;
