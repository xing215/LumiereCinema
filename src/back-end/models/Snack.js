const mongoose = require('mongoose');

const snackSchema = new mongoose.Schema({
  branch: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Branch',
  required: true,
  },
  
  shortname: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },

  name: {
    type: String,
    required: true,
    trim: true,
  },

  description: {
    type: String,
    trim: true,
  },
  
  imageURL: {
    type: String,
    required: true,
  },

  price: {
    type: Number,
    required: true,
    min: 0,
  },
  
  discountedPrice: {
    type: Number,
    validate: {
      validator: function(value) {
        return value <= this.price;
      }
    }
  },
  
  // Stock: Số lượng tồn kho
  stock: {
    type: Number,
    default: 0,
  },

  // IsHidden: Trạng thái ẩn/hiện sản phẩm trên menu
  isHidden: {
    type: Boolean,
    default: false,
  }

}, { timestamps: true }); // Tự động quản lý CreateDate (createdAt) và LastUpdate (updatedAt)


module.exports = mongoose.model('Snack', snackSchema);