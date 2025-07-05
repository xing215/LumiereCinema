const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  hashedPassword : String,
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
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LoyaltyRank', 
  },
  lunarPoints: { type: Number, default: 0 },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
  watchHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' }],
  lastAccess: Date,
  lastOrder: Date,
  isLocked: { type: Boolean, default: false },

  passwordResetToken: String,
  passwordResetExpires: Date,
}, { timestamps: true });

userSchema.index({ email: 1 });
module.exports = mongoose.model('User', userSchema);