const express = require('express');
const router = express.Router();
const { createProductReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createProductReview);

module.exports = router;
