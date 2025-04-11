const express = require('express');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Placeholder controller functions (to be implemented)
const inventoryController = {
  getAllInventory: (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Get all inventory'
    });
  },
  getLowStockInventory: (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Get low stock inventory'
    });
  },
  getInventoryById: (req, res) => {
    res.status(200).json({
      success: true,
      message: `Get inventory with id ${req.params.id}`
    });
  },
  getProductInventory: (req, res) => {
    res.status(200).json({
      success: true,
      message: `Get inventory for product with id ${req.params.productId}`
    });
  },
  createInventory: (req, res) => {
    res.status(201).json({
      success: true,
      message: 'Create new inventory'
    });
  },
  updateInventory: (req, res) => {
    res.status(200).json({
      success: true,
      message: `Update inventory with id ${req.params.id}`
    });
  },
  updateStock: (req, res) => {
    res.status(200).json({
      success: true,
      message: `Update stock for inventory with id ${req.params.id}`
    });
  }
};

// Admin/Seller routes
router.use(protect);
router.use(restrictTo('admin', 'seller'));

router.get('/', inventoryController.getAllInventory);
router.get('/low-stock', inventoryController.getLowStockInventory);
router.get('/product/:productId', inventoryController.getProductInventory);
router.get('/:id', inventoryController.getInventoryById);
router.post('/', inventoryController.createInventory);
router.put('/:id', inventoryController.updateInventory);
router.patch('/:id/stock', inventoryController.updateStock);

module.exports = router; 