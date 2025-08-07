const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({

  title: { type: String, required: true, unique: true, trim: true },
  posterURL: { type: String, required: true },
  description: { type: String, required: true, trim: true },
  trailerURL: { type: String, default: '' },

  releaseDate: { type: Date, required: true },
  duration: { type: Number, required: true }, // Duration in minutes
  genre: { type: [String], required: true },
  director: { type: String, default: '', trim: true },
  cast: { type: [String], default: [] },
  language: { type: String, default: '' },

  // Soft delete flag - true means movie is hidden/deleted
  isHidden: { 
    type: Boolean, 
    required: true, 
    default: true  // Changed to true as requested
  },
  ageRating: { 
    type: String, 
    required: true, 
    enum: ['P', 'K', 'T13', 'T16', 'T18', 'C'], 
    default: 'P'
  },
  
  // ratingsAverage: { type: Number, default: 0, min: 0, max: 5 },
  // ratingsQuantity: { type: Number, default: 0 },
  embedding: { type: [Number] },
  embeddingText: { type: String },
  embeddingUpdatedAt: { type: Date }
}, { timestamps: true });


// Add virtual properties for status based on current date
movieSchema.virtual('status').get(function() {
  const now = new Date();
  const releaseDate = new Date(this.releaseDate); 
  
  if (this.isHidden) {
    return 'Archived';
  } else if (releaseDate > now) {
    return 'Upcoming';
  } else {
    return 'Now Showing';
  }
});

// Add virtual property to check if movie is currently showing
movieSchema.virtual('isNowShowing').get(function() {
  const now = new Date();
  const releaseDate = new Date(this.releaseDate);
  return !this.isHidden && releaseDate <= now;
});

// Add virtual property to check if movie is upcoming
movieSchema.virtual('isUpcoming').get(function() {
  const now = new Date();
  const releaseDate = new Date(this.releaseDate);
  return !this.isHidden && releaseDate > now;
});

// Ensure virtual fields are serialized
movieSchema.set('toJSON', { virtuals: true });
movieSchema.set('toObject', { virtuals: true });

movieSchema.pre('save', async function(next) {
  // `this` ở đây chính là document phim sắp được lưu
  
  // Chỉ chạy khi document là mới, hoặc khi các trường văn bản quan trọng bị thay đổi
  if (this.isNew || this.isModified('title') || this.isModified('description') || this.isModified('genre') || this.isModified('director') || this.isModified('cast')) {
    try {
      console.log(`🎬 Auto-generating embedding for movie: "${this.title}"...`);
      
      // 1. Chuẩn bị văn bản từ document hiện tại
      const textToEmbed = prepareMovieDocument(this);
      
      // 2. Tạo embedding
      const embeddingVector = await generateEmbedding(textToEmbed);

      // 3. Gán embedding và các thông tin liên quan vào document
      this.embedding = embeddingVector;
      this.embeddingText = textToEmbed;
      this.embeddingUpdatedAt = new Date();
      
      console.log(`✅ Embedding for "${this.title}" updated successfully.`);

    } catch (error) {
      console.error(`❌ Failed to auto-generate embedding for "${this.title}":`, error);
      // Không chặn việc lưu, chỉ ghi lại lỗi
    }
  }
  
  // Tiếp tục quá trình lưu bình thường
  next();
});

movieSchema.index({ isHidden: 1, releaseDate: -1 });
module.exports = mongoose.model('Movie', movieSchema);