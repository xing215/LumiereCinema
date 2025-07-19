const Branch = require('../models/Branch.js');
const Snack = require('../models/Snack.js');
const Movie = require('../models/Movie.js');
const Schedule = require('../models/Schedule.js');
const Screen = require('../models/Screen.js');
const mongoose = require('mongoose');
const { redisClient } = require('../config/redis.config.js');

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
    });

    await newSnack.save();

    // 4. Xoá cache danh sách snack của rạp này
    await redisClient.del(`snacks:branch:${branchId}`);

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

    const snack = await Snack.findOneAndUpdate(
      { _id: snackId, branch: branchId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!snack) {
      return res.status(404).json({ message: 'Snack not found for update.' });
    }

    // Xoá cache danh sách snack của rạp này
    await redisClient.del(`snacks:branch:${branchId}`);

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
    const { branchId, snackId } = req.params;

    // Thử xóa trước
    const snack = await Snack.findOneAndDelete({ _id: snackId, branch: branchId });
    if (snack) {
      // Nếu xóa được thì xóa cache và trả về kết quả
      await redisClient.del(`snacks:branch:${branchId}`);
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
    );

    if (hiddenSnack) {
      await redisClient.del(`snacks:branch:${branchId}`);
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

    // 1. Kiểm tra cache
    const cachedSnacks = await redisClient.get(cacheKey);
    if (cachedSnacks) {
      // Cache hit for snacks
      return res.status(200).json(JSON.parse(cachedSnacks));
    }

    // 2. Nếu cache miss → query DB
    // Cache miss - fetch from database
    const branch = await Branch.findById(branchId);
    if (!branch) {
      // Branch not found
      return res.status(404).json({ message: 'Branch not found.' });
    }

    const snacks = await Snack.find({ branch: branchId })
      .select('name price discountedPrice imageURL stock isHidden description createdAt updatedAt');

    if (!snacks || snacks.length === 0) {
      return res.status(404).json({ message: 'No snacks found for this branch.' });
    }

    // 3. Lưu vào cache
    await redisClient.set(cacheKey, JSON.stringify(snacks), { EX: DEFAULT_EXPIRATION });

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

module.exports = {
  createSnack,
  editSnack,
  deleteSnack,
  getSnackList,
  getAvailableBranches
};
