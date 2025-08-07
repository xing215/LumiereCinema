const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const Schedule = require('../models/Schedule');
const Branch = require('../models/Branch');
const Screen = require('../models/Screen');
const { generateQueryEmbedding } = require('./embeddingService');

class ScheduleRetrieverService {
  constructor() {
    this.collectionName = 'schedules';
    this.vectorFieldName = 'embedding';
    this.indexName = 'search_schedules_index';
  }

  async searchSchedules(query, options = {}) {
    const {
      limit = 10, branchId = null, movieId = null, date = null, includeExpired = false
    } = options;
    try {
      const queryEmbedding = await generateQueryEmbedding(query);
      if (!queryEmbedding || queryEmbedding.length === 0) {
        console.warn('Failed to generate query embedding for:', query);
        return [];
      }
      const matchConditions = {
        'movieData.isHidden': false, 'branchData.isActive': true, 'screenData.isActive': true,
        ...(!includeExpired && { endTime: { $gte: new Date() } })
      };
      if (branchId) matchConditions['branchData._id'] = new mongoose.Types.ObjectId(branchId);
      if (movieId) matchConditions['movieData._id'] = new mongoose.Types.ObjectId(movieId);
      if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        matchConditions.startTime = { $gte: startOfDay, $lte: endOfDay };
      }
      const pipeline = [
        {
          $vectorSearch: {
            index: this.indexName, path: this.vectorFieldName, queryVector: queryEmbedding,
            numCandidates: Math.max(limit * 10, 100), limit: limit * 2
          }
        },
        { $addFields: { searchScore: { $meta: 'vectorSearchScore' } } },
        { $lookup: { from: 'movies', localField: 'movie', foreignField: '_id', as: 'movieData' } },
        { $lookup: { from: 'screens', localField: 'screen', foreignField: '_id', as: 'screenData' } },
        { $lookup: { from: 'branches', localField: 'screenData.branch', foreignField: '_id', as: 'branchData' } },
        {
          $lookup: {
            from: 'seatholds', let: { scheduleId: '$_id' },
            pipeline: [
              { $match: { $expr: { $eq: ['$schedule', '$$scheduleId'] }, expiresAt: { $gt: new Date() } } },
              { $project: { seatNumber: 1 } }
            ],
            as: 'seatHolds'
          }
        },
        { $unwind: { path: '$movieData', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$screenData', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$branchData', preserveNullAndEmptyArrays: true } },
        { $match: matchConditions },
        {
          $addFields: {
            totalSeats: { $ifNull: ['$screenData.totalSeats', { $multiply: ['$screenData.size.rows', '$screenData.size.columns'] }] },
            occupiedSeatsCount: { $size: { $ifNull: ['$OccupiedSeat', []] } },
            heldSeatsCount: { $size: '$seatHolds' }
          }
        },
        {
          $addFields: {
            availableSeats: { $subtract: ['$totalSeats', { $add: ['$occupiedSeatsCount', '$heldSeatsCount'] }] }
          }
        },
        {
          $project: {
            _id: 1, startTime: 1, endTime: 1, OccupiedSeat: 1,
            movie: { _id: '$movieData._id', title: '$movieData.title', posterURL: '$movieData.posterURL', duration: '$movieData.duration', genre: '$movieData.genre', ageRating: '$movieData.ageRating' },
            screen: { _id: '$screenData._id', screenName: '$screenData.screenName', screenType: '$screenData.screenType', totalSeats: '$totalSeats' },
            branch: { _id: '$branchData._id', name: '$branchData.name', address: '$branchData.address' },
            availableSeats: 1,
            dateFormatted: { $dateToString: { format: '%Y-%m-%d', date: '$startTime', timezone: 'Asia/Ho_Chi_Minh' } },
            timeFormatted: { $dateToString: { format: '%H:%M', date: '$startTime', timezone: 'Asia/Ho_Chi_Minh' } }
          }
        },
        { $sort: { searchScore: -1, startTime: 1 } },
        { $limit: limit }
      ];
      const schedules = await Schedule.aggregate(pipeline);
      console.log(`Found ${schedules.length} schedules for query: "${query}"`);
      return schedules;
    } catch (error) {
      console.error('Error in schedule vector search:', error);
      return await this.fallbackScheduleSearch(query, options);
    }
  }

  async fallbackScheduleSearch(query, options = {}) {
    const { limit = 10, branchId = null, movieId = null, date = null, includeExpired = false } = options;
    try {
      const searchRegex = new RegExp(query, 'i');
      const matchConditions = {
        $or: [
            { 'movieData.title': { $regex: searchRegex } }, { 'movieData.description': { $regex: searchRegex } },
            { 'movieData.genre': { $in: [searchRegex] } }, { 'movieData.director': { $regex: searchRegex } },
            { 'movieData.cast': { $in: [searchRegex] } }, { 'branchData.name': { $regex: searchRegex } },
            { 'branchData.address': { $regex: searchRegex } }, { 'branchData.city': { $regex: searchRegex } },
            { 'screenData.screenName': { $regex: searchRegex } }
        ],
        'movieData.isHidden': false, 'branchData.isActive': true, 'screenData.isActive': true,
        ...(!includeExpired && { endTime: { $gte: new Date() } })
      };
      if (branchId) matchConditions['branchData._id'] = new mongoose.Types.ObjectId(branchId);
      if (movieId) matchConditions['movieData._id'] = new mongoose.Types.ObjectId(movieId);
      if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        matchConditions.startTime = { $gte: startOfDay, $lte: endOfDay };
      }
      const pipeline = [
        { $lookup: { from: 'movies', localField: 'movie', foreignField: '_id', as: 'movieData' } },
        { $lookup: { from: 'screens', localField: 'screen', foreignField: '_id', as: 'screenData' } },
        { $lookup: { from: 'branches', localField: 'screenData.branch', foreignField: '_id', as: 'branchData' } },
        {
            $lookup: {
                from: 'seatholds', let: { scheduleId: '$_id' },
                pipeline: [
                    { $match: { $expr: { $eq: ['$schedule', '$$scheduleId'] }, expiresAt: { $gt: new Date() } } },
                    { $project: { seatNumber: 1, expiresAt: 1, holdReason: 1 } }
                ],
                as: 'seatHolds'
            }
        },
        { $unwind: { path: '$movieData', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$screenData', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$branchData', preserveNullAndEmptyArrays: true } },
        { $match: matchConditions },
        {
            $addFields: {
                totalSeats: { $ifNull: ['$screenData.totalSeats', { $multiply: ['$screenData.size.rows', '$screenData.size.columns'] }] },
                occupiedSeatsCount: { $size: { $ifNull: ['$OccupiedSeat', []] } },
                heldSeatsCount: { $size: '$seatHolds' }
            }
        },
        {
            $addFields: {
                availableSeats: { $subtract: ['$totalSeats', { $add: ['$occupiedSeatsCount', '$heldSeatsCount'] }] }
            }
        },
        {
            $project: {
                _id: 1, startTime: 1, endTime: 1, OccupiedSeat: 1,
                movie: { _id: '$movieData._id', title: '$movieData.title', posterURL: '$movieData.posterURL', duration: '$movieData.duration', genre: '$movieData.genre', ageRating: '$movieData.ageRating' },
                screen: { _id: '$screenData._id', screenName: '$screenData.screenName', screenType: '$screenData.screenType', totalSeats: '$totalSeats' },
                branch: { _id: '$branchData._id', name: '$branchData.name', address: '$branchData.address' },
                availableSeats: 1,
                dateFormatted: { $dateToString: { format: '%Y-%m-%d', date: '$startTime', timezone: 'Asia/Ho_Chi_Minh' } },
                timeFormatted: { $dateToString: { format: '%H:%M', date: '$startTime', timezone: 'Asia/Ho_Chi_Minh' } }
            }
        },
        { $sort: { startTime: 1 } },
        { $limit: limit }
      ];
      const schedules = await Schedule.aggregate(pipeline);
      console.log(`Fallback search found ${schedules.length} schedules for query: "${query}"`);
      return schedules;
    } catch (error) {
      console.error('Error in fallback schedule search:', error);
      return [];
    }
  }

  async getSchedulesByFilters(filters = {}) {
    const {
      branchId, movieId, date, startDate, endDate, limit = 20, includeExpired = false
    } = filters;
    try {
      const pipeline = [
        { $lookup: { from: 'movies', localField: 'movie', foreignField: '_id', as: 'movieData' } },
        { $lookup: { from: 'screens', localField: 'screen', foreignField: '_id', as: 'screenData' } },
        { $lookup: { from: 'branches', localField: 'screenData.branch', foreignField: '_id', as: 'branchData' } },
        { $unwind: { path: '$movieData', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$screenData', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$branchData', preserveNullAndEmptyArrays: true } }
      ];
      
      const matchStage = {
        'movieData.isHidden': false, 'branchData.isActive': true, 'screenData.isActive': true,
        ...(!includeExpired && { endTime: { $gte: new Date() } })
      };
      if (branchId) matchStage['branchData._id'] = new mongoose.Types.ObjectId(branchId);
      if (movieId) matchStage['movieData._id'] = new mongoose.Types.ObjectId(movieId);
      if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        matchStage.startTime = { $gte: startOfDay, $lte: endOfDay };
      }
      if (startDate && endDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchStage.startTime = { $gte: start, $lte: end };
      }
      
      pipeline.push({ $match: matchStage });

      // ======================= ĐỒNG BỘ HÓA LOGIC TÍNH TOÁN =======================
      // BƯỚC 1: TRA CỨU GHẾ ĐANG GIỮ (SEAT HOLDS)
      pipeline.push({
        $lookup: {
          from: 'seatholds',
          let: { scheduleId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$schedule', '$$scheduleId'] }, expiresAt: { $gt: new Date() } } }
          ],
          as: 'heldSeatsData'
        }
      });

      // BƯỚC 2: TÍNH TOÁN CÁC GIÁ TRỊ
      pipeline.push({
        $addFields: {
          totalSeats: { $ifNull: ['$screenData.totalSeats', { $multiply: ['$screenData.size.rows', '$screenData.size.columns'] }] },
          occupiedSeatsCount: { $size: { $ifNull: ['$OccupiedSeat', []] } },
          heldSeatsCount: { $size: { $ifNull: ['$heldSeatsData', []] } }
        }
      });

      // BƯỚC 3: TÍNH SỐ GHẾ TRỐNG
      pipeline.push({
        $addFields: {
          availableSeats: { $subtract: ['$totalSeats', { $add: ['$occupiedSeatsCount', '$heldSeatsCount'] }] }
        }
      });
      // ========================================================================
      
      pipeline.push(
        {
          $project: {
            _id: 1, startTime: 1, endTime: 1, OccupiedSeat: 1,
            movie: { _id: '$movieData._id', title: '$movieData.title', posterURL: '$movieData.posterURL', duration: '$movieData.duration', genre: '$movieData.genre', ageRating: '$movieData.ageRating' },
            screen: { _id: '$screenData._id', screenName: '$screenData.screenName', screenType: '$screenData.screenType', totalSeats: '$totalSeats' },
            branch: { _id: '$branchData._id', name: '$branchData.name', address: '$branchData.address' },
            availableSeats: 1,
            dateFormatted: { $dateToString: { format: '%Y-%m-%d', date: '$startTime', timezone: 'Asia/Ho_Chi_Minh' } },
            timeFormatted: { $dateToString: { format: '%H:%M', date: '$startTime', timezone: 'Asia/Ho_Chi_Minh' } }
          }
        },
        { $sort: { startTime: 1 } },
        { $limit: limit }
      );

      const schedules = await Schedule.aggregate(pipeline);
      return schedules;
    } catch (error) {
      console.error('Error getting schedules by filters:', error);
      return [];
    }
  }

  async hybridSearch(query, options = {}) {
    const { limit = 10, includeMovies = true, includeSchedules = true } = options;
    try {
      const results = {};
      if (includeSchedules) {
        results.schedules = await this.searchSchedules(query, {
          ...options,
          limit: Math.ceil(limit * 0.7)
        });
      }
      if (includeMovies) {
        const MovieRetrieverService = require('./movieRetrieverService');
        const movieRetriever = new MovieRetrieverService();
        const analysisObject = {
          entities: {
            search_type: 'keyword',
            search_keyword: query,
            movie_title: query.includes('phim') ? query : null
          }
        };
        results.movies = await movieRetriever.searchMovies(analysisObject, {
          ...options,
          limit: Math.ceil(limit * 0.3)
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