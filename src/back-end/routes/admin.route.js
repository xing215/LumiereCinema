const express = require('express');
const router = express.Router();

const { protect, restrictTo } = require('../middlewares/auth.middleware.js');

const {
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
} = require('../controllers/admin.controller.js');

// Quản lý user
router.post('/users', protect, restrictTo('administrator'), createUser);
router.get('/users', protect, restrictTo('administrator'), getAllProfiles);
router.get('/users/:userId', protect, restrictTo('administrator'), getDetailedProfile);
router.patch('/users/:userId', protect, restrictTo('administrator'), updateUserDetails);
router.put('/users/:userId', protect, restrictTo('administrator'), updateUserDetails);
router.patch('/users/:userId/roles', protect, restrictTo('administrator'), updateUserRoles);
router.patch('/users/:userId/status', protect, restrictTo('administrator'), updateUserStatus);
router.delete('/users/:userId', protect, restrictTo('administrator'), deleteUser);

// Quản lý promotion
router.get('/promotions/all', protect, restrictTo('administrator'), getAllPromotions);
router.get('/promotions/:promotionCode', protect, restrictTo('administrator'), getPromotionByCode);
router.post('/promotions', protect, restrictTo('administrator'), createPromotion);
router.patch('/promotions/:promotionCode', protect, restrictTo('administrator'), updatePromotion);
router.delete('/promotions/:promotionCode', protect, restrictTo('administrator'), deletePromotion);

// Quản lý branch
router.post('/branches', protect, restrictTo('administrator'), createBranch);
router.patch('/branches/:branchId', protect, restrictTo('administrator'), updateBranch);
router.delete('/branches/:branchId', protect, restrictTo('administrator'), deleteBranch);
router.patch('/branches/:branchId/status', protect, restrictTo('administrator'), updateBranchStatus);

module.exports = router;