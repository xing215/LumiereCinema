const SnackTicket = require('../models/SnackTicket');
const Snack = require('../models/Snack');
const Promotion = require('../models/Promotion');
const User = require('../models/User'); 
const Branch = require('../models/Branch'); 
const Ticket = require('../models/Ticket'); 
// imports for getSchedulesByBranch
const mongoose = require('mongoose');
const Schedule = require('../models/Schedule');
const Screen = require('../models/Screen');
const Movie = require('../models/Movie');
const SeatHold = require('../models/SeatHold');
const Seat = require('../models/Seat');
const SeatCategory = require('../models/SeatCategory');
const { redisClient } = require('../config/redis.config');
const CacheManager = require('../utils/cacheManager');

/**
 * @desc    Get list of schedules by branch, date, and movie
 * @route   GET /tickets/:branchId/schedule
 * @access  Public
 */
const getSchedulesByBranch = async (req, res) => {
  try {
    const { branchId } = req.params;
    const { date, movieId } = req.query; 

    // Validate branchId format
    if (!mongoose.Types.ObjectId.isValid(branchId)) {
      return res.status(400).json({
        error: 'Invalid branch ID format'
      });
    }

    // Validate required date
    if (!date) {
      return res.status(400).json({
        error: 'Date is required as query parameter'
      });
    }

    // Validate movieId if provided
    if (movieId && !mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(400).json({
        error: 'Invalid movie ID format'
      });
    }

    // Parse target date
    const targetDate = new Date(date);
    
    // Validate date
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({
        error: 'Invalid date format. Use YYYY-MM-DD'
      });
    }

    // Create date range for the entire day
    const targetYear = targetDate.getFullYear();
    const targetMonth = targetDate.getMonth();
    const targetDay = targetDate.getDate();
    const startOfDay = new Date(targetYear, targetMonth, targetDay, 0, 0, 0, 0);
    const endOfDay = new Date(targetYear, targetMonth, targetDay, 23, 59, 59, 999);
    // Try to get branch info from cache first
    let branch = await CacheManager.getCachedBranchInfo(branchId);
    if (branch) {
      // Branch found in cache
    } else {
      branch = await Branch.findById(branchId).lean();
      if (!branch) {
        return res.status(404).json({
          error: 'Branch not found'
        });
      }
      // Cache the branch info
      await CacheManager.cacheBranchInfo(branchId, branch);
    }

    // Build aggregation pipeline
    const pipeline = [
      // Stage 1: Match active screens for the branch
      {
        $match: {
          branch: new mongoose.Types.ObjectId(branchId),
          isActive: true
        }
      },
      // Stage 2: Lookup schedules for these screens
      {
        $lookup: {
          from: 'schedules',
          let: { screenId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$screen', '$$screenId'] },
                startTime: {
                  $gte: startOfDay,
                  $lte: endOfDay
                },
                ...(movieId ? { movie: new mongoose.Types.ObjectId(movieId) } : {})
              }
            },
            { $sort: { startTime: 1 } }
          ],
          as: 'schedules'
        }
      },
      // Stage 3: Only keep screens that have schedules
      {
        $match: {
          'schedules.0': { $exists: true }
        }
      },
      // Stage 4: Unwind schedules to process each one individually
      {
        $unwind: '$schedules'
      },
      // Stage 5: Lookup movie information
      {
        $lookup: {
          from: 'movies',
          localField: 'schedules.movie',
          foreignField: '_id',
          as: 'movieData'
        }
      },      // Stage 6: Unwind movie data
      {
        $unwind: '$movieData'
      },
      // Stage 6.5: Filter out hidden movies
      {
        $match: {
          'movieData.isHidden': false
        }
      },
      // Stage 7: Lookup active seat holds for each schedule
      {
        $lookup: {
          from: 'seatholds',
          let: { scheduleId: '$schedules._id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$schedule', '$$scheduleId'] },
                expiresAt: { $gt: new Date() }
              }
            },
            {
              $project: {
                seatNumber: 1,
                expiresAt: 1,
                holdReason: 1
              }
            }
          ],
          as: 'seatHolds'
        }
      },
      // Stage 8: Calculate seat statistics
      {
        $addFields: {
          'schedules.totalSeats': { $multiply: ['$size.rows', '$size.columns'] },
          'schedules.occupiedSeatsCount': { $size: { $ifNull: ['$schedules.OccupiedSeat', []] } },
          'schedules.heldSeatsCount': { $size: '$seatHolds' },
          'schedules.heldSeats': '$seatHolds'
        }
      },
      // Stage 9: Calculate available seats
      {
        $addFields: {
          'schedules.availableSeatsCount': {
            $subtract: [
              '$schedules.totalSeats',
              { $add: ['$schedules.occupiedSeatsCount', '$schedules.heldSeatsCount'] }
            ]
          }
        }
      },
      // Stage 10: Project final structure
      {
        $project: {
          screenInfo: {
            _id: '$_id',
            screenName: '$screenName',
            screenType: '$screenType',
            totalSeats: '$schedules.totalSeats',
            size: '$size'
          },
          schedule: {
            _id: '$schedules._id',
            startTime: '$schedules.startTime',
            endTime: '$schedules.endTime',
            movie: {
              _id: '$movieData._id',
              title: '$movieData.title',
              duration: '$movieData.duration',
              genre: '$movieData.genre',
              posterURL: '$movieData.posterURL',
              rating: '$movieData.rating'
            },
            seatInfo: {
              totalSeats: '$schedules.totalSeats',
              occupiedSeats: { $ifNull: ['$schedules.OccupiedSeat', []] },
              occupiedSeatsCount: '$schedules.occupiedSeatsCount',
              heldSeats: '$schedules.heldSeats',
              heldSeatsCount: '$schedules.heldSeatsCount',
              availableSeatsCount: '$schedules.availableSeatsCount'
            }
          }
        }
      },
      // Stage 11: Group by screen to collect all schedules
      {
        $group: {
          _id: '$screenInfo._id',
          screenInfo: { $first: '$screenInfo' },
          schedules: { $push: '$schedule' }
        }
      }
    ];    // Execute aggregation pipeline
    const result = await Screen.aggregate(pipeline);

    // Format response
    const screens = result.map(screenData => ({
      screenInfo: screenData.screenInfo,
      schedules: screenData.schedules
    }));

    return res.status(200).json({
      date: targetDate.toISOString().split('T')[0],
      movieFilter: movieId || null,
      totalScreens: screens.length,
      totalSchedules: screens.reduce((sum, screen) => sum + screen.schedules.length, 0),
      screens: screens
    });

  } catch (error) {
    console.error('Error fetching schedules:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get seat map with status (available, occupied, holding)
 * @route   GET /tickets/screen/:scheduleId
 * @access  Public
 */
const getSeatMapBySchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { includeExpired = false } = req.query; // Option to include expired holds

    // Validate scheduleId format
    if (!mongoose.Types.ObjectId.isValid(scheduleId)) {
      return res.status(400).json({
        error: 'Invalid schedule ID format'
      });
    }

    // OPTIMIZATION: Use aggregation pipeline to combine queries
    const aggregationResult = await Schedule.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(scheduleId) }
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
          from: 'movies',
          localField: 'movie',
          foreignField: '_id',
          as: 'movieData'
        }
      },
      {
        $unwind: '$screenData'
      },
      {
        $unwind: '$movieData'
      },
      {
        $match: {
          'movieData.isHidden': false // Only show schedules for non-hidden movies
        }
      },
      {
        $project: {
          _id: 1,
          startTime: 1,
          endTime: 1,
          OccupiedSeat: 1,
          movie: {
            _id: '$movieData._id',
            title: '$movieData.title',
            duration: '$movieData.duration',
            rating: '$movieData.rating'
          },
          screen: {
            _id: '$screenData._id',
            screenName: '$screenData.screenName',
            screenType: '$screenData.screenType',
            size: '$screenData.size',
            branch: '$screenData.branch'
          }
        }
      }
    ]);

    if (aggregationResult.length === 0) {
      return res.status(404).json({
        error: 'Schedule not found'
      });
    }

    const schedule = aggregationResult[0];
    const { rows, columns } = schedule.screen.size;
    const totalSeats = rows * columns;    // OPTIMIZATION: Use Redis cache for seat layout generation via CacheManager
    const allSeats = await CacheManager.getSeatLayout(rows, columns);    // NEW: Get seat information with types/categories from the database
    const Seat = require('../models/Seat');
    const SeatCategory = require('../models/SeatCategory');
    
    // First get all seats for the screen
    const seatsWithTypes = await Seat.find({ screen: schedule.screen._id })
      .select('seatNumber category isHidden location')
      .lean();

    // Get all seat categories separately (since category field is shortname string, not ObjectId reference)
    const seatCategories = await SeatCategory.find({}).select('shortname name Fee FeeForSpecial').lean();
    
    // Create category lookup map
    const categoryMap = new Map();
    seatCategories.forEach(cat => {
      categoryMap.set(cat.shortname, cat);
    });

    // Create seat type mapping for fast lookup
    const seatTypeMap = new Map();
    seatsWithTypes.forEach(seat => {
      const category = categoryMap.get(seat.category) || { shortname: 'STANDARD', name: 'Standard', Fee: 0, FeeForSpecial: 0 };
      seatTypeMap.set(seat.seatNumber, {
        category: category.shortname,
        categoryName: category.name,
        price: category.Fee,
        specialPrice: category.FeeForSpecial,
        isHidden: seat.isHidden,
        location: seat.location
      });
    });

    // OPTIMIZATION: Single query for seat holds with proper filtering
    const holdQuery = {
      schedule: scheduleId,
      ...(includeExpired === 'true' ? {} : { expiresAt: { $gt: new Date() } })
    };

    const seatHolds = await SeatHold.find(holdQuery)
      .select('seatNumber expiresAt holdReason user sessionId')
      .lean();

    // Get occupied and held seats
    const occupiedSeats = schedule.OccupiedSeat || [];
    const heldSeatsMap = new Map();
    
    seatHolds.forEach(hold => {
      heldSeatsMap.set(hold.seatNumber, {
        expiresAt: hold.expiresAt,
        holdReason: hold.holdReason,
        isExpired: hold.expiresAt <= new Date(),
        holdId: hold._id
      });
    });

    // OPTIMIZATION: Use Map for faster lookup
    const occupiedSeatsSet = new Set(occupiedSeats);    // Create simplified seat map - only basic info needed
    const seatsByRow = {};
    
    allSeats.forEach(seatNumber => {
      const rowLetter = seatNumber.charAt(0);
      if (!seatsByRow[rowLetter]) {
        seatsByRow[rowLetter] = [];
      }
      
      const seatData = { seatNumber };
      
      // Add basic seat category information
      const seatInfo = seatTypeMap.get(seatNumber);
      if (seatInfo) {
        seatData.category = seatInfo.category;
        seatData.categoryName = seatInfo.categoryName;
        seatData.isHidden = seatInfo.isHidden;
      } else {
        seatData.category = 'STANDARD';
        seatData.categoryName = 'Standard';
        seatData.isHidden = false;
      }
      
      // Determine seat status
      if (seatData.isHidden) {
        seatData.status = 'hidden';
      } else if (occupiedSeatsSet.has(seatNumber)) {
        seatData.status = 'occupied';
      } else if (heldSeatsMap.has(seatNumber)) {
        const holdInfo = heldSeatsMap.get(seatNumber);
        seatData.status = holdInfo.isExpired ? 'expired_hold' : 'holding';
      } else {
        seatData.status = 'available';
      }

      seatsByRow[rowLetter].push(seatData);
    });    return res.status(200).json({
      schedule: {
        _id: schedule._id,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        movie: schedule.movie
      },
      screen: {
        _id: schedule.screen._id,
        screenName: schedule.screen.screenName,
        screenType: schedule.screen.screenType,
        layout: {
          rows,
          columns,
          totalSeats
        }
      },
      seatsByRow
    });

  } catch (error) {
    console.error('Error fetching seat map:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Temporarily hold seats (seat holding)
 * @route   POST /tickets/hold
 * @access  Public
 */
const holdSeats = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    const { scheduleId, seatNumbers, userId, sessionId, holdDurationMinutes, replaceExisting = false } = req.body;

    // Enhanced validation
    if (!scheduleId || !seatNumbers || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
      return res.status(400).json({
        error: 'Schedule ID and seat numbers array are required'
      });
    }

    if (seatNumbers.length > 10) { // Prevent abuse
      return res.status(400).json({
        error: 'Maximum 10 seats can be held at once'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(scheduleId)) {
      return res.status(400).json({
        error: 'Invalid schedule ID format'
      });
    }

    // Must have either userId or sessionId
    if (!userId && !sessionId) {
      return res.status(400).json({
        error: 'Either userId or sessionId is required'
      });
    }

    // Validate userId if provided
    if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        error: 'Invalid user ID format'
      });
    }

    // Remove duplicates and validate seat format
    const uniqueSeatNumbers = [...new Set(seatNumbers)];
    const validSeatPattern = /^[A-Z]\d+$/;
    
    for (const seatNumber of uniqueSeatNumbers) {
      if (!validSeatPattern.test(seatNumber)) {
        return res.status(400).json({
          error: `Invalid seat number format: ${seatNumber}`
        });
      }
    }
    // CRITICAL: Use transaction to prevent race conditions
    let transactionResult;
    
    await session.withTransaction(async () => {
      // Check if schedule exists and get screen info
      const schedule = await Schedule.findById(scheduleId)
        .populate('screen', 'size')
        .session(session)
        .lean();

      if (!schedule) {
        throw { status: 404, message: 'Schedule not found' };
      }

      // Validate seat existence within screen layout
      const { rows, columns } = schedule.screen.size;
      
      for (const seatNumber of uniqueSeatNumbers) {
        const rowLetter = seatNumber.charAt(0);
        const seatCol = parseInt(seatNumber.slice(1));
        const rowIndex = rowLetter.charCodeAt(0) - 65; // A=0, B=1, etc.

        if (rowIndex >= rows || seatCol > columns || seatCol < 1) {
          throw { 
            status: 400, 
            message: `Seat ${seatNumber} does not exist in this screen (${rows}x${columns})` 
          };
        }
      }

      // Check for occupied seats
      const occupiedSeats = schedule.OccupiedSeat || [];
      const conflictingOccupied = uniqueSeatNumbers.filter(seat => occupiedSeats.includes(seat));
      
      if (conflictingOccupied.length > 0) {
        throw {
          status: 409,
          message: 'Some seats are already occupied',
          conflictingSeats: conflictingOccupied
        };
      }

      // OPTIMIZATION: Check existing holds with single query
      const existingHolds = await SeatHold.find({
        schedule: scheduleId,
        seatNumber: { $in: uniqueSeatNumbers },
        expiresAt: { $gt: new Date() }
      }).session(session).lean();

      // Handle existing holds
      if (existingHolds.length > 0) {
        if (replaceExisting) {
          // Check if user owns existing holds
          const ownedHolds = existingHolds.filter(hold => 
            (userId && hold.user?.toString() === userId) || 
            (sessionId && hold.sessionId === sessionId)
          );
          
          if (ownedHolds.length !== existingHolds.length) {
            const conflictingSeats = existingHolds
              .filter(hold => !ownedHolds.includes(hold))
              .map(hold => hold.seatNumber);
            
            throw {
              status: 409,
              message: 'Some seats are held by other users',
              conflictingSeats
            };
          }
          
          // Delete existing holds owned by this user/session
          await SeatHold.deleteMany({
            schedule: scheduleId,
            seatNumber: { $in: uniqueSeatNumbers },
            $or: [
              ...(userId ? [{ user: userId }] : []),
              ...(sessionId ? [{ sessionId: sessionId }] : [])
            ]
          }).session(session);
          
        } else {
          const conflictingHeld = existingHolds.map(hold => hold.seatNumber);
          throw {
            status: 409,
            message: 'Some seats are already being held',
            conflictingSeats: conflictingHeld,
            suggestion: 'Use replaceExisting=true to replace your own holds'
          };
        }
      }

      // Calculate expiration time
      const holdMinutes = Math.min(holdDurationMinutes || 10, 30); // Max 30 minutes
      const expiresAt = new Date(Date.now() + holdMinutes * 60 * 1000);

      // Create seat holds atomically
      const seatHoldDocuments = uniqueSeatNumbers.map(seatNumber => ({
        schedule: scheduleId,
        seatNumber,
        user: userId || null,
        sessionId: sessionId || null,
        expiresAt,
        holdReason: 'customer_selection'
      }));

      // OPTIMIZATION: Use insertMany with ordered:false for better performance
      await SeatHold.insertMany(seatHoldDocuments, { 
        session,
        ordered: false // Continue if some fail due to unique constraint
      });

      // Store result in outer scope variable
      transactionResult = {
        holds: seatHoldDocuments,
        expiresAt,
        holdDurationMinutes: holdMinutes
      };
    });
      // Use the stored result
    const result = transactionResult;
    
    // Defensive programming: Validate result structure
    if (!result || !result.holds || !Array.isArray(result.holds)) {
      console.error('ERROR: Invalid transaction result structure:', result);
      return res.status(500).json({
        error: 'Transaction completed but returned invalid result structure',
        details: process.env.NODE_ENV === 'development' ? { result } : undefined
      });
    }
    
    // OPTIMIZATION: Invalidate cache for this schedule since seat holds changed
    await CacheManager.invalidateScheduleCache(scheduleId);

    return res.status(201).json({
      success: true,
      message: 'Seats held successfully',
      data: {
        holdCount: result.holds.length,
        holds: result.holds.map(hold => ({
          seatNumber: hold.seatNumber,
          expiresAt: hold.expiresAt,
          holdReason: hold.holdReason
        })),
        expiresAt: result.expiresAt,
        holdDurationMinutes: result.holdDurationMinutes,
        autoExpiry: true
      }
    });

  } catch (error) {
    // Handle custom errors
    if (error.status) {
      return res.status(error.status).json({
        error: error.message,
        ...(error.conflictingSeats && { conflictingSeats: error.conflictingSeats }),
        ...(error.suggestion && { suggestion: error.suggestion })
      });
    }
    
    // Handle MongoDB errors
    if (error.code === 11000) { // Duplicate key error
      return res.status(409).json({
        error: 'Some seats are already held (race condition detected)',
        suggestion: 'Please refresh seat map and try again'
      });
    }

    console.error('Error holding seats:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    await session.endSession();
  }
};

