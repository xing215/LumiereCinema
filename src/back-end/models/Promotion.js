const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  // PromotionCode (PK): Mã khuyến mãi mà người dùng sẽ nhập
  promotionCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },

  // Name: Tên hoặc mô tả ngắn gọn của chương trình
  name: {
    type: String,
    required: true,
    trim: true,
  },

  // DiscountRate: Tỷ lệ hoặc số tiền giảm giá
  discountRate: {
    type: Number,
    required: true,
    min: 0,
  },
  
  // Logic ngầm định: Cần một trường để biết 'discountRate' là % hay số tiền cố định.
  discountType: {
    type: String,
    required: true,
    enum: ['Percentage', 'FixedAmount'], // Giảm theo % hoặc số tiền cố định
  },

  // AppliedProduct: ID của sản phẩm cụ thể được áp dụng (nếu có)
  // Có thể là MovieId hoặc SnackId. Cần một trường để phân biệt.
  appliedProduct: {
    id: { type: mongoose.Schema.Types.ObjectId },
    type: { type: String, enum: ['Movie', 'Snack'] }
  },

  appliedLoyaltyRank: {
    type: String, // Lưu 'rankName' của LoyaltyRank
    ref: 'LoyaltyRank'
  },
  
  // RemainingUse: Số lượt sử dụng còn lại
  remainingUse: {
      type: Number,
      default: Infinity
  },

  // MinimumSpend: Điều kiện chi tiêu tối thiểu để được áp dụng
  minimumSpend: {
    type: Number,
    required: true,
    default: 0
  },

  // Ngày bắt đầu và kết thúc
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },

  // Trạng thái hoạt động
  isActive: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

// Middleware để kiểm tra ngày tháng
promotionSchema.pre('save', function(next) {
    if (this.endDate < this.startDate) {
        return next(new Error('Ngày kết thúc phải sau ngày bắt đầu.'));
    }
    // Logic kiểm tra discountRate dựa trên discountType
    if (this.discountType === 'Percentage' && (this.discountRate < 0 || this.discountRate > 100)) {
        return next(new Error('Tỷ lệ phần trăm giảm giá phải từ 0 đến 100.'));
    }
    next();
});

// Removed redundant explicit index for promotionCode as unique: true already creates it.

module.exports = mongoose.model('Promotion', promotionSchema);