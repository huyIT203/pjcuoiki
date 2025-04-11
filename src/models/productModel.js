const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A product must have a name'],
    trim: true,
    maxlength: [100, 'A product name must have less than or equal to 100 characters']
  },
  slug: {
    type: String,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'A product must have a description'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'A product must have a price'],
    min: [0, 'Price cannot be negative']
  },
  priceDiscount: {
    type: Number,
    validate: {
      validator: function(val) {
        // this only points to current doc on NEW document creation
        return val < this.price;
      },
      message: 'Discount price ({VALUE}) should be below regular price'
    }
  },
  images: [String],
  category: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
    required: [true, 'A product must belong to a category']
  },
  brand: {
    type: mongoose.Schema.ObjectId,
    ref: 'Brand'
  },
  attributes: [{
    name: String,
    value: String
  }],
  variants: [{
    name: String,
    options: [String],
    prices: [Number]
  }],
  ratingsAverage: {
    type: Number,
    default: 0,
    min: [0, 'Rating must be above or equal to 0'],
    max: [5, 'Rating must be below or equal to 5'],
    set: val => Math.round(val * 10) / 10 // 4.666666 -> 4.7
  },
  ratingsQuantity: {
    type: Number,
    default: 0
  },
  stock: {
    type: Number,
    required: [true, 'A product must have stock quantity'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  seller: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A product must belong to a seller']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual populate for reviews
productSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'product',
  localField: '_id'
});

// Indexes for better query performance
productSchema.index({ price: 1, ratingsAverage: -1 });
productSchema.index({ slug: 1 });

// Document middleware: runs before .save() and .create()
productSchema.pre('save', function(next) {
  this.slug = this.name.toLowerCase().split(' ').join('-');
  next();
});

// Query middleware: populate seller and category automatically
productSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'seller',
    select: 'name email'
  }).populate({
    path: 'category',
    select: 'name'
  }).populate({
    path: 'brand',
    select: 'name'
  });
  
  next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product; 