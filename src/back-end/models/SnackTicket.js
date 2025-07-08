const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

const snackTicketSchema = new mongoose.Schema({
  // SnackTicketCode (PK): Mã hóa đơn duy nhất, tự động tạo
  snackTicketCode: {
    type: String,
    required: true,
    unique: true,
  },

  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: true,
  },

  // SnackList(SnackId, Amount) (FK): Danh sách các món đã mua
  snackList: [
    {
      _id: false,
      snack: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Snack',
        required: true 
      },
      quantity: { // Tương ứng 'Amount'
        type: Number, 
        required: true, 
        min: 1 
      },
      priceAtPurchase: { type: Number, required: true } // Giá tại thời điểm mua
    }
  ],
  
  // Tham chiếu đến khách hàng
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // SellerId: Tham chiếu đến nhân viên bán hàng (nếu mua tại quầy)
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  // Tham chiếu đến mã khuyến mãi đã áp dụng
  promotion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Promotion',
  },

  // Total: Tổng số tiền cuối cùng của hóa đơn
  total: {
    type: Number,
    required: true,
    min: 0
  },

  // IsValid: Trạng thái của hóa đơn
  status: {
    type: String,
    enum: ['Confirmed','CheckedIn', 'Cancelled'], 
    default: 'Confirmed',
  },

}, { timestamps: true }); // Dùng timestamps để có CreatedDate (createdAt) và LastAccess (updatedAt)


// Tự động tạo snackTicketCode
snackTicketSchema.pre('validate', function(next) {
    if (this.isNew) {
        this.snackTicketCode = `SNACK-${nanoid(8).toUpperCase()}`;
    }
    next();
});

// Tăng tốc độ tìm kiếm hóa đơn theo khách hàng
snackTicketSchema.index({ customer: 1 });

module.exports = mongoose.model('SnackTicket', snackTicketSchema);