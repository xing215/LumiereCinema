const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middlewares/auth.middleware.js');
const {
  addSnack,
  updateSnack,
  deleteSnack
} = require('../controllers/admin.controller.js');

router.post('/snacks', protect, restrictTo('administrator'), addSnack);
router.patch('/snacks/:snackId', protect, restrictTo('administrator'), updateSnack);
router.delete('/snacks/:snackId', protect, restrictTo('administrator'), deleteSnack);

module.exports = router;
