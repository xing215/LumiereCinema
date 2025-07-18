const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  // Tham chiếu đến bộ phim được chiếu
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true,
  },

  // Tham chiếu đến phòng chiếu
  screen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Screen',
    required: true,
  },
    // Thời gian bắt đầu (datetime)
  startTime: {
    type: Date,
    required: true,
    validate: {
      validator: function(value) {
        return value instanceof Date && !isNaN(value.getTime());
      },
      message: 'startTime must be a valid datetime'
    }
  },

  // Thời gian kết thúc (datetime - được tính toán tự động)
  endTime: {
    type: Date,
    required: true,
    validate: {
      validator: function(value) {
        return value instanceof Date && !isNaN(value.getTime());
      },
      message: 'endTime must be a valid datetime'
    }
  },
  // Danh sách các ghế đã được đặt (chỉ lưu tên ghế)
  OccupiedSeat: [
    {
      type: String,
      required: true
    }
  ],

}, { timestamps: true });

// Middleware để tự động tính endTime
scheduleSchema.pre('save', async function(next) {
  if (this.isModified('startTime') || this.isNew) {
    const Movie = mongoose.model('Movie'); // Lấy Movie model một cách an toàn
    const movie = await Movie.findById(this.movie);
    if (movie && movie.duration) {
      this.endTime = new Date(this.startTime.getTime() + movie.duration * 60 * 1000);
    }
  }
  next();
});

// Indexes để đảm bảo không trùng lịch và tăng tốc truy vấn
scheduleSchema.index({ screen: 1, startTime: 1 }, { unique: true });
scheduleSchema.index({ movie: 1, startTime: 1 });
// Index để query seat availability nhanh
scheduleSchema.index({ OccupiedSeat: 1 });

module.exports = mongoose.model('Schedule', scheduleSchema);