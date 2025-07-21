const mongoose = require('mongoose');

// (Optional) A sub-schema to store geographic coordinates (GeoJSON)
// Very useful for features like "Find cinemas near you"
const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true
  },
  coordinates: {
    type: [Number], // Format: [longitude, latitude]
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
  
  // Cinema image URL
  imageURL: {
    type: String,
    default: ''
  },
  
  // Coordinates on map for Google Maps integration
  location: {
    type: pointSchema,
    // Create 2dsphere index to optimize geospatial queries
    index: '2dsphere'
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Branch', branchSchema);
