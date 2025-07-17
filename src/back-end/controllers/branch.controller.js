const Branch = require('../models/Branch.js');
const Snack = require('../models/Snack.js');
const { redisClient } = require('../config/redis.config.js');

const DEFAULT_EXPIRATION = 600; // Cache 10 minutes

/**
 * @desc    Thêm snack mới cho một rạp 
 * @route   POST /api/branches/:branchId/snacks
 * @access  Administrator
 */
const createSnack = async (req, res) => {
  try {
    const { branchId } = req.params;
    const snackData = req.body;

    // 1. Check if branch exists
    const branch = await Branch.findById(branchId);
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found.' });
    }

    // 2. Check if snack with same shortname already exists in branch
    const existingSnack = await Snack.findOne({
      branch: branchId,
      shortname: snackData.shortname?.toUpperCase()
    });

    if (existingSnack) {
      return res.status(400).json({
        message: `Snack with shortname '${snackData.shortname}' already exists in this branch.`
      });
    }

    // 3. Create new snack
    const newSnack = new Snack({
      ...snackData,
      branch: branchId,
      shortname: snackData.shortname?.toUpperCase(), // ensure uppercase
    });

    await newSnack.save();

    // 4. Clear snack list cache for this branch
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

    // Clear snack list cache for this branch
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
 * @desc    Delete snack
 * @route   DELETE /api/branches/:branchId/snacks/:snackId
 * @access  Administrator
 */
const deleteSnack = async (req, res) => {
  try {
    const { branchId, snackId } = req.params;

    // Try deleting first
    const snack = await Snack.findOneAndDelete({ _id: snackId, branch: branchId });
    if (snack) {
      // If deletion successful, clear cache and return result
      await redisClient.del(`snacks:branch:${branchId}`);
      return res.status(200).json({
        message: 'Snack deleted successfully.',
        snack
      });
    }

    // If deletion failed, try setting isHidden = true
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

    // If not found for hiding, return error
    res.status(404).json({ message: 'Snack not found for deletion or hiding.' });
  } catch (error) {
    console.error('Delete Snack Error:', error);
    res.status(500).json({ message: 'Failed to delete or hide snack.' });
  }
};


/**
 * @desc    Get snack list by branch
 * @route   GET /api/branches/:branchId/snacks
 * @access  Public
 */
const getSnackList = async (req, res) => {
  try {

    const { branchId } = req.params;
    const cacheKey = `snacks:branch:${branchId}`;

    // 1. Check cache
    const cachedSnacks = await redisClient.get(cacheKey);
    if (cachedSnacks) {
      console.log(`Cache HIT for snacks of branch ${branchId}`);
      return res.status(200).json(JSON.parse(cachedSnacks));
    }

    // 2. If cache miss → query DB
    console.log(`Cache MISS for snacks of branch ${branchId}`);
    const branch = await Branch.findById(branchId);
    if (!branch) {
      console.log(`Branch with ID ${branchId} not found.`);
      return res.status(404).json({ message: 'Branch not found.' });
    }

    const snacks = await Snack.find({ branch: branchId })
      .select('name price discountedPrice imageURL stock isHidden description createdAt updatedAt');

    if (!snacks || snacks.length === 0) {
      return res.status(404).json({ message: 'No snacks found for this branch.' });
    }

    // 3. Save to cache
    await redisClient.set(cacheKey, JSON.stringify(snacks), { EX: DEFAULT_EXPIRATION });

    res.status(200).json(snacks);
  } catch (error) {
      console.error('Get Snack List Error:', error);
      res.status(500).json({ message: 'Failed to fetch snack list.' });
    }
};

module.exports = {
  createSnack,
  editSnack,
  deleteSnack,
  getSnackList
};
