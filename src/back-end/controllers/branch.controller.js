const Branch = require('../models/Branch.js');
const Snack = require('../models/Snack.js');
const Movie = require('../models/Movie.js');
const Schedule = require('../models/Schedule.js');
const Screen = require('../models/Screen.js');
const mongoose = require('mongoose');
const { redisClient } = require('../config/redis.config.js');
const CacheManager = require('../utils/cacheManager.js');

const DEFAULT_EXPIRATION = 600; // Cache 10 phút

/**
 * @desc    Thêm snack mới cho một rạp 
 * @route   POST /api/branches/:branchId/snacks
 * @access  Administrator
 */
const createSnack = async (req, res) => {
  try {
    const { branchId } = req.params;
    const snackData = req.body;

    // 1. Kiểm tra rạp tồn tại
    const branch = await Branch.findById(branchId);
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found.' });
    }

    // 2. Kiểm tra snack cùng shortname đã tồn tại trong rạp chưa
    const existingSnack = await Snack.findOne({
      branch: branchId,
      shortname: snackData.shortname?.toUpperCase()
    });

    if (existingSnack) {
      return res.status(400).json({
        message: `Snack with shortname '${snackData.shortname}' already exists in this branch.`
      });
    }

    // 3. Tạo snack mới
    const newSnack = new Snack({
      ...snackData,
      branch: branchId,
      shortname: snackData.shortname?.toUpperCase(), // đảm bảo viết hoa
    });    await newSnack.save();

    // Clear cache for this branch's snacks
    const cacheKey = `snacks:branch:${branchId}`;
    await redisClient.del(cacheKey);

    res.status(201).json({
      message: 'Snack created successfully.',
      snack: newSnack
    });
  } catch (error) {
    console.error('Create Snack Error:', error);
    res.status(500).json({ message: 'Failed to create snack.' });
  }
};

/**
 * @desc    Cập nhật thông tin snack
 * @route   PUT /api/branches/:branchId/snacks/:snackId
 * @access  Administrator
 */
const editSnack = async (req, res) => {
  try {
    const { branchId, snackId } = req.params;
    const updateData = req.body;

    // Get the current snack to validate discountedPrice
    const currentSnack = await Snack.findOne({ _id: snackId, branch: branchId });
    if (!currentSnack) {
      return res.status(404).json({ message: 'Snack not found for update.' });
    }

    // Validate discountedPrice if it's being updated
    if (updateData.discountedPrice !== undefined) {
      const priceToCompare = updateData.price !== undefined ? updateData.price : currentSnack.price;
      
      // Allow null or 0 to clear discounted price
      if (updateData.discountedPrice !== null && updateData.discountedPrice !== 0 && updateData.discountedPrice > priceToCompare) {
        return res.status(400).json({ 
          message: 'Discounted price cannot be higher than regular price.' 
        });
      }
    }

    const snack = await Snack.findOneAndUpdate(
      { _id: snackId, branch: branchId },
      { $set: updateData },
      { new: true, runValidators: false } // Disable validators since we handle it manually
    );    if (!snack) {
      return res.status(404).json({ message: 'Snack not found for update.' });
    }

    // Clear cache for this branch's snacks
    const cacheKey = `snacks:branch:${branchId}`;
    await redisClient.del(cacheKey);

    res.status(200).json({
      message: 'Snack updated successfully.',
      snack
    });
  } catch (error) {
    console.error('Edit Snack Error:', error);
    res.status(500).json({ message: 'Failed to update snack.' });
  }
};

/**
 * @desc    Xoá snack
 * @route   DELETE /api/branches/:branchId/snacks/:snackId
 * @access  Administrator
 */
const deleteSnack = async (req, res) => {
  try {
    const { branchId, snackId } = req.params;    // Thử xóa trước
    const snack = await Snack.findOneAndDelete({ _id: snackId, branch: branchId });
    if (snack) {
      // Clear cache for this branch's snacks
      const cacheKey = `snacks:branch:${branchId}`;
      await redisClient.del(cacheKey);
      
      // Nếu xóa được thì trả về kết quả
      return res.status(200).json({
        message: 'Snack deleted successfully.',
        snack
      });
    }

    // Nếu không xóa được, thử set isHidden = true
    const hiddenSnack = await Snack.findOneAndUpdate(
      { _id: snackId, branch: branchId },
      { isHidden: true },
      { new: true }
    );    if (hiddenSnack) {
      // Clear cache for this branch's snacks
      const cacheKey = `snacks:branch:${branchId}`;
      await redisClient.del(cacheKey);
      
      return res.status(200).json({
        message: 'Snack could not be deleted, but was hidden instead.',
        snack: hiddenSnack
      });
    }

    // Nếu không tìm thấy để ẩn, báo lỗi
    res.status(404).json({ message: 'Snack not found for deletion or hiding.' });
  } catch (error) {
    console.error('Delete Snack Error:', error);
    res.status(500).json({ message: 'Failed to delete or hide snack.' });
  }
};


/**
 * @desc    Lấy danh sách snack theo rạp
 * @route   GET /api/branches/:branchId/snacks
 * @access  Public
 */
const getSnackList = async (req, res) => {
  try {

    const { branchId } = req.params;
    const cacheKey = `snacks:branch:${branchId}`;


    // 2. Nếu cache miss → query DB
    // Cache miss - fetch from database
    const branch = await Branch.findById(branchId);
    if (!branch) {
      // Branch not found
      return res.status(404).json({ message: 'Branch not found.' });
    }

    const snacks = await Snack.find({ branch: branchId })
      .select('name shortname price discountedPrice imageURL stock isHidden description createdAt updatedAt');

    if (!snacks || snacks.length === 0) {
      return res.status(404).json({ message: 'No snacks found for this branch.' });
    }


    res.status(200).json(snacks);
  } catch (error) {
      console.error('Get Snack List Error:', error);
      res.status(500).json({ message: 'Failed to fetch snack list.' });    }
};

/**
 * @desc    Lấy danh sách tất cả branches có sẵn với số phim đang chiếu
 * @route   GET /api/branches/available
 * @access  Public
 */
