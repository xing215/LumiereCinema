const mongoose = require('mongoose');

const movieRatingSchema = new mongoose.Schema({
  // Tên trường trong ERD là 'Star'
  star: {
    type: Number,
    required: [true, 'Số sao đánh giá không được để trống.'],
    min: 1,
    max: 5,
  },

  // Thêm trường bình luận để người dùng có thể viết nhận xét
  comment: {
    type: String,
    trim: true,
  },

  // UserId (FK): Tham chiếu đến người dùng đã đánh giá
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  // MovieId (FK): Tham chiếu đến phim được đánh giá
  movieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true,
  }

}, { timestamps: true });

/**
 * ==================================================================================
 * INDEXES (CHỈ MỤC)
 * ==================================================================================
 * Tạo chỉ mục kết hợp để đảm bảo mỗi người dùng chỉ có thể đánh giá một bộ phim MỘT LẦN.
 * Đây là quy tắc nghiệp vụ quan trọng.
 */
movieRatingSchema.index({ movie: 1, user: 1 }, { unique: true });


/**
 * ==================================================================================
 * STATIC METHOD & MIDDLEWARE
 * ==================================================================================
 * Logic quan trọng: Tự động tính toán và cập nhật điểm trung bình (ratingsAverage)
 * và tổng số lượt đánh giá (ratingsQuantity) trong MovieModel mỗi khi có một
 * đánh giá mới được thêm, sửa, hoặc xóa.
 */

// 1. Tạo một hàm static để tính toán
movieRatingSchema.statics.calculateAverageRatings = async function(movieId) {
  const stats = await this.aggregate([
    {
      $match: { movie: movieId }
    },
    {
      $group: {
        _id: '$movie',
        numRatings: { $sum: 1 },
        avgRating: { $avg: '$star' }
      }
    }
  ]);

  // Cập nhật vào document Movie tương ứng
  if (stats.length > 0) {
    await mongoose.model('Movie').findByIdAndUpdate(movieId, {
      ratingsQuantity: stats[0].numRatings,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    // Nếu không còn rating nào, trả về giá trị mặc định
    await mongoose.model('Movie').findByIdAndUpdate(movieId, {
      ratingsQuantity: 0,
      ratingsAverage: 0
    });
  }
};

// 2. Gọi hàm static đó sau khi một đánh giá được LƯU (tạo mới hoặc cập nhật)
movieRatingSchema.post('save', function() {
  // 'this.constructor' chính là MovieRatingModel
  this.constructor.calculateAverageRatings(this.movie);
});

// 3. Gọi hàm static đó sau khi một đánh giá bị XÓA
// Dùng findOneAndDelete thay vì remove để có thể truy cập vào document đã xóa
movieRatingSchema.post('findOneAndDelete', async function(doc) {
    if (doc) {
        await doc.constructor.calculateAverageRatings(doc.movie);
    }
});


module.exports = mongoose.model('MovieRating', movieRatingSchema);