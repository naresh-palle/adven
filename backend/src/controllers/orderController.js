const Order = require('../models/Order');
const Product = require('../models/Product');
const InventoryLog = require('../models/InventoryLog');
const { sendOrderConfirmation, sendShippingUpdate } = require('../utils/email');

// @desc    Create new order & reduce inventory
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    discountPrice,
    totalPrice,
    couponApplied,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    return res.status(400).json({ message: 'No order items' });
  }

  try {
    // 1. Verify and reduce stock for all items
    // First, let's dry-run check if all items have sufficient stock
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.name} not found` });
      }

      const sizeObj = product.sizes.find((s) => s.size === item.size);
      if (!sizeObj || sizeObj.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${item.name} (Size: ${item.size}). Available: ${sizeObj ? sizeObj.stock : 0}`,
        });
      }
    }

    // 2. Perform stock reductions and log the actions
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      const sizeObj = product.sizes.find((s) => s.size === item.size);
      
      // Reduce stock
      sizeObj.stock -= item.quantity;
      await product.save();

      // Log the inventory deduction
      await InventoryLog.create({
        product: product._id,
        productName: product.name,
        size: item.size,
        changeType: 'sale',
        quantity: item.quantity,
        description: `Auto-deducted on sale. Order checkout.`,
        performedBy: req.user.name,
      });
    }

    // 3. Create order
    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      discountPrice,
      totalPrice,
      couponApplied,
      isPaid: true, // Mark paid directly for simulated checkouts
      paidAt: Date.now(),
      status: 'Paid',
      trackingLogs: [
        {
          status: 'Placed',
          description: 'Order successfully placed and paid.',
        },
        {
          status: 'Paid',
          description: 'Payment processed successfully.',
        },
      ],
    });

    const createdOrder = await order.save();
    // Dispatch mock confirmation email
    sendOrderConfirmation(req.user.email, createdOrder).catch((err) =>
      console.error('Order confirmation email fail:', err.message)
    );
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name price images');

    if (order) {
      // Check if user is owner or admin
      if (
        order.user._id.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin'
      ) {
        return res.status(403).json({ message: 'Not authorized to view this order' });
      }
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status / tracking logs (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  const { status, description } = req.body;

  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.status = status;
      
      if (status === 'Delivered') {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
      }

      order.trackingLogs.push({
        status,
        description: description || `Order marked as ${status}`,
        timestamp: Date.now(),
      });

      const updatedOrder = await order.save();
      
      // Dispatch mock shipping update email
      const populatedOrder = await Order.findById(updatedOrder._id).populate('user', 'email');
      if (populatedOrder && populatedOrder.user) {
        sendShippingUpdate(populatedOrder.user.email, populatedOrder, status).catch((err) =>
          console.error('Shipping update email fail:', err.message)
        );
      }

      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders (Admin only) & Revenue Analytics
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'id name email')
      .sort({ createdAt: -1 });

    // Compute basic analytics
    const totalSales = orders.reduce((acc, order) => {
      return order.isPaid ? acc + order.totalPrice : acc;
    }, 0);

    const pendingOrdersCount = orders.filter((o) => o.status === 'Paid' || o.status === 'Processing').length;
    const completedOrdersCount = orders.filter((o) => o.status === 'Delivered').length;

    res.json({
      orders,
      analytics: {
        totalSales,
        totalOrders: orders.length,
        pendingOrders: pendingOrdersCount,
        completedOrders: completedOrdersCount,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addOrderItems,
  getOrderById,
  updateOrderStatus,
  getMyOrders,
  getOrders,
};
