const express = require('express');
const router = express.Router();

const { protect, restrictTo } = require('../middlewares/auth.middleware.js');

const {
  createTicket,
  getTicketByCode,
  getAllTickets,
} = require('../controllers/ticket.controller.js');


router.post('/', createTicket);

router.get('/admin/all', protect, restrictTo('administrator'), getAllTickets);

router.get('/admin/:code', protect, restrictTo('administrator'), getTicketByCode);



module.exports = router;
