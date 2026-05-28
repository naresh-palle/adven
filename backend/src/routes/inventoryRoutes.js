const express = require('express');
const router = express.Router();
const {
  getInventoryStatus,
  getInventoryLogs,
  updateStock,
} = require('../controllers/inventoryController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, admin, getInventoryStatus);
router.get('/logs', protect, admin, getInventoryLogs);
router.post('/update', protect, admin, updateStock);

module.exports = router;
