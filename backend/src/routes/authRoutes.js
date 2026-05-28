const express = require('express');
const router = express.Router();
const { registerUser, authUser, getUserProfile, googleLogin } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, authUser);
router.post('/google', authLimiter, googleLogin);
router.get('/profile', protect, getUserProfile);

module.exports = router;
