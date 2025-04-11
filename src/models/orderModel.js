const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Order must belong to a user']
  },
  items: [
    {
      product: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: [true, 'Order item must have a product']
      },
      quantity: {
        type: Number,
        required: [true, 'Order item must have a quantity'],
        min: [1, 'Quantity must be at least 1']
      },
      price: {
        type: Number,
        required: [true, 'Order item must have a price']
      }
    }
  ],
  totalPrice: {
    type: Number,
    required: [true, 'Order must have a total price']
  },
  shippingAddress: {
    street: {
      type: String,
      required: [true, 'Shipping address must have a street']
    },
    city: {
      type: String,
      required: [true, 'Shipping address must have a city']
    },
    state: {
      type: String,
      required: [true, 'Shipping address must have a state']
    },
    postalCode: {
      type: String,
      required: [true, 'Shipping address must have a postal code']
    },
    country: {
      type: String,
      required: [true, 'Shipping address must have a country'],
      default: 'Vietnam'
    }
  },
  billingAddress: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  paymentMethod: {
    type: String,
    required: [true, 'Order must have a payment method'],
    enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash_on_delivery'],
    default: 'cash_on_delivery'
  },
  paymentResult: {
    id: String,
    status: String,
    update_time: String,
    email_address: String
  },
  taxPrice: {
    type: Number,
    required: [true, 'Order must have a tax price'],
    default: 0
  },
  shippingPrice: {
    type: Number,
    required: [true, 'Order must have a shipping price'],
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  coupon: {
    type: mongoose.Schema.ObjectId,
    ref: 'Coupon'
  },
  status: {
    type: String,
    required: [true, 'Order must have a status'],
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  notes: [
    {
      text: String,
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  refund: {
    amount: Number,
    reason: String,
    processedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    processedAt: Date
  },
  refundStatus: {
    type: String,
    enum: ['none', 'requested', 'processing', 'processed', 'rejected'],
    default: 'none'
  },
  paidAt: Date,
  deliveredAt: Date,
  cancelledAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Update the updatedAt field on save
orderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Populate fields on find
orderSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name email'
  }).populate({
    path: 'items.product',
    select: 'name price images'
  });
  
  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order; 