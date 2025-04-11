const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Payment must belong to a user']
  },
  order: {
    type: mongoose.Schema.ObjectId,
    ref: 'Order',
    required: [true, 'Payment must be associated with an order']
  },
  amount: {
    type: Number,
    required: [true, 'Payment must have an amount']
  },
  currency: {
    type: String,
    required: [true, 'Payment must have a currency'],
    default: 'USD'
  },
  method: {
    type: String,
    required: [true, 'Payment must have a method'],
    enum: ['credit_card', 'paypal', 'bank_transfer', 'cash_on_delivery']
  },
  status: {
    type: String,
    required: [true, 'Payment must have a status'],
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionId: String,
  paymentDetails: {
    cardType: String,
    last4: String,
    paypalEmail: String,
    bankReference: String
  },
  billingAddress: {
    type: mongoose.Schema.ObjectId,
    ref: 'Address'
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  refundReason: String,
  refundedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
paymentSchema.index({ user: 1, order: 1 });
paymentSchema.index({ createdAt: -1 });

// Query middleware: populate user and order
paymentSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name email'
  }).populate({
    path: 'order',
    select: 'orderStatus totalAmount'
  }).populate({
    path: 'billingAddress',
    select: '-__v'
  });
  
  next();
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment; 