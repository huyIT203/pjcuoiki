const mongoose = require('mongoose');

const attributeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Attribute must have a name'],
    unique: true,
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Attribute must have a code'],
    unique: true,
    trim: true,
    lowercase: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Attribute must have a type'],
    enum: ['text', 'number', 'boolean', 'date', 'color', 'select', 'multiselect'],
    default: 'text'
  },
  unit: String, // e.g., cm, kg, etc.
  options: [String], // for select and multiselect types
  defaultValue: mongoose.Schema.Types.Mixed,
  values: [{
    type: mongoose.Schema.ObjectId,
    ref: 'AttributeValue'
  }],
  isRequired: {
    type: Boolean,
    default: false
  },
  isFilterable: {
    type: Boolean,
    default: false
  },
  isSearchable: {
    type: Boolean,
    default: false
  },
  isComparable: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  categories: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Category'
  }],
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
attributeSchema.index({ code: 1 });
attributeSchema.index({ name: 1 });
attributeSchema.index({ isFilterable: 1 });
attributeSchema.index({ isSearchable: 1 });

// Update the updatedAt field when updating attribute
attributeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Populate categories and values on find operations
attributeSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'categories',
    select: 'name'
  }).populate({
    path: 'values',
    select: 'value displayName'
  });
  
  next();
});

const Attribute = mongoose.model('Attribute', attributeSchema);

module.exports = Attribute; 