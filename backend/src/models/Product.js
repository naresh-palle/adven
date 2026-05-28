const mongoose = require('mongoose');

const productSizeSchema = new mongoose.Schema({
  size: {
    type: String,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a product name'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a product description'],
    },
    price: {
      type: Number,
      required: [true, 'Please add a price in INR'],
      min: 0,
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: [
        'T-Shirts',
        'Shirts',
        'Trousers',
        'Jeans',
        'Cotton Shorts',
        'Cargos',
        'Sports Trousers',
        'Sports Shorts',
      ],
    },
    images: {
      type: [String],
      required: true,
      validate: [
        (val) => val.length > 0,
        'Please add at least one product image',
      ],
    },
    sizes: [productSizeSchema],
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numberOfReviews: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for overall stock status
productSchema.virtual('status').get(function () {
  const totalStock = this.sizes.reduce((acc, curr) => acc + curr.stock, 0);
  if (totalStock === 0) return 'out-of-stock';
  if (totalStock < 10) return 'low-stock';
  return 'in-stock';
});

module.exports = mongoose.model('Product', productSchema);
