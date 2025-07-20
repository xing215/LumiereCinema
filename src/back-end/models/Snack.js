const mongoose = require('mongoose');

const snackSchema = new mongoose.Schema({
  branch: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Branch',
  required: true,
  },
  
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

  description: {
    type: String,
    trim: true,
  },
  
  imageURL: {
    type: String,
    required: true,
  },

  price: {
    type: Number,
    required: true,
    min: 0,
  },
  
  discountedPrice: {
    type: Number,
    validate: {
      validator: function(value) {
        return value <= this.price;
      }
    }
  },
  
  // Stock: Inventory quantity
  stock: {
    type: Number,
    default: 0,
  },

  // IsHidden: Product visibility status on menu
  isHidden: {
    type: Boolean,
    default: false,
  },

  // Field to track reserved stock:
  reserved: {
    type: Number,
    default: 0,
    validate: {
      validator: function(value) {
        return value <= this.stock; // Reserved cannot be greater than stock
      }
    }
  }

}, { timestamps: true }); // Automatically manage CreateDate (createdAt) and LastUpdate (updatedAt)

// Indexes for performance:
snackSchema.index({ branch: 1, isHidden: 1 }); // Query snacks by branch
snackSchema.index({ branch: 1, stock: 1 }); // Check availability


module.exports = mongoose.model('Snack', snackSchema);