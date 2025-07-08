const express = require('express');
const router = express.Router();

const { protect, restrictTo } = require('../middlewares/auth.middleware.js');

const {
  getSnackList,
  createSnack,
  editSnack,
  deleteSnack,
} = require('../controllers/branch.controller.js');

// Các thao tác quản lý snack của branch (bảo vệ, phân quyền admin)
router.get('/:branchId/snacks', protect, restrictTo('administrator'), getSnackList);
router.post('/:branchId/snacks', protect, restrictTo('administrator'), createSnack);
router.patch('/:branchId/snacks/:snackId', protect, restrictTo('administrator'), editSnack);
router.delete('/:branchId/snacks/:snackId', protect, restrictTo('administrator'), deleteSnack);

module.exports = router;
