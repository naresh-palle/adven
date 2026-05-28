const express = require('express');
const router = express.Router();
const { addToWishlist, removeFromWishlist, getWishlist } = require('../controllers/wishlistController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, addToWishlist)
  .get(protect, getWishlist);

router.delete('/:productId', protect, removeFromWishlist);

module.exports = router;