const getAvailableBranches = async (req, res) => {
  try {
    // Cache key for this query
    const cacheKey = `available_branches`;
    
    try {
      // Try to get from cache first
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return res.status(200).json({
          ...JSON.parse(cached),
          fromCache: true
        });
      }
    } catch (cacheError) {
      console.warn('Cache error:', cacheError);
    }

    // Build aggregation pipeline to get all active branches with movie count
    const pipeline = [
      // Stage 1: Match active branches
      {
        $match: {
          isActive: true
        }
      },
      // Stage 2: Lookup active screens for each branch
      {
        $lookup: {
          from: 'screens',
          localField: '_id',
          foreignField: 'branch',
          pipeline: [
            { $match: { isActive: true } }
          ],
          as: 'screens'
        }
      },
      // Stage 3: Lookup current schedules and movies
      {
        $lookup: {
          from: 'schedules',
          let: { branchScreens: '$screens._id' },
          pipeline: [
            {
              $match: {
                $expr: { $in: ['$screen', '$$branchScreens'] },
                startTime: { $gte: new Date() } // Only future schedules
              }
            },
            {              $lookup: {
                from: 'movies',
                localField: 'movie',
                foreignField: '_id',
                pipeline: [
                  { 
                    $match: { 
                      isHidden: false,
                      releaseDate: { $lte: new Date() } // Only movies that are currently showing
                    } 
                  }
                ],
                as: 'movieData'
              }
            },
            {
              $match: {
                'movieData.0': { $exists: true } // Only schedules with showing movies
              }
            },
            {
              $group: {
                _id: '$movie',
                movieInfo: { $first: { $arrayElemAt: ['$movieData', 0] } }
              }
            }
          ],
          as: 'showingMovies'
        }
      },
      // Stage 4: Project full branch information
      {
        $project: {
          _id: 1,
          name: 1,
          address: 1,
          city: 1,
          imageURL: 1,
          location: 1,
          isActive: 1,
          createdAt: 1,
          updatedAt: 1,
          showingMoviesCount: { $size: '$showingMovies' }
        }
      },
      // Stage 5: Sort by name
      {
        $sort: { name: 1 }
      }
    ];

    // Execute aggregation
    const availableBranches = await Branch.aggregate(pipeline);

    // Prepare response with full branch information
    const response = {
      totalFound: availableBranches.length,
      branches: availableBranches.map(branch => ({
        _id: branch._id,
        name: branch.name,
        address: branch.address,
        city: branch.city,
        imageURL: branch.imageURL,
        location: branch.location,
        isActive: branch.isActive,
        createdAt: branch.createdAt,
        updatedAt: branch.updatedAt,
        showingMoviesCount: branch.showingMoviesCount
      }))
    };

    // Cache the result for 10 minutes
    try {
      await redisClient.setEx(cacheKey, 600, JSON.stringify(response));
    } catch (cacheError) {
      console.warn('Failed to cache result:', cacheError);
    }

    return res.status(200).json(response);

  } catch (error) {
    console.error('Error fetching available branches:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getBranchById = async (req, res) => {
  const { branchId } = req.params;
  try {
    // Check cache first
  // const cacheKey = `branch:${branchId}`;
  // const cachedBranch = await redisClient.get(cacheKey);
  // if (cachedBranch) {
  //   return res.status(200).json(JSON.parse(cachedBranch));
  // }

    // Aggregation pipeline similar to getAvailableBranches, but filter by _id
    const pipeline = [
      { $match: { _id: new mongoose.Types.ObjectId(branchId) } },
      {
        $lookup: {
          from: 'screens',
          localField: '_id',
          foreignField: 'branch',
          pipeline: [ { $match: { isActive: true } } ],
          as: 'screens'
        }
      },
      {
        $lookup: {
          from: 'schedules',
          let: { branchScreens: '$screens._id' },
          pipeline: [
            {
              $match: {
                $expr: { $in: ['$screen', '$$branchScreens'] },
                startTime: { $gte: new Date() }
              }
            },
            {
              $lookup: {
                from: 'movies',
                localField: 'movie',
                foreignField: '_id',
                pipeline: [
                  { $match: { isHidden: false, releaseDate: { $lte: new Date() } } }
                ],
                as: 'movieData'
              }
            },
            { $match: { 'movieData.0': { $exists: true } } },
            {
              $group: {
                _id: '$movie',
                movieInfo: { $first: { $arrayElemAt: ['$movieData', 0] } }
              }
            }
          ],
          as: 'showingMovies'
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          address: 1,
          city: 1,
          imageURL: 1,
          location: 1,
          isActive: 1,
          createdAt: 1,
          updatedAt: 1,
          showingMoviesCount: { $size: '$showingMovies' },
          showingMovies: 1,
          screens: 1
        }
      }
    ];

    const result = await Branch.aggregate(pipeline);
    if (!result || result.length === 0) {
      return res.status(404).json({ error: 'Branch not found' });
    }
    const branch = result[0];

    // Prepare response in the same format as getAvailableBranches, but with extra details
    const response = {
      _id: branch._id,
      name: branch.name,
      address: branch.address,
      city: branch.city,
      imageURL: branch.imageURL,
      location: branch.location,
      isActive: branch.isActive,
      createdAt: branch.createdAt,
      updatedAt: branch.updatedAt,
      showingMoviesCount: branch.showingMoviesCount,
      showingMovies: branch.showingMovies,
      screens: branch.screens
    };

    // Cache the result
    if (response) {
      // await redisClient.setEx(cacheKey, 600, JSON.stringify(response));
    }


    return res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching branch by ID:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

  // =============================== SCHEDULE MANAGEMENT ===============================

  /**
   * @desc    Create a new movie screening schedule
   * @route   POST /api/branches/:branchId/schedules
   * @access  Branch Manager (restricted to their assigned branch)
   */
  const scheduleMovieScreening = async (req, res) => {
    try {
      const { branchId } = req.params;
      const { movieId, screenId, startTime } = req.body;

    console.log('Editing schedule:', {
      branchId,
      screenId,
      movieId,
      startTime
    });


      // 1. Validate branch manager permissions
      if (!req.user.roles.includes('branchmanager')) {
        return res.status(403).json({ 
          message: 'Only branch managers can create schedules.' 
        });
      }

      // 2. Check if branch manager belongs to this branch
      if (!req.user.branch || req.user.branch.toString() !== branchId) {
        return res.status(403).json({ 
          message: 'You can only manage schedules for your assigned branch.' 
        });
      }

      // 3. Validate required fields
      if (!movieId || !screenId || !startTime) {
        return res.status(400).json({ 
          message: 'Movie ID, Screen ID, and Start Time are required.' 
        });
      }

      // 4. Validate ObjectId formats
      if (!mongoose.Types.ObjectId.isValid(branchId) || 
          !mongoose.Types.ObjectId.isValid(movieId) || 
          !mongoose.Types.ObjectId.isValid(screenId)) {
        return res.status(400).json({ 
          message: 'Invalid ID format.' 
        });
      }

      // 5. Validate startTime format
      const scheduleStartTime = new Date(startTime);
      if (isNaN(scheduleStartTime.getTime())) {
        return res.status(400).json({ 
          message: 'Invalid start time format.' 
        });
      }

      // 6. Check if startTime is in the future
      if (scheduleStartTime <= new Date()) {
        return res.status(400).json({ 
          message: 'Start time must be in the future.' 
        });
      }

      // 7. Verify branch exists and is active
      const branch = await Branch.findById(branchId);
      if (!branch || !branch.isActive) {
        return res.status(404).json({ message: 'Branch not found or inactive.' });
      }

      // 8. Verify movie exists and is not hidden
      const movie = await Movie.findById(movieId);
      if (!movie || movie.isHidden) {
        return res.status(404).json({ message: 'Movie not found or not available.' });
      }

      // 9. Verify screen exists, is active, and belongs to the branch
      const screen = await Screen.findOne({ 
        _id: screenId, 
        branch: branchId, 
        isActive: true 
      });
      if (!screen) {
        return res.status(404).json({ 
          message: 'Screen not found, inactive, or does not belong to this branch.' 
        });
      }

      // 10. Calculate end time
      const endTime = new Date(scheduleStartTime.getTime() + movie.duration * 60 * 1000);

      // 11. Check for schedule conflicts (same screen, overlapping times)
      const conflictingSchedule = await Schedule.findOne({
        screen: screenId,
        $or: [
          // New schedule starts during existing schedule
          {
            startTime: { $lte: scheduleStartTime },
            endTime: { $gt: scheduleStartTime }
          },
          // New schedule ends during existing schedule
          {
            startTime: { $lt: endTime },
            endTime: { $gte: endTime }
          },
          // New schedule completely contains existing schedule
          {
            startTime: { $gte: scheduleStartTime },
            endTime: { $lte: endTime }
          }
        ]
      });

      if (conflictingSchedule) {
        return res.status(409).json({ 
          message: 'Schedule conflict detected. The screen is already booked during this time.',
          conflictingSchedule: {
            _id: conflictingSchedule._id,
            startTime: conflictingSchedule.startTime,
            endTime: conflictingSchedule.endTime
          }
        });
      }

      // 12. Create new schedule
      const newSchedule = new Schedule({
        movie: movieId,
        screen: screenId,
        startTime: scheduleStartTime,
        endTime: endTime,
        OccupiedSeat: []
      });      await newSchedule.save();

      // 13. Clear related caches - schedule creation affects multiple cache types
      await Promise.all([
        redisClient.del(`schedules:branch:${branchId}`),
        // Clear branch list cache as it includes movie count per branch
        redisClient.del('branchList'),
        // Clear movie cache as it affects movie scheduling info
        redisClient.del(`movie:${movieId}`),
        redisClient.del('movies:now-showing'),
        redisClient.del('movies:upcoming'),
        // Clear any cached schedule queries with different parameters
        redisClient.keys(`schedules:branch:${branchId}:*`).then(keys => {
          if (keys.length > 0) return redisClient.del(keys);
        })
      ]);

      // 14. Populate the response
      const populatedSchedule = await Schedule.findById(newSchedule._id)
        .populate('movie', 'title duration genre rating posterURL')
        .populate('screen', 'screenName screenType size');

      res.status(201).json({
        message: 'Movie screening scheduled successfully.',
        schedule: populatedSchedule
      });

    } catch (error) {
      console.error('Error creating schedule:', error);
      res.status(500).json({ 
        message: 'Server error', 
        error: process.env.NODE_ENV === 'development' ? error.message : undefined 
      });
    }
  };

/**
 * @desc    Edit an existing movie schedule
 * @route   PATCH /api/branches/:branchId/schedules/:scheduleId
 * @access  Branch Manager (restricted to their assigned branch)
 */
const editMovieSchedule = async (req, res) => {
  try {
    const { branchId, scheduleId } = req.params;
    const { movieId, screenId, startTime } = req.body;

    console.log('Editing schedule:', {
      branchId,
      scheduleId,
      movieId,
      screenId,
      startTime
    });

    // 1. Validate branch manager permissions
    if (!req.user.roles.includes('branchmanager')) {
      return res.status(403).json({ 
        message: 'Only branch managers can edit schedules.' 
      });
    }

    // 2. Check if branch manager belongs to this branch
    if (!req.user.branch || req.user.branch.toString() !== branchId) {
      return res.status(403).json({ 
        message: 'You can only manage schedules for your assigned branch.' 
      });
    }

    // 3. Validate ObjectId formats
    if (!mongoose.Types.ObjectId.isValid(branchId) || 
        !mongoose.Types.ObjectId.isValid(scheduleId)) {
      return res.status(400).json({ 
        message: 'Invalid ID format.' 
      });
    }

    // 4. Find the existing schedule and verify it belongs to this branch
    const existingSchedule = await Schedule.findById(scheduleId)
      .populate('screen', 'branch');
    
    if (!existingSchedule) {
      return res.status(404).json({ message: 'Schedule not found.' });
    }

    if (existingSchedule.screen.branch.toString() !== branchId) {
      return res.status(403).json({ 
        message: 'Schedule does not belong to your branch.' 
      });
    }

    // 5. Check if schedule has already started (cannot edit past/ongoing schedules)
    if (existingSchedule.startTime <= new Date()) {
      return res.status(400).json({ 
        message: 'Cannot edit schedules that have already started.' 
      });
    }

    // 6. Check if there are tickets sold for this schedule
    const Ticket = require('../models/Ticket');
    const ticketCount = await Ticket.countDocuments({ 
      schedule: scheduleId,
      status: { $in: ['Confirmed', 'CheckedIn'] }
    });

    if (ticketCount > 0) {
      return res.status(400).json({ 
        message: `Cannot edit schedule. ${ticketCount} ticket(s) have been sold.` 
      });
    }

    // 7. Build update object
    const updateData = {};
    let movie = null;

    // Validate and set movie if provided
    if (movieId) {
      if (!mongoose.Types.ObjectId.isValid(movieId)) {
        return res.status(400).json({ message: 'Invalid movie ID format.' });
      }
      
      movie = await Movie.findById(movieId);
      if (!movie || movie.isHidden) {
        return res.status(404).json({ message: 'Movie not found or not available.' });
      }
      updateData.movie = movieId;
    }

    // Validate and set screen if provided
    if (screenId) {
      if (!mongoose.Types.ObjectId.isValid(screenId)) {
        return res.status(400).json({ message: 'Invalid screen ID format.' });
      }

      const screen = await Screen.findOne({ 
        _id: screenId, 
        branch: branchId, 
        isActive: true 
      });
      if (!screen) {
        return res.status(404).json({ 
          message: 'Screen not found, inactive, or does not belong to this branch.' 
        });
      }
      updateData.screen = screenId;
    }

    // Validate and set start time if provided
    if (startTime) {
      const newStartTime = new Date(startTime);
      if (isNaN(newStartTime.getTime())) {
        return res.status(400).json({ message: 'Invalid start time format.' });
      }

      if (newStartTime <= new Date()) {
        return res.status(400).json({ message: 'Start time must be in the future.' });
      }

      updateData.startTime = newStartTime;

      // Calculate new end time using the movie duration
      const movieForDuration = movie || await Movie.findById(existingSchedule.movie);
      updateData.endTime = new Date(newStartTime.getTime() + movieForDuration.duration * 60 * 1000);
    }

    // 8. Check for schedule conflicts if time or screen changed
    if (updateData.startTime || updateData.screen) {
      const checkStartTime = updateData.startTime || existingSchedule.startTime;
      const checkEndTime = updateData.endTime || existingSchedule.endTime;
      const checkScreenId = updateData.screen || existingSchedule.screen._id;

      const conflictingSchedule = await Schedule.findOne({
        _id: { $ne: scheduleId }, // Exclude current schedule
        screen: checkScreenId,
        $or: [
          {
            startTime: { $lte: checkStartTime },
            endTime: { $gt: checkStartTime }
          },
          {
            startTime: { $lt: checkEndTime },
            endTime: { $gte: checkEndTime }
          },
          {
            startTime: { $gte: checkStartTime },
            endTime: { $lte: checkEndTime }
          }
        ]
      });

      if (conflictingSchedule) {
        return res.status(409).json({ 
          message: 'Schedule conflict detected. The screen is already booked during this time.',
          conflictingSchedule: {
            _id: conflictingSchedule._id,
            startTime: conflictingSchedule.startTime,
            endTime: conflictingSchedule.endTime
          }
        });
      }
    }

    // 9. Update the schedule
    const updatedSchedule = await Schedule.findByIdAndUpdate(
      scheduleId,
      updateData,
      { new: true, runValidators: true }
    ).populate('movie', 'title duration genre rating posterURL')
     .populate('screen', 'screenName screenType size');    // 10. Clear related caches - schedule update affects multiple cache types
    await Promise.all([
      redisClient.del(`schedules:branch:${branchId}`),
      // Clear branch list cache as it includes movie count per branch
      redisClient.del('branchList'),
      // Clear seat map cache for this schedule
      CacheManager.invalidateScheduleCache(scheduleId),
      // Clear movie cache if movie was changed
      ...(updateData.movie ? [
        redisClient.del(`movie:${updateData.movie}`),
        redisClient.del(`movie:${existingSchedule.movie}`),
        redisClient.del('movies:now-showing'),
        redisClient.del('movies:upcoming')
      ] : []),
      // Clear any cached schedule queries with different parameters
      redisClient.keys(`schedules:branch:${branchId}:*`).then(keys => {
        if (keys.length > 0) return redisClient.del(keys);
      })
    ]);

    res.status(200).json({
      message: 'Schedule updated successfully.',
      schedule: updatedSchedule
    });

  } catch (error) {
    console.error('Error editing schedule:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

/**
 * @desc    Delete/cancel an existing movie schedule
 * @route   DELETE /api/branches/:branchId/schedules/:scheduleId
 * @access  Branch Manager (restricted to their assigned branch)
 */
const deleteMovieSchedule = async (req, res) => {
  try {
    const { branchId, scheduleId } = req.params;

    // 1. Validate branch manager permissions
    if (!req.user.roles.includes('branchmanager')) {
      return res.status(403).json({ 
        message: 'Only branch managers can delete schedules.' 
      });
    }

    // 2. Check if branch manager belongs to this branch
    if (!req.user.branch || req.user.branch.toString() !== branchId) {
      return res.status(403).json({ 
        message: 'You can only manage schedules for your assigned branch.' 
      });
    }

    // 3. Validate ObjectId formats
    if (!mongoose.Types.ObjectId.isValid(branchId) || 
        !mongoose.Types.ObjectId.isValid(scheduleId)) {
      return res.status(400).json({ 
        message: 'Invalid ID format.' 
      });
    }

    // 4. Find the schedule and verify it belongs to this branch
    const schedule = await Schedule.findById(scheduleId)
      .populate('screen', 'branch screenName')
      .populate('movie', 'title');
    
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found.' });
    }

    if (schedule.screen.branch.toString() !== branchId) {
      return res.status(403).json({ 
        message: 'Schedule does not belong to your branch.' 
      });
    }

    // 5. Check if schedule has already started
    if (schedule.startTime <= new Date()) {
      return res.status(400).json({ 
        message: 'Cannot delete schedules that have already started.' 
      });
    }

    // 6. Check if there are tickets sold for this schedule
    const Ticket = require('../models/Ticket');
    const tickets = await Ticket.find({ 
      schedule: scheduleId,
      status: { $in: ['Confirmed', 'CheckedIn'] }
    });

    if (tickets.length > 0) {
      return res.status(400).json({ 
        message: `Cannot delete schedule. ${tickets.length} ticket(s) have been sold. Please contact customers to cancel their tickets first.` 
      });
    }    // 7. Delete the schedule
    await Schedule.findByIdAndDelete(scheduleId);

    // 8. Clear related caches - schedule deletion affects multiple cache types
    await Promise.all([
      redisClient.del(`schedules:branch:${branchId}`),
      // Clear branch list cache as it includes movie count per branch
      redisClient.del('branchList'),
      // Clear seat map cache for this schedule
      CacheManager.invalidateScheduleCache(scheduleId),
      // Clear movie cache as it affects movie scheduling info
      redisClient.del(`movie:${schedule.movie._id}`),
      redisClient.del('movies:now-showing'),
      redisClient.del('movies:upcoming'),
      // Clear any cached schedule queries with different parameters
      redisClient.keys(`schedules:branch:${branchId}:*`).then(keys => {
        if (keys.length > 0) return redisClient.del(keys);
      })
    ]);

    res.status(200).json({
      message: 'Schedule deleted successfully.',
      deletedSchedule: {
        _id: schedule._id,
        movie: schedule.movie.title,
        screen: schedule.screen.screenName,
        startTime: schedule.startTime
      }
    });

  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

/**
 * @desc    Get all movie schedules for a branch
 * @route   GET /api/branches/:branchId/schedules
 * @access  Branch Manager (restricted to their assigned branch)
 */
const getMovieSchedules = async (req, res) => {
  try {
    const { branchId } = req.params;
    const { movieId, screenId, fromDate, toDate, page = 1, limit = 50 } = req.query;
    console.log('getMovieSchedules called')

    // 1. Validate branch manager permissions
    if (!req.user.roles.includes('branchmanager')) {
      return res.status(403).json({ 
        message: 'Only branch managers can view schedules.' 
      });
    }

    // 2. Check if branch manager belongs to this branch
    if (!req.user.branch || req.user.branch.toString() !== branchId) {
      return res.status(403).json({ 
        message: 'You can only view schedules for your assigned branch.' 
      });
    }

    // 3. Validate branch ID format
    if (!mongoose.Types.ObjectId.isValid(branchId)) {
      return res.status(400).json({ message: 'Invalid branch ID format.' });
    }

    // 4. Check cache first
    const cacheKey = `schedules:branch:${branchId}`;
    try {
      const cachedSchedules = await redisClient.get(cacheKey);
      if (cachedSchedules) {
        return res.status(200).json({
          ...JSON.parse(cachedSchedules),
          fromCache: true
        });
      }
    } catch (cacheError) {
      console.warn('Cache error:', cacheError);
    }

    // 5. Build aggregation pipeline
    const pipeline = [
      // Stage 1: Lookup screens to filter by branch
      {
        $lookup: {
          from: 'screens',
          localField: 'screen',
          foreignField: '_id',
          as: 'screenData'
        }
      },
      {
        $unwind: '$screenData'
      },
      // Stage 2: Match schedules for this branch
      {
        $match: {
          'screenData.branch': new mongoose.Types.ObjectId(branchId)
        }
      }
    ];

    // Add optional filters
    const matchConditions = {};

    if (movieId) {
      if (!mongoose.Types.ObjectId.isValid(movieId)) {
        return res.status(400).json({ message: 'Invalid movie ID format.' });
      }
      matchConditions.movie = new mongoose.Types.ObjectId(movieId);
    }

    if (screenId) {
      if (!mongoose.Types.ObjectId.isValid(screenId)) {
        return res.status(400).json({ message: 'Invalid screen ID format.' });
      }
      matchConditions.screen = new mongoose.Types.ObjectId(screenId);
    }

    if (fromDate || toDate) {
      matchConditions.startTime = {};
      if (fromDate) {
        const fromDateTime = new Date(fromDate);
        if (isNaN(fromDateTime.getTime())) {
          return res.status(400).json({ message: 'Invalid fromDate format.' });
        }
        matchConditions.startTime.$gte = fromDateTime;
      }
      if (toDate) {
        const toDateTime = new Date(toDate);
        if (isNaN(toDateTime.getTime())) {
          return res.status(400).json({ message: 'Invalid toDate format.' });
        }
        matchConditions.startTime.$lte = toDateTime;
      }
    }

    if (Object.keys(matchConditions).length > 0) {
      pipeline.push({ $match: matchConditions });
    }

    // Stage 3: Lookup movie details
    pipeline.push({
      $lookup: {
        from: 'movies',
        localField: 'movie',
        foreignField: '_id',
        as: 'movieData'
      }
    });

    pipeline.push({ $unwind: '$movieData' });

    // Stage 4: Project final structure
    pipeline.push({
      $project: {
        _id: 1,
        startTime: 1,
        endTime: 1,
        OccupiedSeat: 1,
        createdAt: 1,
        updatedAt: 1,
        movie: {
          _id: '$movieData._id',
          title: '$movieData.title',
          duration: '$movieData.duration',
          genre: '$movieData.genre',
          rating: '$movieData.rating',
          posterURL: '$movieData.posterURL'
        },
        screen: {
          _id: '$screenData._id',
          screenName: '$screenData.screenName',
          screenType: '$screenData.screenType',
          size: '$screenData.size'
        },
        ticketsSold: { $size: { $ifNull: ['$OccupiedSeat', []] } }
      }
    });

    // Stage 5: Sort by start time
    pipeline.push({ $sort: { startTime: 1 } });

    // 6. Execute aggregation with pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [schedules, totalCount] = await Promise.all([
      Schedule.aggregate([...pipeline, { $skip: skip }, { $limit: limitNum }]),
      Schedule.aggregate([...pipeline, { $count: 'total' }])
    ]);

    const total = totalCount.length > 0 ? totalCount[0].total : 0;

    // 7. Prepare response
    const response = {
      schedules,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalSchedules: total,
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1
      },
      filters: {
        branchId,
        movieId: movieId || null,
        screenId: screenId || null,
        fromDate: fromDate || null,
        toDate: toDate || null
      }
    };

    // 8. Cache the result for 5 minutes
    try {
      await redisClient.setEx(cacheKey, 300, JSON.stringify(response));
    } catch (cacheError) {
      console.warn('Failed to cache schedules:', cacheError);
    }

    res.status(200).json(response);

  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

/**
 * @desc    Get all screens for a branch
 * @route   GET /api/branches/:branchId/screens
 * @access  Branch Manager (restricted to their assigned branch)
 */
const getBranchScreens = async (req, res) => {
  try {
    const { branchId } = req.params;
    const { isActive, screenType } = req.query;

    // 1. Validate branch manager permissions
    if (!req.user.roles.includes('branchmanager')) {
      return res.status(403).json({ 
        message: 'Only branch managers can view screens.' 
      });
    }

    // 2. Check if branch manager belongs to this branch
    if (!req.user.branch || req.user.branch.toString() !== branchId) {
      return res.status(403).json({ 
        message: 'You can only view screens for your assigned branch.' 
      });
    }

    // 3. Validate branch ID format
    if (!mongoose.Types.ObjectId.isValid(branchId)) {
      return res.status(400).json({ message: 'Invalid branch ID format.' });
    }

    // 4. Check cache first
    const cacheKey = `screens:branch:${branchId}:${JSON.stringify(req.query)}`;
    try {
      const cachedScreens = await redisClient.get(cacheKey);
      if (cachedScreens) {
        return res.status(200).json({
          ...JSON.parse(cachedScreens),
          fromCache: true
        });
      }
    } catch (cacheError) {
      console.warn('Cache error:', cacheError);
    }

    // 5. Verify branch exists and is active
    const branch = await Branch.findById(branchId);
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found.' });
    }

    // 6. Build filter conditions
    const filterConditions = {
      branch: new mongoose.Types.ObjectId(branchId)
    };

    // Add optional filters
    if (isActive !== undefined) {
      filterConditions.isActive = isActive === 'true';
    }

    if (screenType) {
      const validScreenTypes = ['2D', '3D', 'IMAX', '4DX'];
      if (validScreenTypes.includes(screenType)) {
        filterConditions.screenType = screenType;
      } else {
        return res.status(400).json({ 
          message: `Invalid screen type. Valid types: ${validScreenTypes.join(', ')}` 
        });
      }
    }    // 7. Build aggregation pipeline
    const pipeline = [
      { $match: filterConditions },
      // Calculate total seats
      {
        $addFields: {
          totalSeats: { $multiply: ['$size.rows', '$size.columns'] }
        }
      },
      // Project final structure
      {
        $project: {
          _id: 1,
          screenName: 1,
          screenType: 1,
          size: 1,
          totalSeats: 1,
          isActive: 1,
          createdAt: 1,
          updatedAt: 1
        }
      },
      // Sort by screen name
      { $sort: { screenName: 1 } }
    ];// 8. Execute aggregation
    const screens = await Screen.aggregate(pipeline);// 9. Cache the result for 5 minutes
    try {
      await redisClient.setEx(cacheKey, 300, JSON.stringify(screens));
    } catch (cacheError) {
      console.warn('Failed to cache screens:', cacheError);
    }

    res.status(200).json(screens);

  } catch (error) {
    console.error('Error fetching branch screens:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

  // =============================== SCREEN MANAGEMENT ===============================

  /**
   * @desc    Create a new screen for a branch
   * @route   POST /api/branches/:branchId/screens
   * @access  Branch Manager (restricted to their assigned branch)
   */
  const createScreen = async (req, res) => {
    try {
      const { branchId } = req.params;
      const { screenName, screenType, size } = req.body;

      // 1. Validate branch manager permissions
      if (!req.user.roles.includes('branchmanager')) {
        return res.status(403).json({ 
          message: 'Only branch managers can create screens.' 
        });
      }

      // 2. Check if branch manager belongs to this branch
      if (!req.user.branch || req.user.branch.toString() !== branchId) {
        return res.status(403).json({ 
          message: 'You can only manage screens for your assigned branch.' 
        });
      }

      // 3. Validate required fields
      if (!screenName || !screenType || !size || !size.rows || !size.columns) {
        return res.status(400).json({ 
          message: 'Screen name, type, and size (rows, columns) are required.' 
        });
      }

      // 4. Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(branchId)) {
        return res.status(400).json({ 
          message: 'Invalid branch ID format.' 
        });
      }

      // 5. Verify branch exists and is active
      const branch = await Branch.findById(branchId);
      if (!branch || !branch.isActive) {
        return res.status(404).json({ message: 'Branch not found or inactive.' });
      }

      // 6. Validate screen type
      const validScreenTypes = ['2D', '3D', 'IMAX', '4DX'];
      if (!validScreenTypes.includes(screenType)) {
        return res.status(400).json({ 
          message: `Invalid screen type. Valid types: ${validScreenTypes.join(', ')}` 
        });
      }

      // 7. Validate size constraints
      if (size.rows < 1 || size.rows > 15 || size.columns < 1 || size.columns > 15) {
        return res.status(400).json({ 
          message: 'Screen size must be between 1-15 rows and 1-15 columns.' 
        });
      }

      // 8. Check for duplicate screen name in this branch
      const existingScreen = await Screen.findOne({ 
        screenName: screenName.trim(), 
        branch: branchId 
      });
      if (existingScreen) {
        return res.status(409).json({ 
          message: 'A screen with this name already exists in this branch.' 
        });
      }

      // 9. Create new screen
      const newScreen = new Screen({
        screenName: screenName.trim(),
        branch: branchId,
        screenType,
        size: {
          rows: parseInt(size.rows),
          columns: parseInt(size.columns)
        },
        isActive: true
      });      await newScreen.save();

      // 10. Clear related caches - screen creation affects multiple cache types
      await Promise.all([
        redisClient.del(`screens:branch:${branchId}`),
        // Clear branch list cache as it includes screen count per branch
        redisClient.del('branchList'),
        redisClient.del(`branch:${branchId}`),
        // Clear any cached screen queries with different parameters
        redisClient.keys(`screens:branch:${branchId}:*`).then(keys => {
          if (keys.length > 0) return redisClient.del(keys);
        })
      ]);

      res.status(201).json({
        message: 'Screen created successfully.',
        screen: newScreen
      });

    } catch (error) {
      console.error('Error creating screen:', error);
      res.status(500).json({ 
        message: 'Server error', 
        error: process.env.NODE_ENV === 'development' ? error.message : undefined 
      });
    }
  };

  /**
   * @desc    Get screen details by ID
   * @route   GET /api/branches/:branchId/screens/:screenId
   * @access  Branch Manager (restricted to their assigned branch)
   */
  const getScreenById = async (req, res) => {
    try {
      const { branchId, screenId } = req.params;

      // 1. Validate branch manager permissions
      if (!req.user.roles.includes('branchmanager')) {
        return res.status(403).json({ 
          message: 'Only branch managers can view screen details.' 
        });
      }

      // 2. Check if branch manager belongs to this branch
      if (!req.user.branch || req.user.branch.toString() !== branchId) {
        return res.status(403).json({ 
          message: 'You can only view screens for your assigned branch.' 
        });
      }

      // 3. Validate ObjectId formats
      if (!mongoose.Types.ObjectId.isValid(branchId) || 
          !mongoose.Types.ObjectId.isValid(screenId)) {
        return res.status(400).json({ 
          message: 'Invalid ID format.' 
        });
      }

      // 4. Find screen and verify it belongs to this branch
      const screen = await Screen.findOne({ 
        _id: screenId, 
        branch: branchId 
      });

      if (!screen) {
        return res.status(404).json({ 
          message: 'Screen not found or does not belong to your branch.' 
        });
      }

      // 5. Get additional screen statistics
      const totalSeats = screen.size.rows * screen.size.columns;

      // Get active schedules count
      const activeSchedulesCount = await Schedule.countDocuments({
        screen: screenId,
        startTime: { $gte: new Date() }
      });

      // 6. Prepare response
      const response = {
        _id: screen._id,
        screenName: screen.screenName,
        screenType: screen.screenType,
        size: screen.size,
        totalSeats,
        isActive: screen.isActive,
        createdAt: screen.createdAt,
        updatedAt: screen.updatedAt,
        statistics: {
          activeSchedulesCount
        }
      };

      res.status(200).json(response);

    } catch (error) {
      console.error('Error fetching screen details:', error);
      res.status(500).json({ 
        message: 'Server error', 
        error: process.env.NODE_ENV === 'development' ? error.message : undefined 
      });
    }
  };

  /**
   * @desc    Update an existing screen
   * @route   PATCH /api/branches/:branchId/screens/:screenId
   * @access  Branch Manager (restricted to their assigned branch)
   */
  const updateScreen = async (req, res) => {
    try {
      const { branchId, screenId } = req.params;
      const { screenName, screenType, size, isActive } = req.body;

      // 1. Validate branch manager permissions
      if (!req.user.roles.includes('branchmanager')) {
        return res.status(403).json({ 
          message: 'Only branch managers can update screens.' 
        });
      }

      // 2. Check if branch manager belongs to this branch
      if (!req.user.branch || req.user.branch.toString() !== branchId) {
        return res.status(403).json({ 
          message: 'You can only manage screens for your assigned branch.' 
        });
      }

      // 3. Validate ObjectId formats
      if (!mongoose.Types.ObjectId.isValid(branchId) || 
          !mongoose.Types.ObjectId.isValid(screenId)) {
        return res.status(400).json({ 
          message: 'Invalid ID format.' 
        });
      }

      // 4. Find the existing screen and verify it belongs to this branch
      const existingScreen = await Screen.findOne({ 
        _id: screenId, 
        branch: branchId 
      });

      if (!existingScreen) {
        return res.status(404).json({ 
          message: 'Screen not found or does not belong to your branch.' 
        });
      }

      // 5. Check if screen has active schedules (if trying to deactivate)
      if (isActive === false && existingScreen.isActive) {
        const activeSchedules = await Schedule.countDocuments({
          screen: screenId,
          startTime: { $gte: new Date() }
        });

        if (activeSchedules > 0) {
          return res.status(400).json({ 
            message: `Cannot deactivate screen. ${activeSchedules} active schedule(s) exist.` 
          });
        }
      }

      // 6. Build update object
      const updateData = {};

      // Validate and set screen name if provided
      if (screenName) {
        const trimmedName = screenName.trim();
        
        // Check for duplicate name (excluding current screen)
        const duplicateScreen = await Screen.findOne({ 
          screenName: trimmedName, 
          branch: branchId,
          _id: { $ne: screenId }
        });

        if (duplicateScreen) {
          return res.status(409).json({ 
            message: 'A screen with this name already exists in this branch.' 
          });
        }

        updateData.screenName = trimmedName;
      }

      // Validate and set screen type if provided
      if (screenType) {
        const validScreenTypes = ['2D', '3D', 'IMAX', '4DX'];
        if (!validScreenTypes.includes(screenType)) {
          return res.status(400).json({ 
            message: `Invalid screen type. Valid types: ${validScreenTypes.join(', ')}` 
          });
        }
        updateData.screenType = screenType;
      }

      // Validate and set size if provided
      if (size) {
        if (!size.rows || !size.columns) {
          return res.status(400).json({ 
            message: 'Both rows and columns are required when updating size.' 
          });
        }

        if (size.rows < 1 || size.rows > 15 || size.columns < 1 || size.columns > 15) {
          return res.status(400).json({ 
            message: 'Screen size must be between 1-15 rows and 1-15 columns.' 
          });
        }

        updateData.size = {
          rows: parseInt(size.rows),
          columns: parseInt(size.columns)
        };
      }

      // Set active status if provided
      if (typeof isActive === 'boolean') {
        updateData.isActive = isActive;
      }      // 7. Update the screen
      const updatedScreen = await Screen.findByIdAndUpdate(
        screenId,
        updateData,
        { new: true, runValidators: true }
      );

      // 8. Clear related caches - screen update affects multiple cache types
      await Promise.all([
        redisClient.del(`screens:branch:${branchId}`),
        // Clear branch list cache as it includes screen count per branch
        redisClient.del('branchList'),
        redisClient.del(`branch:${branchId}`),
        // Clear any cached screen queries with different parameters
        redisClient.keys(`screens:branch:${branchId}:*`).then(keys => {
          if (keys.length > 0) return redisClient.del(keys);
        })
      ]);

      res.status(200).json({
        message: 'Screen updated successfully.',
        screen: updatedScreen
      });

    } catch (error) {
      console.error('Error updating screen:', error);
      res.status(500).json({ 
        message: 'Server error', 
        error: process.env.NODE_ENV === 'development' ? error.message : undefined 
      });
    }
  };

  /**
   * @desc    Delete a screen
   * @route   DELETE /api/branches/:branchId/screens/:screenId
   * @access  Branch Manager (restricted to their assigned branch)
   */
  const deleteScreen = async (req, res) => {
    try {
      const { branchId, screenId } = req.params;

      // 1. Validate branch manager permissions
      if (!req.user.roles.includes('branchmanager')) {
        return res.status(403).json({ 
          message: 'Only branch managers can delete screens.' 
        });
      }

      // 2. Check if branch manager belongs to this branch
      if (!req.user.branch || req.user.branch.toString() !== branchId) {
        return res.status(403).json({ 
          message: 'You can only manage screens for your assigned branch.' 
        });
      }

      // 3. Validate ObjectId formats
      if (!mongoose.Types.ObjectId.isValid(branchId) || 
          !mongoose.Types.ObjectId.isValid(screenId)) {
        return res.status(400).json({ 
          message: 'Invalid ID format.' 
        });
      }

      // 4. Find the screen and verify it belongs to this branch
      const screen = await Screen.findOne({ 
        _id: screenId, 
        branch: branchId 
      });

      if (!screen) {
        return res.status(404).json({ 
          message: 'Screen not found or does not belong to your branch.' 
        });
      }

      // 5. Check for existing schedules
      const schedulesCount = await Schedule.countDocuments({ screen: screenId });
      
      if (schedulesCount > 0) {        // If schedules exist, just deactivate the screen instead of deleting
        const deactivatedScreen = await Screen.findByIdAndUpdate(
          screenId,
          { isActive: false },
          { new: true }
        );

        // Clear related caches for screen deactivation
        await Promise.all([
          redisClient.del(`screens:branch:${branchId}`),
          redisClient.del('branchList'),
          redisClient.del(`branch:${branchId}`),
          redisClient.keys(`screens:branch:${branchId}:*`).then(keys => {
            if (keys.length > 0) return redisClient.del(keys);
          })
        ]);

        return res.status(200).json({
          message: `Screen cannot be deleted due to existing schedules (${schedulesCount}). Screen has been deactivated instead.`,
          screen: deactivatedScreen
        });
      }

      // 6. Check for existing seats
      const Seat = require('../models/Seat');
      const seatsCount = await Seat.countDocuments({ screen: screenId });

      if (seatsCount > 0) {
        // Delete all seats associated with this screen first
        await Seat.deleteMany({ screen: screenId });
      }      // 7. Delete the screen
      await Screen.findByIdAndDelete(screenId);

      // 8. Clear related caches - screen deletion affects multiple cache types
      await Promise.all([
        redisClient.del(`screens:branch:${branchId}`),
        // Clear branch list cache as it includes screen count per branch
        redisClient.del('branchList'),
        redisClient.del(`branch:${branchId}`),
        // Clear any cached screen queries with different parameters
        redisClient.keys(`screens:branch:${branchId}:*`).then(keys => {
          if (keys.length > 0) return redisClient.del(keys);
        })
      ]);

      res.status(200).json({
        message: 'Screen deleted successfully.',
        deletedScreen: {
          _id: screen._id,
          screenName: screen.screenName,
          screenType: screen.screenType,
          deletedSeatsCount: seatsCount
        }
      });

    } catch (error) {
      console.error('Error deleting screen:', error);
      res.status(500).json({ 
        message: 'Server error', 
        error: process.env.NODE_ENV === 'development' ? error.message : undefined 
      });
    }
  };

  // =============================== SEAT MANAGEMENT ===============================

  /**
   * @desc    Get all seats for a screen
   * @route   GET /api/branches/:branchId/screens/:screenId/seats
   * @access  Branch Manager (restricted to their assigned branch)
   */
  const getScreenSeats = async (req, res) => {
    try {
      const { branchId, screenId } = req.params;
      const { category, isHidden } = req.query;

      // 1. Validate branch manager permissions
      if (!req.user.roles.includes('branchmanager')) {
        return res.status(403).json({ 
          message: 'Only branch managers can view seats.' 
        });
      }

      // 2. Check if branch manager belongs to this branch
      if (!req.user.branch || req.user.branch.toString() !== branchId) {
        return res.status(403).json({ 
          message: 'You can only view seats for your assigned branch.' 
        });
      }

      // 3. Validate ObjectId formats
      if (!mongoose.Types.ObjectId.isValid(branchId) || 
          !mongoose.Types.ObjectId.isValid(screenId)) {
        return res.status(400).json({ 
          message: 'Invalid ID format.' 
        });
      }

      // 4. Verify screen exists and belongs to this branch
      const screen = await Screen.findOne({ 
        _id: screenId, 
        branch: branchId 
      });

      if (!screen) {
        return res.status(404).json({ 
          message: 'Screen not found or does not belong to your branch.' 
        });
      }

      // 5. Build filter conditions
      const filterConditions = {
        screen: new mongoose.Types.ObjectId(screenId)
      };

      // Add optional filters
      if (category) {
        filterConditions.category = category;
      }

      if (isHidden !== undefined) {
        filterConditions.isHidden = isHidden === 'true';
      }

      // 6. Get seats
      const Seat = require('../models/Seat');
      const seats = await Seat.find(filterConditions)
        .sort({ 'location.row': 1, 'location.column': 1 });

      res.status(200).json({
        seats,
        total: seats.length,
        screen: {
          _id: screen._id,
          screenName: screen.screenName,
          screenType: screen.screenType,
          size: screen.size
        }
      });

    } catch (error) {
      console.error('Error fetching screen seats:', error);
      res.status(500).json({ 
        message: 'Server error', 
        error: process.env.NODE_ENV === 'development' ? error.message : undefined 
      });
    }
  };

  /**
   * @desc    Create a new seat for a screen
   * @route   POST /api/branches/:branchId/screens/:screenId/seats
   * @access  Branch Manager (restricted to their assigned branch)
   */
  const createSeat = async (req, res) => {
    try {
      const { branchId, screenId } = req.params;
      const { seatNumber, location, category } = req.body;

      // 1. Validate branch manager permissions
      if (!req.user.roles.includes('branchmanager')) {
        return res.status(403).json({ 
          message: 'Only branch managers can create seats.' 
        });
      }

      // 2. Check if branch manager belongs to this branch
      if (!req.user.branch || req.user.branch.toString() !== branchId) {
        return res.status(403).json({ 
          message: 'You can only manage seats for your assigned branch.' 
        });
      }

      // 3. Validate required fields
      if (!seatNumber || !location || !location.row || !location.column || !category) {
        return res.status(400).json({ 
          message: 'Seat number, location (row, column), and category are required.' 
        });
      }

      // 4. Validate ObjectId formats
      if (!mongoose.Types.ObjectId.isValid(branchId) || 
          !mongoose.Types.ObjectId.isValid(screenId)) {
        return res.status(400).json({ 
          message: 'Invalid ID format.' 
        });
      }

      // 5. Verify screen exists and belongs to this branch
      const screen = await Screen.findOne({ 
        _id: screenId, 
        branch: branchId,
        isActive: true 
      });

      if (!screen) {
        return res.status(404).json({ 
          message: 'Screen not found, inactive, or does not belong to your branch.' 
        });
      }

      // 6. Validate location within screen size
      let rowNumber;
      if (typeof location.row === 'string') {
        // Convert row letter (A, B, C, etc.) to number (1, 2, 3, etc.)
        rowNumber = location.row.charCodeAt(0) - 64;
      } else {
        rowNumber = parseInt(location.row);
      }

      if (rowNumber < 1 || rowNumber > screen.size.rows ||
          location.column < 1 || location.column > screen.size.columns) {
        return res.status(400).json({ 
          message: `Seat location must be within screen size (row: ${location.row}, column: ${location.column}, screen: ${screen.size.rows}x${screen.size.columns}).` 
        });
      }

      // 7. Check for duplicate seat number in this screen
      const Seat = require('../models/Seat');
      const existingSeat = await Seat.findOne({ 
        seatNumber: seatNumber.trim(), 
        screen: screenId 
      });

      if (existingSeat) {
        return res.status(409).json({ 
          message: 'A seat with this number already exists in this screen.' 
        });
      }

      // 8. Check for duplicate location in this screen
      const existingLocation = await Seat.findOne({ 
        screen: screenId,
        'location.row': location.row,
        'location.column': location.column
      });

      if (existingLocation) {
        return res.status(409).json({ 
          message: 'A seat already exists at this location.' 
        });
      }

      // 9. Create new seat
      const newSeat = new Seat({
        seatNumber: seatNumber.trim(),
        location: {
          row: location.row,
          column: parseInt(location.column)
        },
        screen: screenId,
        category: category.trim(),
        isHidden: false
      });

      await newSeat.save();

      res.status(201).json({
        message: 'Seat created successfully.',
        seat: newSeat
      });

    } catch (error) {
      console.error('Error creating seat:', error);
      res.status(500).json({ 
        message: 'Server error', 
        error: process.env.NODE_ENV === 'development' ? error.message : undefined 
      });
    }
  };

  /**
   * @desc    Bulk create seats for a screen
   * @route   POST /api/branches/:branchId/screens/:screenId/seats/bulk
   * @access  Branch Manager (restricted to their assigned branch)
   */
  const bulkCreateSeats = async (req, res) => {
    try {
      const { branchId, screenId } = req.params;
      const { seats } = req.body;

      // 1. Validate branch manager permissions
      if (!req.user.roles.includes('branchmanager')) {
        return res.status(403).json({ 
          message: 'Only branch managers can bulk create seats.' 
        });
      }

      // 2. Check if branch manager belongs to this branch
      if (!req.user.branch || req.user.branch.toString() !== branchId) {
        return res.status(403).json({ 
          message: 'You can only manage seats for your assigned branch.' 
        });
      }

      // 3. Validate seats array
      if (!seats || !Array.isArray(seats) || seats.length === 0) {
        return res.status(400).json({ 
          message: 'Seats array is required and cannot be empty.' 
        });
      }

      // 4. Validate ObjectId formats
      if (!mongoose.Types.ObjectId.isValid(branchId) || 
          !mongoose.Types.ObjectId.isValid(screenId)) {
        return res.status(400).json({ 
          message: 'Invalid ID format.' 
        });
      }

      // 5. Verify screen exists and belongs to this branch
      const screen = await Screen.findOne({ 
        _id: screenId, 
        branch: branchId,
        isActive: true 
      });

      if (!screen) {
        return res.status(404).json({ 
          message: 'Screen not found, inactive, or does not belong to your branch.' 
        });
      }

      // 6. Validate each seat data
      const validatedSeats = [];
      const errors = [];

      for (let i = 0; i < seats.length; i++) {
        const seat = seats[i];
        
        if (!seat.seatNumber || !seat.location || !seat.location.row || !seat.location.column || !seat.category) {
          errors.push(`Seat ${i + 1}: Missing required fields`);
          continue;
        }

        // Validate row - convert letter to number for bounds checking
        let rowNumber;
        if (typeof seat.location.row === 'string') {
          // Convert row letter (A, B, C, etc.) to number (1, 2, 3, etc.)
          rowNumber = seat.location.row.charCodeAt(0) - 64;
        } else {
          rowNumber = parseInt(seat.location.row);
        }

        if (rowNumber < 1 || rowNumber > screen.size.rows ||
            seat.location.column < 1 || seat.location.column > screen.size.columns) {
          errors.push(`Seat ${i + 1}: Location out of screen bounds (row: ${seat.location.row}, column: ${seat.location.column}, screen: ${screen.size.rows}x${screen.size.columns})`);
          continue;
        }

        validatedSeats.push({
          seatNumber: seat.seatNumber.trim(),
          location: {
            row: seat.location.row,
            column: parseInt(seat.location.column)
          },
          screen: screenId,
          category: seat.category.trim(),
          isHidden: seat.isHidden || false
        });
      }

      if (errors.length > 0) {
        return res.status(400).json({ 
          message: 'Validation errors',
          errors
        });
      }

      // 7. Check for duplicates within the batch and with existing seats
      const Seat = require('../models/Seat');
      const existingSeats = await Seat.find({ screen: screenId });
      
      const seatNumbers = new Set();
      const locations = new Set();
      
      for (const existingSeat of existingSeats) {
        seatNumbers.add(existingSeat.seatNumber);
        locations.add(`${existingSeat.location.row}-${existingSeat.location.column}`);
      }

      for (let i = 0; i < validatedSeats.length; i++) {
        const seat = validatedSeats[i];
        const locationKey = `${seat.location.row}-${seat.location.column}`;
        
        if (seatNumbers.has(seat.seatNumber)) {
          errors.push(`Seat ${i + 1}: Seat number '${seat.seatNumber}' already exists`);
        }
        
        if (locations.has(locationKey)) {
          errors.push(`Seat ${i + 1}: Location (${seat.location.row}, ${seat.location.column}) already occupied`);
        }
        
        seatNumbers.add(seat.seatNumber);
        locations.add(locationKey);
      }

      if (errors.length > 0) {
        return res.status(409).json({ 
          message: 'Duplicate errors',
          errors
        });
      }

      // 8. Create all seats
      const createdSeats = await Seat.insertMany(validatedSeats);

      res.status(201).json({
        message: `${createdSeats.length} seats created successfully.`,
        seats: createdSeats,
        total: createdSeats.length
      });

    } catch (error) {
      console.error('Error bulk creating seats:', error);
      res.status(500).json({ 
        message: 'Server error', 
        error: process.env.NODE_ENV === 'development' ? error.message : undefined 
      });
    }
  };

  /**
   * @desc    Update an existing seat
   * @route   PATCH /api/branches/:branchId/screens/:screenId/seats/:seatId
   * @access  Branch Manager (restricted to their assigned branch)
   */
  const updateSeat = async (req, res) => {
    try {
      const { branchId, screenId, seatId } = req.params;
      const { seatNumber, location, category, isHidden } = req.body;

      // 1. Validate branch manager permissions
      if (!req.user.roles.includes('branchmanager')) {
        return res.status(403).json({ 
          message: 'Only branch managers can update seats.' 
        });
      }

      // 2. Check if branch manager belongs to this branch
      if (!req.user.branch || req.user.branch.toString() !== branchId) {
        return res.status(403).json({ 
          message: 'You can only manage seats for your assigned branch.' 
        });
      }

      // 3. Validate ObjectId formats
      if (!mongoose.Types.ObjectId.isValid(branchId) || 
          !mongoose.Types.ObjectId.isValid(screenId) ||
          !mongoose.Types.ObjectId.isValid(seatId)) {
        return res.status(400).json({ 
          message: 'Invalid ID format.' 
        });
      }

      // 4. Find the seat and verify it belongs to the screen
      const Seat = require('../models/Seat');
      const existingSeat = await Seat.findOne({ 
        _id: seatId, 
        screen: screenId 
      });

      if (!existingSeat) {
        return res.status(404).json({ 
          message: 'Seat not found or does not belong to this screen.' 
        });
      }

      // 5. Verify screen belongs to this branch
      const screen = await Screen.findOne({ 
        _id: screenId, 
        branch: branchId 
      });

      if (!screen) {
        return res.status(404).json({ 
          message: 'Screen not found or does not belong to your branch.' 
        });
      }

      // 6. Build update object
      const updateData = {};

      // Validate and set seat number if provided
      if (seatNumber) {
        const trimmedSeatNumber = seatNumber.trim();
        
        // Check for duplicate name (excluding current seat)
        const duplicateSeat = await Seat.findOne({ 
          seatNumber: trimmedSeatNumber, 
          screen: screenId,
          _id: { $ne: seatId }
        });

        if (duplicateSeat) {
          return res.status(409).json({ 
            message: 'A seat with this number already exists in this screen.' 
          });
        }

        updateData.seatNumber = trimmedSeatNumber;
      }

        // Validate and set location if provided
        if (location) {
          if (!location.row || !location.column) {
            return res.status(400).json({ 
              message: 'Both row and column are required when updating location.' 
            });
          }

          let rowNumber;
          if (typeof location.row === 'string') {
            // Convert row letter (A, B, C, etc.) to number (1, 2, 3, etc.)
            rowNumber = location.row.charCodeAt(0) - 64;
          } else {
            rowNumber = parseInt(location.row);
          }

          if (rowNumber < 1 || rowNumber > screen.size.rows ||
              location.column < 1 || location.column > screen.size.columns) {
            return res.status(400).json({ 
              message: `Location must be within screen size (row: ${location.row}, column: ${location.column}, screen: ${screen.size.rows}x${screen.size.columns}).` 
            });
          }

        // Check for duplicate location (excluding current seat)
        const duplicateLocation = await Seat.findOne({ 
          screen: screenId,
          'location.row': location.row,
          'location.column': location.column,
          _id: { $ne: seatId }
        });

        if (duplicateLocation) {
          return res.status(409).json({ 
            message: 'A seat already exists at this location.' 
          });
        }

        updateData.location = {
          row: location.row,
          column: parseInt(location.column)
        };
      }

      // Set category if provided
      if (category) {
        updateData.category = category.trim();
      }

      // Set hidden status if provided
      if (typeof isHidden === 'boolean') {
        updateData.isHidden = isHidden;
      }

      // 7. Update the seat
      const updatedSeat = await Seat.findByIdAndUpdate(
        seatId,
        updateData,
        { new: true, runValidators: true }
      );

      res.status(200).json({
        message: 'Seat updated successfully.',
        seat: updatedSeat
      });

    } catch (error) {
      console.error('Error updating seat:', error);
      res.status(500).json({ 
        message: 'Server error', 
        error: process.env.NODE_ENV === 'development' ? error.message : undefined 
      });
    }
  };

  /**
   * @desc    Delete a seat
   * @route   DELETE /api/branches/:branchId/screens/:screenId/seats/:seatId
   * @access  Branch Manager (restricted to their assigned branch)
   */
  const deleteSeat = async (req, res) => {
    try {
      const { branchId, screenId, seatId } = req.params;

      // 1. Validate branch manager permissions
      if (!req.user.roles.includes('branchmanager')) {
        return res.status(403).json({ 
          message: 'Only branch managers can delete seats.' 
        });
      }

      // 2. Check if branch manager belongs to this branch
      if (!req.user.branch || req.user.branch.toString() !== branchId) {
        return res.status(403).json({ 
          message: 'You can only manage seats for your assigned branch.' 
        });
      }

      // 3. Validate ObjectId formats
      if (!mongoose.Types.ObjectId.isValid(branchId) || 
          !mongoose.Types.ObjectId.isValid(screenId) ||
          !mongoose.Types.ObjectId.isValid(seatId)) {
        return res.status(400).json({ 
          message: 'Invalid ID format.' 
        });
      }

      // 4. Find the seat and verify it belongs to the screen
      const Seat = require('../models/Seat');
      const seat = await Seat.findOne({ 
        _id: seatId, 
        screen: screenId 
      });

      if (!seat) {
        return res.status(404).json({ 
          message: 'Seat not found or does not belong to this screen.' 
        });
      }

      // 5. Verify screen belongs to this branch
      const screen = await Screen.findOne({ 
        _id: screenId, 
        branch: branchId 
      });

      if (!screen) {
        return res.status(404).json({ 
          message: 'Screen not found or does not belong to your branch.' 
        });
      }

      // 6. Check if seat is in any existing schedules or tickets
      const Schedule = require('../models/Schedule');
      const scheduleCount = await Schedule.countDocuments({ 
        screen: screenId,
        startTime: { $gte: new Date() } // Only future schedules
      });

      if (scheduleCount > 0) {
        // If there are future schedules, just hide the seat instead of deleting
        const hiddenSeat = await Seat.findByIdAndUpdate(
          seatId,
          { isHidden: true },
          { new: true }
        );

        return res.status(200).json({
          message: `Seat cannot be deleted due to existing schedules (${scheduleCount}). Seat has been hidden instead.`,
          seat: hiddenSeat
        });
      }

      // 7. Delete the seat
      await Seat.findByIdAndDelete(seatId);

      res.status(200).json({
        message: 'Seat deleted successfully.',
        deletedSeat: {
          _id: seat._id,
          seatNumber: seat.seatNumber,
          location: seat.location
        }
      });

    } catch (error) {
      console.error('Error deleting seat:', error);
      res.status(500).json({ 
        message: 'Server error', 
        error: process.env.NODE_ENV === 'development' ? error.message : undefined 
      });
    }
  };

module.exports = {
  createSnack,
  editSnack,
  deleteSnack,
  getSnackList,
  getAvailableBranches,
  getBranchById,
  // Schedule management functions
  scheduleMovieScreening,
  editMovieSchedule,
  deleteMovieSchedule,
  getMovieSchedules,
  // Screen management function
  getBranchScreens,
  createScreen,
  getScreenById,
  updateScreen,
  deleteScreen,
  // Seat management functions
  getScreenSeats,
  createSeat,
  bulkCreateSeats,
  updateSeat,
  deleteSeat
};
