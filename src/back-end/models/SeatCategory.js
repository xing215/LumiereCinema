const mongoose = require('mongoose');

const seatCategorySchema = new mongoose.Schema(
    {
        shortname: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        Fee: { type: Number, required: true, default: 0 },
        FeeForSpecial: {
            type: Number,
            required: true,
            default: 0,
        },
    },
    { timestamps: false },
);

seatCategorySchema.pre('save', function (next) {
    this._id = this.shortname;
    next();
});

module.exports = mongoose.model('SeatCategory', seatCategorySchema);
