const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  seatNumber: {
    type: String,
    required: true,
  },
  location: {
    row: { type: String, required: true },
    column: { type: Number, required: true },
  },
  screen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Screen',
    required: true
  },
  category: {
    type: String,
    ref: 'SeatCategory',
    required: true,
  },
  isHidden: {
    type: Boolean,
    default: false,
  }
}, { timestamps: false });

seatSchema.index({ seatNumber: 1, screen: 1 }, { unique: true });

module.exports = mongoose.model('Seat', seatSchema);