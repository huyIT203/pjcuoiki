const express = require('express');
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getTopProducts,
  getProductsByCategory
} = require('../controllers/productController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/top', getTopProducts);
router.get('/category/:categoryId', getProductsByCategory);
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Protected routes
router.use(protect);
router.post('/', restrictTo('admin', 'seller'), createProduct);
router.route('/:id')
  .put(restrictTo('admin', 'seller'), updateProduct)
  .delete(restrictTo('admin', 'seller'), deleteProduct);

module.exports = router; 