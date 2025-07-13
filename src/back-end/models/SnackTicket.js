const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

const snackTicketSchema = new mongoose.Schema({
  // SnackTicketCode (PK): Mã hóa đơn duy nhất, tự động tạo
  snackTicketCode: {
    type: String,
    required: true,
    unique: true,
    immutable: true, // Không cho phép sửa đổi sau khi tạo
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
  
  // Tham chiếu đến khách hàng (nếu khách hàng đã đăng nhập)
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // required: true, // Không bắt buộc, có thể là khách hàng không đăng nhập, cần kiểm tra có customer hoặc noLoginCustomerInfo (ở dưới)
  },

  // Thông tin khách hàng không đăng nhập
  noLoginCustomerInfo: {
    name: { type: String},
    phone: { type: String},
    email: { type: String},
  },

  // SellerId: Tham chiếu đến nhân viên bán hàng (nếu mua tại quầy)
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  // tham chiếu đến chương trình khuyến mãi (nếu có)
  promotion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Promotion',
    default: null, // Không bắt buộc, có thể không áp dụng khuyến mãi
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

  ticketType: {
    type: String,
    enum: ['Snack'],
    default: 'Snack', // Mặc định là Snack
    immutable: true  // Tuỳ chọn: đảm bảo không ai sửa sau khi tạo
  }

}, { timestamps: true }); // Dùng timestamps để có CreatedDate (createdAt) và LastAccess (updatedAt)

// Custom validation: bắt buộc có customer hoặc đầy đủ thông tin không login
snackTicketSchema.pre('validate', function (next) {
  const hasCustomer = !!this.customer;
  const info = this.noLoginCustomerInfo || {};

  const hasGuestInfo = info.name && info.email && info.phone;

  if (!hasCustomer && !hasGuestInfo) {
    return next(new Error('Customer information is required: either a logged-in customer or full name, email, and phone number must be provided.'));
  }

  next();
});

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