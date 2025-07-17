const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },

  hashedPassword: String,

  name: {type: String, required: true},

  phone: {type: String, required: true, unique: true},

  birthday: Date,

  gender: {
    type: String,
    enum: ['male', 'female', 'other'], default: 'male'
  },

  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },

  roles: {
  type: [String],
  enum: ['customer', 'cashier', 'checkincounter' ,'branchmanager','administrator'], 
  default: ['customer']
  },

  loyaltyRank: {
    rank: { 
      type: String, 
      enum: ['SILVER', 'GOLD', 'PLATINUM'], 
      default: 'SILVER' 
    },

    lunarPoints: { type: Number, default: 0 },
  },

  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],

  watchHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' }],

  lastAccess: Date,

  lastOrder: Date,

  isLocked: { type: Boolean, default: false },

  passwordResetToken: String,

  passwordResetExpires: Date,

}, { timestamps: true });

userSchema.methods.addLunarPointsFromPurchase = function (amountInVND) {
  let pointPer10k = 1;

  switch (this.loyaltyRank.rank) {
    case 'GOLD':
      pointPer10k = 3;
      break;
    case 'PLATINUM':
      pointPer10k = 5;
      break;
    default: // SILVER
      pointPer10k = 1;
  }

  const pointsToAdd = Math.floor(amountInVND / 10000) * pointPer10k;
  this.loyaltyRank.lunarPoints += pointsToAdd;

  // Update tier if qualified
  const newPoints = this.loyaltyRank.lunarPoints;
  if (newPoints >= 1500) {
    this.loyaltyRank.rank = 'PLATINUM';
    this.loyaltyRank.defaultDiscountRate = 10;
  } else if (newPoints >= 500) {
    this.loyaltyRank.rank = 'GOLD';
    this.loyaltyRank.defaultDiscountRate = 5;
  } else {
    this.loyaltyRank.rank = 'SILVER';
    this.loyaltyRank.defaultDiscountRate = 0;
  }
};

userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);
