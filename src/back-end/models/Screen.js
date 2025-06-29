const mongoose = require('mongoose');

const screenSchema = new mongoose.Schema({
  screenName: {
    type: String,
    required: true,
    trim: true,
  },

  // Tham chiếu đến cụm rạp
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: true,
  },

  // Kích thước phòng chiếu (số hàng, số cột)
  size: {
    rows: { type: Number, required: true },
    columns: { type: Number, required: true },
  },

  // Loại màn hình: 2D, 3D...
  screenType: {
    type: String,
    required: true,
    enum: ['2D', '3D', 'IMAX', '4DX'],
  },

  // Trạng thái hoạt động
  isActive: {
    type: Boolean,
    default: true,
  }
}, { timestamps: true });

screenSchema.index({ screenName: 1, branch: 1 }, { unique: true });

module.exports = mongoose.model('Screen', screenSchema);