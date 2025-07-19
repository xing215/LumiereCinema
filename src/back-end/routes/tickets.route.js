const express = require('express');
const router = express.Router();

const { 
  getSchedulesByBranch, 
  getSeatMapBySchedule,
  createTicket,
  createSnackTicket,
  holdSeats,
  manageSeatHold,
  releaseBulkHolds,
  cleanupExpiredHolds,
  getSnacksByBranch,
  reserveSnacks,
  getCacheStats,
  cleanupCache,
  preloadCache
} = require('../controllers/ticket.controller.js');

/**
 * GET /:branchId/schedule
 * Lấy danh sách lịch chiếu theo branch, ngày và phim
 * Query: ?date=YYYY-MM-DD&movieId=ObjectId (movieId optional)
 */
router.get('/:branchId/schedule', getSchedulesByBranch);

/**
 * GET /screen/:scheduleId
 * Lấy sơ đồ ghế với trạng thái (available, occupied, holding)
 * Query: ?includeExpired=true (optional)
 */
router.get('/screen/:scheduleId', getSeatMapBySchedule);

/**
 * POST /hold
 * Giữ ghế tạm thời
 * Body: { scheduleId, seatNumbers[], userId?, sessionId?, holdDurationMinutes?, replaceExisting? }
 */
router.post('/hold', holdSeats);

/**
 * PATCH /hold/:holdId
 * Quản lý seat hold (release/extend)
 * Body: { action: 'release'|'extend', extendMinutes?, userId?, sessionId? }
 */
router.patch('/hold/:holdId', manageSeatHold);

/**
 * DELETE /hold/bulk
 * Bulk release seat holds
 * Body: { scheduleId, userId?, sessionId?, seatNumbers? }
 */
router.delete('/hold/bulk', releaseBulkHolds);

/**
 * POST /hold/cleanup
 * Cleanup expired holds (admin only)
 */
router.post('/hold/cleanup', cleanupExpiredHolds);

/**
 * GET /:branchId/snacks
 * Lấy danh sách snacks có sẵn theo branch
 */
router.get('/:branchId/snacks', getSnacksByBranch);

/**
 * POST /snacks/reserve
 * Đặt trước snacks tạm thời
 * Body: { branchId, snackItems[], userId?, sessionId?, reserveDurationMinutes? }
 */
router.post('/snacks/reserve', reserveSnacks);

/**
 * POST /create
 * Tạo vé thống nhất (có thể tạo movie ticket, snack ticket, hoặc cả hai)
 * Body: { customer?, noLoginCustomerInfo?, branch, seller?, promotionCode?, movieTicket?, snackTicket? }
 */
router.post('/create', createTicket);

/**
 * POST /snacks/create
 * Tạo vé snack riêng biệt
 * Body: { customer?, noLoginCustomerInfo?, branch, seller?, promotionCode?, snackList }
 */
router.post('/snacks/create', createSnackTicket);

/**
 * Cache Management APIs
 */

/**
 * GET /cache/stats
 * Lấy thống kê cache (Admin only)
 */
router.get('/cache/stats', getCacheStats);

/**
 * POST /cache/cleanup
 * Dọn dẹp cache entries hết hạn (Admin only)
 */
router.post('/cache/cleanup', cleanupCache);

/**
 * POST /cache/preload
 * Preload cache cho popular routes (Admin only)
 * Body: { routes: [{ branchId, scheduleId }] }
 */
router.post('/cache/preload', preloadCache);

module.exports = router;