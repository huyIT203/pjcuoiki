const mongoose = require('mongoose');

const shippingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Shipping method must have a name'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Shipping method must have a price'],
    min: [0, 'Shipping price cannot be negative']
  },
  estimatedDays: {
    min: {
      type: Number,
      required: [true, 'Minimum estimated days required']
    },
    max: {
      type: Number,
      required: [true, 'Maximum estimated days required']
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  freeShippingThreshold: {
    type: Number,
    default: null // null means no free shipping threshold
  },
  restrictions: {
    countries: [String], // countries where this shipping is available
    excludedCountries: [String], // countries where this shipping is not available
    weightLimit: {
      type: Number,
      default: null // null means no weight limit
    },
    dimensionLimit: {
      length: Number,
      width: Number,
      height: Number
    }
  },
  allowedPaymentMethods: [{
    type: String,
    enum: ['credit_card', 'paypal', 'bank_transfer', 'cash_on_delivery']
  }],
  handlingTime: {
    type: Number,
    default: 1 // days
  },
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

// Ensure only one default shipping method
shippingSchema.pre('save', async function(next) {
  if (this.isDefault) {
    // Set all other shipping methods to non-default
    await this.constructor.updateMany(
      { 
        _id: { $ne: this._id },
        isDefault: true
      },
      { isDefault: false }
    );
  }
  this.updatedAt = Date.now();
  next();
});

// Method to check if shipping is free based on order total
shippingSchema.methods.isFreeShipping = function(orderTotal) {
  if (!this.freeShippingThreshold) return false;
  return orderTotal >= this.freeShippingThreshold;
};

// Method to check if shipping is available for a specific country
shippingSchema.methods.isAvailableForCountry = function(country) {
  // If no restrictions, available everywhere
  if (!this.restrictions.countries.length && !this.restrictions.excludedCountries.length) {
    return true;
  }
  
  // If country is in excluded list, not available
  if (this.restrictions.excludedCountries.includes(country)) {
    return false;
  }
  
  // If specific countries are listed and country is not there, not available
  if (this.restrictions.countries.length && !this.restrictions.countries.includes(country)) {
    return false;
  }
  
  return true;
};

const Shipping = mongoose.model('Shipping', shippingSchema);

module.exports = Shipping; 