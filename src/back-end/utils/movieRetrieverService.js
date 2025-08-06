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
   */  constructor() {
    this.collectionName = 'movies';
    this.vectorFieldName = 'embedding';
    this.indexName = 'search_movies_index';
  }
  /**
   * Perform intelligent search for movies using LLM analysis
   * @param {Object} analysis - LLM analysis object with entities and search_type
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Search results
   */
  async searchMovies(analysis, options = {}) {
    const { entities } = analysis;
    const { search_type, search_keyword, movie_title } = entities;
    const {
      limit = 10,
      includeUpcoming = true,
      includeNowShowing = true,
      minRating = 0
    } = options;    let pipeline = [];
    let queryToEmbed = movie_title || search_keyword;

    console.log(`🧠 Intelligent Retriever building query for search_type: ${search_type}`);

    try {
      // ================== SPECIALIZED SEARCHES ==================
      
      if (search_type === 'genre') {
        console.log(`🎯 Performing targeted GENRE search for: "${search_keyword}"`);
        
        pipeline = [
          {
            $match: {
              isHidden: false,
              genre: { $regex: new RegExp(search_keyword, 'i') },
              ...(minRating > 0 && { ratingsAverage: { $gte: minRating } }),
              ...(includeUpcoming && !includeNowShowing && { releaseDate: { $gt: new Date() } }),
              ...(includeNowShowing && !includeUpcoming && { releaseDate: { $lte: new Date() } })
            }
          },
          {
            $addFields: {
              searchScore: 1.0, // High confidence for exact genre match
              searchMethod: 'genre_targeted',
              status: {
                $cond: {
                  if: { $gt: ['$releaseDate', new Date()] },
                  then: 'Upcoming',
                  else: 'Now Showing'
                }
              }
            }
          },
          { 
            $sort: { 
              ratingsAverage: -1, 
              ratingsQuantity: -1,
              releaseDate: -1 
            } 
          },
          { $limit: limit }
        ];
      }
      
      else if (search_type === 'director') {
        console.log(`🎯 Performing targeted DIRECTOR search for: "${search_keyword}"`);
        
        pipeline = [
          {
            $match: {
              isHidden: false,
              director: { $regex: new RegExp(search_keyword, 'i') },
              ...(minRating > 0 && { ratingsAverage: { $gte: minRating } }),
              ...(includeUpcoming && !includeNowShowing && { releaseDate: { $gt: new Date() } }),
              ...(includeNowShowing && !includeUpcoming && { releaseDate: { $lte: new Date() } })
            }
          },
          {
            $addFields: {
              searchScore: 1.0, // High confidence for exact director match
              searchMethod: 'director_targeted',
              status: {
                $cond: {
                  if: { $gt: ['$releaseDate', new Date()] },
                  then: 'Upcoming',
                  else: 'Now Showing'
                }
              }
            }
          },
          { 
            $sort: { 
              ratingsAverage: -1, 
              releaseDate: -1 
            } 
          },
          { $limit: limit }
        ];
      }
      
      else if (search_type === 'cast') {
        console.log(`🎯 Performing targeted CAST search for: "${search_keyword}"`);
        
        pipeline = [
          {
            $match: {
              isHidden: false,
              cast: { $regex: new RegExp(search_keyword, 'i') },
              ...(minRating > 0 && { ratingsAverage: { $gte: minRating } }),
              ...(includeUpcoming && !includeNowShowing && { releaseDate: { $gt: new Date() } }),
              ...(includeNowShowing && !includeUpcoming && { releaseDate: { $lte: new Date() } })
            }
          },
          {
            $addFields: {
              searchScore: 1.0, // High confidence for exact cast match
              searchMethod: 'cast_targeted',
              status: {
                $cond: {
                  if: { $gt: ['$releaseDate', new Date()] },
                  then: 'Upcoming',
                  else: 'Now Showing'
                }
              }
            }
          },
          { 
            $sort: { 
              ratingsAverage: -1, 
              releaseDate: -1 
            } 
          },
          { $limit: limit }
        ];
      }
      
      // ================== HYBRID SEARCH (TITLE OR GENERAL) ==================
      else {
        console.log(`🚀 Performing Hybrid Vector + Text Search for: "${queryToEmbed}"`);
        
        // Try vector search first
        const queryEmbedding = await generateQueryEmbedding(queryToEmbed);
        
        if (queryEmbedding && queryEmbedding.length > 0) {
          // Use vector search with text fallback
          pipeline = [
            {
              $vectorSearch: {
                index: this.indexName,
                path: this.vectorFieldName,
                queryVector: queryEmbedding,
                numCandidates: Math.max(limit * 10, 150),
                limit: limit * 2
              }
            },
            {
              $addFields: {
                searchScore: { $meta: 'vectorSearchScore' },
                searchMethod: 'vector_hybrid'
              }
            },
            {
              $match: {
                isHidden: false,
                ...(minRating > 0 && { ratingsAverage: { $gte: minRating } }),
                ...(includeUpcoming && !includeNowShowing && { releaseDate: { $gt: new Date() } }),
                ...(includeNowShowing && !includeUpcoming && { releaseDate: { $lte: new Date() } })
              }
            },
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
            {
              $sort: {
                searchScore: -1,
                ratingsAverage: -1,
                releaseDate: -1
              }
            },
            { $limit: limit }
          ];
        } else {
          // Fallback to text search
          console.log('⚠️ Vector embedding failed, using text search fallback');
          return await this.fallbackMovieSearch(queryToEmbed, options);
        }
      }

      // ================== EXECUTE SEARCH ==================
      const movies = await Movie.aggregate(pipeline);
      
      // Add formatted fields to all results
      const enhancedMovies = movies.map(movie => ({
        ...movie,
        genreString: Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre,
        castString: Array.isArray(movie.cast) ? movie.cast.slice(0, 3).join(', ') : movie.cast,
        durationFormatted: movie.duration ? `${Math.floor(movie.duration / 60)}h ${movie.duration % 60}m` : '',
        searchType: search_type || 'general'
      }));

      console.log(`✅ Found ${enhancedMovies.length} movies using ${search_type || 'hybrid'} search`);
      return enhancedMovies;
      
    } catch (error) {
      console.error(`Error in intelligent movie search for type '${search_type}':`, error);
      // Fallback to simple search
      return await this.fallbackMovieSearch(queryToEmbed || 'popular movies', options);
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

  // === STATEFUL RAG SUPPORT METHODS ===
  
  /**
   * Get movie by ID (for context retrieval)
   * @param {string} movieId - Movie ID
   * @returns {Promise<Object|null>} Movie object or null
   */
  async getMovieById(movieId) {
    try {
      const movie = await Movie.findById(movieId)
        .select('title description posterURL duration genre ageRating director cast language releaseDate ratingsAverage ratingsQuantity')
        .lean();
      
      if (!movie) return null;

      // Add computed fields
      const now = new Date();
      return {
        ...movie,
        status: new Date(movie.releaseDate) > now ? 'Upcoming' : 'Now Showing',
        genreString: Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre,
        castString: Array.isArray(movie.cast) ? movie.cast.slice(0, 3).join(', ') : movie.cast,
        durationFormatted: movie.duration ? `${Math.floor(movie.duration / 60)}h ${movie.duration % 60}m` : ''
      };
    } catch (error) {
      console.error('Error getting movie by ID:', error);
      return null;
    }
  }

  /**
   * Find similar movies based on genre/director/cast
   * @param {Array} baseMovieIds - Array of movie IDs to find similar to
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Similar movies
   */
  async findSimilarMovies(baseMovieIds, options = {}) {
    const { limit = 5 } = options;
    
    try {
      // Get base movies first
      const baseMovies = await Movie.find({ 
        _id: { $in: baseMovieIds }, 
        isHidden: false 
      })
      .select('genre director cast')
      .lean();

      if (baseMovies.length === 0) return [];

      // Extract characteristics from base movies
      const allGenres = [...new Set(baseMovies.flatMap(m => Array.isArray(m.genre) ? m.genre : [m.genre]))];
      const allDirectors = [...new Set(baseMovies.map(m => m.director).filter(Boolean))];
      const allCast = [...new Set(baseMovies.flatMap(m => Array.isArray(m.cast) ? m.cast.slice(0, 3) : [m.cast]).filter(Boolean))];

      // Build search criteria
      const searchCriteria = {
        _id: { $nin: baseMovieIds }, // Exclude base movies
        isHidden: false,
        $or: [
          { genre: { $in: allGenres } },
          { director: { $in: allDirectors } },
          { cast: { $in: allCast } }
        ]
      };

      const similarMovies = await Movie.find(searchCriteria)
        .select('title description posterURL duration genre ageRating director cast language releaseDate ratingsAverage ratingsQuantity')
        .sort({ ratingsAverage: -1, ratingsQuantity: -1 })
        .limit(limit)
        .lean();

      // Add computed fields
      const now = new Date();
      return similarMovies.map(movie => ({
        ...movie,
        status: new Date(movie.releaseDate) > now ? 'Upcoming' : 'Now Showing',
        genreString: Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre,
        castString: Array.isArray(movie.cast) ? movie.cast.slice(0, 3).join(', ') : movie.cast,
        durationFormatted: movie.duration ? `${Math.floor(movie.duration / 60)}h ${movie.duration % 60}m` : '',
        searchScore: 0.8, // High relevance for similar movies
        searchMethod: 'similarity'
      }));

    } catch (error) {
      console.error('Error finding similar movies:', error);
      return [];
    }
  }

  /**
   * Get popular/trending movies
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Popular movies
   */
  async getPopularMovies(options = {}) {
    const { limit = 10, includeUpcoming = false } = options;
    
    try {
      const now = new Date();
      const matchCriteria = {
        isHidden: false,
        ratingsAverage: { $gte: 7.0 }, // Only high-rated movies
        ratingsQuantity: { $gte: 10 }, // With enough reviews
        ...(includeUpcoming ? {} : { releaseDate: { $lte: now } })
      };

      const popularMovies = await Movie.find(matchCriteria)
        .select('title description posterURL duration genre ageRating director cast language releaseDate ratingsAverage ratingsQuantity')
        .sort({ 
          ratingsAverage: -1, 
          ratingsQuantity: -1, 
          releaseDate: -1 
        })
        .limit(limit)
        .lean();

      // Add computed fields
      return popularMovies.map(movie => ({
        ...movie,
        status: new Date(movie.releaseDate) > now ? 'Upcoming' : 'Now Showing',
        genreString: Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre,
        castString: Array.isArray(movie.cast) ? movie.cast.slice(0, 3).join(', ') : movie.cast,
        durationFormatted: movie.duration ? `${Math.floor(movie.duration / 60)}h ${movie.duration % 60}m` : '',
        searchScore: 0.9, // High relevance for popular movies
        searchMethod: 'popularity'
      }));    } catch (error) {
      console.error('Error getting popular movies:', error);
      return [];
    }
  }

  // ================ STATEFUL RAG CONTEXT-AWARE METHODS ================
  /**
   * Get now showing movies with interaction context
   */
  async getNowShowingWithContext(interactionContext = {}) {
    try {
      console.log('🎬 Getting now showing movies with context');
      const movies = await this.getMoviesByFilters({ status: 'now-showing' });
      
      // Prioritize movies similar to previously interacted ones
      if (interactionContext.lastInteractedMovieId) {
        return this._prioritizeByContext(movies, interactionContext);
      }
      
      return movies;
    } catch (error) {
      console.error('Error getting now showing movies with context:', error);
      return [];
    }
  }

  /**
   * Get upcoming movies with interaction context
   */
  async getUpcomingWithContext(interactionContext = {}) {
    try {
      console.log('🎬 Getting upcoming movies with context');
      const movies = await this.getMoviesByFilters({ status: 'upcoming' });
      
      // Prioritize movies similar to previously interacted ones
      if (interactionContext.lastInteractedMovieId) {
        return this._prioritizeByContext(movies, interactionContext);
      }
      
      return movies;
    } catch (error) {
      console.error('Error getting upcoming movies with context:', error);
      return [];
    }
  }
  /**
   * Search movies with interaction context
   */
  async searchMoviesWithContext(analysis, interactionContext = {}) {
    try {
      console.log('🔍 Searching movies with context:', analysis.entities);
      const movies = await this.searchMovies(analysis);
      
      // Prioritize movies similar to previously interacted ones
      if (interactionContext.lastInteractedMovieId) {
        return this._prioritizeByContext(movies, interactionContext);
      }
      
      return movies;
    } catch (error) {
      console.error('Error searching movies with context:', error);
      return [];
    }
  }

  /**
   * Get movie details with interaction context
   */
  async getMovieDetailsWithContext(movieId, interactionContext = {}) {
    try {
      console.log('📄 Getting movie details with context:', movieId);
      const movie = await Movie.findById(movieId).lean();
      
      if (!movie) return null;
      
      // Add context-aware metadata
      movie.contextual = {
        isFromPreviousInteraction: movieId === interactionContext.lastInteractedMovieId,
        interactionHistory: interactionContext.movieInteractionCount || 0
      };
      
      return movie;
    } catch (error) {
      console.error('Error getting movie details with context:', error);
      return null;
    }
  }

  /**
   * Get schedules with interaction context
   */  async getSchedulesWithContext(entities, interactionContext = {}) {
    try {
      console.log('📅 Getting schedules with context:', entities);
      
      // Use context to fill missing movie information
      let movieTitle = entities.movie_title || interactionContext.lastInteractedMovieTitle;
      let movieId = entities.movie_id || interactionContext.lastInteractedMovieId;
      
      if (!movieTitle && !movieId) {
        throw new Error('No movie information available in entities or context');
      }
      
      // If we have movieId, proceed directly; otherwise search for movie
      if (!movieId && movieTitle) {
        const analysis = {
          entities: {
            search_type: 'title',
            movie_title: movieTitle,
            search_keyword: movieTitle
          }
        };
        
        const movies = await this.searchMovies(analysis, { limit: 1 });
        if (movies.length === 0) {
          throw new Error('Movie not found');
        }
        movieId = movies[0]._id;
        movieTitle = movies[0].title;
      }
      
      // Now get schedules for the movie
      const schedules = await this._getSchedulesForMovie(
        movieId, 
        entities.location, 
        entities.date || new Date().toISOString().split('T')[0]
      );
      
      // Add context information
      schedules.contextual = {
        movieTitle,
        movieId,
        fromInteractionContext: !entities.movie_title && !!interactionContext.lastInteractedMovieTitle
      };
      
      return schedules;
    } catch (error) {
      console.error('Error getting schedules with context:', error);
      return null;
    }
  }
  /**
   * Search movies for schedule with interaction context
   */
  async searchMoviesForScheduleWithContext(movieTitle, interactionContext = {}) {
    try {
      console.log('🎬🗓️ Searching movies for schedule with context:', movieTitle);
      
      // Create analysis object for title search
      const analysis = {
        entities: {
          search_type: 'title',
          movie_title: movieTitle,
          search_keyword: movieTitle
        }
      };
      
      const movies = await this.searchMovies(analysis, { limit: 5 });
      
      // Mark movies with schedule context
      const scheduleFocusedMovies = movies.map(movie => ({
        ...movie,
        context: 'schedule',
        contextual: {
          searchedForSchedule: true,
          relatedToPreviousInteraction: movie._id === interactionContext.lastInteractedMovieId
        }
      }));
      
      return scheduleFocusedMovies;
    } catch (error) {
      console.error('Error searching movies for schedule with context:', error);
      return [];
    }
  }

  /**
   * Helper: Prioritize movies based on interaction context
   */
  _prioritizeByContext(movies, interactionContext) {
    if (!interactionContext.lastInteractedMovieId || !movies.length) {
      return movies;
    }
    
    // Sort movies: previously interacted movie and similar ones first
    return movies.sort((a, b) => {
      // Prioritize the exact movie from context
      if (a._id.toString() === interactionContext.lastInteractedMovieId) return -1;
      if (b._id.toString() === interactionContext.lastInteractedMovieId) return 1;
      
      // Prioritize movies with same genre as context movie
      if (interactionContext.lastInteractedMovieGenre) {
        const aMatchesGenre = a.genre?.includes(interactionContext.lastInteractedMovieGenre);
        const bMatchesGenre = b.genre?.includes(interactionContext.lastInteractedMovieGenre);
        
        if (aMatchesGenre && !bMatchesGenre) return -1;
        if (bMatchesGenre && !aMatchesGenre) return 1;
      }
      
      // Default sort by rating or popularity
      return (b.rating || 0) - (a.rating || 0);
    });
  }

  /**
   * Helper: Get schedules for a specific movie
   */
  async _getSchedulesForMovie(movieId, location, date) {
    try {
      // This is a simplified version - in reality you'd need to:
      // 1. Find branch by location
      // 2. Get schedules for that branch, movie, and date
      // For now, return a mock structure that matches the expected format
      
      const movie = await Movie.findById(movieId).lean();
      
      return {
        movie_id: movieId,
        movie_title: movie?.title || 'Unknown Movie',
        branch_location: location || 'Unknown Location',
        date: date,
        schedules: [], // Would be populated with actual schedule data
        total_schedules: 0
      };
      
    } catch (error) {
      console.error('Error getting schedules for movie:', error);
      throw error;
    }
  }
}

module.exports = MovieRetrieverService;