/**
 * @desc    Temporarily reserve snacks
 * @route   POST /tickets/snacks/reserve
 * @access  Public
 * @body    { branchId, snackItems: [{ shortname, quantity }], userId?, sessionId?, reserveDurationMinutes? }
 */
const reserveSnacks = async (req, res) => {
  try {
    const { branchId, snackItems, userId, sessionId, reserveDurationMinutes } = req.body;

    // Validation
    if (!branchId || !snackItems || !Array.isArray(snackItems) || snackItems.length === 0) {
      return res.status(400).json({
        error: 'Branch ID and snack items array are required'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(branchId)) {
      return res.status(400).json({
        error: 'Invalid branch ID format'
      });
    }

    // Must have either userId or sessionId
    if (!userId && !sessionId) {
      return res.status(400).json({
        error: 'Either userId or sessionId is required'
      });
    }    // Validate snackItems format
    for (const item of snackItems) {
      if (!item.shortname || !item.quantity || item.quantity <= 0) {
        return res.status(400).json({
          error: 'Each snack item must have shortname and positive quantity'
        });
      }

      // Validate shortname format (should be uppercase and trimmed)
      if (typeof item.shortname !== 'string' || !item.shortname.trim()) {
        return res.status(400).json({
          error: `Invalid shortname format: ${item.shortname}`
        });
      }
    }

    // Check if branch exists
    const branch = await Branch.findById(branchId);
    if (!branch) {
      return res.status(404).json({
        error: 'Branch not found'
      });
    }

    // Get shortnames for checking
    const shortnames = snackItems.map(item => item.shortname.toUpperCase().trim());
    
    // Check if all snacks exist and belong to the branch
    const snacks = await Snack.find({
      shortname: { $in: shortnames },
      branch: branchId,
      isHidden: false
    }).lean();    if (snacks.length !== shortnames.length) {
      const foundShortnames = snacks.map(snack => snack.shortname);
      const missingShortnames = shortnames.filter(shortname => !foundShortnames.includes(shortname));
      return res.status(404).json({
        error: 'Some snacks not found or not available',
        missingShortnames: missingShortnames
      });
    }

    // Check stock availability
    const stockIssues = [];
    const reservationRequests = [];

    for (const item of snackItems) {
      const snack = snacks.find(s => s.shortname === item.shortname.toUpperCase().trim());
      const availableStock = snack.stock - (snack.reserved || 0);
      
      if (availableStock < item.quantity) {
        stockIssues.push({
          shortname: item.shortname,
          snackName: snack.name,
          requested: item.quantity,
          available: availableStock
        });
      } else {
        reservationRequests.push({
          snackId: snack._id,
          shortname: snack.shortname,
          quantity: item.quantity,
          snack: snack
        });
      }
    }

    if (stockIssues.length > 0) {
      return res.status(409).json({
        error: 'Insufficient stock for some items',
        stockIssues
      });
    }

    // Calculate expiration time for reservation
    const reserveMinutes = reserveDurationMinutes || 15; // Default 15 minutes
    const expiresAt = new Date(Date.now() + reserveMinutes * 60 * 1000);

    // Update snack reservations atomically
    const session = await mongoose.startSession();
    
    try {
      await session.withTransaction(async () => {
        for (const request of reservationRequests) {
          await Snack.findByIdAndUpdate(
            request.snackId,
            { 
              $inc: { reserved: request.quantity } 
            },
            { session }
          );
        }
      });

      // Create a simple reservation record (you might want to create a SnackReservation model)
      const reservationRecord = {
        _id: new mongoose.Types.ObjectId(),
        branch: branchId,
        user: userId || null,
        sessionId: sessionId || null,        items: reservationRequests.map(req => ({
          snackId: req.snackId,
          shortname: req.shortname,
          snackName: req.snack.name,
          quantity: req.quantity,
          pricePerUnit: req.snack.price,
          totalPrice: req.snack.price * req.quantity
        })),
        expiresAt,
        status: 'reserved',
        createdAt: new Date()
      };

      await session.commitTransaction();

      // Calculate total
      const totalAmount = reservationRecord.items.reduce(
        (sum, item) => sum + item.totalPrice, 0
      );

      return res.status(201).json({
        message: 'Snacks reserved successfully',
        reservation: {
          _id: reservationRecord._id,
          items: reservationRecord.items,
          totalAmount,
          expiresAt,
          reserveDurationMinutes: reserveMinutes
        }
      });

    } catch (sessionError) {
      await session.abortTransaction();
      throw sessionError;
    } finally {
      await session.endSession();
    }

  } catch (error) {
    console.error('Error reserving snacks:', error);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
};

/**
 * @desc    Create standalone snack ticket
 * @route   POST /tickets/snacks/create
 * @access  Public
 * @body    {
 *            customer?: ObjectId,
 *            noLoginCustomerInfo?: { name, email, phone },
 *            branch: ObjectId,
 *            seller?: ObjectId,
 *            promotionCode?: string,
 *            snackList: [{ shortname: string, quantity: number }]
 *          }
 */
const createSnackTicket = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    const { 
      customer, 
      noLoginCustomerInfo, 
      branch, 
      seller, 
      promotionCode,
      snackList 
    } = req.body;

    // Validate snackList is provided
    if (!snackList || !Array.isArray(snackList) || snackList.length === 0) {
      return res.status(400).json({ 
        error: 'snackList array is required and cannot be empty' 
      });
    }

    let transactionResult;

    await session.withTransaction(async () => {
      // ===== Validate data =====
      const { user, branchData } = await validateRequestData({ 
        customer, 
        noLoginCustomerInfo, 
        branch, 
        snackList, 
        seller 
      });

      // ===== Calculate total and update stock =====
      const { total: baseTotal, validatedSnackList } = await calculateTotalAndUpdateStock(
        snackList, 
        branchData._id, 
        session
      );

      // ===== Apply discounts =====
      const { total: finalTotal, appliedPromotion } = await applyDiscounts({ 
        user, 
        promotionCode, 
        total: baseTotal,
        session 
      });

      // ===== Add loyalty points if user is logged in =====
      let pointsAdded = 0;
      if (user && finalTotal > 0) {
        pointsAdded = Math.floor(finalTotal / 10000); // 1 point per 10,000 VND
        user.loyaltyPoints = (user.loyaltyPoints || 0) + pointsAdded;
        await user.save({ session });
      }

      // ===== Create snack ticket =====
      const snackTicket = new SnackTicket({
        branch,
        snackList: validatedSnackList,
        promotion: appliedPromotion,
        total: finalTotal,
        seller: seller || null,
        ...(customer ? { customer } : { noLoginCustomerInfo })
      });

      await snackTicket.save({ session });

      // Store result for response
      transactionResult = {
        snackTicket,
        totalAmount: finalTotal,
        appliedPromotion,
        pointsAdded
      };
    });

    return res.status(201).json({
      success: true,
      message: 'Snack ticket created successfully',
      data: {
        snackTicket: transactionResult.snackTicket,
        totalAmount: transactionResult.totalAmount,
        appliedPromotion: transactionResult.appliedPromotion,
        pointsAdded: transactionResult.pointsAdded
      }
    });

  } catch (error) {
    console.error('Create Snack Ticket Error:', error);
    const status = error.status || 500;
    const message = error.message || 'Failed to create snack ticket.';
    return res.status(status).json({ 
      error: message 
    });
  } finally {
    await session.endSession();
  }
};

// ======= EXISTING SUB FUNCTIONS =======

const validateRequestData = async ({ customer, noLoginCustomerInfo, branch, snackList = [], seller }) => {
  let user = null;

  if (customer) {
    user = await User.findById(customer);
    if (!user) throw { status: 404, message: 'Customer not found.' };
    if (user.isLocked) throw { status: 403, message: 'Customer account is locked.' };
  }

  if (!customer && !noLoginCustomerInfo) {
    throw { status: 400, message: 'Customer information is required.' };
  }

  if (!branch) {
    throw { status: 400, message: 'Branch is required.' };
  }

  const branchData = await Branch.findById(branch);
  if (!branchData) throw { status: 404, message: 'Branch not found.' };

  if (seller) {
    const staff = await User.findById(seller);
    if (!staff || !staff.roles.includes('cashier')) {
      throw { status: 400, message: 'Invalid seller.' };
    }
  }

  return { user, branchData };
};

const calculateTotalAndUpdateStock = async (snackList, branchId, session = null) => {
  let total = 0;
  const validatedSnackList = [];

  for (const item of snackList) {
    // Use shortname instead of _id for snack identification
    const snack = await Snack.findOne({ 
      shortname: item.shortname, 
      branch: branchId 
    }).session(session);
    
    if (!snack || snack.isHidden) {
      throw { status: 404, message: `Snack ${item.shortname} not found or hidden.` };
    }

    // Check if requested quantity is available (considering current stock)
    const availableStock = snack.stock - (snack.reserved || 0);
    if (availableStock < item.quantity) {
      throw { 
        status: 400, 
        message: `Not enough stock for snack: ${snack.name}. Available: ${availableStock}, Requested: ${item.quantity}` 
      };
    }

    const price = snack.discountedPrice || snack.price;
    total += price * item.quantity;

    validatedSnackList.push({
      snack: snack._id, // Store the actual ObjectId in the ticket
      quantity: item.quantity,
      priceAtPurchase: price,
    });

    // Update stock by reducing available quantity
    snack.stock -= item.quantity;
    await snack.save({ session });
  }

  return { total, validatedSnackList };
};

// Áp dụng khuyến mãi và điểm thành viên
const applyDiscounts = async ({ user, promotionCode, total, session = null }) => {
  let updatedTotal = total;
  let appliedPromotion = null;

  // Apply promotion FIRST, then loyalty discount
  if (promotionCode) {
    const promo = await Promotion.findOne({ promotionCode: promotionCode, isActive: true }).session(session);
    const now = new Date();

    // Check promotion validity using ORIGINAL total (before any discounts)
    if (
      !promo || promo.startDate > now || promo.endDate < now || total < promo.minimumSpend
    ) {
      throw { status: 400, message: 'Invalid or inapplicable promotion.' };
    }

    if (promo.remainingUse !== null && promo.remainingUse <= 0) {
      throw { status: 400, message: 'Promotion has no remaining uses.' };
    }

    if (promo.appliedLoyaltyRank && !user) {
      throw { status: 400, message: 'Promotion requires a customer.' };
    }

    if (promo.appliedLoyaltyRank && user.loyaltyRank.rank !== promo.appliedLoyaltyRank) {
      throw { status: 400, message: 'Promotion not applicable for your loyalty rank.' };
    }

    const discount = Math.min(updatedTotal * promo.discountRate / 100.0, promo.maximumDiscount);
    updatedTotal -= discount;

    if (promo.remainingUse !== null) {
      promo.remainingUse -= 1;
      await promo.save({ session });
    }

    appliedPromotion = promo._id;
  }

  // Apply loyalty discount AFTER promotion (if any)
  if (user && user.loyaltyRank?.defaultDiscountRate) {
    const loyaltyDiscount = updatedTotal * user.loyaltyRank.defaultDiscountRate / 100;
    updatedTotal -= loyaltyDiscount;
  }

  // Ensure total cannot go below 0
  updatedTotal = Math.max(0, updatedTotal);

  return { total: updatedTotal, appliedPromotion };
};

/**
 * @desc    Create unified ticket (movie, snack, or both)
 * @route   POST /tickets/create
 * @access  Public
 * @body    {
 *            customer?: ObjectId,
 *            noLoginCustomerInfo?: { name, email, phone },
 *            branch: ObjectId,
 *            seller?: ObjectId,
 *            promotionCode?: string,
 *            movieTicket?: {
 *              schedule: ObjectId,
 *              seats: [string]
 *            },
 *            snackTicket?: {
 *              snackList: [{ shortname: string, quantity: number }]
 *            }
 *          }
 */
const createTicket = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    const { 
      customer, 
      noLoginCustomerInfo, 
      branch, 
      seller, 
      promotionCode,
      movieTicket,
      snackTicket 
    } = req.body;

    // Validate that at least one ticket type is requested
    if (!movieTicket && !snackTicket) {
      return res.status(400).json({ 
        error: 'At least one ticket type (movieTicket or snackTicket) must be provided' 
      });
    }

    let transactionResult;

    await session.withTransaction(async () => {
      // ===== Validate common data =====
      const { user, branchData } = await validateRequestData({ 
        customer, 
        noLoginCustomerInfo, 
        branch, 
        snackList: snackTicket?.snackList || [], 
        seller 
      });

      let createdMovieTicket = null;
      let createdSnackTicket = null;
      let totalAmount = 0;

      // ===== Process Movie Ticket =====
      if (movieTicket) {
        const { schedule, seats } = movieTicket;
        
        // Validate movie ticket data
        if (!schedule || !seats || !Array.isArray(seats) || seats.length === 0) {
          throw { status: 400, message: 'Movie ticket requires schedule and seats array' };
        }

        // Validate schedule exists and get movie pricing
        const scheduleData = await Schedule.findById(schedule)
          .populate('movie')
          .populate('screen')
          .session(session);
        
        if (!scheduleData) {
          throw { status: 404, message: 'Schedule not found' };
        }

        if (scheduleData.movie.isHidden) {
          throw { status: 400, message: 'Movie is not available' };
        }        // Check seat availability
        const existingTickets = await Ticket.find({
          schedule: schedule,
          seats: { $in: seats },
          status: { $in: ['Confirmed', 'CheckedIn'] }
        }).session(session);

        if (existingTickets.length > 0) {
          const occupiedSeats = existingTickets.flatMap(ticket => ticket.seats);
          const conflictSeats = seats.filter(seat => occupiedSeats.includes(seat));
          throw { 
            status: 409, 
            message: 'Some seats are already booked',
            conflictSeats 
          };
        }        // Calculate movie ticket price based on seat categories
        let movieTicketTotal = 0;
        
        // Determine if customer qualifies for special pricing (elderly 60+, students with HSSV assumed based on age)
        let useSpecialPricing = false;
        if (user && user.birthday) {
          const age = new Date().getFullYear() - new Date(user.birthday).getFullYear();
          useSpecialPricing = age >= 60 || (age >= 16 && age <= 25); // Elderly (60+) or student age (16-25)
        }        for (const seatNumber of seats) {
          // Find seat information with category shortname (no populate needed since it's a string)
          const seat = await Seat.findOne({
            seatNumber: seatNumber,
            screen: scheduleData.screen._id
          }).session(session);

          if (!seat) {
            throw { status: 400, message: `Seat ${seatNumber} not found in this screen` };
          }
 
          // Get seat category using shortname lookup
          const seatCategory = await SeatCategory.findOne({ shortname: seat.category }).session(session);
          
          if (!seatCategory) {
            throw { status: 400, message: `Seat category '${seat.category}' not found for seat ${seatNumber}` };
          }

          // Apply special pricing logic
          let seatPrice = seatCategory.Fee; // Default price
          if (useSpecialPricing && seatCategory.FeeForSpecial > 0) {
            seatPrice = seatCategory.FeeForSpecial; // Use special price for eligible customers
          }
          
          movieTicketTotal += seatPrice;
        }

        // Create movie ticket
        createdMovieTicket = new Ticket({
          customer: customer || null,
          seller: seller || null,
          branch,
          schedule,
          seats,
          total: movieTicketTotal,
          status: 'Confirmed'
        });        await createdMovieTicket.save({ session });
        totalAmount += movieTicketTotal;

        // add ticket to user's watch history if logged in
        if (user) {
          user.watchHistory = user.watchHistory || [];
          user.watchHistory.push(createdMovieTicket._id);
          await user.save({ session });

          // Cập nhật lại Redis nếu có dùng cache user
          const userCacheKey = `user:${user._id}`;
          await redisClient.set(userCacheKey, JSON.stringify(user));
        }

        // CRITICAL: Update Schedule.OccupiedSeat to mark seats as occupied
        await Schedule.findByIdAndUpdate(
          schedule,
          { $addToSet: { OccupiedSeat: { $each: seats } } },
          { session }
        );

        // Clear seat holds for these seats
        await SeatHold.deleteMany({
          schedule: schedule,
          seatNumber: { $in: seats },
          $or: [
            { user: customer },
            { sessionId: req.sessionID }
          ]
        }).session(session);
      }

      // ===== Process Snack Ticket =====
      if (snackTicket) {
        const { snackList } = snackTicket;
        
        if (!snackList || !Array.isArray(snackList) || snackList.length === 0) {
          throw { status: 400, message: 'Snack ticket requires snackList array' };
        }

        // Calculate snack total and update stock
        const { total: snackTotal, validatedSnackList } = await calculateTotalAndUpdateStock(
          snackList, 
          branchData._id, 
          session
        );

        // Create snack ticket
        createdSnackTicket = new SnackTicket({
          branch,
          snackList: validatedSnackList,
          total: snackTotal,
          seller: seller || null,
          ...(customer ? { customer } : { noLoginCustomerInfo })
        });

        await createdSnackTicket.save({ session });
        totalAmount += snackTotal;
      }

      // ===== Apply promotions and discounts =====
      let finalTotal = totalAmount;
      let appliedPromotion = null;

      if (user || promotionCode) {
        const discountResult = await applyDiscounts({ 
          user, 
          promotionCode, 
          total: totalAmount,
          session 
        });
        finalTotal = discountResult.total;
        appliedPromotion = discountResult.appliedPromotion;

        // Update promotion reference in tickets
        if (appliedPromotion) {
          if (createdMovieTicket) {
            createdMovieTicket.promotion = appliedPromotion;
            createdMovieTicket.total = createdMovieTicket.total * (finalTotal / totalAmount);
            await createdMovieTicket.save({ session });
          }
          if (createdSnackTicket) {
            createdSnackTicket.promotion = appliedPromotion;
            createdSnackTicket.total = createdSnackTicket.total * (finalTotal / totalAmount);
            await createdSnackTicket.save({ session });
          }
        }
      }

      // ===== Add loyalty points if user is logged in =====
      if (user && finalTotal > 0) {
        user.addLunarPointsFromPurchase(finalTotal);
        await user.save({ session });
      }

      // Store result for response
      transactionResult = {
        movieTicket: createdMovieTicket,
        snackTicket: createdSnackTicket,
        totalAmount: finalTotal,
        appliedPromotion,
        pointsAdded: user ? Math.floor(finalTotal / 10000) : 0
      };
    });

    // Invalidate relevant caches
    if (movieTicket) {
      await CacheManager.invalidateScheduleCache(movieTicket.schedule);
    }

    return res.status(201).json({
      success: true,
      message: 'Ticket(s) created successfully',
      data: {
        movieTicket: transactionResult.movieTicket,
        snackTicket: transactionResult.snackTicket,
        totalAmount: transactionResult.totalAmount,
        appliedPromotion: transactionResult.appliedPromotion,
        pointsAdded: transactionResult.pointsAdded
      }
    });

  } catch (error) {
    console.error('Create Ticket Error:', error);
    const status = error.status || 500;
    const message = error.message || 'Failed to create ticket.';
    return res.status(status).json({ 
      error: message,
      ...(error.conflictSeats && { conflictSeats: error.conflictSeats })
    });
  } finally {
    await session.endSession();
  }
};



