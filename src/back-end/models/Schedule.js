const mongoose = require('mongoose');
const { prepareScheduleDocument, generateEmbedding } = require('../utils/embeddingService');

const scheduleSchema = new mongoose.Schema({
  // Reference to the movie being screened
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true,
  },

  // Reference to the screening room
  screen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Screen',
    required: true,
  },
    // Start time (datetime)
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

  // End time (datetime - automatically calculated)
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
  // List of booked seats (only stores seat names)
  OccupiedSeat: [
    {
      type: String,
      required: true
    }
  ],
  embedding: { type: [Number] },
  embeddingText: { type: String },
  embeddingUpdatedAt: { type: Date }
}, { timestamps: true });

// Middleware to automatically calculate endTime
scheduleSchema.pre('save', async function(next) {
  if (this.isModified('startTime') || this.isNew) {
    const Movie = mongoose.model('Movie'); // Safely get Movie model
    const movie = await Movie.findById(this.movie);
    if (movie && movie.duration) {
      this.endTime = new Date(this.startTime.getTime() + movie.duration * 60 * 1000);
    }
  }
  next();
});

scheduleSchema.pre('save', async function(next) {
  // Chỉ chạy khi document là mới hoặc startTime thay đổi (vì embedding phụ thuộc vào ngày giờ)
  if (this.isNew || this.isModified('startTime')) {
    try {
      console.log(`📅 Auto-generating embedding for schedule...`);

      // Lấy các model cần thiết để populate dữ liệu thủ công
      const Movie = mongoose.model('Movie');
      const Screen = mongoose.model('Screen');
      
      // Lấy thông tin chi tiết của movie và screen (bao gồm cả branch)
      const movie = await Movie.findById(this.movie);
      const screen = await Screen.findById(this.screen).populate('branch');

      if (!movie || !screen || !screen.branch) {
        console.warn('Skipping embedding generation due to missing populated data.');
        return next(); // Bỏ qua nếu thiếu dữ liệu liên quan
      }

      // Tạo một object schedule tạm thời với dữ liệu đã được populate đầy đủ
      const populatedSchedule = { ...this.toObject(), movie, screen };
      
      const textToEmbed = prepareScheduleDocument(populatedSchedule);
      const embeddingVector = await generateEmbedding(textToEmbed);

      this.embedding = embeddingVector;
      this.embeddingText = textToEmbed;
      this.embeddingUpdatedAt = new Date();

      console.log(`✅ Embedding for schedule of "${movie.title}" at "${screen.branch.name}" updated successfully.`);

    } catch (error) {
      console.error(`❌ Failed to auto-generate embedding for schedule:`, error);
    }
  }
  next();
});

// Indexes to ensure no schedule conflicts and speed up queries
scheduleSchema.index({ screen: 1, startTime: 1 }, { unique: true });
scheduleSchema.index({ movie: 1, startTime: 1 });
// Index for fast seat availability queries
scheduleSchema.index({ OccupiedSeat: 1 });

module.exports = mongoose.model('Schedule', scheduleSchema);