const express = require('express');
const router = express.Router();

const { protect, restrictTo, getUser } = require('../middlewares/auth.middleware.js');

const {
  createUser,
  getAllProfiles,
  getDetailedProfile,
  updateUserDetails,
  updateUserRoles,
  updateUserStatus,
  deleteUser,
  getAllPromotions,
  getPromotionBannerList,
  getPromotionByCode,
  getPublicPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  getAllBranches,
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
router.get('/promotions/all', protect, restrictTo('administrator', 'cashier'), getAllPromotions);
router.get('/promotions/banner', getPromotionBannerList);
router.get('/promotions/public', getUser, getPublicPromotions);
router.get('/promotions/:promotionCode', protect, restrictTo('administrator'), getPromotionByCode);
router.post('/promotions', protect, restrictTo('administrator'), createPromotion);
router.patch('/promotions/:promotionCode', protect, restrictTo('administrator'), updatePromotion);
router.delete('/promotions/:promotionCode', protect, restrictTo('administrator'), deletePromotion);

// Quản lý branch
router.get('/branches', protect, restrictTo('administrator', 'branchmanager'), getAllBranches);
router.post('/branches', protect, restrictTo('administrator'), createBranch);
router.patch('/branches/:branchId', protect, restrictTo('administrator'), updateBranch);
router.delete('/branches/:branchId', protect, restrictTo('administrator'), deleteBranch);
router.patch('/branches/:branchId/status', protect, restrictTo('administrator'), updateBranchStatus);

module.exports = router;