const express = require('express');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const {
  getAllOrders,
  getUserOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  cancelOrder,
  generateInvoice,
  addOrderNote,
  processRefund
} = require('../controllers/orderController');

const router = express.Router();

// Protected routes
router.use(protect);

// User routes
router.get('/myorders', getUserOrders);
router.post('/', createOrder);
router.get('/:id', getOrderById);
router.patch('/:id/cancel', cancelOrder);
router.get('/:id/invoice', generateInvoice);

// Admin routes
router.use(restrictTo('admin'));
router.get('/', getAllOrders);
router.patch('/:id/status', updateOrderStatus);
router.post('/:id/notes', addOrderNote);
router.post('/:id/refund', processRefund);

module.exports = router; 