// ======= GET TICKET BY CODE =======
const getTicketByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const isSnack = req.baseUrl.includes('/snacks');
    const isMovie = req.baseUrl.includes('/movies');

    if (isSnack) {
      const ticket = await SnackTicket.findOne({ snackTicketCode: code })
        .populate('customer')
        .populate('branch')
        .populate('snackList.snack')
        .populate('promotion');
      if (!ticket) {
        return res.status(404).json({ message: 'Snack ticket not found.' });
      }

      return res.status(200).json(ticket);
    }

    if (isMovie) {
      // TODO: Add handling for MovieTicket if needed
      return res.status(501).json({ message: 'Movie ticket fetching not implemented yet.' });
    }

    return res.status(400).json({ message: 'Unknown ticket type in URL.' });
  } catch (error) {
    console.error('Get Ticket By Code Error:', error);
    return res.status(500).json({ message: 'Failed to fetch ticket by code.' });
  }
};

// ======= UPDATE TICKET =======
const updateTicket = async (req, res) => {
  try {
    const { ticketCode } = req.params;
    const isSnack = req.baseUrl.includes('/snacks');
    const isMovie = req.baseUrl.includes('/movies');
    const updateData = req.body;

    if (isSnack) {
      const ticket = await SnackTicket.findOne({ snackTicketCode: ticketCode });

      if (!ticket) {
        return res.status(404).json({ message: 'Snack ticket not found.' });
      }

      // Chỉ cho phép cập nhật một số trường quan trọng
      const allowedFields = ['status', 'seller', 'noLoginCustomerInfo'];

      if(updateData.seller) {
        const seller = await User.findById(updateData.seller);
        if (!seller || !seller.roles.includes('cashier')) {
          return res.status(400).json({ message: 'Invalid seller.' });
        }
      }

      for (const field in updateData) {
        if (!allowedFields.includes(field)) {
          return res.status(400).json({ message: `Field ${field} cannot be updated.` });
        }
        ticket[field] = updateData[field];
      }

      await ticket.save();

      return res.status(200).json({
        message: 'Snack ticket updated successfully.',
        ticket,
      });
    }

    if (isMovie) {
      // TODO: Handle movie ticket update later
      return res.status(501).json({ message: 'Movie ticket update not implemented yet.' });
    }

    return res.status(400).json({ message: 'Unknown ticket type in URL.' });
  } catch (error) {
    console.error('Update Ticket Error:', error);
    return res.status(500).json({ message: 'Failed to update ticket.' });
  }
};

