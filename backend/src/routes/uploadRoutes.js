const express = require('express');
const router = express.Router();
const { upload, uploadImages } = require('../controllers/uploadController');
const { protect, admin } = require('../middleware/authMiddleware');

// Accept up to 5 images under key name 'images'
router.post('/', protect, admin, upload.array('images', 5), uploadImages);

module.exports = router;
