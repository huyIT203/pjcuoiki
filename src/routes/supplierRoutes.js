const express = require('express');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const {
  getAllSuppliers,
  getActiveSuppliers,
  getSupplierById,
  getSupplierProducts,
  createSupplier,
  updateSupplier,
  deleteSupplier
} = require('../controllers/supplierController');

const router = express.Router();

// Admin routes
router.use(protect);
router.use(restrictTo('admin'));

router.get('/active', getActiveSuppliers);
router.get('/:id/products', getSupplierProducts);

router.route('/')
  .get(getAllSuppliers)
  .post(createSupplier);

router.route('/:id')
  .get(getSupplierById)
  .put(updateSupplier)
  .delete(deleteSupplier);

module.exports = router; 