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
const TicketCacheManager = require('../utils/ticketCacheManager');
const EmailService = require('../utils/emailService');

/**
 * @desc    Get list of schedules by branch, date, and movie
 * @route   GET /tickets/:branchId/schedule
 * @access  Public
 */
const getSchedulesByBranch = async (req, res) => {
  try {

    const { branchId } = req.params;
    const { movieId } = req.query;
    const userId = req.user && req.user?.id ? req.user?.id : null;
    //find user by userId
    let user = null;
    if (userId) {
      user = await User.findById(userId).lean();
    }
    // Validate movieId if provided
    if (movieId && !mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(400).json({ error: 'Invalid movie ID format' });
    }

    // Try to get branch info from cache first
    let branch = await CacheManager.getCachedBranchInfo(branchId);
    if (!branch) {
      branch = await Branch.findById(branchId).lean();
      if (!branch) {
        return res.status(404).json({ error: 'Branch not found' });
      }
      await CacheManager.cacheBranchInfo(branchId, branch);
    }

    // Build aggregation pipeline for all schedules of the movie in the branch
    const now = new Date();
    const isCashier = user && user.roles && user.roles.includes('cashier');
    const timeMatch = isCashier
      ? { endTime: { $gt: now } }
      : { startTime: { $gt: now } };
    const pipeline = [
      { $match: { branch: new mongoose.Types.ObjectId(branchId), isActive: true } },
      {
        $lookup: {
          from: 'schedules',
          let: { screenId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$screen', '$$screenId'] },
                ...(movieId ? { movie: new mongoose.Types.ObjectId(movieId) } : {}),
                ...timeMatch // Match by startTime or endTime depending on user role
              }
            },
            { $sort: { startTime: 1 } }
          ],
          as: 'schedules'
        }
      },
      { $match: { 'schedules.0': { $exists: true } } },
      { $unwind: '$schedules' },
      {
        $lookup: {
          from: 'movies',
          localField: 'schedules.movie',
          foreignField: '_id',
          as: 'movieData'
        }
      },
      { $unwind: '$movieData' },
      { $match: { 'movieData.isHidden': false } },
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
            { $project: { seatNumber: 1, expiresAt: 1, holdReason: 1 } }
          ],
          as: 'seatHolds'
        }
      },
      {
        $addFields: {
          'schedules.totalSeats': { $multiply: ['$size.rows', '$size.columns'] },
          'schedules.occupiedSeatsCount': { $size: { $ifNull: ['$schedules.OccupiedSeat', []] } },
          'schedules.heldSeatsCount': { $size: '$seatHolds' },
          'schedules.heldSeats': '$seatHolds'
        }
      },
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
      {
        $group: {
          _id: '$screenInfo._id',
          screenInfo: { $first: '$screenInfo' },
          schedules: { $push: '$schedule' }
        }
      }
    ];

    const result = await Screen.aggregate(pipeline);

    const screens = result.map(screenData => ({
      screenInfo: screenData.screenInfo,
      schedules: screenData.schedules
    }));

    return res.status(200).json({
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
        seatData.fee = seatInfo.price;
        seatData.specialFee = seatInfo.specialPrice;
      } else {
        seatData.category = 'STANDARD';
        seatData.categoryName = 'Standard';
        seatData.isHidden = false;
        seatData.fee = 0;
        seatData.specialFee = 0;
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
    const { scheduleId, sessionId, seatNumbers, holdDurationMinutes, replaceExisting = false } = req.body;
   const userId = req.user && req.user?.id ? req.user?.id : null;

    if (!userId && !sessionId) {
      return res.status(400).json({
        error: 'Either userId or sessionId is required'
      });
    }
    
    console.log('Hold request:', {
      scheduleId,
      seatNumbers,
      sessionId,
      holdDurationMinutes,
      replaceExisting
    });
    // Enhanced validation
    if (!scheduleId || !seatNumbers || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
      return res.status(400).json({
        error: 'Schedule ID and seat numbers array are required'
      });
    }

    if (seatNumbers.length > 20) { // Prevent abuse
      return res.status(400).json({
        error: 'Maximum 20 seats can be held at once'
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

      console.log('Existing holds:', existingHolds);  

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
      });    }
    
    // Invalidate cache for this schedule since seat holds changed
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

// ======= EXISTING SUB FUNCTIONS =======

const validateRequestData = async ({ customer, noLoginCustomerInfo, branch, snackList = [] }) => {
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

// API handler: Tính số tiền giảm sau khi áp mã (cho frontend gọi để hiển thị trước khi thanh toán)
const calculateDiscountedTotal = async (req, res) => {
  try {
    console.log('Calculate Discounted Total Request:', req.body);
    console.log('User Info:', req.user);
    const { promotionCode, snackTotal, movieTotal, noLoginCustomerInfo } = req.body;
    let userId = req.user && req.user?.id ? req.user?.id : null;
    let user = null;
    if (userId) {
      const userBody = await User.findById(userId);
      if (userBody && userBody.roles.includes('cashier')) {
        user = null; // If cashier, do not use userId as customer
      } else {
        user = userBody; // Use userId as customer if not a cashier
      }
    }
    
    if (!user && noLoginCustomerInfo && noLoginCustomerInfo.phone) {
      const foundUser = await User.findOne({ phone: noLoginCustomerInfo.phone });
      if (foundUser) {
        user = foundUser
      } else {
        user = null
    }
  }
    console.log('User ID:', userId);
    console.log(user ? 'Customer found:' : 'No customer found, using noLoginCustomerInfo:', user);

    // console.log('User:', user);

    const promotion = await Promotion.findOne({
      promotionCode: promotionCode,
      isActive: true
    });
    // Check if promotion is valid
    if (!promotion) {
      console.log('Promotion not found or inactive:', promotionCode);
      return res.status(400).json({
        success: false,
        error: { status: 400, message: 'Invalid promotion code.' }
      });
    }
    // Check promotion time validity
    const now = new Date();
    if ((promotion.startDate && promotion.startDate > now) || (promotion.endDate && promotion.endDate < now)) {
      console.log('Promotion is not valid at this time:', promotionCode);
      return res.status(400).json({
        success: false,
        error: { status: 400, message: 'Promotion is not valid at this time.' }
      });
    }
    let snackDiscount = 0;
    let movieDiscount = 0;
    let snackError = null;
    let movieError = null;
    let processedItems = 0;
    let failedItems = 0;
    // ===== Process Snack Total =====
    if (snackTotal) {
      processedItems++;
      try {
        if (promotion.appliedProduct !== 'Snack' && promotion.appliedProduct !== 'All') {
          throw new Error('Promotion not applicable for snacks.');
        }
        if (snackTotal < promotion.minimumSpend) {
          throw new Error('Promotion minimum spend not met for snacks.');
        }
        if (promotion.remainingUse !== null && promotion.remainingUse <= 0) {
          throw new Error('Promotion has no remaining uses.');
        }
        if (user && promotion.appliedLoyaltyRank && promotion.appliedLoyaltyRank.trim() !== '') {
          // Check if user's rank can access this promotion (hierarchy: PLATINUM > GOLD > SILVER)
          const userRank = user.loyaltyRank.rank;
          const promoRank = promotion.appliedLoyaltyRank;
          
          const rankHierarchy = { 'SILVER': 1, 'GOLD': 2, 'PLATINUM': 3 };
          const userRankLevel = rankHierarchy[userRank] || 0;
          const promoRankLevel = rankHierarchy[promoRank] || 0;
          
          if (userRankLevel < promoRankLevel) {
            throw new Error('Promotion not applicable for your loyalty rank.');
          }
        }
        if (!user && promotion.appliedLoyaltyRank && promotion.appliedLoyaltyRank.trim() !== '') {
          throw new Error('Promotion not applicable for your loyalty rank.');
        }
        
        // Calculate discount with proper maximum handling
        const calculatedDiscount = snackTotal * promotion.discountRate / 100.0;
        snackDiscount = promotion.maximumDiscount !== null 
          ? Math.min(calculatedDiscount, promotion.maximumDiscount)
          : calculatedDiscount;
      } catch (error) {
        snackError = error.message;
        failedItems++;
      }
    }
    // ===== Process Movie Total =====
    if (movieTotal) {
      processedItems++;
      try {
        if (promotion.appliedProduct !== 'Movie' && promotion.appliedProduct !== 'All') {
          throw new Error('Promotion not applicable for movies.');
        }
        if (movieTotal < promotion.minimumSpend) {
          throw new Error('Promotion minimum spend not met for movies.');
        }
        if (promotion.remainingUse !== null && promotion.remainingUse <= 0) {
          throw new Error('Promotion has no remaining uses.');
        }
        if (user && promotion.appliedLoyaltyRank && promotion.appliedLoyaltyRank.trim() !== '') {
          // Check if user's rank can access this promotion (hierarchy: PLATINUM > GOLD > SILVER)
          const userRank = user.loyaltyRank.rank;
          const promoRank = promotion.appliedLoyaltyRank;
          
          const rankHierarchy = { 'SILVER': 1, 'GOLD': 2, 'PLATINUM': 3 };
          const userRankLevel = rankHierarchy[userRank] || 0;
          const promoRankLevel = rankHierarchy[promoRank] || 0;
          
          if (userRankLevel < promoRankLevel) {
            throw new Error('Promotion not applicable for your loyalty rank.');
          }
        }
        if (!user && promotion.appliedLoyaltyRank && promotion.appliedLoyaltyRank.trim() !== '') {
          throw new Error('Promotion not applicable for your loyalty rank.');
        }
        
        // Calculate discount with proper maximum handling
        const calculatedDiscount = movieTotal * promotion.discountRate / 100.0;
        movieDiscount = promotion.maximumDiscount !== null 
          ? Math.min(calculatedDiscount, promotion.maximumDiscount)
          : calculatedDiscount;
      } catch (error) {
        movieError = error.message;
        failedItems++;
      }
    }
    // ===== Determine result based on success/failure =====
    if (failedItems === processedItems) {
      const primaryError = snackError || movieError;
      console.log('All items failed:', { snackError, movieError });
      return res.status(400).json({
        success: false,
        error: {
          status: 400,
          message: primaryError,
          details: {
            ...(snackError && { snackError }),
            ...(movieError && { movieError })
          }
        }
      });
    }
    const hasSnackSuccess = snackTotal && !snackError;
    const hasMovieSuccess = movieTotal && !movieError;
    const warnings = {};
    if (snackError) warnings.snack = snackError;
    if (movieError) warnings.movie = movieError;
    return res.status(200).json({
      success: true,
      data: {
        snackDiscount: hasSnackSuccess ? snackDiscount : 0,
        movieDiscount: hasMovieSuccess ? movieDiscount : 0,
        promotion: promotionCode,
        ...(Object.keys(warnings).length > 0 && { warnings })
      }
    });
  } catch (error) {
    console.error('Calculate Discounted Total Error:', error);
    return res.status(500).json({
      success: false,
      error: { status: 500, message: 'Database error while calculating discount.' }
    });
  }
};

// Áp dụng khuyến mãi và điểm thành viên
const applyDiscounts = async ({ user, promotionCode, snackTotal, movieTotal, session = null }) => {
  // Accept snackTotal and movieTotal for unified discount handling
  let appliedPromotion = null;
  let snackDiscount = 0;
  let movieDiscount = 0;
  let finalSnackTotal = snackTotal;
  let finalMovieTotal = movieTotal;

  if (promotionCode) {
    const promo = await Promotion.findOne({ promotionCode: promotionCode, isActive: true }).session(session);
    const now = new Date();
    if (!promo || (promo.startDate && promo.startDate > now) || (promo.endDate && promo.endDate < now)) {
      throw { status: 400, message: 'Invalid or inapplicable promotion.' };
    }
    if (promo.remainingUse !== null && promo.remainingUse <= 0) {
      throw { status: 400, message: 'Promotion has no remaining uses.' };
    }
    if (promo.appliedLoyaltyRank && promo.appliedLoyaltyRank.trim() !== '' && !user) {
      throw { status: 400, message: 'Promotion requires a customer.' };
    }
    if (promo.appliedLoyaltyRank && promo.appliedLoyaltyRank.trim() !== '' && user) {
      // Check if user's rank can access this promotion (hierarchy: PLATINUM > GOLD > SILVER)
      const userRank = user.loyaltyRank.rank;
      const promoRank = promo.appliedLoyaltyRank;
      
      const rankHierarchy = { 'SILVER': 1, 'GOLD': 2, 'PLATINUM': 3 };
      const userRankLevel = rankHierarchy[userRank] || 0;
      const promoRankLevel = rankHierarchy[promoRank] || 0;
      
      if (userRankLevel < promoRankLevel) {
        throw { status: 400, message: 'Promotion not applicable for your loyalty rank.' };
      }
    }
    // Snack discount
    if (snackTotal && (promo.appliedProduct === 'Snack' || promo.appliedProduct === 'All') && snackTotal >= promo.minimumSpend) {
      const calculatedSnackDiscount = snackTotal * promo.discountRate / 100.0;
      snackDiscount = promo.maximumDiscount !== null 
        ? Math.min(calculatedSnackDiscount, promo.maximumDiscount)
        : calculatedSnackDiscount;
      finalSnackTotal -= snackDiscount;
    }
    // Movie discount
    if (movieTotal && (promo.appliedProduct === 'Movie' || promo.appliedProduct === 'All') && movieTotal >= promo.minimumSpend) {
      const calculatedMovieDiscount = movieTotal * promo.discountRate / 100.0;
      movieDiscount = promo.maximumDiscount !== null 
        ? Math.min(calculatedMovieDiscount, promo.maximumDiscount)
        : calculatedMovieDiscount;
      finalMovieTotal -= movieDiscount;
    }
    if (promo.remainingUse !== null) {
      promo.remainingUse -= 1;
      await promo.save({ session });
    }
    appliedPromotion = promo._id;
  }
  // Loyalty discount
  finalSnackTotal = Math.max(0, finalSnackTotal);
  finalMovieTotal = Math.max(0, finalMovieTotal);
  return {
    snackTotal: finalSnackTotal,
    movieTotal: finalMovieTotal,
    appliedPromotion,
    snackDiscount,
    movieDiscount
  };
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
      noLoginCustomerInfo, 
      branch, 
      seller, 
      promotionCode,
      movieTicket,
      snackTicket 
    } = req.body;

    console.log('Create Ticket Request:', req.body);

    let userId = req.user && req.user?.id ? req.user?.id : null;
    console.log('User ID:', userId);
    let customer = null;
    if (userId) {
      const user = await User.findById(userId);
      if (user && user.roles.includes('cashier')) {
        customer = null; // If cashier, do not use userId as customer
        seller = user._id
      } else {
        customer = user; // Use userId as customer if not a cashier
      }
    }

    if (!customer && noLoginCustomerInfo && noLoginCustomerInfo.phone) {
      const foundUser = await User.findOne({ phone: noLoginCustomerInfo.phone });
      if (foundUser) {
        customer = foundUser._id;
      } else {
        customer = null; // No existing user found, use noLoginCustomerInfo
      }
    }
    console.log(req.body)

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
      });

      let createdMovieTicket = null;
      let createdSnackTicket = null;
      let totalAmount = 0;

      // ===== Process Movie Ticket =====
      if (movieTicket) {
        const { schedule, seats, total: movieTicketTotal, discountedTickets,  adultTickets } = movieTicket;
        // Validate movie ticket data
        if (!schedule || !seats || !Array.isArray(seats) || seats.length === 0) {
          throw { status: 400, message: 'Movie ticket requires schedule and seats array' };
        }
        // Validate schedule exists and get movie info
        const scheduleData = await Schedule.findById(schedule)
          .populate('movie')
          .populate('screen')
          .session(session);
        if (!scheduleData) {
          throw { status: 404, message: 'Schedule not found' };
        }
        if (scheduleData.movie.isHidden) {
          throw { status: 400, message: 'Movie is not available' };
        }
        // Check seat availability
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
        }
        // Use total from API (required)
        if (typeof movieTicketTotal !== 'number') {
          throw { status: 400, message: 'Movie ticket total is required and must be a number' };
        }
        createdMovieTicket = new Ticket({
          ...(customer ? { customer } : { noLoginCustomerInfo }),
          seller: seller || null,
          branch,
          schedule,
          seats,
          total: movieTicketTotal,
          status: 'Confirmed',
          discountedTickets,
          adultTickets
        });
        await createdMovieTicket.save({ session });
        totalAmount += movieTicketTotal;        // add ticket to user's watch history if logged in
        if (user) {
          user.watchHistory = user.watchHistory || [];
          user.watchHistory.push(createdMovieTicket._id);
          await user.save({ session });
          
          // Clear related user cache
          const userCacheKey = `user:${user._id}`;
          const watchHistoryCacheKey = `watchHistory:${user._id}`;
          const userTicketsCacheKey = `userTickets:${user._id}`;
          
          await Promise.all([
            redisClient.del(userCacheKey),
            redisClient.del(watchHistoryCacheKey),
            // Clear all user tickets cache with different query parameters
            redisClient.keys(`userTickets:${user._id}:*`).then(keys => {
              if (keys.length > 0) {
                return redisClient.del(keys);
              }
            })
          ]);
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
        const { snackList, total: snackTicketTotal } = snackTicket;
        if (!snackList || !Array.isArray(snackList) || snackList.length === 0) {
          throw { status: 400, message: 'Snack ticket requires snackList array' };
        }
        // Calculate and validate snack list (but do not use backend total)
        const { validatedSnackList } = await calculateTotalAndUpdateStock(
          snackList,
          branchData._id,
          session
        );
        // Use total from API (required)
        if (typeof snackTicketTotal !== 'number') {
          throw { status: 400, message: 'Snack ticket total is required and must be a number' };
        }
        createdSnackTicket = new SnackTicket({
          branch,
          snackList: validatedSnackList,
          total: snackTicketTotal,
          seller: seller || null,
          ...(customer ? { customer } : { noLoginCustomerInfo })
        });
        await createdSnackTicket.save({ session });
        totalAmount += snackTicketTotal;
      }

      // ===== Apply promotions and discounts (using both snack and movie totals) =====
      let snackTicketTotal = createdSnackTicket ? createdSnackTicket.total : 0;
      let movieTicketTotal = createdMovieTicket ? createdMovieTicket.total : 0;
      let appliedPromotion = null;
      let finalSnackTotal = snackTicketTotal;
      let finalMovieTotal = movieTicketTotal;

      if (user || promotionCode) {
        const discountResult = await applyDiscounts({
          user,
          promotionCode,
          snackTotal: snackTicketTotal,
          movieTotal: movieTicketTotal,
          session
        });
        appliedPromotion = discountResult.appliedPromotion;
        finalSnackTotal = discountResult.snackTotal;
        finalMovieTotal = discountResult.movieTotal;
        if (createdSnackTicket) {
          createdSnackTicket.promotion = appliedPromotion;
          createdSnackTicket.total = finalSnackTotal;
          await createdSnackTicket.save({ session });
        }
        if (createdMovieTicket) {
          createdMovieTicket.promotion = appliedPromotion;
          createdMovieTicket.total = finalMovieTotal;
          await createdMovieTicket.save({ session });
        }
      }

      let finalTotal = finalSnackTotal + finalMovieTotal;

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

    // ===== Send email confirmation =====
    try {
      const emailService = new EmailService();
      
      // Determine customer email and name
      let customerEmail = null;
      let customerName = 'Customer';
      
      if (customer) {
        // Logged in customer - always use email from User model
        const customerData = await User.findById(customer).select('email name');
        if (customerData) {
          if(noLoginCustomerInfo.email) {
            customerEmail = noLoginCustomerInfo.email; // Use email from noLoginCustomerInfo if provided
          } else {
            customerEmail = customerData.email; // Use user's email from database
          }
          customerName = customerData.name || 'Customer';
        }
      } else if (noLoginCustomerInfo) {
        // Guest customer - use email from noLoginCustomerInfo (only when not logged in)
        customerEmail = noLoginCustomerInfo.email || null;
        customerName = noLoginCustomerInfo.name || 'Guest';
      }

      if (customerEmail) {
        // Get branch information for email
        const branchInfo = await Branch.findById(branch).select('name address');
        const cinemaName = branchInfo?.name || 'Lumiere Cinema';
        const cinemaAddress = branchInfo?.address || 'Cinema Location';

        // Send movie ticket email
        if (transactionResult.movieTicket) {
          try {
            // Get movie and schedule details
            const scheduleData = await Schedule.findById(transactionResult.movieTicket.schedule)
              .populate('movie', 'title')
              .populate('screen', 'screenName')
              .lean();
            
            if (scheduleData) {
              const movieEmailParams = {
                email: customerEmail,
                fullname: customerName,
                movie: scheduleData.movie.title,
                datetime: emailService.formatDateTime(scheduleData.startTime),
                seat: emailService.formatSeatList(transactionResult.movieTicket.seats),
                screen: scheduleData.screen.screenName,
                cinema: cinemaName,
                cinemaAddress: cinemaAddress,
                ticketCode: transactionResult.movieTicket.ticketCode
              };

              await emailService.sendMovieTicketEmail(movieEmailParams);
              console.log('Movie ticket email sent successfully');
            }
          } catch (emailError) {
            console.error('Error sending movie ticket email:', emailError);
            // Don't fail the request if email fails
          }
        }

        // Send snack ticket email
        if (transactionResult.snackTicket) {
          try {
            // Get detailed snack information
            const snackTicketData = await SnackTicket.findById(transactionResult.snackTicket._id)
              .populate('snackList.snack', 'name')
              .lean();
            
            if (snackTicketData) {
              const snackEmailParams = {
                email: customerEmail,
                fullname: customerName,
                snackList: emailService.formatSnackList(snackTicketData.snackList),
                cinema: cinemaName,
                cinemaAddress: cinemaAddress,
                ticketCode: transactionResult.snackTicket.snackTicketCode
              };

              await emailService.sendSnackTicketEmail(snackEmailParams);
              console.log('Snack ticket email sent successfully');
            }
          } catch (emailError) {
            console.error('Error sending snack ticket email:', emailError);
            // Don't fail the request if email fails
          }
        }
      } else {
        console.log('No customer email available, skipping email notification');
      }
    } catch (emailError) {
      console.error('Error in email service:', emailError);
      // Don't fail the request if email service fails
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


const getTicketByCode = async (req, res) => {
    try {
        const { ticketCode } = req.params;
        
        // Kiểm tra cache trước sử dụng TicketCacheManager
        const cachedTicket = await TicketCacheManager.getCachedTicket(ticketCode);
        if (cachedTicket) {
            return res.status(200).json(cachedTicket);
        }
        
        let ticket;
        let Model;
        let ticketType = '';

        // Tối ưu database query bằng cách sử dụng Promise.all
        const [movieTicket, snackTicket] = await Promise.all([
            Ticket.findOne({ ticketCode: ticketCode }).lean(),
            SnackTicket.findOne({ snackTicketCode: ticketCode }).lean()
        ]);
        
        if (movieTicket) {
            Model = Ticket;
            ticketType = 'Movie';
            ticket = movieTicket;
        } else if (snackTicket) {
            Model = SnackTicket;
            ticketType = 'Snack';
            ticket = snackTicket;
        }

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found.' });
        }

        const previousScanTimestamp = ticket.lastScanAt || null;
        const isFirstScan = ticket.status === 'Confirmed';
        const currentScanTimestamp = new Date();        if (isFirstScan) {
            await Model.findByIdAndUpdate(ticket._id, {
                status: 'CheckedIn',
                lastScanAt: currentScanTimestamp
            });
        } else {
            await Model.findByIdAndUpdate(ticket._id, {
                lastScanAt: currentScanTimestamp
            });
        }

        // Invalidate cache since ticket was updated
        await TicketCacheManager.invalidateTicket(ticketCode);

        let query = Model.findById(ticket._id).populate('branch', 'name address');

        if (ticketType === 'Movie') {
            query = query.populate({
                path: 'schedule',
                populate: [{ path: 'movie', select: 'title' }, { path: 'screen', select: 'screenName' }]
            });
        } else if (ticketType === 'Snack') {
            query = query.populate({
                path: 'snackList.snack',
                select: 'name price'
            });
        }

        const populatedTicket = await query.lean();        const finalResponse = {
            ...populatedTicket,
            status: isFirstScan ? 'Confirmed' : populatedTicket.status,
            ticketType: ticketType,
            lastScanAt: previousScanTimestamp
        };

        // Cache kết quả sử dụng TicketCacheManager
        await TicketCacheManager.cacheTicket(ticketCode, finalResponse);

        return res.status(200).json(finalResponse);

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
    console.log(req.body)
    const { action, extendMinutes, sessionId, scheduleId, seatNumbers } = req.body;
    const userId = req.user.id

    if (!userId && !sessionId) {
      return res.status(400).json({
        error: 'Either userId or sessionId is required'
      });
    }

    if (!['release', 'extend'].includes(action)) {
      return res.status(400).json({
        error: 'Action must be either "release" or "extend"'
      });
    }

    // Build query for holds
    const query = {
      ...(scheduleId && { schedule: scheduleId }),
      $or: [
        ...(userId ? [{ user: userId }] : []),
        ...(sessionId ? [{ sessionId: sessionId }] : [])
      ]
    };
    if (seatNumbers && Array.isArray(seatNumbers)) {
      query.seatNumber = { $in: seatNumbers };
    }

    const holds = await SeatHold.find(query);

    if (!holds.length) {
      return res.status(404).json({
        error: 'No seat holds found for the given user/session'
      });
    }    if (action === 'release') {
      const ids = holds.map(h => h._id);
      await SeatHold.deleteMany({ _id: { $in: ids } });
      
      // Invalidate seat map cache since holds were released
      if (scheduleId) {
        await CacheManager.invalidateScheduleCache(scheduleId);
      }
      
      return res.status(200).json({
        success: true,
        message: 'Seat holds released successfully',
        releasedCount: ids.length,
        seatNumbers: holds.map(h => h.seatNumber)
      });
    }

    if (action === 'extend') {
      const additionalMinutes = Math.min(extendMinutes || 5, 15); // Max 15 minutes extension
      const now = new Date();
      let extended = 0;
      for (const hold of holds) {
        // Only extend if not expired
        if (hold.expiresAt > now) {
          await hold.extendHold(additionalMinutes);
          extended++;
        }
      }
      return res.status(200).json({
        success: true,
        message: 'Seat holds extended successfully',
        extendedCount: extended,
        extendedBy: additionalMinutes
      });
    }

  } catch (error) {
    console.error('Error managing seat holds:', error);
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
    }    const result = await SeatHold.deleteMany(query);

    // Invalidate seat map cache since holds were released
    await CacheManager.invalidateScheduleCache(scheduleId);

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
    });  }
};

