const express = require('express');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Placeholder controller functions (to be implemented)
const paymentController = {
  getAllPayments: (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Get all payments'
    });
  },
  getUserPayments: (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Get user payments'
    });
  },
  getPaymentById: (req, res) => {
    res.status(200).json({
      success: true,
      message: `Get payment with id ${req.params.id}`
    });
  },
  createPayment: (req, res) => {
    res.status(201).json({
      success: true,
      message: 'Create new payment'
    });
  },
  updatePayment: (req, res) => {
    res.status(200).json({
      success: true,
      message: `Update payment with id ${req.params.id}`
    });
  },
  processRefund: (req, res) => {
    res.status(200).json({
      success: true,
      message: `Process refund for payment with id ${req.params.id}`
    });
  }
};

// Protected routes
router.use(protect);
router.get('/user', paymentController.getUserPayments);
router.post('/', paymentController.createPayment);
router.get('/:id', paymentController.getPaymentById);

// Admin routes
router.use(restrictTo('admin'));
router.get('/', paymentController.getAllPayments);
router.put('/:id', paymentController.updatePayment);
router.post('/:id/refund', paymentController.processRefund);

module.exports = router; 