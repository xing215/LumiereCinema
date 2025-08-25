const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

const ticketSchema = new mongoose.Schema(
    {
        // Unique ticket code, auto-generated
        ticketCode: {
            type: String,
            required: true,
            unique: true,
            immutable: true,
        },
        // Customer reference
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },

        // Guest customer information
        noLoginCustomerInfo: {
            name: { type: String },
            phone: { type: String },
            email: { type: String },
        },

        // Staff member who sold the ticket (for counter sales)
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },

        // Branch reference for quick queries without populate
        branch: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Branch',
            required: true,
            index: true,
        },

        schedule: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Schedule',
            required: true,
        },

        // List of seat names booked in this ticket
        seats: {
            type: [String], // Array of seat names, e.g., ["A1", "A2", "A3"]
            required: true,
        },

        // Applied promotion reference
        promotion: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Promotion',
        },

        // Final total amount
        total: {
            type: Number,
            required: true,
            min: 0,
        },

        // Ticket status
        status: {
            type: String,
            enum: ['Confirmed', 'CheckedIn', 'Cancelled'], // 'Confirmed' & 'CheckedIn' are valid
            default: 'Confirmed',
        },

        lastScanAt: {
            type: Date,
            default: null,
        },
        ticketType: {
            type: String,
            enum: ['Movie'],
            default: 'Movie',
            immutable: true,
        },

        adultTickets: {
            type: Number,
            required: true,
            min: 0,
        },

        discountedTickets: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    { timestamps: true },
); // Use timestamps for CreatedDate (createdAt) and LastAccess (updatedAt)

// Custom validation: must have either customer or complete guest info
ticketSchema.pre('validate', function (next) {
    const hasCustomer = !!this.customer;
    const info = this.noLoginCustomerInfo || {};
    const hasGuestInfo = info.name;
    if (!hasCustomer && !hasGuestInfo) {
        return next(
            new Error(
                'Customer information is required: either a logged-in customer or full name, email, and phone number must be provided.',
            ),
        );
    }
    next();
});

// Auto-generate ticketCode
ticketSchema.pre('validate', function (next) {
    if (this.isNew) {
        this.ticketCode = nanoid(10).toUpperCase();
    }
    next();
});

// Thêm index cho ticketCode để tăng tốc độ lookup
ticketSchema.index({ ticketCode: 1 });

// Compound index cho các query phổ biến
ticketSchema.index({ branch: 1, status: 1 });
ticketSchema.index({ customer: 1, status: 1 });

module.exports = mongoose.model('Ticket', ticketSchema);
