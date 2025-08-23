const mongoose = require('mongoose');

const loyaltyRankSchema = new mongoose.Schema(
    {
        // Rank name (acts as Primary Key), example: 'BRONZE', 'SILVER'
        rankName: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },

        // User-friendly display name
        displayName: {
            type: String,
            required: true,
            trim: true,
        },

        // Minimum points required for user to reach this tier
        minimumPoints: {
            type: Number,
            required: true,
            default: 0,
        },

        // Short description of benefits for this tier
        description: {
            type: String,
            default: '',
        },

        // Reference to a default promotion code for this tier
        // Example: Gold tier gets 10% discount on all tickets
        defaultPromotion: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Promotion',
        },
    },
    { timestamps: false },
); // Configuration data, no timestamps needed

module.exports = mongoose.model('LoyaltyRank', loyaltyRankSchema);
