const SnackTicket = require('../models/SnackTicket');
const User = require('../models/User'); 
const Ticket = require('../models/Ticket'); 
const MovieRating = require('../models/MovieRating');
const { redisClient } = require('../config/redis.config');
const Branch = require('../models/Branch');

const getAllProfiles = async (req, res) => {
  try {
    const userList = await redisClient.get('userList');
    if (userList) {
      return res.status(200).json(JSON.parse(userList));
    }
    const users = await User.find().select('-password -wishlist -watchHistory -branch -roles -lastAccess -lastOrder -passwordResetToken -passwordResetExpires');
    if (!users || users.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }
    await redisClient.set('userList', JSON.stringify(users), { EX: 3600 });
    res.status(200).json(users);
  } catch (error) {
    console.error('Error getting all profiles:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

const getDetailedProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-wishlist -watchHistory -lastAccess -lastOrder -passwordResetToken -passwordResetExpires');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error getting detailed profile:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

const updateUserDetails = async (req, res) => {
  try {
    const allowedFields = ['email', 'name', 'phone', 'birthday', 'gender', 'branch', 'password'];
    const user = await User.findById(req.body.userId).select('-roles -wishlist -watchHistory -lastAccess -isLocked -lastOrder -passwordResetToken -passwordResetExpires');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    await redisClient.del('userList');
    await redisClient.del('userProfile');

    if (req.body.updateData.email) {
      if (await User.findOne({ email: req.body.updateData.email })) {
        return res.status(400).json({ message: 'Email already in use.' });
      }
    }
    if (req.body.updateData.phone) {
      if (await User.findOne({ phone: req.body.updateData.phone })) {
        return res.status(400).json({ message: 'Phone number already in use.' });
      }
    }
    if (req.body.updateData.branch) {
      if (!await Branch.findById(req.body.updateData.branch)) {
        return res.status(400).json({ message: 'Branch does not exist.' });
      }
    }
    for (const field in req.body.updateData) {
      if (!allowedFields.includes(field)) {
        return res.status(400).json({ message: `Field ${field} cannot be updated.` });
      }
      user[field] = req.body.updateData[field];
    }
    await user.save();
    res.status(200).json({ message: 'User details updated successfully.', user });
  } catch (error) {
    console.error('Error updating user details:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

const updateUserRoles = async (req, res) => {
  try {
    const allowedFields = ['roles'];
    const validRoles = ['cashier', 'checkincounter', 'branchmanager', 'administrator'];
    const user = await User.findById(req.body.userId).select('-name -email -phone -birthday -gender -branch -password -wishlist -watchHistory -isLocked -lastAccess -lastOrder -passwordResetToken -passwordResetExpires');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (req.body.updateData.roles && !Array.isArray(req.body.updateData.roles)) {
      return res.status(400).json({ message: 'Roles must be an array.' });
    }
    if (req.body.updateData.roles && req.body.updateData.roles.length > 0) {
      for (const role of req.body.updateData.roles) {
        if (!validRoles.includes(role)) {
          return res.status(400).json({ message: `Invalid role: ${role}` });
        }
      }
    }
    await redisClient.del('userList');
    await redisClient.del('userProfile');
    for (const field in req.body.updateData) {
      if (!allowedFields.includes(field)) {
        return res.status(400).json({ message: `Field ${field} cannot be updated.` });
      }
      user[field] = req.body.updateData[field];
    }
    await user.save();
    res.status(200).json({ message: 'User roles updated successfully.', user });
  } catch (error) {
    console.error('Error updating user details:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const allowedFields = ['isLocked'];
    const user = await User.findById(req.body.userId).select('-name -email -phone -birthday -gender -branch -password -wishlist -watchHistory -roles -lastAccess -lastOrder -passwordResetToken -passwordResetExpires');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (req.body.updateData.isLocked !== undefined && typeof req.body.updateData.isLocked !== 'boolean') {
      return res.status(400).json({ message: 'isLocked must be a boolean.' });
    }
    for (const field in req.body.updateData) {
      if (!allowedFields.includes(field)) {
        return res.status(400).json({ message: `Field ${field} cannot be updated.` });
      }
      user[field] = req.body.updateData[field];
    }
    await user.save();
    res.status(200).json({ message: 'User status updated successfully.', user });
  } catch (error) {
    console.error('Error updating user details:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    await redisClient.del('userList');
    await redisClient.del('userProfile');
  
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const hasTicket = await Ticket.findOne({ user: userId });
    if (hasTicket) {
      return res.status(400).json({ message: 'Cannot delete user with existing tickets.' });
    }

    const hasSnackTicket = await SnackTicket.findOne({ user: userId });
    if (hasSnackTicket) {
      return res.status(400).json({ message: 'Cannot delete user with existing snack tickets.' });
    }
    const hasRating = await MovieRating.findOne({ user: userId });
    if (hasRating) {
      return res.status(400).json({ message: 'Cannot delete user with existing movie ratings.' });
    }  

    await user.remove();
    res.status(200).json({ message: 'User deleted successfully.' });

  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

module.exports = {
  getAllProfiles,
  getDetailedProfile,
  updateUserDetails,
  updateUserRoles,
  updateUserStatus,
  deleteUser,
};
