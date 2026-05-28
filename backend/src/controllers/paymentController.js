const crypto = require('crypto');
const Razorpay = require('razorpay');
const Product = require('../models/Product');
const Order = require('../models/Order');
const InventoryLog = require('../models/InventoryLog');
const { sendOrderConfirmation } = require('../utils/email');

// Helper to check if credentials are placeholders
const isPlaceholderCredentials = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  return (
    !keyId ||
    !secret ||
    keyId.includes('placeholder') ||
    secret.includes('placeholder')
  );
};

// Helper to get Razorpay Instance
const getRazorpayInstance = () => {
  if (isPlaceholderCredentials()) {
    return null;
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// @desc    Create secure Razorpay order & check stock
// @route   POST /api/payments/order
// @access  Private
const createRazorpayOrder = async (req, res) => {
  const { amount, orderItems } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Invalid order amount' });
  }

  if (!orderItems || orderItems.length === 0) {
    return res.status(400).json({ message: 'No items in the order' });
  }

  try {
    // 1. Dry-run stock availability check
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

    // 2. Initialize and create Razorpay order
    const razorpay = getRazorpayInstance();

    if (!razorpay) {
      // Mock sandbox mode
      console.log('--- RAZORPAY SANDBOX SIMULATION MODE ---');
      const mockOrder = {
        id: `order_mock_${crypto.randomBytes(8).toString('hex')}`,
        amount: Math.round(amount * 100),
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        status: 'created',
        keyId: 'rzp_test_placeholder_key'
      };
      return res.status(201).json(mockOrder);
    }

    // Actual Razorpay call
    const options = {
      amount: Math.round(amount * 100), // paise
      currency: 'INR',
      receipt: `receipt_order_${Date.now().toString().slice(-8)}`,
    };

    const order = await razorpay.orders.create(options);
    res.status(201).json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify payment signature and finalize order
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderData, // contains shippingAddress, itemsPrice, taxPrice, shippingPrice, discountPrice, totalPrice, couponApplied, orderItems
  } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id) {
    return res.status(400).json({ message: 'Missing payment details' });
  }

  const {
    orderItems,
    shippingAddress,
    itemsPrice,
    taxPrice,
    shippingPrice,
    discountPrice,
    totalPrice,
    couponApplied,
  } = orderData;

  try {
    // 1. Signature Cryptographic verification
    const isMock = razorpay_order_id.startsWith('order_mock_');
    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!isMock && !isPlaceholderCredentials()) {
      // Real cryptographic verification
      const sign = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSign = crypto
        .createHmac('sha256', secret)
        .update(sign.toString())
        .digest('hex');

      if (expectedSign !== razorpay_signature) {
        return res.status(400).json({ message: 'Invalid payment signature. Transaction rejected.' });
      }
    } else {
      console.log(`Verified mock payment successfully: ${razorpay_payment_id}`);
    }

    // 2. Re-check stock before final deduction
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

    // 3. Deduct stock and audit log
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      const sizeObj = product.sizes.find((s) => s.size === item.size);
      
      sizeObj.stock -= item.quantity;
      await product.save();

      await InventoryLog.create({
        product: product._id,
        productName: product.name,
        size: item.size,
        changeType: 'sale',
        quantity: item.quantity,
        description: `Auto-deducted on sale. Razorpay checkout.`,
        performedBy: req.user.name,
      });
    }

    // 4. Create database Order entry
    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod: 'Razorpay Secure Payment',
      paymentResult: {
        id: razorpay_payment_id,
        status: 'success',
        update_time: new Date().toISOString(),
        email_address: req.user.email,
      },
      itemsPrice,
      taxPrice,
      shippingPrice,
      discountPrice,
      totalPrice,
      couponApplied,
      isPaid: true,
      paidAt: Date.now(),
      status: 'Paid',
      trackingLogs: [
        {
          status: 'Placed',
          description: 'Order successfully placed via Razorpay checkout.',
        },
        {
          status: 'Paid',
          description: `Payment confirmed. Razorpay ID: ${razorpay_payment_id}.`,
        },
      ],
    });

    const createdOrder = await order.save();

    // Dispatch mock order confirmation email
    sendOrderConfirmation(req.user.email, createdOrder).catch((err) =>
      console.error('Order confirmation email failure:', err.message)
    );

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createRazorpayOrder,
  verifyPayment,
};
