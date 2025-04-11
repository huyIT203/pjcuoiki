const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: [true, 'Inventory must be associated with a product']
  },
  quantity: {
    type: Number,
    required: [true, 'Inventory must have a quantity'],
    min: [0, 'Quantity cannot be negative'],
    default: 0
  },
  sku: {
    type: String,
    required: [true, 'Inventory must have a SKU (Stock Keeping Unit)'],
    unique: true,
    trim: true
  },
  variants: [{
    name: String,
    value: String,
    quantity: Number,
    sku: String
  }],
  reservedQuantity: {
    type: Number,
    default: 0
  },
  location: {
    warehouse: String,
    aisle: String,
    shelf: String,
    bin: String
  },
  lowStockThreshold: {
    type: Number,
    default: 10
  },
  supplier: {
    type: mongoose.Schema.ObjectId,
    ref: 'Supplier'
  },
  lastRestocked: Date,
  nextRestockDate: Date,
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
inventorySchema.index({ product: 1 });
inventorySchema.index({ sku: 1 });
inventorySchema.index({ quantity: 1 });

// Virtual for available quantity (total - reserved)
inventorySchema.virtual('availableQuantity').get(function() {
  return this.quantity - this.reservedQuantity;
});

// Virtual for low stock status
inventorySchema.virtual('isLowStock').get(function() {
  return this.quantity <= this.lowStockThreshold;
});

// Query middleware: populate product and supplier
inventorySchema.pre(/^find/, function(next) {
  this.populate({
    path: 'product',
    select: 'name price'
  }).populate({
    path: 'supplier',
    select: 'name contactInfo'
  });
  
  next();
});

// Update the updatedAt field when updating inventory
inventorySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Inventory = mongoose.model('Inventory', inventorySchema);

module.exports = Inventory; 