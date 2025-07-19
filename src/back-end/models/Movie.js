const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({

  title: { type: String, required: true, unique: true, trim: true },
  posterURL: { type: String, required: true },
  description: { type: String, required: true, trim: true },
  trailerURL: { type: String, default: '' },

  releaseDate: { type: Date, required: true },
  duration: { type: Number, required: true }, // Duration in minutes
  genre: { type: [String], required: true },
  director: { type: String, required: true, trim: true },
  cast: { type: [String], required: true },
  language: { type: String},

  // Soft delete flag - true means movie is hidden/deleted
  isHidden: { 
    type: Boolean, 
    required: true, 
    default: false 
  },
  ageRating: { 
    type: String, 
    required: true, 
    enum: ['P', 'K', 'T13', 'T16', 'T18', 'C'], 
    default: 'P'
  },
  
  ratingsAverage: { type: Number, default: 0, min: 0, max: 5 },
  ratingsQuantity: { type: Number, default: 0 },
  
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

movieSchema.index({ isHidden: 1, releaseDate: -1 });
module.exports = mongoose.model('Movie', movieSchema);