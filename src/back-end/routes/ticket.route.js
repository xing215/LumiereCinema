const express = require('express');
const router = express.Router();

const { protect, restrictTo } = require('../middlewares/auth.middleware.js');

const {
  getSchedulesByBranch,
  createTicket,
  getTicketByCode,
  getAllTickets,
  updateTicket,
  deleteTicket,
  checkInTicket,
  makeTicketValid,
} = require('../controllers/ticket.controller.js');

router.get('/schedules/:branchId', getSchedulesByBranch);

router.post('/snacks', createTicket);

router.get('/snacks/admin/all', protect, restrictTo('administrator'), getAllTickets);

router.patch('/snacks/admin/:ticketCode/check-in', protect, restrictTo('administrator'), checkInTicket);

router.patch('/snacks/admin/:ticketCode/make-valid', protect, restrictTo('administrator'), makeTicketValid);

router.get('/snacks/admin/:ticketCode', protect, restrictTo('administrator'), getTicketByCode);

router.patch('/snacks/admin/:ticketCode', protect, restrictTo('administrator'), updateTicket);

router.delete('/snacks/admin/:ticketCode', protect, restrictTo('administrator'), deleteTicket);

module.exports = router;
