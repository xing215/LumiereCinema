const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({

  title: { type: String, required: true, unique: true, trim: true },
  posterURL: { type: String, required: true },
  description: { type: String, required: true, trim: true },
  trailerURL: { type: String, default: '' },

  releaseDate: { type: Date, required: true },
  duration: { type: Number, required: true }, // phút
  genre: { type: [String], required: true },
  director: { type: String, required: true, trim: true },
  cast: { type: [String], required: true },
  language: { type: String, required: true },

  status: { 
    type: String, 
    required: true, 
    enum: ['Now Showing', 'Upcoming', 'Archived'], 
    default: 'Upcoming' 
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

movieSchema.index({ status: 1, releaseDate: -1 });
module.exports = mongoose.model('Movie', movieSchema);