const express = require('express');
const router = express.Router();

const { protect, restrictTo, getUser } = require('../middlewares/auth.middleware.js');

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
  preloadCache,
  getTicketByCode,
  getAllTickets,
  updateTicket,
  deleteTicket,
  calculateDiscountedTotal,
} = require('../controllers/ticket.controller.js');

// =============================================================================
// GENERAL TICKET ROUTES (Both Movie and Snack)
// =============================================================================

/**
 * GET /:branchId/schedule
 * Lấy danh sách lịch chiếu theo branch, ngày và phim
 * Query: ?date=YYYY-MM-DD&movieId=ObjectId (movieId optional)
 */
router.get('/:branchId/schedule',getUser, getSchedulesByBranch);

/**
 * GET /screen/:scheduleId
 * Lấy sơ đồ ghế với trạng thái (available, occupied, holding)
 * Query: ?includeExpired=true (optional)
 */
router.get('/screen/:scheduleId', getSeatMapBySchedule);

/**
 * POST /create
 * Tạo vé thống nhất (có thể tạo movie ticket, snack ticket, hoặc cả hai)
 * Body: { customer?, noLoginCustomerInfo?, branch, seller?, promotionCode?, 
 *         movieTicket?: { schedule, seats }, 
 *         snackTicket?: { snackList: [{ shortname, quantity }] } }
 */
router.post('/create', getUser, createTicket);

// =============================================================================
// MOVIE TICKET SPECIFIC ROUTES
// =============================================================================

/**
 * POST /movie/hold
 * Giữ ghế tạm thời
 * Body: { scheduleId, seatNumbers[], userId?, sessionId?, holdDurationMinutes?, replaceExisting? }
 */
router.post('/movie/hold', getUser, holdSeats);

/**
 * PATCH /movie/hold/:holdId
 * Quản lý seat hold (release/extend)
 * Body: { action: 'release'|'extend', extendMinutes?, userId?, sessionId? }
 */
router.patch('/movie/hold/', getUser, manageSeatHold);

/**
 * DELETE /movie/hold/bulk
 * Bulk release seat holds
 * Body: { scheduleId, userId?, sessionId?, seatNumbers? }
 */
router.delete('/movie/hold/bulk', releaseBulkHolds);

/**
 * POST /movie/hold/cleanup
 * Cleanup expired holds (admin only)
 */
router.post('/movie/hold/cleanup', protect, restrictTo('administrator'), cleanupExpiredHolds);

/**
 * GET /movie/admin/all
 * Lấy tất cả movie tickets (Admin only)
 */
router.get('/movie/admin/all', protect, restrictTo('administrator'), getAllTickets);

/**
 * GET /movie/admin/:ticketCode
 * Lấy movie ticket theo code (Admin only)
 */
router.get('/movie/admin/:ticketCode', protect, restrictTo('administrator'), getTicketByCode);

/**
 * PATCH /movie/admin/:ticketCode
 * Cập nhật movie ticket (Admin only)
 */
router.patch('/movie/admin/:ticketCode', protect, restrictTo('administrator'), updateTicket);

/**
 * DELETE /movie/admin/:ticketCode
 * Hủy movie ticket (Admin only)
 */
router.delete('/movie/admin/:ticketCode', protect, restrictTo('administrator'), deleteTicket);

// =============================================================================
// SNACK TICKET SPECIFIC ROUTES  
// =============================================================================

/**
 * GET /:branchId/snacks
 * Lấy danh sách snacks có sẵn theo branch
 */
router.get('/:branchId/snacks', getSnacksByBranch);

/**
 * POST /snack/reserve
 * Đặt trước snacks tạm thời
 * Body: { branchId, snackItems: [{ shortname, quantity }], userId?, sessionId?, reserveDurationMinutes? }
 */
router.post('/snack/reserve', getUser, reserveSnacks);

/**
 * POST /snack/create
 * Tạo vé snack riêng biệt
 * Body: { customer?, noLoginCustomerInfo?, branch, seller?, promotionCode?, 
 *         snackList: [{ shortname, quantity }] }
 */
router.post('/snack/create', getUser, createSnackTicket);

/**
 * GET /snack/admin/all
 * Lấy tất cả snack tickets (Admin only)
 */
router.get('/snack/admin/all', protect, restrictTo('administrator'), getAllTickets);

/**
 * GET /snack/admin/:ticketCode
 * Lấy snack ticket theo code (Admin only)
 */
router.get('/snack/admin/:ticketCode', protect, restrictTo('administrator'), getTicketByCode);

/**
 * PATCH /snack/admin/:ticketCode
 * Cập nhật snack ticket (Admin only)
 */
router.patch('/snack/admin/:ticketCode', protect, restrictTo('administrator'), updateTicket);

/**
 * DELETE /snack/admin/:ticketCode
 * Hủy snack ticket (Admin only)
 */
router.delete('/snack/admin/:ticketCode', protect, restrictTo('administrator'), deleteTicket);

// =============================================================================
// CACHE MANAGEMENT ROUTES (Admin only)
// =============================================================================

/**
 * GET /cache/stats
 * Lấy thống kê cache (Admin only)
 */
router.get('/cache/stats', protect, restrictTo('administrator'), getCacheStats);

/**
 * POST /cache/cleanup
 * Dọn dẹp cache entries hết hạn (Admin only)
 */
router.post('/cache/cleanup', protect, restrictTo('administrator'), cleanupCache);

/**
 * POST /cache/preload
 * Preload cache cho popular routes (Admin only)
 * Body: { routes: [{ branchId, scheduleId }] }
 */
router.post('/cache/preload', protect, restrictTo('administrator'), preloadCache);

/**
 * GET /calculate-discounted-total
 * Tính tổng tiền sau khi áp dụng khuyến mãi
 * Query: { user, promotionCode, snackTotal, movieTotal, session = null }
 */
router.post('/calculate-discounted', getUser, calculateDiscountedTotal);

module.exports = router;