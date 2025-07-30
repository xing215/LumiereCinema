const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

const ticketSchema = new mongoose.Schema({
  // Unique ticket code, auto-generated
  ticketCode: {
    type: String,
    required: true,
    unique: true,
    immutable: true,
  },
  // Customer reference
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Staff member who sold the ticket (for counter sales)
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
  },

  // Branch reference for quick queries without populate
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: true,
    index: true,
  },

  schedule: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Schedule',
    required: true,
  },

  // List of seat names booked in this ticket
  seats: {
    type: [String], // Array of seat names, e.g., ["A1", "A2", "A3"]
    required: true,
  },

  // Applied promotion reference
  promotion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Promotion', 
  },

  // Final total amount
  total: {
    type: Number,
    required: true,
    min: 0
  },

  // Ticket status
  status: {
      type: String,
      enum: ['Confirmed', 'CheckedIn', 'Cancelled'], // 'Confirmed' & 'CheckedIn' are valid
      default: 'Confirmed',
  },

  lastScanAt: {
    type: Date,
    default: null
  },
  ticketType: {
    type: String,
    enum: ['Movie'],
    default: 'Movie',
    immutable: true
  }

}, { timestamps: true }); // Use timestamps for CreatedDate (createdAt) and LastAccess (updatedAt)


// Auto-generate ticketCode
ticketSchema.pre('validate', function(next) {
    if (this.isNew) {
        this.ticketCode = nanoid(10).toUpperCase();
    }
    next();
});

module.exports = mongoose.model('Ticket', ticketSchema);