// ======= DELETE TICKET (Cancel SnackTicket) =======
const deleteTicket = async (req, res) => {
  try {
    const { ticketCode } = req.params;
    const isSnack = req.baseUrl.includes('/snacks');
    const isMovie = req.baseUrl.includes('/movies');

    let ticket;

    if (isSnack) {
      ticket = await SnackTicket.findOne({ snackTicketCode: ticketCode });
    } else if (isMovie) {
      ticket = await Ticket.findOne({ ticketCode: ticketCode });
    } else {
      return res.status(400).json({ message: 'Unknown ticket type in URL.' });
    }

    if (!ticket) {
      return res.status(404).json({ message: `${ticketCode} ticket not found.` });
    }

    if (ticket.status === 'Cancelled') {
      return res.status(400).json({ message: `${ticketCode} ticket already cancelled.` });
    }
    ticket.status = 'Cancelled';
    await ticket.save();

    // CRITICAL: If movie ticket, release seats from Schedule.OccupiedSeat
    if (isMovie && ticket.seats && ticket.seats.length > 0) {
      await Schedule.findByIdAndUpdate(
        ticket.schedule,
        { $pullAll: { OccupiedSeat: ticket.seats } }
      );
      // Invalidate cache for this schedule since seats are now available
      await CacheManager.invalidateScheduleCache(ticket.schedule);
    }

    return res.status(200).json({
      message: `${ticket.ticketType} ticket cancelled successfully.`,
      ticket,
    });
  } catch (error) {
    console.error('Delete Ticket Error:', error);
    return res.status(500).json({ message: 'Failed to cancel ticket.' });
  }
};

