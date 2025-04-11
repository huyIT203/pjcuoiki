const express = require('express');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const {
  getAllAttributes,
  getAttributeById,
  getAttributeValues,
  createAttribute,
  updateAttribute,
  deleteAttribute,
  addAttributeValue,
  removeAttributeValue
} = require('../controllers/attributeController');

const router = express.Router();

// Public routes
router.get('/', getAllAttributes);
router.get('/:id', getAttributeById);
router.get('/:id/values', getAttributeValues);

// Admin routes
router.use(protect);
router.use(restrictTo('admin'));

router.post('/', createAttribute);
router.put('/:id', updateAttribute);
router.delete('/:id', deleteAttribute);

router.post('/:id/values', addAttributeValue);
router.delete('/:id/values/:valueId', removeAttributeValue);

module.exports = router; 