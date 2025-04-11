const express = require('express');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Placeholder controller functions (to be implemented)
const couponController = {
  getAllCoupons: (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Get all coupons'
    });
  },
  getActiveCoupons: (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Get active coupons'
    });
  },
  getCouponById: (req, res) => {
    res.status(200).json({
      success: true,
      message: `Get coupon with id ${req.params.id}`
    });
  },
  createCoupon: (req, res) => {
    res.status(201).json({
      success: true,
      message: 'Create new coupon'
    });
  },
  updateCoupon: (req, res) => {
    res.status(200).json({
      success: true,
      message: `Update coupon with id ${req.params.id}`
    });
  },
  deleteCoupon: (req, res) => {
    res.status(200).json({
      success: true,
      message: `Delete coupon with id ${req.params.id}`
    });
  },
  validateCoupon: (req, res) => {
    res.status(200).json({
      success: true,
      message: `Validate coupon code ${req.params.code}`
    });
  }
};

// Public routes
router.get('/active', couponController.getActiveCoupons);
router.get('/validate/:code', couponController.validateCoupon);

// Admin routes
router.use(protect);
router.use(restrictTo('admin'));
router.route('/')
  .get(couponController.getAllCoupons)
  .post(couponController.createCoupon);

router.route('/:id')
  .get(couponController.getCouponById)
  .put(couponController.updateCoupon)
  .delete(couponController.deleteCoupon);

module.exports = router; 