const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Cart must belong to a user']
  },
  items: [{
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: [true, 'Cart item must have a product']
    },
    quantity: {
      type: Number,
      required: [true, 'Cart item must have a quantity'],
      min: [1, 'Quantity must be at least 1'],
      default: 1
    },
    variant: {
      name: String,
      value: String
    }
  }],
  modifiedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
cartSchema.index({ user: 1 });

// Query middleware: populate user and products automatically
cartSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'items.product',
    select: 'name price images stock'
  });
  
  next();
});

// Calculate total cart value
cartSchema.virtual('totalCartValue').get(function() {
  return this.items.reduce((total, item) => {
    return total + (item.product.price * item.quantity);
  }, 0);
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart; 