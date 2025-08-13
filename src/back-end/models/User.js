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

  activationToken: String,
  activationExpires: Date,
  activateStatus: { type: Boolean, default: false },

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

// Middleware to automatically set branch to null for customer and administrator roles
userSchema.pre('save', function(next) {
  // Check if roles field is modified or this is a new document
  if (this.isModified('roles') || this.isNew) {
    // Only set branch to null if user has ONLY customer role OR ONLY administrator role
    // If admin has other staff roles, they can have a branch
    if ((this.roles.includes('customer') && this.roles.length === 1) || 
        (this.roles.includes('administrator') && this.roles.length === 1)) {
      this.branch = undefined;
    }
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
