const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');

// Route to get branch list
router.get('/branches', reportController.getBranches);

// Route to get revenue summary data
router.get('/revenue-summary', reportController.getRevenueSummary);

module.exports = router;