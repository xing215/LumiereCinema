const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const Schedule = require('../models/Schedule');
const Branch = require('../models/Branch'); // Import Branch model
const { generateEmbedding } = require('./embeddingService');
const ScheduleRetrieverService = require('./scheduleRetrieverService');

class MovieRetrieverService {
    constructor() {
        this.collectionName = 'movies';
        this.vectorFieldName = 'embedding';
        this.indexName = 'search_movies_index';
        this.scheduleRetriever = new ScheduleRetrieverService();
    }

    // ... (Hàm searchMovies và các hàm khác giữ nguyên không thay đổi)
    async searchMovies(analysis, options = {}) {
        const { entities } = analysis;
        const { search_type, search_keyword, movie_title } = entities;
        const { limit = 10, minRating = 0 } = options;
        let pipeline = [];
        let queryToEmbed = movie_title || search_keyword;

        console.log(`🧠 Intelligent Retriever building query for search_type: ${search_type}`);

        try {
            if (search_type === 'genre' || search_type === 'director' || search_type === 'cast') {
                console.log(`🎯 Performing targeted ${search_type.toUpperCase()} search for: "${search_keyword}"`);
                const matchField = search_type === 'genre' || search_type === 'cast' ? search_type : 'director';
                pipeline = [
                    {
                        $match: {
                            isHidden: false,
                            [matchField]: { $regex: new RegExp(search_keyword, 'i') },
                            ...(minRating > 0 && { ratingsAverage: { $gte: minRating } }),
                        },
                    },
                    { $addFields: { searchScore: 1.0, searchMethod: `${search_type}_targeted` } },
                    { $sort: { ratingsAverage: -1, releaseDate: -1 } },
                    { $limit: limit },
                ];
            } else {
                console.log(`🚀 Performing OPTIMIZED Hybrid Vector Search for: "${queryToEmbed}"`);
                const movieSearchText = `Title: ${queryToEmbed}. Description: ${queryToEmbed}.`;
                const queryEmbedding = await generateEmbedding(movieSearchText);

                if (queryEmbedding && queryEmbedding.length > 0) {
                    pipeline = [
                        {
                            $vectorSearch: {
                                index: this.indexName,
                                path: this.vectorFieldName,
                                queryVector: queryEmbedding,
                                numCandidates: Math.max(limit * 15, 200),
                                limit: limit,
                            },
                        },
                        {
                            $addFields: {
                                searchScore: { $meta: 'vectorSearchScore' },
                                searchMethod: 'vector_optimized',
                            },
                        },
                        {
                            $match: {
                                isHidden: false,
                                ...(minRating > 0 && { ratingsAverage: { $gte: minRating } }),
                            },
                        },
                    ];
                } else {
                    console.log('⚠️ Vector embedding failed, using fallback');
                    return await this.fallbackMovieSearch(queryToEmbed, options);
                }
            }
            const movies = await Movie.aggregate(pipeline);

            if (movies.length === 0) {
                console.log(`🔄 ${search_type || 'Vector'} search returned 0 results, triggering fallback...`);
                return await this.fallbackMovieSearch(queryToEmbed, options);
            }

            console.log(`✅ Found ${movies.length} movies using ${search_type || 'vector_optimized'} search`);
            return movies;
        } catch (error) {
            console.error(`Error in intelligent movie search for type '${search_type}':`, error);
            return await this.fallbackMovieSearch(queryToEmbed || 'popular movies', options);
        }
    }

    async fallbackMovieSearch(query, options = {}) {
        const { limit = 10 } = options;
        try {
            console.log(`🔍 FALLBACK: Searching for "${query}"`);
            const searchRegex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
            const matchConditions = {
                isHidden: false,
                $or: [
                    { title: { $regex: searchRegex } },
                    { director: { $regex: searchRegex } },
                    { cast: { $in: [searchRegex] } },
                    { genre: { $in: [searchRegex] } },
                ],
            };
            const movies = await Movie.find(matchConditions)
                .sort({ ratingsAverage: -1, releaseDate: -1 })
                .limit(limit)
                .lean();
            console.log(`✅ Fallback found ${movies.length} movies for query: "${query}"`);
            return movies;
        } catch (error) {
            console.error('Error in fallback movie search:', error);
            return [];
        }
    }

