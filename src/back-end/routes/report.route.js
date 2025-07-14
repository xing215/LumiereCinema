const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');

// Route lấy danh sách branch
router.get('/branches', reportController.getBranches);

// Route lấy dữ liệu tổng hợp revenue
router.get('/revenue-summary', reportController.getRevenueSummary);

module.exports = router;