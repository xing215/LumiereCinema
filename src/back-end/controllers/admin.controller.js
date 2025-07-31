const SnackTicket = require('../models/SnackTicket');
const User = require('../models/User'); 
const Ticket = require('../models/Ticket'); 
const MovieRating = require('../models/MovieRating');
const { redisClient } = require('../config/redis.config');
const Branch = require('../models/Branch');
const Promotion = require('../models/Promotion');
const bcrypt = require('bcryptjs');

// =============================== USER MANAGEMENT ===============================

/**
 * @desc    Create a new user (admin only)
 * @route   POST /api/admin/users
 * @access  Administrator
 */
const createUser = async (req, res) => {
  try {
    const { name, email, phone, password, birthday, gender, roles, branch } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ 
        message: 'Name, email, phone, and password are required fields.' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { phone }] 
    });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this email or phone already exists.' 
      });
    }

    // Validate roles if provided
    const validRoles = ['customer', 'cashier', 'checkincounter', 'branchmanager', 'administrator'];
    if (roles && Array.isArray(roles)) {
      for (const role of roles) {
        if (!validRoles.includes(role)) {
          return res.status(400).json({ 
            message: `Invalid role: ${role}. Valid roles: ${validRoles.join(', ')}` 
          });
        }
      }
    }

    // Validate branch if provided
    if (branch) {
      const branchExists = await Branch.findById(branch);
      if (!branchExists) {
        return res.status(400).json({ 
          message: 'Invalid branch ID.' 
        });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user data
    const userData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      hashedPassword,
      birthday: birthday ? new Date(birthday) : undefined,
      gender: gender ? gender.toLowerCase() : 'male',
      roles: roles && roles.length > 0 ? roles : ['customer'],
      branch: branch || undefined,
      activateStatus: true, // Admin-created users are automatically activated
      isLocked: false
    };

    // Create new user
    const newUser = new User(userData);
    await newUser.save();

    // Clear related caches
    await redisClient.del('userList');

    // Return user without sensitive data
    const userResponse = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      birthday: newUser.birthday,
      gender: newUser.gender,
      roles: newUser.roles,
      branch: newUser.branch,
      activateStatus: newUser.activateStatus,
      isLocked: newUser.isLocked,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt
    };

    res.status(201).json({
      message: 'User created successfully.',
      user: userResponse
    });

  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
}

