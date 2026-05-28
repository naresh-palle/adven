const Product = require('../models/Product');
const InventoryLog = require('../models/InventoryLog');

// @desc    Get current inventory status and warnings
// @route   GET /api/inventory
// @access  Private/Admin
const getInventoryStatus = async (req, res) => {
  try {
    const products = await Product.find({});
    
    const inventoryList = products.map((product) => {
      const totalStock = product.sizes.reduce((acc, curr) => acc + curr.stock, 0);
      const lowStockSizes = product.sizes.filter((s) => s.stock < 5).map((s) => s.size);
      
      return {
        _id: product._id,
        name: product.name,
        category: product.category,
        price: product.price,
        sizes: product.sizes,
        totalStock,
        isLowStock: totalStock < 10 || lowStockSizes.length > 0,
        lowStockSizes,
      };
    });

    const lowStockAlerts = inventoryList.filter((item) => item.isLowStock);

    res.json({
      inventory: inventoryList,
      alertsCount: lowStockAlerts.length,
      alerts: lowStockAlerts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get list of all stock change logs
// @route   GET /api/inventory/logs
// @access  Private/Admin
const getInventoryLogs = async (req, res) => {
  try {
    const logs = await InventoryLog.find({}).sort({ createdAt: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Manually update stock of a product size
// @route   POST /api/inventory/update
// @access  Private/Admin
const updateStock = async (req, res) => {
  const { productId, size, newStock, description } = req.body;

  if (newStock === undefined || newStock < 0) {
    return res.status(400).json({ message: 'Stock must be 0 or greater' });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const sizeObj = product.sizes.find((s) => s.size === size);
    
    if (!sizeObj) {
      // Add size if not existing
      product.sizes.push({ size, stock: newStock });
      
      await InventoryLog.create({
        product: product._id,
        productName: product.name,
        size: size,
        changeType: 'manual-add',
        quantity: newStock,
        description: description || `Added size ${size} with stock ${newStock}`,
        performedBy: req.user.name,
      });
    } else {
      const oldStock = sizeObj.stock;
      const difference = newStock - oldStock;
      
      if (difference === 0) {
        return res.json(product.toObject({ virtuals: true }));
      }
      
      const changeType = difference > 0 ? 'restock' : 'manual-reduce';
      sizeObj.stock = newStock;

      await InventoryLog.create({
        product: product._id,
        productName: product.name,
        size: size,
        changeType: changeType,
        quantity: Math.abs(difference),
        description: description || `Stock updated from ${oldStock} to ${newStock}`,
        performedBy: req.user.name,
      });
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct.toObject({ virtuals: true }));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get daily and weekly stock adjustments summary
// @route   GET /api/inventory/summary
// @access  Private/Admin
const getInventorySummary = async (req, res) => {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const dailyLogs = await InventoryLog.find({ createdAt: { $gte: oneDayAgo } });
    const weeklyLogs = await InventoryLog.find({ createdAt: { $gte: oneWeekAgo } });

    let dailyAdded = 0;
    let dailyReduced = 0;
    dailyLogs.forEach((log) => {
      const isReduction = log.changeType === 'sale' || log.changeType === 'manual-reduce';
      if (isReduction) {
        dailyReduced += log.quantity;
      } else {
        dailyAdded += log.quantity;
      }
    });

    let weeklyAdded = 0;
    let weeklyReduced = 0;
    weeklyLogs.forEach((log) => {
      const isReduction = log.changeType === 'sale' || log.changeType === 'manual-reduce';
      if (isReduction) {
        weeklyReduced += log.quantity;
      } else {
        weeklyAdded += log.quantity;
      }
    });

    res.json({
      daily: {
        added: dailyAdded,
        reduced: dailyReduced,
        net: dailyAdded - dailyReduced,
        count: dailyLogs.length,
      },
      weekly: {
        added: weeklyAdded,
        reduced: weeklyReduced,
        net: weeklyAdded - weeklyReduced,
        count: weeklyLogs.length,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getInventoryStatus,
  getInventoryLogs,
  updateStock,
  getInventorySummary,
};

