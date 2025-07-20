const mongoose = require('mongoose');

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

// Indexes to ensure no schedule conflicts and speed up queries
scheduleSchema.index({ screen: 1, startTime: 1 }, { unique: true });
scheduleSchema.index({ movie: 1, startTime: 1 });
// Index for fast seat availability queries
scheduleSchema.index({ OccupiedSeat: 1 });

module.exports = mongoose.model('Schedule', scheduleSchema);