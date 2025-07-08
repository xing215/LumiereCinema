const Branch = require('../models/Branch.js');
const Snack = require('../models/Snack.js');
const mongoose = require('mongoose');

/**
 * @desc    Lấy danh sách snack của 1 branch (có populate thông tin snack)
 * @route   GET /api/branches/:branchId/snacks
 */
const getSnackList = async (req, res) => {
  try {
    const { branchId } = req.params;

    const branch = await Branch.findById(branchId).populate('snacks.snack');
    if (!branch) {
      return res.status(404).json({ message: 'Không tìm thấy rạp.' });
    }

    res.status(200).json(branch.snacks);
  } catch (error) {
    console.error('Get Snack List Error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

/**
 * @desc    Thêm snack vào branch
 * @route   POST /api/branches/:branchId/snacks
 * @body    { snackId, stock }
 */
const createSnack = async (req, res) => {
  try {
    const { branchId } = req.params;
    const { snackId, stock } = req.body;

    if (!mongoose.Types.ObjectId.isValid(snackId)) {
      return res.status(400).json({ message: 'SnackId không hợp lệ.' });
    }

    const branch = await Branch.findById(branchId);
    if (!branch) {
      return res.status(404).json({ message: 'Không tìm thấy rạp.' });
    }

    // Kiểm tra snack đã tồn tại trong branch chưa
    const exists = branch.snacks.find(s => s.snack.toString() === snackId);
    if (exists) {
      return res.status(400).json({ message: 'Snack đã tồn tại trong branch.' });
    }

    branch.snacks.push({ snack: snackId, stock: stock || 0 });
    await branch.save();

    res.status(201).json({ message: 'Thêm snack thành công.', snacks: branch.snacks });
  } catch (error) {
    console.error('Add Snack to Branch Error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

/**
 * @desc    Cập nhật stock của snack trong branch
 * @route   PATCH /api/branches/:branchId/snacks/:snackId
 * @body    { stock }
 */
const editSnack = async (req, res) => {
  try {
    const { branchId, snackId } = req.params;
    const { stock } = req.body;

    if (stock == null || stock < 0) {
      return res.status(400).json({ message: 'Stock không hợp lệ.' });
    }

    const branch = await Branch.findById(branchId);
    if (!branch) return res.status(404).json({ message: 'Không tìm thấy rạp.' });

    // Tìm snack trong branch
    const snackItem = branch.snacks.find(s => s.snack.toString() === snackId);
    if (!snackItem) {
      return res.status(404).json({ message: 'Snack không tồn tại trong branch.' });
    }

    snackItem.stock = stock;
    await branch.save();

    res.status(200).json({ message: 'Cập nhật stock thành công.', snack: snackItem });
  } catch (error) {
    console.error('Update Snack Stock Error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

/**
 * @desc    Xóa snack khỏi branch
 * @route   DELETE /api/branches/:branchId/snacks/:snackId
 */
const deleteSnack = async (req, res) => {
  try {
    const { branchId, snackId } = req.params;

    const branch = await Branch.findById(branchId);
    if (!branch) return res.status(404).json({ message: 'Không tìm thấy rạp.' });

    const originalLength = branch.snacks.length;
    branch.snacks = branch.snacks.filter(s => s.snack.toString() !== snackId);

    if (branch.snacks.length === originalLength) {
      return res.status(404).json({ message: 'Snack không tồn tại trong branch.' });
    }

    await branch.save();

    res.status(200).json({ message: 'Xóa snack khỏi branch thành công.' });
  } catch (error) {
    console.error('Delete Snack from Branch Error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

module.exports = {
  getSnackList,
  createSnack,
  editSnack,
  deleteSnack,
};