// ======= TICKET CACHE MANAGEMENT =======

/**
 * @desc    Preload recent tickets to cache for faster checkin
 * @route   POST /api/tickets/cache/preload
 * @access  Admin only
 */
const preloadTicketCache = async (req, res) => {
  try {
    const result = await TicketCacheManager.preloadRecentTickets();
    
    if (result.error) {
      return res.status(500).json({ 
        success: false, 
        error: result.error 
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Ticket cache preloaded successfully',
      data: result
    });
  } catch (error) {
    console.error('Error preloading ticket cache:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to preload ticket cache'
    });
  }
};

/**
 * @desc    Get ticket cache statistics
 * @route   GET /api/tickets/cache/stats
 * @access  Admin only
 */
const getTicketCacheStats = async (req, res) => {
  try {
    const stats = await TicketCacheManager.getCacheStats();
    
    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get cache statistics'
    });
  }
};

/**
 * @desc    Clear ticket cache
 * @route   DELETE /api/tickets/cache/clear
 * @access  Admin only
 */
const clearTicketCache = async (req, res) => {
  try {
    const result = await TicketCacheManager.clearTicketCache();
    
    return res.status(200).json({
      success: true,
      message: 'Ticket cache cleared successfully',
      data: result
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to clear cache'
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
  manageSeatHold,
  releaseBulkHolds,
  cleanupExpiredHolds,
  getCacheStats,
  cleanupCache,
  preloadCache,
  calculateDiscountedTotal,
  // New ticket cache management functions
  preloadTicketCache,
  getTicketCacheStats,
  clearTicketCache,
};
