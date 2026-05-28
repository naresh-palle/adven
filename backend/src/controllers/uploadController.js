const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Multer memory storage configuration
const storage = multer.memoryStorage();

// File filter to allow only image files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter,
});

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Check if Cloudinary credentials are validly set
const isCloudinaryConfigured = () => {
  const name = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  return (
    name && name !== 'placeholder_cloud_name' &&
    key && key !== 'placeholder_api_key' &&
    secret && secret !== 'placeholder_api_secret'
  );
};

// Stream upload buffer to Cloudinary
const streamUploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'adven_products' },
      (error, result) => {
        if (result) {
          resolve(result.secure_url);
        } else {
          reject(error);
        }
      }
    );
    stream.write(file.buffer);
    stream.end();
  });
};

// Write buffer to local disk uploads folder
const saveToLocalDisk = (file, req) => {
  const uploadDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const fileExt = path.extname(file.originalname) || '.jpg';
  const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
  const filePath = path.join(uploadDir, fileName);

  fs.writeFileSync(filePath, file.buffer);
  const protocol = req.protocol || 'http';
  const host = (req.get && req.get('host')) || 'localhost:5000';
  const baseUrl = `${protocol}://${host}`;
  return `${baseUrl}/uploads/${fileName}`;
};

// @desc    Upload multiple product images
// @route   POST /api/upload
// @access  Private/Admin
const uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Please upload at least one image file.' });
    }

    const useCloudinary = isCloudinaryConfigured();
    if (!useCloudinary) {
      console.log('--- CLOUDINARY SANDBOX FALLBACK: UPLOADING TO LOCAL DISK ---');
    }

    const uploadPromises = req.files.map(async (file) => {
      if (useCloudinary) {
        return await streamUploadToCloudinary(file);
      } else {
        return saveToLocalDisk(file, req);
      }
    });


    const urls = await Promise.all(uploadPromises);
    res.status(200).json({ urls });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Image upload failed.' });
  }
};

module.exports = {
  upload,
  uploadImages,
};
