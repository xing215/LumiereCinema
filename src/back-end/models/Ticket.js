const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

const ticketSchema = new mongoose.Schema({
  // TicketCode (PK): Mã vé duy nhất, ngắn gọn, tự động tạo
  ticketCode: {
    type: String,
    required: true,
    unique: true,
  },
  // Customer (FK): Tham chiếu đến người dùng mua vé
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // SellerId: Tham chiếu đến nhân viên bán vé (nếu mua tại quầy)
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
  },

  // Lưu lại để truy vấn nhanh không cần populate
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: true,
  },
  screen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Screen',
    required: true,
  },
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true
  },
  showtime: { // Tương ứng với DateTime trong ERD
    type: Date,
    required: true,
  },
  // --------------------------------------------------------

  // SeatNameList: Danh sách các ghế được đặt trong vé này
  seats: {
    type: [String], // Mảng các tên ghế, ví dụ: ["A1", "A2", "A3"]
    required: true,
  },

  // PromotionCode (FK): Tham chiếu đến mã khuyến mãi đã áp dụng
  promotion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Promotion', 
  },

  // Total: Tổng số tiền cuối cùng của vé
  total: {
    type: Number,
    required: true,
    min: 0
  },

  // IsValid: Trạng thái của vé
  status: {
      type: String,
      enum: ['Confirmed', 'CheckedIn', 'Cancelled'], // 'Confirmed' & 'CheckedIn' là hợp lệ
      default: 'Confirmed',
  },

}, { timestamps: true }); // Dùng timestamps để có CreatedDate (createdAt) và LastAccess (updatedAt)


// Tự động tạo ticketCode
ticketSchema.pre('validate', function(next) {
    if (this.isNew) {
        this.ticketCode = nanoid(10).toUpperCase();
    }
    next();
});

module.exports = mongoose.model('Ticket', ticketSchema);