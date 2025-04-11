const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Get all orders (admin only)
exports.getAllOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.find().populate({
    path: 'user',
    select: 'name email'
  });
  
  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: {
      orders
    }
  });
});

// Get orders for the logged-in user
exports.getUserOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.find({ user: req.user.id });
  
  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: {
      orders
    }
  });
});

// Get a single order by ID
exports.getOrderById = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate({
    path: 'user',
    select: 'name email'
  });
  
  if (!order) {
    return next(new AppError('No order found with that ID', 404));
  }
  
  // Check if the user is authorized to view this order
  if (req.user.role !== 'admin' && order.user.toString() !== req.user.id) {
    return next(new AppError('You are not authorized to access this order', 403));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      order
    }
  });
});

// Create a new order
exports.createOrder = catchAsync(async (req, res, next) => {
  try {
    // Add user ID to order
    req.body.user = req.user.id;
    
    // Check if items exist
    if (!req.body.items || !Array.isArray(req.body.items) || req.body.items.length === 0) {
      return next(new AppError('Please add at least one item to the order', 400));
    }
    
    // Check if Product model is available
    if (!Product) {
      console.error('Product model is not defined');
      return next(new AppError('Internal server error - Product model not available', 500));
    }
    
    // Check product availability and calculate total price
    let totalPrice = 0;
    const orderItems = req.body.items;
    
    // Validate products and calculate price
    for (const item of orderItems) {
      try {
        const product = await Product.findById(item.product);
        
        if (!product) {
          return next(new AppError(`Product not found with ID: ${item.product}`, 404));
        }
        
        if (product.stock < item.quantity) {
          return next(new AppError(`Not enough stock for product: ${product.name}`, 400));
        }
        
        // Add price from product to order item
        item.price = product.price;
        totalPrice += product.price * item.quantity;
        
        // Update product stock
        product.stock -= item.quantity;
        await product.save();
      } catch (err) {
        console.error(`Error processing product ${item.product}:`, err);
        return next(new AppError(`Error processing product: ${err.message}`, 500));
      }
    }
    
    // Add total price to order if not provided
    if (!req.body.totalPrice) {
      req.body.totalPrice = totalPrice + (req.body.shippingPrice || 0) + (req.body.taxPrice || 0);
    }
    
    // Create the order
    const newOrder = await Order.create(req.body);
    
    res.status(201).json({
      status: 'success',
      data: {
        order: newOrder
      }
    });
  } catch (err) {
    console.error('Error creating order:', err);
    return next(new AppError(`Error creating order: ${err.message}`, 500));
  }
});

// Update order status (admin only)
exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;
  
  if (!status) {
    return next(new AppError('Please provide order status', 400));
  }
  
  const order = await Order.findById(req.params.id);
  
  if (!order) {
    return next(new AppError('No order found with that ID', 404));
  }
  
  order.status = status;
  order.updatedAt = Date.now();
  
  if (status === 'delivered') {
    order.deliveredAt = Date.now();
  }
  
  await order.save();
  
  res.status(200).json({
    status: 'success',
    data: {
      order
    }
  });
});

// Cancel an order
exports.cancelOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  
  if (!order) {
    return next(new AppError('No order found with that ID', 404));
  }
  
  // Check if the user is authorized to cancel this order
  if (req.user.role !== 'admin' && order.user.toString() !== req.user.id) {
    return next(new AppError('You are not authorized to cancel this order', 403));
  }
  
  // Check if order can be canceled (e.g., not already shipped or delivered)
  if (['shipped', 'delivered', 'cancelled'].includes(order.status)) {
    return next(new AppError(`Order cannot be cancelled in "${order.status}" status`, 400));
  }
  
  // Update product stock
  for (const item of order.items) {
    const product = await Product.findById(item.product);
    if (product) {
      product.stock += item.quantity;
      await product.save();
    }
  }
  
  order.status = 'cancelled';
  order.cancelledAt = Date.now();
  await order.save();
  
  res.status(200).json({
    status: 'success',
    data: {
      order
    }
  });
});

// Generate invoice for an order
exports.generateInvoice = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate({
      path: 'user',
      select: 'name email'
    })
    .populate({
      path: 'items.product',
      select: 'name price'
    });
  
  if (!order) {
    return next(new AppError('No order found with that ID', 404));
  }
  
  // Check if the user is authorized to view this invoice
  if (req.user.role !== 'admin' && order.user._id.toString() !== req.user.id) {
    return next(new AppError('You are not authorized to access this invoice', 403));
  }
  
  // Generate invoice data
  const invoice = {
    orderID: order._id,
    orderDate: order.createdAt,
    customerName: order.user.name,
    customerEmail: order.user.email,
    shippingAddress: order.shippingAddress,
    billingAddress: order.billingAddress,
    paymentMethod: order.paymentMethod,
    status: order.status,
    items: order.items.map(item => ({
      product: item.product.name,
      quantity: item.quantity,
      price: item.price,
      total: item.price * item.quantity
    })),
    totalPrice: order.totalPrice
  };
  
  res.status(200).json({
    status: 'success',
    data: {
      invoice
    }
  });
});

// Add note to an order (admin only)
exports.addOrderNote = catchAsync(async (req, res, next) => {
  const { note } = req.body;
  
  if (!note) {
    return next(new AppError('Please provide a note', 400));
  }
  
  const order = await Order.findById(req.params.id);
  
  if (!order) {
    return next(new AppError('No order found with that ID', 404));
  }
  
  const newNote = {
    text: note,
    user: req.user.id,
    createdAt: Date.now()
  };
  
  order.notes.push(newNote);
  await order.save();
  
  res.status(200).json({
    status: 'success',
    data: {
      note: newNote
    }
  });
});

// Process refund for an order (admin only)
exports.processRefund = catchAsync(async (req, res, next) => {
  const { amount, reason } = req.body;
  
  if (!amount || !reason) {
    return next(new AppError('Please provide refund amount and reason', 400));
  }
  
  const order = await Order.findById(req.params.id);
  
  if (!order) {
    return next(new AppError('No order found with that ID', 404));
  }
  
  if (order.status !== 'delivered' && order.status !== 'cancelled') {
    return next(new AppError(`Cannot process refund for order in "${order.status}" status`, 400));
  }
  
  if (amount > order.totalPrice) {
    return next(new AppError('Refund amount cannot exceed order total', 400));
  }
  
  const refund = {
    amount,
    reason,
    processedBy: req.user.id,
    processedAt: Date.now()
  };
  
  order.refund = refund;
  order.refundStatus = 'processed';
  await order.save();
  
  res.status(200).json({
    status: 'success',
    data: {
      refund
    }
  });
}); 