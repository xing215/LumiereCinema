const express = require('express');
const router = express.Router();

const { protect, restrictTo } = require('../middlewares/auth.middleware.js');

const {
  createSnack,
  editSnack,
  deleteSnack,
  getSnackList,
  getAvailableBranches,
  getBranchById,
  // Schedule management functions
  scheduleMovieScreening,
  editMovieSchedule,
  deleteMovieSchedule,
  getMovieSchedules,
  // Screen management function
  getBranchScreens
} = require('../controllers/branch.controller.js');

/**
 * GET /available
 * Lấy danh sách tất cả branches có sẵn với số phim đang chiếu
 */
router.get('/available', getAvailableBranches);
router.get('/:branchId', getBranchById);

router.get('/:branchId/snacks', getSnackList);

// Các thao tác quản lý snack của branch (bảo vệ, phân quyền admin)
router.post('/:branchId/snacks', protect, restrictTo('administrator'), createSnack);
router.patch('/:branchId/snacks/:snackId', protect, restrictTo('administrator'), editSnack);
router.delete('/:branchId/snacks/:snackId', protect, restrictTo('administrator'), deleteSnack);

// Các thao tác quản lý schedule của branch (bảo vệ, phân quyền branch manager)
router.get('/:branchId/schedules', protect, restrictTo('branchmanager'), getMovieSchedules);
router.post('/:branchId/schedules', protect, restrictTo('branchmanager'), scheduleMovieScreening);
router.patch('/:branchId/schedules/:scheduleId', protect, restrictTo('branchmanager'), editMovieSchedule);
router.delete('/:branchId/schedules/:scheduleId', protect, restrictTo('branchmanager'), deleteMovieSchedule);

// Các thao tác xem screens của branch (bảo vệ, phân quyền branch manager)
router.get('/:branchId/screens', protect, restrictTo('branchmanager'), getBranchScreens);

module.exports = router;
