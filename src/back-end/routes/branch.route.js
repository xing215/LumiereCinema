const express = require('express');
const router = express.Router();

const { protect, restrictTo } = require('../middlewares/auth.middleware.js');

const {
  createSnack,
  editSnack,
  deleteSnack,
  getSnackList,
  getAvailableBranches,
} = require('../controllers/branch.controller.js');

/**
 * GET /available
 * Lấy danh sách tất cả branches có sẵn với số phim đang chiếu
 */
router.get('/available', getAvailableBranches);

router.get('/:branchId/snacks', getSnackList);

// Các thao tác quản lý snack của branch (bảo vệ, phân quyền admin)
router.post('/:branchId/snacks', protect, restrictTo('administrator'), createSnack);
router.patch('/:branchId/snacks/:snackId', protect, restrictTo('administrator'), editSnack);
router.delete('/:branchId/snacks/:snackId', protect, restrictTo('administrator'), deleteSnack);

module.exports = router;
