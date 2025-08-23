const mongoose = require('mongoose');

const screenSchema = new mongoose.Schema(
    {
        screenName: {
            type: String,
            required: true,
            trim: true,
        },

        // Reference to cinema complex
        branch: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Branch',
            required: true,
        },

        // Screening room size (number of rows, number of columns)
        size: {
            rows: { type: Number, required: true },
            columns: { type: Number, required: true },
        },

        // Screen type: 2D, 3D, etc.
        screenType: {
            type: String,
            required: true,
            enum: ['2D', '3D', 'IMAX', '4DX'],
        },

        // Active status
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true },
);

screenSchema.index({ screenName: 1, branch: 1 }, { unique: true });

module.exports = mongoose.model('Screen', screenSchema);
