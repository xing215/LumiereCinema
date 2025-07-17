const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  // PromotionCode (PK): Promotion code that users will enter
  promotionCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },

  // Name: Name or short description of the program
  name: {
    type: String,
    required: true,
    trim: true,
  },

  // DiscountRate: Discount rate or discount amount
  discountRate: {
    type: Number,
    required: true,
    min: 0,
  },

  maximumDiscount: {
    type: Number,
    default: null, // No limit if no value
    min: 0
  },

  appliedProduct: {
    type: String, // Store 'productType' (example: 'Movie', 'Snack', 'All')
    enum: ['Movie', 'Snack', 'All'], // Only applies to this product type
    required: true,
  },

  appliedLoyaltyRank: {
    type: String, // Store 'rankName' from LoyaltyRank
    enum: ['SILVER', 'GOLD', 'PLATINUM'], // Only applies to this customer tier
    default: null, // No limit if no value
  },
  
  // RemainingUse: Number of uses remaining
  remainingUse: {
      type: Number,
      default: null
  },

  // MinimumSpend: Minimum spending requirement to apply
  minimumSpend: {
    type: Number,
    required: true,
    default: 0
  },

  // Start and end dates
  startDate: {
    type: Date,
    //required: true,
    default: null
  },
  endDate: {
    type: Date,
    //required: true,
    default: null
  },

  // Active status
  isActive: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

// Middleware to validate dates
promotionSchema.pre('save', function(next) {
    if (this.endDate < this.startDate) {
        return next(new Error('The end date must be after the start date.'));
    }
    // Logic to validate discountRate based on discountType
    if (this.discountRate < 0 || this.discountRate > 100) {
        return next(new Error('The discount percentage must be between 0 and 100.'));
    }
    next();
});

module.exports = mongoose.model('Promotion', promotionSchema);
