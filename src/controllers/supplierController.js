const Supplier = require('../models/supplierModel');
const Product = require('../models/productModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Get all suppliers
exports.getAllSuppliers = catchAsync(async (req, res, next) => {
  const suppliers = await Supplier.find();
  
  res.status(200).json({
    status: 'success',
    results: suppliers.length,
    data: {
      suppliers
    }
  });
});

// Get active suppliers
exports.getActiveSuppliers = catchAsync(async (req, res, next) => {
  const suppliers = await Supplier.find({ status: 'active' });
  
  res.status(200).json({
    status: 'success',
    results: suppliers.length,
    data: {
      suppliers
    }
  });
});

// Get a supplier by ID
exports.getSupplierById = catchAsync(async (req, res, next) => {
  const supplier = await Supplier.findById(req.params.id);
  
  if (!supplier) {
    return next(new AppError('No supplier found with that ID', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      supplier
    }
  });
});

// Get products from a supplier
exports.getSupplierProducts = catchAsync(async (req, res, next) => {
  const products = await Product.find({ supplier: req.params.id });
  
  res.status(200).json({
    status: 'success',
    results: products.length,
    data: {
      products
    }
  });
});

// Create a new supplier
exports.createSupplier = catchAsync(async (req, res, next) => {
  const newSupplier = await Supplier.create(req.body);
  
  res.status(201).json({
    status: 'success',
    data: {
      supplier: newSupplier
    }
  });
});

// Update a supplier
exports.updateSupplier = catchAsync(async (req, res, next) => {
  const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  if (!supplier) {
    return next(new AppError('No supplier found with that ID', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      supplier
    }
  });
});

// Delete a supplier
exports.deleteSupplier = catchAsync(async (req, res, next) => {
  const supplier = await Supplier.findByIdAndDelete(req.params.id);
  
  if (!supplier) {
    return next(new AppError('No supplier found with that ID', 404));
  }
  
  // Check if supplier has products
  const supplierProducts = await Product.countDocuments({ supplier: req.params.id });
  
  if (supplierProducts > 0) {
    return next(new AppError('Cannot delete supplier with associated products', 400));
  }
  
  res.status(204).json({
    status: 'success',
    data: null
  });
}); 