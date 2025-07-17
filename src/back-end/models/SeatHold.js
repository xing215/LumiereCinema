const mongoose = require('mongoose');

const seatHoldSchema = new mongoose.Schema({
  // Tham chiếu đến lịch chiếu cụ thể
  schedule: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Schedule',
    required: true,
    index: true // Tăng tốc truy vấn theo schedule
  },

  // Tên ghế được giữ (A1, B5, etc.)
  seatNumber: {
    type: String,
    required: true,
    trim: true
  },

  // User đang giữ ghế (có thể null cho guest users)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  // Session ID cho guest users (alternative to user)
  sessionId: {
    type: String,
    default: null
  },

  // Thời điểm hết hạn (TTL sẽ auto delete)
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 phút từ bây giờ
    index: { expireAfterSeconds: 0 } // TTL Index - MongoDB auto cleanup
  },

  // Metadata bổ sung
  holdReason: {
    type: String,
    enum: ['customer_selection', 'payment_processing', 'admin_hold'],
    default: 'customer_selection'
  }

}, { 
  timestamps: true,
  // Tự động xóa document khi hết hạn
  expireAfterSeconds: 0
});

// ✨ CRITICAL: Unique compound index để đảm bảo 1 ghế chỉ được hold bởi 1 user
seatHoldSchema.index(
  { schedule: 1, seatNumber: 1 }, 
  { 
    unique: true,
    name: 'unique_seat_hold' // Explicit index name
  }
);

// Index để query nhanh theo user
seatHoldSchema.index({ user: 1, expiresAt: 1 });

// Validation: Bắt buộc có user HOẶC sessionId
seatHoldSchema.pre('validate', function(next) {
  if (!this.user && !this.sessionId) {
    return next(new Error('Either user or sessionId must be provided'));
  }
  next();
});

// Static method để cleanup expired holds manually (backup cho TTL)
seatHoldSchema.statics.cleanupExpiredHolds = async function() {
  const now = new Date();
  const result = await this.deleteMany({ expiresAt: { $lte: now } });
  return result.deletedCount;
};

// Instance method để extend hold time
seatHoldSchema.methods.extendHold = function(additionalMinutes = 5) {
  this.expiresAt = new Date(this.expiresAt.getTime() + additionalMinutes * 60 * 1000);
  return this.save();
};

module.exports = mongoose.model('SeatHold', seatHoldSchema);