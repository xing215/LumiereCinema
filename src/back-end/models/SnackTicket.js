const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

const snackTicketSchema = new mongoose.Schema({
  // SnackTicketCode (PK): Unique invoice code, auto-generated
  snackTicketCode: {
    type: String,
    required: true,
    unique: true,
    immutable: true, // Not allowed to modify after creation
  },

  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: true,
  },

  // SnackList(SnackId, Amount) (FK): List of purchased items
  snackList: [
    {
      _id: false,
      snack: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Snack',
        required: true 
      },
      quantity: { // Corresponds to 'Amount'
        type: Number, 
        required: true, 
        min: 1 
      },
      priceAtPurchase: { type: Number, required: true } // Price at time of purchase
    }
  ],
  
  // Reference to customer (if customer is logged in)
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // required: true, // Not required, can be guest customer, must check for either customer or noLoginCustomerInfo (below)
  },

  // Guest customer information
  noLoginCustomerInfo: {
    name: { type: String},
    phone: { type: String},
    email: { type: String},
  },

  // SellerId: Reference to cashier (if purchased at counter)
  seller: {
    type: String,
    default: null,
  },

  // Reference to promotion program (if any)
  promotion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Promotion',
    default: null, // Not required, may not apply promotion
  },

  // Total: Final total amount of invoice
  total: {
    type: Number,
    required: true,
    min: 0
  },

  // IsValid: Invoice status
  status: {
    type: String,
    enum: ['Confirmed','CheckedIn', 'Cancelled'], 
    default: 'Confirmed',
  },
  lastScanAt: {
    type: Date,
    default: null
  },
  ticketType: {
    type: String,
    enum: ['Snack'],
    default: 'Snack', // Default is Snack
    immutable: true  // Optional: ensure no one edits after creation
  }

}, { timestamps: true }); // Use timestamps for CreatedDate (createdAt) and LastAccess (updatedAt)

// Custom validation: must have either customer or complete guest info
snackTicketSchema.pre('validate', function (next) {
  const hasCustomer = !!this.customer;
  const info = this.noLoginCustomerInfo || {};

  const hasGuestInfo = info.name;

  if (!hasCustomer && !hasGuestInfo) {
    return next(new Error('Customer information is required: either a logged-in customer or full name, email, and phone number must be provided.'));
  }

  next();
});

// Automatically generate snackTicketCode
snackTicketSchema.pre('validate', function(next) {
    if (this.isNew) {
        this.snackTicketCode = `SNACK-${nanoid(8).toUpperCase()}`;
    }
    next();
});

// Speed up invoice search by customer
snackTicketSchema.index({ customer: 1 });

module.exports = mongoose.model('SnackTicket', snackTicketSchema);