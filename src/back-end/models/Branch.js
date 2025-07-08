const mongoose = require('mongoose');

// (Tùy chọn) Một sub-schema để lưu trữ tọa độ địa lý (GeoJSON)
// Rất hữu ích cho các tính năng như "Tìm rạp gần bạn"
const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true
  },
  coordinates: {
    type: [Number], // Định dạng: [kinh độ, vĩ độ]
    required: true
  }
});

const branchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  
  address: {
    type: String,
    required: true,
    trim: true
  },
  
  city: {
    type: String,
    required: true,
    trim: true
  },
  
  // URL hình ảnh của rạp
  imageURL: {
    type: String,
    default: ''
  },
  
  // Tọa độ trên bản đồ để tích hợp Google Maps
  location: {
    type: pointSchema,
    // Tạo chỉ mục 2dsphere để tối ưu các truy vấn địa lý
    index: '2dsphere'
  },
  isActive: { type: Boolean, default: true },

  snacks: [
    {
      snack: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Snack',
        required: true
      },
      stock: {
        type: Number,
        default: 0,
        min: 0
      }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Branch', branchSchema);