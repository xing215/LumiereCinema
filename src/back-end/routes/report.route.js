const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');


// Route to get branch list (admin only)
router.get('/branches', protect, restrictTo('administrator'), reportController.getBranches);

// Route to get branch for branch manager only
router.get('/branch', protect, restrictTo('branchmanager'), reportController.getBranch);

// Route to get revenue summary data
router.get('/revenue-summary', protect, restrictTo('administrator', 'branchmanager'), reportController.getRevenueSummary);

module.exports = router;