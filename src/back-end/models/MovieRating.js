const mongoose = require('mongoose');

const movieRatingSchema = new mongoose.Schema(
    {
        // Field name in ERD is 'Star'
        star: {
            type: Number,
            required: [true, 'Star rating cannot be empty.'],
            min: 1,
            max: 5,
        },

        // Add comment field so users can write reviews
        comment: {
            type: String,
            trim: true,
        },

        // UserId (FK): Reference to the user who rated
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        // MovieId (FK): Reference to the movie being rated
        movie: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Movie',
            required: true,
        },
    },
    { timestamps: true },
);

/**
 * ==================================================================================
 * INDEXES
 * ==================================================================================
 * Create a compound index to ensure each user can only rate a movie ONCE.
 * This is an important business rule.
 */
movieRatingSchema.index({ movie: 1, user: 1 }, { unique: true });

/**
 * ==================================================================================
 * STATIC METHOD & MIDDLEWARE
 * ==================================================================================
 * Important logic: Automatically calculate and update average rating (ratingsAverage)
 * and total number of ratings (ratingsQuantity) in MovieModel whenever a rating
 * is added, updated, or deleted.
 */

// 1. Create a static function to calculate
movieRatingSchema.statics.calculateAverageRatings = async function (movieId) {
    const stats = await this.aggregate([
        {
            $match: { movie: movieId },
        },
        {
            $group: {
                _id: '$movie',
                numRatings: { $sum: 1 },
                avgRating: { $avg: '$star' },
            },
        },
    ]);

    // Update the corresponding Movie document
    if (stats.length > 0) {
        await mongoose.model('Movie').findByIdAndUpdate(movieId, {
            ratingsQuantity: stats[0].numRatings,
            ratingsAverage: stats[0].avgRating,
        });
    } else {
        // If there are no ratings left, return default values
        await mongoose.model('Movie').findByIdAndUpdate(movieId, {
            ratingsQuantity: 0,
            ratingsAverage: 0,
        });
    }
};

// 2. Call that static function after a rating is SAVED (created or updated)
movieRatingSchema.post('save', function () {
    // 'this.constructor' is the MovieRatingModel
    this.constructor.calculateAverageRatings(this.movie);
});

// 3. Call that static function after a rating is DELETED
// Use findOneAndDelete instead of remove to access the deleted document
movieRatingSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await doc.constructor.calculateAverageRatings(doc.movie);
    }
});

module.exports = mongoose.model('MovieRating', movieRatingSchema);