const getAllProfiles = async (req, res) => {
  try {
    const userList = await redisClient.get('userList');
    if (userList) {
      return res.status(200).json(JSON.parse(userList));
    }
    const users = await User.find()
      .populate('branch', 'name location')
      .select('-password -wishlist -watchHistory -lastAccess -lastOrder -passwordResetToken -passwordResetExpires');
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
    const cachedUser = await redisClient.get(`user:${req.params.userId}`);
    if (cachedUser) {
      return res.status(200).json(JSON.parse(cachedUser));
    }

    const user = await User.findById(req.params.userId).select('-wishlist -watchHistory -lastAccess -lastOrder -passwordResetToken -passwordResetExpires');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    await redisClient.set(`user:${req.params.userId}`, JSON.stringify(user), { EX: 120 }); // Cache user profile for 2 minutes
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
    await redisClient.del(`user:${req.body.userId}`); // Clear cache for updated user profile

    if (req.body.updateData.email) {
      const existingUser = await User.findOne({ 
        email: req.body.updateData.email,
        _id: { $ne: req.body.userId } // Exclude current user
      });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use.' });
      }
    }
    if (req.body.updateData.phone) {
      const existingUser = await User.findOne({ 
        phone: req.body.updateData.phone,
        _id: { $ne: req.body.userId } // Exclude current user
      });
      if (existingUser) {
        return res.status(400).json({ message: 'Phone number already in use.' });
      }
    }
    if (req.body.updateData.branch) {
      const branchExists = await Branch.findById(req.body.updateData.branch);
      if (!branchExists) {
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
    await redisClient.del(`user:${req.body.userId}`); // Clear cache for updated user profile
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
    await redisClient.del('userList');
    await redisClient.del(`user:${req.body.userId}`); // Clear cache for updated user profile
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
    await redisClient.del(`user:${userId}`);

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

// Lấy tất cả promotion (có cache)
const getAllPromotions = async (req, res) => {
  try {
    const cached = await redisClient.get('promotionList');
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }
    const promotions = await Promotion.find();
    await redisClient.set('promotionList', JSON.stringify(promotions), { EX: 3600 });
    res.status(200).json(promotions);
  } catch (error) {
    console.error('Error getting promotions:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// Lấy promotion theo code (có cache)
const getPromotionByCode = async (req, res) => {
  try {
    const code = req.params.promotionCode.toUpperCase();
    const cacheKey = `promotion:${code}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }
    const promotion = await Promotion.findOne({ promotionCode: code });
    if (!promotion) {
      return res.status(404).json({ message: 'Promotion not found.' });
    }
    await redisClient.set(cacheKey, JSON.stringify(promotion), { EX: 3600 });
    res.status(200).json(promotion);
  } catch (error) {
    console.error('Error getting promotion:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// Khi tạo, cập nhật, xóa promotion thì xóa cache liên quan
const createPromotion = async (req, res) => {
  try {
    const data = req.body;
    const exists = await Promotion.findOne({ promotionCode: data.promotionCode });
    if (exists) {
      return res.status(400).json({ message: 'Promotion code already exists.' });
    }
    const promotion = new Promotion(data);
    await promotion.save();
    await redisClient.del('promotionList');
    res.status(201).json({ message: 'Promotion created successfully.', promotion });
  } catch (error) {
    console.error('Error creating promotion:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

const updatePromotion = async (req, res) => {
  try {
    const { promotionCode } = req.params;
    const updateData = req.body;
    const promotion = await Promotion.findOneAndUpdate(
      { promotionCode: promotionCode.toUpperCase() },
      updateData,
      { new: true, runValidators: true }
    );
    if (!promotion) {
      return res.status(404).json({ message: 'Promotion not found.' });
    }
    await redisClient.del('promotionList');
    await redisClient.del(`promotion:${promotionCode.toUpperCase()}`);
    res.status(200).json({ message: 'Promotion updated successfully.', promotion });
  } catch (error) {
    console.error('Error updating promotion:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

const deletePromotion = async (req, res) => {
  try {
    const { promotionCode } = req.params;
    const promotion = await Promotion.findOneAndDelete({ promotionCode: promotionCode.toUpperCase() });
    if (!promotion) {
      return res.status(404).json({ message: 'Promotion not found.' });
    }
    await redisClient.del('promotionList');
    await redisClient.del(`promotion:${promotionCode.toUpperCase()}`);
    res.status(200).json({ message: 'Promotion deleted successfully.' });
  } catch (error) {
    console.error('Error deleting promotion:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// =============================== BRANCH MANAGEMENT ===============================

// Create new branch
const createBranch = async (req, res) => {
  try {
    const { name, address, city, imageURL, location } = req.body;

    // Validate required fields
    if (!name || !address || !city) {
      return res.status(400).json({ 
        message: 'Name, address, and city are required fields.' 
      });
    }

    // Check if branch name already exists
    const existingBranch = await Branch.findOne({ name: name.trim() });
    if (existingBranch) {
      return res.status(400).json({ 
        message: 'Branch name already exists.' 
      });
    }

    // Validate location if provided
    if (location) {
      if (!location.type || location.type !== 'Point') {
        return res.status(400).json({ 
          message: 'Location type must be "Point".' 
        });
      }
      if (!location.coordinates || !Array.isArray(location.coordinates) || location.coordinates.length !== 2) {
        return res.status(400).json({ 
          message: 'Location coordinates must be an array of [longitude, latitude].' 
        });
      }
    }

    // Create new branch
    const branchData = {
      name: name.trim(),
      address: address.trim(),
      city: city.trim(),
      imageURL: imageURL || '',
      location: location || undefined,
      isActive: true
    };

    const branch = new Branch(branchData);
    await branch.save();

    // Clear related caches
    await redisClient.del('branchList');
    
    res.status(201).json({ 
      message: 'Branch created successfully.', 
      branch 
    });
  } catch (error) {
    console.error('Error creating branch:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

// Update existing branch
const updateBranch = async (req, res) => {
  try {
    const { branchId } = req.params;
    const updateData = req.body;

    // Validate branchId
    if (!branchId || !require('mongoose').Types.ObjectId.isValid(branchId)) {
      return res.status(400).json({ message: 'Invalid branch ID.' });
    }

    // Find branch
    const branch = await Branch.findById(branchId);
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found.' });
    }

    // Define allowed update fields
    const allowedFields = ['name', 'address', 'city', 'imageURL', 'location'];
    
    // Check if trying to update restricted fields
    for (const field in updateData) {
      if (!allowedFields.includes(field)) {
        return res.status(400).json({ 
          message: `Field '${field}' cannot be updated. Use updateBranchStatus for status changes.` 
        });
      }
    }

    // Validate name uniqueness if updating name
    if (updateData.name && updateData.name.trim() !== branch.name) {
      const existingBranch = await Branch.findOne({ 
        name: updateData.name.trim(),
        _id: { $ne: branchId }
      });
      if (existingBranch) {
        return res.status(400).json({ 
          message: 'Branch name already exists.' 
        });
      }
    }

    // Validate location format if updating location
    if (updateData.location) {
      if (!updateData.location.type || updateData.location.type !== 'Point') {
        return res.status(400).json({ 
          message: 'Location type must be "Point".' 
        });
      }
      if (!updateData.location.coordinates || !Array.isArray(updateData.location.coordinates) || updateData.location.coordinates.length !== 2) {
        return res.status(400).json({ 
          message: 'Location coordinates must be an array of [longitude, latitude].' 
        });
      }
    }

    // Update branch
    const updatedBranch = await Branch.findByIdAndUpdate(
      branchId,
      updateData,
      { new: true, runValidators: true }
    );

    // Clear related caches
    await redisClient.del('branchList');
    await redisClient.del(`branch:${branchId}`);

    res.status(200).json({ 
      message: 'Branch updated successfully.', 
      branch: updatedBranch 
    });
  } catch (error) {
    console.error('Error updating branch:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

// Delete branch (only if no dependencies)
const deleteBranch = async (req, res) => {
  try {
    const { branchId } = req.params;

    // Validate branchId
    if (!branchId || !require('mongoose').Types.ObjectId.isValid(branchId)) {
      return res.status(400).json({ message: 'Invalid branch ID.' });
    }

    // Find branch
    const branch = await Branch.findById(branchId);
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found.' });
    }

    // Check for dependencies
    
    // Check for Users assigned to this branch
    const usersCount = await User.countDocuments({ branch: branchId });
    if (usersCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete branch. ${usersCount} user(s) are assigned to this branch.` 
      });
    }

    // Check for Screens in this branch
    const Screen = require('../models/Screen');
    const screensCount = await Screen.countDocuments({ branch: branchId });
    if (screensCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete branch. ${screensCount} screen(s) exist in this branch.` 
      });
    }

    // Check for Tickets sold at this branch
    const ticketsCount = await Ticket.countDocuments({ branch: branchId });
    if (ticketsCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete branch. ${ticketsCount} movie ticket(s) were sold at this branch.` 
      });
    }

    // Check for SnackTickets sold at this branch
    const snackTicketsCount = await SnackTicket.countDocuments({ branch: branchId });
    if (snackTicketsCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete branch. ${snackTicketsCount} snack ticket(s) were sold at this branch.` 
      });
    }

    // Check for Snacks available at this branch
    const Snack = require('../models/Snack');
    const snacksCount = await Snack.countDocuments({ branch: branchId });
    if (snacksCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete branch. ${snacksCount} snack(s) are available at this branch.` 
      });
    }

    // If no dependencies, delete the branch
    await Branch.findByIdAndDelete(branchId);

    // Clear related caches
    await redisClient.del('branchList');
    await redisClient.del(`branch:${branchId}`);

    res.status(200).json({ 
      message: 'Branch deleted successfully.' 
    });
  } catch (error) {
    console.error('Error deleting branch:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

// Update branch status (activate/deactivate)
const updateBranchStatus = async (req, res) => {
  try {
    const { branchId } = req.params;
    const { isActive } = req.body;

    // Validate branchId
    if (!branchId || !require('mongoose').Types.ObjectId.isValid(branchId)) {
      return res.status(400).json({ message: 'Invalid branch ID.' });
    }

    // Validate isActive field
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ 
        message: 'isActive must be a boolean value.' 
      });
    }

    // Find branch
    const branch = await Branch.findById(branchId);
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found.' });
    }

    // Update branch status
    branch.isActive = isActive;
    await branch.save();

    // Clear related caches
    await redisClient.del('branchList');
    await redisClient.del(`branch:${branchId}`);

    res.status(200).json({ 
      message: `Branch ${isActive ? 'activated' : 'deactivated'} successfully.`, 
      branch: {
        _id: branch._id,
        name: branch.name,
        isActive: branch.isActive
      }
    });
  } catch (error) {
    console.error('Error updating branch status:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

/**
 * @desc    Get all branches
 * @route   GET /api/admin/branches
 * @access  Administrator, BranchManager
 */
const getAllBranches = async (req, res) => {
  try {
    const branches = await Branch.find({ isActive: true }).select('_id name address city');
    
    res.status(200).json(branches);
  } catch (error) {
    console.error('Error fetching branches:', error);
    res.status(500).json({ 
      message: 'Failed to fetch branches',
      error: error.message 
    });
  }
};

module.exports = {
  createUser,
  getAllProfiles,
  getDetailedProfile,
  updateUserDetails,
  updateUserRoles,
  updateUserStatus,
  deleteUser,
  getAllPromotions,
  getPromotionByCode,
  createPromotion,
  updatePromotion,
  deletePromotion,
  createBranch,
  updateBranch,
  deleteBranch,
  updateBranchStatus,
  getAllBranches,
};
