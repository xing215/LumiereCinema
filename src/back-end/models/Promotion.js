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

  maximumDiscount: {
    type: Number,
    default: null, // Không giới hạn nếu không có giá trị
    min: 0
  },

  // AppliedProduct: ID của sản phẩm cụ thể được áp dụng (nếu có)
  // Có thể là MovieId hoặc SnackId. Cần một trường để phân biệt.
  appliedProduct: {
    type: String, // Lưu 'productType' (ví dụ: 'Movie', 'Snack')
    enum: ['Movie', 'Snack'], // Chỉ áp dụng cho loại sản phẩm này
    required: true,
  },

  appliedLoyaltyRank: {
    type: String, // Lưu 'rankName' của LoyaltyRank
    enum: ['SILVER', 'GOLD', 'PLATINUM'], // Chỉ áp dụng cho hạng khách hàng này
    default: null, // Không giới hạn nếu không có giá trị
  },
  
  // RemainingUse: Số lượt sử dụng còn lại
  remainingUse: {
      type: Number,
      default: null
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
        return next(new Error('The end date must be after the start date.'));
    }
    // Logic kiểm tra discountRate dựa trên discountType
    if (this.discountRate < 0 || this.discountRate > 100) {
        return next(new Error('The discount percentage must be between 0 and 100.'));
    }
    next();
});

// Removed redundant explicit index for promotionCode as unique: true already creates it.

module.exports = mongoose.model('Promotion', promotionSchema);
