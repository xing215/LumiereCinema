const SnackTicket = require('../models/SnackTicket');
const User = require('../models/User'); 
const Ticket = require('../models/Ticket'); 
const MovieRating = require('../models/MovieRating');
const Movie = require('../models/Movie');
const { redisClient } = require('../config/redis.config');

const getProfile = async (req, res) => {
  try {
    const cachedUser = await redisClient.get(`userProfile`)
    if (cachedUser) {
      return res.status(200).json(JSON.parse(cachedUser));
    }

      const userId = req.user.email;
      const user = await User.findById(userId).select('-password -branch -roles -wishlist -watchHistory -lastAccess -lastOrder -isLocked -passwordResetToken -passwordResetExpires'); // Exclude password
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
    await redisClient.set(`userProfile`, JSON.stringify(user), { EX: 3600 }); // Cache user profile for 1 hour
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
    const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password -branch -roles -wishlist -watchHistory -lastAccess -lastOrder -isLocked -passwordResetToken -passwordResetExpires'); // Exclude sensitive fields
    if (!user) {S
      return res.status(404).json({ message: 'User not found' });
    }
    await redisClient.del(`userList`);
    await redisClient.del(`userProfile`);

          const allowedFields = ['email', 'name', 'phone', 'birthday', 'gender'];

          if(updateData.email) {
            const emailExists = await User.findOne({ email: updateData.email });
            if (emailExists) {
              return res.status(400).json({ message: 'Email already in use.' });
            }
          }

          if(updateData.phone) {
            const phoneExists = await User.findOne({ phone: updateData.phone });
            if (phoneExists) {
              return res.status(400).json({ message: 'Phone number already in use.' });
            }
          }
    
          for (const field in updateData) {
            if (!allowedFields.includes(field)) {
              return res.status(400).json({ message: `Field ${field} cannot be updated.` });
            }
            user[field] = updateData[field];
          }

    await user.save();

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
// mới kiếm dc cách tối ưu hơn
const updatedRating = await MovieRating.findOneAndUpdate(
  { movieId: movieId, userId: userId },
  { star: rating },
  { new: true, upsert: true }
);

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

    const userRating = await MovieRating.findOne({ movieId, userId });
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

    const user = await User.findById(userId).populate('watchHistory');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    await redisClient.set(cacheKey, JSON.stringify(user.watchHistory), { EX: 3600 }); // Cache for 1 hour
    res.status(200).json({ watchHistory: user.watchHistory });
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

module.exports = {
  getProfile,
  updateProfile,
  rateMovie,
  getRatingMovie,
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  getWatchHistory,
  removeFromWatchHistory
};