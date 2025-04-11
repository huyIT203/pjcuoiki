const Category = require('../models/categoryModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Get all categories
exports.getAllCategories = catchAsync(async (req, res, next) => {
  const categories = await Category.find();
  
  res.status(200).json({
    status: 'success',
    results: categories.length,
    data: {
      categories
    }
  });
});

// Get a category by ID
exports.getCategoryById = catchAsync(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  
  if (!category) {
    return next(new AppError('No category found with that ID', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      category
    }
  });
});

// Create a new category
exports.createCategory = catchAsync(async (req, res, next) => {
  const newCategory = await Category.create(req.body);
  
  res.status(201).json({
    status: 'success',
    data: {
      category: newCategory
    }
  });
});

// Update a category
exports.updateCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  if (!category) {
    return next(new AppError('No category found with that ID', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      category
    }
  });
});

// Delete a category
exports.deleteCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  
  if (!category) {
    return next(new AppError('No category found with that ID', 404));
  }
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Get products by category
exports.getCategoryProducts = catchAsync(async (req, res, next) => {
  const category = await Category.findById(req.params.id).populate('products');
  
  if (!category) {
    return next(new AppError('No category found with that ID', 404));
  }
  
  res.status(200).json({
    status: 'success',
    results: category.products.length,
    data: {
      products: category.products
    }
  });
}); 