    async getMoviesByFilters(filters = {}) {
        const { status = null, limit = 20 } = filters;
        try {
            const now = new Date();
            const matchConditions = {
                isHidden: false,
                ...(status === 'now-showing' && { releaseDate: { $lte: now } }),
                ...(status === 'upcoming' && { releaseDate: { $gt: now } }),
            };
            return await Movie.find(matchConditions)
                .sort({ releaseDate: status === 'upcoming' ? 1 : -1 })
                .limit(limit)
                .lean();
        } catch (error) {
            console.error('Error getting movies by filters:', error);
            return [];
        }
    }

    async getMovieById(movieId) {
        try {
            return await Movie.findById(movieId).lean();
        } catch (error) {
            console.error('Error getting movie by ID:', error);
            return null;
        }
    }

    async getNowShowingWithContext(interactionContext = {}) {
        return this.getMoviesByFilters({ status: 'now-showing' });
    }

    async getUpcomingWithContext(interactionContext = {}) {
        return this.getMoviesByFilters({ status: 'upcoming' });
    }

    async searchMoviesWithContext(analysis, interactionContext = {}) {
        return this.searchMovies(analysis);
    }

    async getMovieDetailsWithContext(movieId, interactionContext = {}) {
        return this.getMovieById(movieId);
    }

    async getSchedulesWithContext(entities, interactionContext = {}) {
        try {
            console.log('📅 Getting schedules with context:', entities);
            let movieTitle = entities.movie_title || interactionContext.lastInteractedMovieTitle;
            let movieId = entities.movie_id || interactionContext.lastInteractedMovieId;
            if (!movieTitle && !movieId) {
                throw new Error('No movie information available in entities or context');
            }
            if (!movieId && movieTitle) {
                const analysis = {
                    entities: {
                        search_type: 'title',
                        movie_title: movieTitle,
                        search_keyword: movieTitle,
                    },
                };
                const movies = await this.searchMovies(analysis, { limit: 1 });
                if (movies.length === 0) {
                    throw new Error('Movie not found');
                }
                movieId = movies[0]._id;
            }
            const schedules = await this._getSchedulesForMovie(movieId, entities.location, entities.date);
            return schedules;
        } catch (error) {
            console.error('Error getting schedules with context:', error);
            return null;
        }
    }

    async searchMoviesForScheduleWithContext(movieTitle, interactionContext = {}) {
        const analysis = {
            entities: {
                search_type: 'title',
                movie_title: movieTitle,
                search_keyword: movieTitle,
            },
        };
        return this.searchMovies(analysis, { limit: 5 });
    }

    // ======================= HÀM ĐÃ ĐƯỢC NÂNG CẤP =======================
    async _getSchedulesForMovie(movieId, location, date) {
        try {
            const movie = await Movie.findById(movieId).lean();
            if (!movie) {
                throw new Error(`Movie with ID ${movieId} not found for schedule lookup.`);
            }

            let branchId = null;
            // Nếu có `location` (tên chi nhánh), tìm kiếm `branch_id` tương ứng
            if (location) {
                console.log(`📍 Converting location "${location}" to branch ID...`);
                // Dùng regex để tìm kiếm linh hoạt (VD: "nguyen van cu" cũng sẽ khớp)
                const branch = await Branch.findOne({ name: { $regex: new RegExp(location, 'i') } }).lean();
                if (branch) {
                    branchId = branch._id;
                    console.log(`✅ Found branch ID: ${branchId}`);
                } else {
                    console.log(`⚠️ Could not find branch for location: "${location}". Searching all branches.`);
                }
            }

            const filters = {
                movieId: movieId,
                date: date,
                branchId: branchId, // Truyền branchId (có thể là null) vào bộ lọc
            };

            const schedules = await this.scheduleRetriever.getSchedulesByFilters(filters);
            return schedules;
        } catch (error) {
            console.error('Error in _getSchedulesForMovie:', error);
            throw error;
        }
    }
    // =====================================================================
}

module.exports = MovieRetrieverService;
