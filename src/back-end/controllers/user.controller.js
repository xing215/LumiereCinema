const SnackTicket = require('../models/SnackTicket');
const User = require('../models/User'); 
const Ticket = require('../models/Ticket'); 
const Movie = require('../models/Movie');
const { redisClient } = require('../config/redis.config');
const { generateKey } = require('crypto');

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password -branch -roles -wishlist -watchHistory -lastAccess -lastOrder -isLocked -passwordResetToken -passwordResetExpires'); // Exclude password
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    redisClient.set(`user:${userId}`, JSON.stringify(user), { EX: 3600 });
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
    await redisClient.del(`user:${userId}`);

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

module.exports = {
  getProfile,
  updateProfile
};