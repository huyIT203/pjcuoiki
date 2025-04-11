const mongoose = require('mongoose');

const attributeValueSchema = new mongoose.Schema({
  attribute: {
    type: mongoose.Schema.ObjectId,
    ref: 'Attribute',
    required: [true, 'Attribute value must belong to an attribute']
  },
  value: {
    type: String,
    required: [true, 'Attribute value must have a value'],
    trim: true
  },
  displayName: {
    type: String,
    trim: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  isDefault: {
    type: Boolean,
    default: false
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

// Compound index to ensure unique values per attribute
attributeValueSchema.index({ attribute: 1, value: 1 }, { unique: true });

// Update the updatedAt field when updating attribute value
attributeValueSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const AttributeValue = mongoose.model('AttributeValue', attributeValueSchema);

module.exports = AttributeValue; 