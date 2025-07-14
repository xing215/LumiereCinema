const express = require('express');
const router = express.Router();

const { protect, restrictTo } = require('../middlewares/auth.middleware.js');

const {
  createTicket,
  getTicketByCode,
  getAllTickets,
  updateTicket,
  deleteTicket,
} = require('../controllers/ticket.controller.js');


router.post('/', createTicket);

router.get('/admin/all', protect, restrictTo('administrator'), getAllTickets);

router.get('/admin/:ticketCode', protect, restrictTo('administrator'), getTicketByCode);

router.patch('/admin/:ticketCode', protect, restrictTo('administrator'), updateTicket);

router.delete('/admin/:ticketCode', protect, restrictTo('administrator'), deleteTicket);

module.exports = router;