// ======= GET ALL TICKET =======
const getAllTickets = async (req, res) => {
  try {
    const isSnack = req.baseUrl.includes('/snacks');
    const isMovie = req.baseUrl.includes('/movies');
    if (isSnack) {
      const tickets = await SnackTicket.find()
        .populate('customer')
        .populate('branch')
        .populate('snackList.snack')
        .populate('promotion');
      return res.status(200).json(tickets);
    }
    if (isMovie) {
      // TODO: Add handling for MovieTicket if needed
      return res.status(501).json({ message: 'Movie ticket fetching not implemented yet.' });
    }
    return res.status(400).json({ message: 'Unknown ticket type in URL.' });

  } catch (error) {
    console.error('Get All Tickets Error:', error);
    return res.status(500).json({ message: 'Failed to fetch all tickets.' });
  }
};


/**
 * @desc    Get list of available snacks by branch
 * @route   GET /tickets/:branchId/snacks
 * @access  Public
 */
const getSnacksByBranch = async (req, res) => {
  try {
    const { branchId } = req.params;

    // Validate branchId format
    if (!mongoose.Types.ObjectId.isValid(branchId)) {
      return res.status(400).json({
        error: 'Invalid branch ID format'
      });
    }

    // Verify Branch Exists
    const branch = await Branch.findById(branchId);
    if (!branch) {
      return res.status(404).json({
        error: 'Branch not found'
      });
    }

    // Get available snacks for this branch
    const snacks = await Snack.find({
      branch: branchId,
      isHidden: false, // Only active snacks
      stock: { $gt: 0 } // Only snacks with stock > 0
    }).lean();    // Format response with availability info
    const availableSnacks = snacks.map(snack => ({
      _id: snack._id,
      shortname: snack.shortname, // Include shortname for frontend identification
      name: snack.name,
      description: snack.description,
      price: snack.price,
      discountedPrice: snack.discountedPrice,
      imageURL: snack.imageURL,
      category: snack.category,
      stock: {
        available: Math.max(0, snack.stock - (snack.reserved || 0)),
        total: snack.stock,
        reserved: snack.reserved || 0
      },
      isAvailable: (snack.stock - (snack.reserved || 0)) > 0
    }));

    return res.status(200).json({
      branch: {
        _id: branch._id,
        name: branch.name
      },
      totalSnacks: availableSnacks.length,
      snacks: availableSnacks
    });

  } catch (error) {
    console.error('Error fetching snacks:', error);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
};

/**
 * @desc    Release seat holds or extend hold time
 * @route   PATCH /tickets/hold/:holdId
 * @access  Public
 */
const manageSeatHold = async (req, res) => {
  try {
    const { holdId } = req.params;
    const { action, extendMinutes, userId, sessionId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(holdId)) {
      return res.status(400).json({
        error: 'Invalid hold ID format'
      });
    }

    if (!['release', 'extend'].includes(action)) {
      return res.status(400).json({
        error: 'Action must be either "release" or "extend"'
      });
    }

    // Find the hold
    const hold = await SeatHold.findById(holdId);

    if (!hold) {
      return res.status(404).json({
        error: 'Seat hold not found or already expired'
      });
    }

    // Verify ownership
    const isOwner = (userId && hold.user?.toString() === userId) || 
                   (sessionId && hold.sessionId === sessionId);

    if (!isOwner) {
      return res.status(403).json({
        error: 'You can only manage your own seat holds'
      });
    }

    if (action === 'release') {
      await SeatHold.findByIdAndDelete(holdId);
      return res.status(200).json({
        success: true,
        message: 'Seat hold released successfully',
        seatNumber: hold.seatNumber
      });
    }

    if (action === 'extend') {
      const additionalMinutes = Math.min(extendMinutes || 5, 15); // Max 15 minutes extension
      await hold.extendHold(additionalMinutes);
      
      return res.status(200).json({
        success: true,
        message: 'Seat hold extended successfully',
        seatNumber: hold.seatNumber,
        newExpiresAt: hold.expiresAt,
        extendedBy: additionalMinutes
      });
    }

  } catch (error) {
    console.error('Error managing seat hold:', error);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
};

/**
 * @desc    Bulk release seat holds for user/session
 * @route   DELETE /tickets/hold/bulk
 * @access  Public
 */
const releaseBulkHolds = async (req, res) => {
  try {
    const { scheduleId, userId, sessionId, seatNumbers } = req.body;

    if (!scheduleId || (!userId && !sessionId)) {
      return res.status(400).json({
        error: 'Schedule ID and user/session identification required'
      });
    }

    // Build query
    const query = {
      schedule: scheduleId,
      $or: [
        ...(userId ? [{ user: userId }] : []),
        ...(sessionId ? [{ sessionId: sessionId }] : [])
      ]
    };

    // Add seat numbers filter if provided
    if (seatNumbers && Array.isArray(seatNumbers)) {
      query.seatNumber = { $in: seatNumbers };
    }

    const result = await SeatHold.deleteMany(query);

    return res.status(200).json({
      success: true,
      message: 'Seat holds released successfully',
      releasedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Error releasing bulk holds:', error);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
};

/**
 * @desc    Cleanup expired holds (maintenance endpoint)
 * @route   POST /tickets/hold/cleanup
 * @access  Private (should be protected by admin middleware)
 */
const cleanupExpiredHolds = async (req, res) => {
  try {
    const deletedCount = await SeatHold.cleanupExpiredHolds();
    
    return res.status(200).json({
      success: true,
      message: 'Expired holds cleaned up successfully',
      deletedCount
    });

  } catch (error) {
    console.error('Error cleaning up expired holds:', error);
    return res.status(500).json({
      error: 'Internal server error'
    });  }
};

/**
 * @desc    Get cache statistics and performance metrics
 * @route   GET /tickets/cache/stats
 * @access  Private (Admin only)
 */
const getCacheStats = async (req, res) => {
  try {
    const stats = await CacheManager.getCacheStats();
      return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return res.status(500).json({
      error: 'Failed to get cache statistics'
    });
  }
};

/**
 * @desc    Cleanup expired cache entries
 * @route   POST /tickets/cache/cleanup
 * @access  Private (Admin only)
 */
const cleanupCache = async (req, res) => {
  try {
    const cleanedCount = await CacheManager.cleanupCache();
    
    return res.status(200).json({
      success: true,
      message: 'Cache cleanup completed',
      cleanedCount
    });
  } catch (error) {
    console.error('Error cleaning up cache:', error);
    return res.status(500).json({
      error: 'Failed to cleanup cache'
    });
  }
};

/**
 * @desc    Preload cache for popular routes
 * @route   POST /tickets/cache/preload
 * @access  Private (Admin only)
 */
const preloadCache = async (req, res) => {
  try {
    const { routes = [] } = req.body;
    const result = await CacheManager.preloadCache(routes);
    
    return res.status(200).json({
      success: true,
      message: 'Cache preloading completed',
      result
    });
  } catch (error) {
    console.error('Error preloading cache:', error);
    return res.status(500).json({
      error: 'Failed to preload cache'
    });
  }
};

module.exports = {
  getSchedulesByBranch, 
  getSeatMapBySchedule,
  createTicket,
  getTicketByCode,
  getAllTickets,
  updateTicket,
  deleteTicket,
  holdSeats,
  getSnacksByBranch,
  reserveSnacks,
  manageSeatHold,
  releaseBulkHolds,
  cleanupExpiredHolds,
  getCacheStats,  cleanupCache,
  preloadCache,
  createSnackTicket
  // getTicketListByTime,
  // checkInTicket,
  // makeTicketValid,
  // updateTicket
};
