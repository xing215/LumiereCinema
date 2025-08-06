const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const Schedule = require('../models/Schedule');
const Branch = require('../models/Branch');
const Screen = require('../models/Screen');
const { generateQueryEmbedding } = require('./embeddingService');

/**
 * Schedule Retriever Service
 * Handles vector-based search for schedules using MongoDB Atlas Vector Search
 */
class ScheduleRetrieverService {
  /**
   * Initialize the service
   */  constructor() {
    this.collectionName = 'schedules';
    this.vectorFieldName = 'embedding';
    this.indexName = 'search_schedules_index';
  }

  /**
   * Perform semantic search for schedules
   * @param {string} query - User query
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Search results
   */
  async searchSchedules(query, options = {}) {
    const {
      limit = 10,
      branchId = null,
      movieId = null,
      date = null,
      includeExpired = false
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
        // Populate related data
        {
          $lookup: {
            from: 'movies',
            localField: 'movie',
            foreignField: '_id',
            as: 'movieData'
          }
        },
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
        // Unwind arrays
        {
          $unwind: {
            path: '$movieData',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: '$screenData',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: '$branchData',
            preserveNullAndEmptyArrays: true
          }
        },
        // Apply filters
        {
          $match: {
            'movieData.isHidden': false, // Only show schedules for visible movies
            'branchData.isActive': true, // Only active branches
            'screenData.isActive': true, // Only active screens
            ...(branchId && { 'branchData._id': new mongoose.Types.ObjectId(branchId) }),
            ...(movieId && { 'movieData._id': new mongoose.Types.ObjectId(movieId) }),
            ...(date && { 
              startTime: {
                $gte: new Date(date + 'T00:00:00.000Z'),
                $lt: new Date(date + 'T23:59:59.999Z')
              }
            }),
            ...(!includeExpired && { endTime: { $gte: new Date() } })
          }
        },
        // Project relevant fields
        {
          $project: {
            _id: 1,
            startTime: 1,
            endTime: 1,
            searchScore: 1,
            OccupiedSeat: 1,
            movie: {
              _id: '$movieData._id',
              title: '$movieData.title',
              description: '$movieData.description',
              posterURL: '$movieData.posterURL',
              duration: '$movieData.duration',
              genre: '$movieData.genre',
              ageRating: '$movieData.ageRating',
              ratingsAverage: '$movieData.ratingsAverage'
            },
            screen: {
              _id: '$screenData._id',
              screenName: '$screenData.screenName',
              screenType: '$screenData.screenType',
              totalSeats: '$screenData.totalSeats'
            },
            branch: {
              _id: '$branchData._id',
              name: '$branchData.name',
              address: '$branchData.address',
              city: '$branchData.city'
            },
            // Add computed fields
            availableSeats: {
              $subtract: [
                { $ifNull: ['$screenData.totalSeats', 0] },
                { $size: { $ifNull: ['$OccupiedSeat', []] } }
              ]
            },
            dateFormatted: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$startTime'
              }
            },
            timeFormatted: {
              $dateToString: {
                format: '%H:%M',
                date: '$startTime'
              }
            }
          }
        },
        // Sort by relevance score and start time
        {
          $sort: {
            searchScore: -1,
            startTime: 1
          }
        },
        // Limit final results
        {
          $limit: limit
        }
      ];

      const schedules = await Schedule.aggregate(pipeline);
      
      console.log(`Found ${schedules.length} schedules for query: "${query}"`);
      return schedules;
      
    } catch (error) {
      console.error('Error in schedule vector search:', error);
      // Fallback to regular search if vector search fails
      return await this.fallbackScheduleSearch(query, options);
    }
  }

  /**
   * Fallback search using regular text search
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Search results
   */
  async fallbackScheduleSearch(query, options = {}) {
    const {
      limit = 10,
      branchId = null,
      movieId = null,
      date = null,
      includeExpired = false
    } = options;

    try {
      const searchRegex = new RegExp(query, 'i');
      
      const pipeline = [
        // Populate related data first
        {
          $lookup: {
            from: 'movies',
            localField: 'movie',
            foreignField: '_id',
            as: 'movieData'
          }
        },
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
        // Unwind arrays
        {
          $unwind: {
            path: '$movieData',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: '$screenData',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: '$branchData',
            preserveNullAndEmptyArrays: true
          }
        },
        // Apply text search and filters
        {
          $match: {
            $or: [
              { 'movieData.title': { $regex: searchRegex } },
              { 'movieData.description': { $regex: searchRegex } },
              { 'movieData.genre': { $in: [searchRegex] } },
              { 'movieData.director': { $regex: searchRegex } },
              { 'movieData.cast': { $in: [searchRegex] } },
              { 'branchData.name': { $regex: searchRegex } },
              { 'branchData.address': { $regex: searchRegex } },
              { 'branchData.city': { $regex: searchRegex } },
              { 'screenData.screenName': { $regex: searchRegex } }
            ],
            'movieData.isHidden': false,
            'branchData.isActive': true,
            'screenData.isActive': true,
            ...(branchId && { 'branchData._id': new mongoose.Types.ObjectId(branchId) }),
            ...(movieId && { 'movieData._id': new mongoose.Types.ObjectId(movieId) }),
            ...(date && { 
              startTime: {
                $gte: new Date(date + 'T00:00:00.000Z'),
                $lt: new Date(date + 'T23:59:59.999Z')
              }
            }),
            ...(!includeExpired && { endTime: { $gte: new Date() } })
          }
        },
        // Project results
        {
          $project: {
            _id: 1,
            startTime: 1,
            endTime: 1,
            searchScore: 1, // Will be 1 for fallback
            OccupiedSeat: 1,
            movie: {
              _id: '$movieData._id',
              title: '$movieData.title',
              description: '$movieData.description',
              posterURL: '$movieData.posterURL',
              duration: '$movieData.duration',
              genre: '$movieData.genre',
              ageRating: '$movieData.ageRating',
              ratingsAverage: '$movieData.ratingsAverage'
            },
            screen: {
              _id: '$screenData._id',
              screenName: '$screenData.screenName',
              screenType: '$screenData.screenType',
              totalSeats: '$screenData.totalSeats'
            },
            branch: {
              _id: '$branchData._id',
              name: '$branchData.name',
              address: '$branchData.address',
              city: '$branchData.city'
            },
            availableSeats: {
              $subtract: [
                { $ifNull: ['$screenData.totalSeats', 0] },
                { $size: { $ifNull: ['$OccupiedSeat', []] } }
              ]
            },
            dateFormatted: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$startTime'
              }
            },
            timeFormatted: {
              $dateToString: {
                format: '%H:%M',
                date: '$startTime'
              }
            }
          }
        },
        // Sort by start time
        {
          $sort: {
            startTime: 1
          }
        },
        {
          $limit: limit
        }
      ];

      const schedules = await Schedule.aggregate(pipeline);
      
      // Add fallback score
      schedules.forEach(schedule => {
        schedule.searchScore = 1;
        schedule.searchMethod = 'fallback';
      });

      console.log(`Fallback search found ${schedules.length} schedules for query: "${query}"`);
      return schedules;
      
    } catch (error) {
      console.error('Error in fallback schedule search:', error);
      return [];
    }
  }

  /**
   * Get schedules by specific criteria (helper method)
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} Filtered schedules
   */
  async getSchedulesByFilters(filters = {}) {
    const {
      branchId,
      movieId,
      date,
      startDate,
      endDate,
      limit = 20,
      includeExpired = false
    } = filters;

    try {
      const pipeline = [
        // Populate related data
        {
          $lookup: {
            from: 'movies',
            localField: 'movie',
            foreignField: '_id',
            as: 'movieData'
          }
        },
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
        // Unwind
        {
          $unwind: {
            path: '$movieData',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: '$screenData',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: '$branchData',
            preserveNullAndEmptyArrays: true
          }
        },
        // Apply filters
        {
          $match: {
            'movieData.isHidden': false,
            'branchData.isActive': true,
            'screenData.isActive': true,
            ...(branchId && { 'branchData._id': new mongoose.Types.ObjectId(branchId) }),
            ...(movieId && { 'movieData._id': new mongoose.Types.ObjectId(movieId) }),
            ...(date && { 
              startTime: {
                $gte: new Date(date + 'T00:00:00.000Z'),
                $lt: new Date(date + 'T23:59:59.999Z')
              }
            }),
            ...(startDate && endDate && {
              startTime: {
                $gte: new Date(startDate + 'T00:00:00.000Z'),
                $lte: new Date(endDate + 'T23:59:59.999Z')
              }
            }),
            ...(!includeExpired && { endTime: { $gte: new Date() } })
          }
        },
        // Project results
        {
          $project: {
            _id: 1,
            startTime: 1,
            endTime: 1,
            OccupiedSeat: 1,
            movie: {
              _id: '$movieData._id',
              title: '$movieData.title',
              description: '$movieData.description',
              posterURL: '$movieData.posterURL',
              duration: '$movieData.duration',
              genre: '$movieData.genre',
              ageRating: '$movieData.ageRating',
              ratingsAverage: '$movieData.ratingsAverage'
            },
            screen: {
              _id: '$screenData._id',
              screenName: '$screenData.screenName',
              screenType: '$screenData.screenType',
              totalSeats: '$screenData.totalSeats'
            },
            branch: {
              _id: '$branchData._id',
              name: '$branchData.name',
              address: '$branchData.address',
              city: '$branchData.city'
            },
            availableSeats: {
              $subtract: [
                { $ifNull: ['$screenData.totalSeats', 0] },
                { $size: { $ifNull: ['$OccupiedSeat', []] } }
              ]
            },
            dateFormatted: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$startTime'
              }
            },
            timeFormatted: {
              $dateToString: {
                format: '%H:%M',
                date: '$startTime'
              }
            }
          }
        },
        // Sort by start time
        {
          $sort: {
            startTime: 1
          }
        },
        {
          $limit: limit
        }
      ];

      const schedules = await Schedule.aggregate(pipeline);
      return schedules;
      
    } catch (error) {
      console.error('Error getting schedules by filters:', error);
      return [];
    }
  }

  /**
   * Combine and rank results from both movie and schedule searches
   * @param {string} query - User query
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Combined results
   */
  async hybridSearch(query, options = {}) {
    const { limit = 10, includeMovies = true, includeSchedules = true } = options;
    
    try {
      const results = {};
      
      if (includeSchedules) {
        // Search schedules
        results.schedules = await this.searchSchedules(query, {
          ...options,
          limit: Math.ceil(limit * 0.7) // 70% for schedules
        });
      }
        if (includeMovies) {
        // Import movie retriever service dynamically to avoid circular dependency
        const MovieRetrieverService = require('./movieRetrieverService');
        const movieRetriever = new MovieRetrieverService();
        
        // Create analysis object for movie search
        const analysisObject = {
          entities: {
            search_type: 'keyword',
            search_keyword: query,
            movie_title: query.includes('phim') ? query : null
          }
        };
        
        results.movies = await movieRetriever.searchMovies(analysisObject, {
          ...options,
          limit: Math.ceil(limit * 0.3) // 30% for movies
        });
      }
      
      return {
        query,
        totalResults: (results.schedules?.length || 0) + (results.movies?.length || 0),
        schedules: results.schedules || [],
        movies: results.movies || [],
        searchMethod: 'hybrid',
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Error in hybrid search:', error);
      return {
        query,
        totalResults: 0,
        schedules: [],
        movies: [],
        error: error.message
      };
    }
  }

  /**
   * Format schedule results for chatbot response
   * @param {Array} schedules - Schedule results
   * @param {Object} context - Additional context
   * @returns {Object} Formatted response
   */
  formatScheduleResults(schedules, context = {}) {
    if (!schedules || schedules.length === 0) {
      return {
        type: 'no_results',
        message: 'Không tìm thấy lịch chiếu phù hợp.',
        suggestions: [
          { text: 'Thay đổi ngày tìm kiếm', action: 'change_date' },
          { text: 'Chọn chi nhánh khác', action: 'change_branch' },
          { text: 'Tìm phim khác', action: 'search_movies' }
        ]
      };
    }

    const formattedSchedules = schedules.map(schedule => ({
      id: schedule._id,
      movie: {
        title: schedule.movie.title,
        genre: schedule.movie.genre,
        duration: schedule.movie.duration,
        ageRating: schedule.movie.ageRating,
        rating: schedule.movie.ratingsAverage
      },
      schedule: {
        date: schedule.dateFormatted,
        time: schedule.timeFormatted,
        startTime: schedule.startTime,
        endTime: schedule.endTime
      },
      venue: {
        branch: schedule.branch.name,
        screen: schedule.screen.screenName,
        address: schedule.branch.address,
        city: schedule.branch.city
      },
      seats: {
        available: schedule.availableSeats,
        total: schedule.screen.totalSeats
      },
      relevanceScore: schedule.searchScore
    }));

    return {
      type: 'schedule_results',
      count: schedules.length,
      results: formattedSchedules,
      context: context,
      summary: `Tìm thấy ${schedules.length} lịch chiếu phù hợp`,
      suggestions: [
        { text: 'Đặt vé ngay', action: 'book_tickets' },
        { text: 'Xem chi tiết phim', action: 'movie_details' },
        { text: 'Tìm chi nhánh gần nhất', action: 'find_nearest_branch' }
      ]
    };
  }
}

module.exports = ScheduleRetrieverService;
