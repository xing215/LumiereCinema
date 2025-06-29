const mongoose = require('mongoose');

const loyaltyRankSchema = new mongoose.Schema({
  // Tên hạng (đóng vai trò là Primary Key), ví dụ: 'BRONZE', 'SILVER'
  rankName: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },

  // Tên hiển thị thân thiện với người dùng
  displayName: {
    type: String,
    required: true,
    trim: true,
  },

  // Số điểm tối thiểu mà người dùng cần đạt được để lên hạng này
  minimumPoints: {
      type: Number,
      required: true,
      default: 0
  },

  // Mô tả ngắn về các quyền lợi của hạng này
  description: {
      type: String,
      default: ''
  },
  
  // Tham chiếu đến một mã khuyến mãi mặc định cho hạng này
  // Ví dụ: Hạng Vàng được giảm 10% cho mọi vé
  defaultPromotion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Promotion'
  }
}, { timestamps: false }); // Dữ liệu cấu hình, không cần timestamps

module.exports = mongoose.model('LoyaltyRank', loyaltyRankSchema);