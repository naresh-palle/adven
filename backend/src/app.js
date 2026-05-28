const express = require('express');
const cors = require('cors');
const path = require('path');
const { apiLimiter } = require('./middleware/rateLimiter');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const couponRoutes = require('./routes/couponRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const { sendContactForm } = require('./utils/email');

const app = express();

// Core Middleware
app.use(cors());
app.use(express.json());

// Apply rate limiter to all API endpoints
app.use('/api/', apiLimiter);

// Serve uploads folder (in case of image uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes mapping
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/upload', uploadRoutes);


// Contact form API (Email notification task)
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'All fields (name, email, message) are required.' });
  }
  try {
    await sendContactForm(email, name, message);
    res.json({ message: 'Message sent successfully. We will get back to you shortly!' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send message' });
  }
});

// Root API Welcome Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Adven Premium Men Fashion API' });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

module.exports = app;
