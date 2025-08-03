const SnackTicket = require('../models/SnackTicket');
const User = require('../models/User'); 
const Ticket = require('../models/Ticket'); 
const MovieRating = require('../models/MovieRating');
const Movie = require('../models/Movie');
const mongoose = require('mongoose');
const { redisClient } = require('../config/redis.config');

const getProfile = async (req, res) => {
  try {
    // const cachedUser = await redisClient.get(`user:${req.user.id}`);
    // if (cachedUser) {
    //   return res.status(200).json(JSON.parse(cachedUser));
    // }

      const userId = req.user.id;
      const user = await User.findById(userId).select('-hashedPassword -branch -roles -wishlist -watchHistory -lastAccess -lastOrder -isLocked -passwordResetToken -passwordResetExpires'); // Exclude password
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
    //await redisClient.set(`user:${req.user.id}`, JSON.stringify(user), { EX: 3600 }); // Cache user profile for 1 hour
    res.status(200).json(user);
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    // Validate allowed fields first
    const allowedFields = ['name', 'phone', 'birthday', 'gender'];
    
    for (const field in updateData) {
      if (!allowedFields.includes(field)) {
        return res.status(400).json({ message: `Field ${field} cannot be updated.` });
      }
    }

    // Check phone uniqueness if phone is being updated
    if (updateData.phone) {
      const phoneExists = await User.findOne({ 
        phone: updateData.phone,
        _id: { $ne: userId } // Exclude current user from the check
      });
      if (phoneExists) {
        return res.status(400).json({ message: 'Phone number already in use.' });
      }
    }

    // Find and update user
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { 
        new: true,
        runValidators: true,
        select: '-hashedPassword -branch -roles -wishlist -watchHistory -lastAccess -lastOrder -isLocked -passwordResetToken -passwordResetExpires'
      }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Clear cache after successful update
    await redisClient.del(`userList`);
    await redisClient.del(`user:${userId}`);

    res.status(200).json({
      message: 'Profile updated successfully.',
      updatedUser: user
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

const rateMovie = async (req, res) => {
  try {
    const { movieId, rating } = req.body;
    const userId = req.user.id;
    
    if (!movieId || !rating) {
      return res.status(400).json({ message: 'Movie ID and rating are required.' });
    }

    const movie = await Movie.findOne({ _id: movieId });
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found.' });
    }

    const updatedRating = await MovieRating.findOneAndUpdate(
      { movie: movieId, user: userId },
      { star: rating },
      { new: true, upsert: true }
    );    // Clear cached movie data - ratings affect movie averages
    await Promise.all([
      redisClient.del(`movie:${movieId}`),
      redisClient.del('movies:now-showing'),
      redisClient.del('movies:upcoming')
    ]);

    res.status(200).json({ message: 'Rating updated successfully.', rating: updatedRating });
  } catch (error) {
    console.error('Error rating movie:', error);
    res.status(500).json({ message: 'Server error', error });
  }
}

const getRatingMovie = async (req, res) => {
  try {
    const { movieId } = req.params;
    const userId = req.user.id;
    
    if (!movieId) {
      return res.status(400).json({ message: 'Movie ID is required.' });
    }

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found.' });
    }

    const userRating = await MovieRating.findOne({ movie: movieId, user: userId });
    if (!userRating) {
      return res.status(404).json({ rated: false, rating: null });
    }

    res.status(200).json({ rated:true, rating: userRating.star });
  } catch (error) {
    console.error('Error getting movie rating:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

const addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { movieId } = req.params;
    const cacheKey = `wishlist:${userId}`;

    if (!movieId) {
      return res.status(400).json({ message: 'Movie ID is required.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.wishlist.includes(movieId)) {
      return res.status(400).json({ message: 'Movie already in wishlist.' });
    }

    user.wishlist.push(movieId);
    await user.save();

    await redisClient.del(cacheKey); // Xóa cache khi có thay đổi

    res.status(200).json({ message: 'Movie added to wishlist successfully.', wishlist: user.wishlist });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ message: 'Server error', error });
  }
}

const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { movieId } = req.params;
    const cacheKey = `wishlist:${userId}`;

    if (!movieId) {
      return res.status(400).json({ message: 'Movie ID is required.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (!user.wishlist.includes(movieId)) {
      return res.status(400).json({ message: 'Movie not found in wishlist.' });
    }

    user.wishlist = user.wishlist.filter(id => id.toString() !== movieId);
    await user.save();

    await redisClient.del(cacheKey); // Xóa cache khi có thay đổi

    res.status(200).json({ message: 'Movie removed from wishlist successfully.', wishlist: user.wishlist });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const cacheKey = `wishlist:${userId}`;
    const cachedWishlist = await redisClient.get(cacheKey);

    if (cachedWishlist) {
      return res.status(200).json({ wishlist: JSON.parse(cachedWishlist) });
    }

    const user = await User.findById(userId).populate('wishlist');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    await redisClient.set(cacheKey, JSON.stringify(user.wishlist), { EX: 3600 }); // Cache for 1 hour
    res.status(200).json({ wishlist: user.wishlist });
  } catch (error) {
    console.error('Error getting wishlist:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

const getWatchHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const cacheKey = `watchHistory:${userId}`;
    const cachedHistory = await redisClient.get(cacheKey);

    if (cachedHistory) {
      return res.status(200).json({ watchHistory: JSON.parse(cachedHistory) });
    }

    const user = await User.findById(userId).populate({
      path: 'watchHistory',
      populate: [
        {
          path: 'schedule',
          populate: [
            { path: 'movie', select: 'title duration genre poster' },
            { path: 'screen', select: 'screenName capacity screenType' }
          ]
        },
        {
          path: 'branch',
          select: 'name address phone location'
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Filter out null tickets (in case some tickets were deleted)
    const validWatchHistory = user.watchHistory.filter(ticket => ticket !== null);

    await redisClient.set(cacheKey, JSON.stringify(validWatchHistory), { EX: 3600 }); // Cache for 1 hour
    res.status(200).json({ watchHistory: validWatchHistory });
  } catch (error) {
    console.error('Error getting watch history:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// Remove a ticket from watch history (admin only)
const removeFromWatchHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { ticketId } = req.params;
    const cacheKey = `watchHistory:${userId}`;

    if (!ticketId) {
      return res.status(400).json({ message: 'Ticket ID is required.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (!user.watchHistory.includes(ticketId)) {
      return res.status(400).json({ message: 'Ticket not found in watch history.' });
    }

    user.watchHistory = user.watchHistory.filter(id => id.toString() !== ticketId);
    await user.save();

    await redisClient.del(cacheKey); // Xóa cache khi có thay đổi

    res.status(200).json({ message: 'Ticket removed from watch history successfully.', watchHistory: user.watchHistory });
  } catch (error) {
    console.error('Error removing from watch history:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

/**
 * @desc    Get all movie tickets for the user
 * @route   GET /api/users/tickets
 * @access  Customer
 */
const getUserTickets = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      status, 
      page = 1, 
      limit = 10 
    } = req.query;

    // Build cache key
    const cacheKey = `userTickets:${userId}:${JSON.stringify(req.query)}`;
    
    // Check cache first
    try {
      const cachedTickets = await redisClient.get(cacheKey);
      if (cachedTickets) {
        return res.status(200).json({
          ...JSON.parse(cachedTickets),
          fromCache: true
        });
      }
    } catch (cacheError) {
      console.warn('Cache error:', cacheError);
    }    // Build query conditions
    const matchConditions = { customer: userId };

    // Always limit to last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    matchConditions.createdAt = { $gte: thirtyDaysAgo };

    // Add status filter if provided
    if (status) {
      const validStatuses = ['Confirmed', 'CheckedIn', 'Cancelled'];
      if (validStatuses.includes(status)) {
        matchConditions.status = status;
      } else {
        return res.status(400).json({ 
          message: `Invalid status. Valid statuses: ${validStatuses.join(', ')}` 
        });
      }
    }

    // Add additional date range filter if provided (within the 30-day limit)
    if (fromDate || toDate) {
      if (fromDate) {
        const fromDateTime = new Date(fromDate);
        if (isNaN(fromDateTime.getTime())) {
          return res.status(400).json({ message: 'Invalid fromDate format.' });
        }
        // Use the later of thirtyDaysAgo or fromDate
        if (fromDateTime > thirtyDaysAgo) {
          matchConditions.createdAt.$gte = fromDateTime;
        }
      }
      if (toDate) {
        const toDateTime = new Date(toDate);
        if (isNaN(toDateTime.getTime())) {
          return res.status(400).json({ message: 'Invalid toDate format.' });
        }
        matchConditions.createdAt.$lte = toDateTime;
      }
    }

    // Add additional date range filter if provided (within the 30-day limit)
    if (fromDate || toDate) {
      if (fromDate) {
        const fromDateTime = new Date(fromDate);
        if (isNaN(fromDateTime.getTime())) {
          return res.status(400).json({ message: 'Invalid fromDate format.' });
        }
        // Use the later of thirtyDaysAgo or fromDate
        if (fromDateTime > thirtyDaysAgo) {
          matchConditions.createdAt.$gte = fromDateTime;
        }
      }
      if (toDate) {
        const toDateTime = new Date(toDate);
        if (isNaN(toDateTime.getTime())) {
          return res.status(400).json({ message: 'Invalid toDate format.' });
        }
        matchConditions.createdAt.$lte = toDateTime;
      }
    }

    // Pagination setup
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build aggregation pipeline
    const pipeline = [
      { $match: matchConditions },
      // Lookup schedule details
      {
        $lookup: {
          from: 'schedules',
          localField: 'schedule',
          foreignField: '_id',
          as: 'scheduleData'
        }
      },
      { $unwind: '$scheduleData' },
      // Lookup movie details
      {
        $lookup: {
          from: 'movies',
          localField: 'scheduleData.movie',
          foreignField: '_id',
          as: 'movieData'
        }
      },
      { $unwind: '$movieData' },
      // Lookup screen details
      {
        $lookup: {
          from: 'screens',
          localField: 'scheduleData.screen',
          foreignField: '_id',
          as: 'screenData'
        }
      },
      { $unwind: '$screenData' },
      // Lookup branch details
      {
        $lookup: {
          from: 'branches',
          localField: 'branch',
          foreignField: '_id',
          as: 'branchData'
        }
      },
      { $unwind: '$branchData' },
      // Project final structure
      {
        $project: {
          _id: 1,
          ticketCode: 1,
          seats: 1,
          total: 1,
          status: 1,
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
          schedule: {
            _id: '$scheduleData._id',
            startTime: '$scheduleData.startTime',
            endTime: '$scheduleData.endTime'
          },
          screen: {
            _id: '$screenData._id',
            screenName: '$screenData.screenName',
            screenType: '$screenData.screenType'
          },
          branch: {
            _id: '$branchData._id',
            name: '$branchData.name',
            address: '$branchData.address',
            city: '$branchData.city'
          },
          seatCount: { $size: '$seats' }
        }
      },
      // Sort by creation date (newest first)
      { $sort: { createdAt: -1 } }
    ];

    // Execute aggregation with pagination
    const [tickets, totalCount] = await Promise.all([
      Ticket.aggregate([...pipeline, { $skip: skip }, { $limit: limitNum }]),
      Ticket.aggregate([...pipeline, { $count: 'total' }])
    ]);

    const total = totalCount.length > 0 ? totalCount[0].total : 0;

    // Prepare response
    const response = {
      tickets,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalTickets: total,
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1,
        limit: limitNum
      },      filters: {
        status: status || null
      }
    };

    // Cache the result for 5 minutes
    try {
      await redisClient.setEx(cacheKey, 300, JSON.stringify(response));
    } catch (cacheError) {
      console.warn('Failed to cache user tickets:', cacheError);
    }

    res.status(200).json(response);

  } catch (error) {
    console.error('Error getting user tickets:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  rateMovie,
  getRatingMovie,
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  getWatchHistory,
  removeFromWatchHistory,
  getUserTickets
};