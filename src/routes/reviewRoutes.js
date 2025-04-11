const express = require('express');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Placeholder controller functions (to be implemented)
const reviewController = {
  getAllReviews: (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Get all reviews'
    });
  },
  getProductReviews: (req, res) => {
    res.status(200).json({
      success: true,
      message: `Get reviews for product with id ${req.params.productId}`
    });
  },
  getReviewById: (req, res) => {
    res.status(200).json({
      success: true,
      message: `Get review with id ${req.params.id}`
    });
  },
  createReview: (req, res) => {
    res.status(201).json({
      success: true,
      message: 'Create new review'
    });
  },
  updateReview: (req, res) => {
    res.status(200).json({
      success: true,
      message: `Update review with id ${req.params.id}`
    });
  },
  deleteReview: (req, res) => {
    res.status(200).json({
      success: true,
      message: `Delete review with id ${req.params.id}`
    });
  }
};

// Public routes
router.get('/product/:productId', reviewController.getProductReviews);

// Protected routes
router.use(protect);
router.post('/', reviewController.createReview);

router.route('/:id')
  .get(reviewController.getReviewById)
  .put(reviewController.updateReview)
  .delete(reviewController.deleteReview);

// Admin routes
router.use(restrictTo('admin'));
router.get('/', reviewController.getAllReviews);

module.exports = router; 