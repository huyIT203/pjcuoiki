const Attribute = require('../models/attributeModel');
const AttributeValue = require('../models/attributeValueModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Get all attributes
exports.getAllAttributes = catchAsync(async (req, res, next) => {
  const attributes = await Attribute.find().populate('values');
  
  res.status(200).json({
    status: 'success',
    results: attributes.length,
    data: {
      attributes
    }
  });
});

// Get attribute by ID
exports.getAttributeById = catchAsync(async (req, res, next) => {
  const attribute = await Attribute.findById(req.params.id).populate('values');
  
  if (!attribute) {
    return next(new AppError('No attribute found with that ID', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      attribute
    }
  });
});

// Get attribute values
exports.getAttributeValues = catchAsync(async (req, res, next) => {
  const attribute = await Attribute.findById(req.params.id);
  
  if (!attribute) {
    return next(new AppError('No attribute found with that ID', 404));
  }
  
  const values = await AttributeValue.find({ attribute: req.params.id });
  
  res.status(200).json({
    status: 'success',
    results: values.length,
    data: {
      values
    }
  });
});

// Create a new attribute
exports.createAttribute = catchAsync(async (req, res, next) => {
  const newAttribute = await Attribute.create(req.body);
  
  res.status(201).json({
    status: 'success',
    data: {
      attribute: newAttribute
    }
  });
});

// Update an attribute
exports.updateAttribute = catchAsync(async (req, res, next) => {
  const attribute = await Attribute.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  if (!attribute) {
    return next(new AppError('No attribute found with that ID', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      attribute
    }
  });
});

// Delete an attribute
exports.deleteAttribute = catchAsync(async (req, res, next) => {
  const attribute = await Attribute.findById(req.params.id);
  
  if (!attribute) {
    return next(new AppError('No attribute found with that ID', 404));
  }
  
  // Check if attribute has values
  const attributeValues = await AttributeValue.countDocuments({ attribute: req.params.id });
  
  if (attributeValues > 0) {
    return next(new AppError('Cannot delete attribute with associated values', 400));
  }
  
  await Attribute.findByIdAndDelete(req.params.id);
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Add attribute value
exports.addAttributeValue = catchAsync(async (req, res, next) => {
  // Check if attribute exists
  const attribute = await Attribute.findById(req.params.id);
  
  if (!attribute) {
    return next(new AppError('No attribute found with that ID', 404));
  }
  
  // Create new attribute value
  const newValue = await AttributeValue.create({
    attribute: req.params.id,
    value: req.body.value,
    displayName: req.body.displayName
  });
  
  // Update attribute's values array
  attribute.values.push(newValue._id);
  await attribute.save();
  
  res.status(201).json({
    status: 'success',
    data: {
      value: newValue
    }
  });
});

// Remove attribute value
exports.removeAttributeValue = catchAsync(async (req, res, next) => {
  // Check if attribute exists
  const attribute = await Attribute.findById(req.params.id);
  
  if (!attribute) {
    return next(new AppError('No attribute found with that ID', 404));
  }
  
  // Check if value exists
  const value = await AttributeValue.findById(req.params.valueId);
  
  if (!value) {
    return next(new AppError('No attribute value found with that ID', 404));
  }
  
  // Check if value belongs to attribute
  if (value.attribute.toString() !== req.params.id) {
    return next(new AppError('Attribute value does not belong to this attribute', 400));
  }
  
  // Remove value from attribute's values array
  attribute.values = attribute.values.filter(
    val => val.toString() !== req.params.valueId
  );
  await attribute.save();
  
  // Delete the attribute value
  await AttributeValue.findByIdAndDelete(req.params.valueId);
  
  res.status(204).json({
    status: 'success',
    data: null
  });
}); 