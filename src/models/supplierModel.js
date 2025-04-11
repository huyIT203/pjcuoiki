const mongoose = require('mongoose');
const validator = require('validator');

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Supplier must have a name'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  contactInfo: {
    email: {
      type: String,
      required: [true, 'Supplier must have an email'],
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email']
    },
    phone: {
      type: String,
      required: [true, 'Supplier must have a phone number']
    },
    contactPerson: String,
    website: String
  },
  address: {
    street: {
      type: String,
      required: [true, 'Supplier must have a street address']
    },
    city: {
      type: String,
      required: [true, 'Supplier must have a city']
    },
    state: {
      type: String,
      required: [true, 'Supplier must have a state']
    },
    postalCode: {
      type: String,
      required: [true, 'Supplier must have a postal code']
    },
    country: {
      type: String,
      required: [true, 'Supplier must have a country']
    }
  },
  paymentTerms: {
    type: String,
    enum: ['net_30', 'net_60', 'net_90', 'immediate'],
    default: 'net_30'
  },
  minimumOrderValue: {
    type: Number,
    default: 0
  },
  leadTime: {
    type: Number, // days
    default: 7
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'blacklisted'],
    default: 'active'
  },
  taxId: String,
  products: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Product'
  }],
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  notes: String,
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

// Indexes for better query performance
supplierSchema.index({ name: 1 });
supplierSchema.index({ status: 1 });
supplierSchema.index({ 'contactInfo.email': 1 });

// Update the updatedAt field when updating supplier
supplierSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual populate for products
supplierSchema.virtual('productCount').get(function() {
  return this.products ? this.products.length : 0;
});

const Supplier = mongoose.model('Supplier', supplierSchema);

module.exports = Supplier; 