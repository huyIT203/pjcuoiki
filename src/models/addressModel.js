const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Address must belong to a user']
  },
  addressType: {
    type: String,
    enum: ['shipping', 'billing'],
    default: 'shipping'
  },
  fullName: {
    type: String,
    required: [true, 'Address must have a full name']
  },
  addressLine1: {
    type: String,
    required: [true, 'Address must have an address line 1']
  },
  addressLine2: String,
  city: {
    type: String,
    required: [true, 'Address must have a city']
  },
  state: {
    type: String,
    required: [true, 'Address must have a state']
  },
  postalCode: {
    type: String,
    required: [true, 'Address must have a postal code']
  },
  country: {
    type: String,
    required: [true, 'Address must have a country']
  },
  phone: {
    type: String,
    required: [true, 'Address must have a phone number']
  },
  isDefault: {
    type: Boolean,
    default: false
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
addressSchema.index({ user: 1, addressType: 1 });

// Set one default address per type
addressSchema.pre('save', async function(next) {
  if (this.isDefault) {
    // Set all other addresses of the same type to non-default
    await this.constructor.updateMany(
      { 
        user: this.user, 
        addressType: this.addressType,
        _id: { $ne: this._id },
        isDefault: true
      },
      { isDefault: false }
    );
  }
  next();
});

const Address = mongoose.model('Address', addressSchema);

module.exports = Address; 