const express = require('express');
const router = express.Router();

const { protect, restrictTo } = require('../middlewares/auth.middleware.js');

const {
  createSnack,
  editSnack,
  deleteSnack,
  getSnackList,
  getOccupiedSeats,
} = require('../controllers/branch.controller.js');

router.get('/:branchId/snacks', getSnackList);

// Các thao tác quản lý snack của branch (bảo vệ, phân quyền admin)
router.post('/:branchId/snacks', protect, restrictTo('administrator'), createSnack);
router.patch('/:branchId/snacks/:snackId', protect, restrictTo('administrator'), editSnack);
router.delete('/:branchId/snacks/:snackId', protect, restrictTo('administrator'), deleteSnack);

router.get('/:branchId/schedules/:scheduleId/occupied-seats', getOccupiedSeats);
module.exports = router;
