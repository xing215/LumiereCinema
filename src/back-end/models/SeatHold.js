const mongoose = require('mongoose');

const seatHoldSchema = new mongoose.Schema(
    {
        // Reference to specific schedule
        schedule: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Schedule',
            required: true,
            index: true, // Speed up queries by schedule
        },

        // Held seat name (A1, B5, etc.)
        seatNumber: {
            type: String,
            required: true,
            trim: true,
        },

        // User holding the seat (can be null for guest users)
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },

        // Session ID for guest users (alternative to user)
        sessionId: {
            type: String,
            default: null,
        },

        // Expiration time (TTL will auto delete)
        expiresAt: {
            type: Date,
            required: true,
            default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
            index: { expireAfterSeconds: 0 }, // TTL Index - MongoDB auto cleanup
        },

        // Additional metadata
        holdReason: {
            type: String,
            enum: ['customer_selection', 'payment_processing', 'admin_hold'],
            default: 'customer_selection',
        },
    },
    {
        timestamps: true,
        // Automatically delete document when expired
        expireAfterSeconds: 0,
    },
);

// ✨ CRITICAL: Unique compound index to ensure one seat can only be held by one user
seatHoldSchema.index(
    { schedule: 1, seatNumber: 1 },
    {
        unique: true,
        name: 'unique_seat_hold', // Explicit index name
    },
);

// Index for fast query by user
seatHoldSchema.index({ user: 1, expiresAt: 1 });

// Validation: Must have either user OR sessionId
seatHoldSchema.pre('validate', function (next) {
    if (!this.user && !this.sessionId) {
        return next(new Error('Either user or sessionId must be provided'));
    }
    next();
});

// Static method to manually cleanup expired holds (backup for TTL)
seatHoldSchema.statics.cleanupExpiredHolds = async function () {
    const now = new Date();
    const result = await this.deleteMany({ expiresAt: { $lte: now } });
    return result.deletedCount;
};

// Instance method to extend hold time
seatHoldSchema.methods.extendHold = function (additionalMinutes = 5) {
    this.expiresAt = new Date(this.expiresAt.getTime() + additionalMinutes * 60 * 1000);
    return this.save();
};

module.exports = mongoose.model('SeatHold', seatHoldSchema);
