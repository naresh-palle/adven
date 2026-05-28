const Product = require('../models/Product');
const Review = require('../models/Review');

// @desc    Get all products with filters
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, size, sortBy } = req.query;
    let query = {};

    // Filter by Category
    if (category) {
      query.category = category;
    }

    // Filter by Search Query (Name/Description)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by Price Range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Filter by Size availability
    if (size) {
      query.sizes = {
        $elemMatch: { size: size, stock: { $gt: 0 } },
      };
    }

    let apiQuery = Product.find(query);

    // Sorting options
    if (sortBy === 'price-low') {
      apiQuery = apiQuery.sort({ price: 1 });
    } else if (sortBy === 'price-high') {
      apiQuery = apiQuery.sort({ price: -1 });
    } else if (sortBy === 'rating') {
      apiQuery = apiQuery.sort({ averageRating: -1 });
    } else {
      // Default: newest first
      apiQuery = apiQuery.sort({ createdAt: -1 });
    }

    const products = await apiQuery;
    
    // Add status virtual output to raw objects
    const productsWithStatus = products.map(product => {
      const obj = product.toObject({ virtuals: true });
      return obj;
    });

    res.json(productsWithStatus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single product details
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      const reviews = await Review.find({ product: product._id }).populate('user', 'name email');
      const productObj = product.toObject({ virtuals: true });
      productObj.reviews = reviews;
      res.json(productObj);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a product (Admin only)
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, images, sizes, featured } = req.body;

    if (!images || images.length === 0) {
      return res.status(400).json({ message: 'Please add at least one image url' });
    }

    // Default sizes stock structure if not provided
    const parsedSizes = sizes || [
      { size: 'S', stock: 10 },
      { size: 'M', stock: 15 },
      { size: 'L', stock: 15 },
      { size: 'XL', stock: 10 },
    ];

    const product = new Product({
      name,
      description,
      price,
      category,
      images,
      sizes: parsedSizes,
      featured: featured || false,
    });

    const createdProduct = await product.save();
    
    // Log initial inventory creation
    const InventoryLog = require('../models/InventoryLog');
    for (const sizeObj of createdProduct.sizes) {
      if (sizeObj.stock > 0) {
        await InventoryLog.create({
          product: createdProduct._id,
          productName: createdProduct.name,
          size: sizeObj.size,
          changeType: 'manual-add',
          quantity: sizeObj.stock,
          description: 'Initial stock setup upon product creation',
          performedBy: req.user ? req.user.name : 'Admin',
        });
      }
    }

    res.status(201).json(createdProduct.toObject({ virtuals: true }));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a product (Admin only)
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const { name, description, price, category, images, sizes, featured } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.description = description || product.description;
      product.price = price !== undefined ? price : product.price;
      product.category = category || product.category;
      product.images = images || product.images;
      product.featured = featured !== undefined ? featured : product.featured;

      // Handle stock tracking if sizes are updated
      if (sizes) {
        const InventoryLog = require('../models/InventoryLog');
        
        // Track changes and log them
        for (const sizeObj of sizes) {
          const existingSizeIndex = product.sizes.findIndex(s => s.size === sizeObj.size);
          const oldStock = existingSizeIndex > -1 ? product.sizes[existingSizeIndex].stock : 0;
          const newStock = sizeObj.stock;
          
          if (oldStock !== newStock) {
            const difference = newStock - oldStock;
            const changeType = difference > 0 ? 'restock' : 'manual-reduce';
            
            await InventoryLog.create({
              product: product._id,
              productName: product.name,
              size: sizeObj.size,
              changeType: changeType,
              quantity: Math.abs(difference),
              description: `Stock adjusted from ${oldStock} to ${newStock} via Admin edit`,
              performedBy: req.user ? req.user.name : 'Admin',
            });
          }
        }
        
        product.sizes = sizes;
      }

      const updatedProduct = await product.save();
      res.json(updatedProduct.toObject({ virtuals: true }));
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a product (Admin only)
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await Product.findByIdAndDelete(req.params.id);
      
      // Also delete corresponding reviews
      await Review.deleteMany({ product: req.params.id });

      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ featured: true }).limit(8);
    res.json(products.map(p => p.toObject({ virtuals: true })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get related products
// @route   GET /api/products/:id/related
// @access  Public
const getRelatedProducts = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
    }).limit(4);

    res.json(related.map(p => p.toObject({ virtuals: true })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Custom helper to parse CSV with support for double quotes
const parseCSV = (csvBuffer) => {
  const text = csvBuffer.toString('utf-8');
  const lines = [];
  let currentLine = '';
  let inQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === '\n' && !inQuotes) {
      lines.push(currentLine.trim());
      currentLine = '';
    } else if (char === '\r') {
      // Skip carriage returns
    } else {
      currentLine += char;
    }
  }
  if (currentLine) {
    lines.push(currentLine.trim());
  }
  
  if (lines.length === 0) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const products = [];
  
  for (let l = 1; l < lines.length; l++) {
    const line = lines[l];
    if (!line) continue;
    
    const values = [];
    let curVal = '';
    let valQuotes = false;
    for (let c = 0; c < line.length; c++) {
      const char = line[c];
      if (char === '"') {
        valQuotes = !valQuotes;
      } else if (char === ',' && !valQuotes) {
        values.push(curVal.trim().replace(/^"|"$/g, ''));
        curVal = '';
      } else {
        curVal += char;
      }
    }
    values.push(curVal.trim().replace(/^"|"$/g, ''));
    
    const row = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx];
    });
    products.push(row);
  }
  return products;
};

// @desc    Bulk upload products via CSV
// @route   POST /api/products/bulk
// @access  Private/Admin
const bulkUploadProducts = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a CSV file.' });
    }

    const csvData = parseCSV(req.file.buffer);
    const createdProducts = [];
    const InventoryLog = require('../models/InventoryLog');

    for (const row of csvData) {
      const { name, description, price, category, images, sizes_stock, featured } = row;

      if (!name || !description || !price || !category || !images) {
        continue;
      }

      // Parse images (semicolon-separated)
      const parsedImages = images.split(';').map(url => url.trim()).filter(Boolean);
      if (parsedImages.length === 0) continue;

      // Parse sizes_stock (semicolon-separated size:stock pairs)
      const sizes = [];
      if (sizes_stock) {
        const pairs = sizes_stock.split(/[;,]/).map(p => p.trim()).filter(Boolean);
        for (const pair of pairs) {
          const [size, stockStr] = pair.split(':').map(s => s.trim());
          if (size && stockStr !== undefined) {
            sizes.push({ size, stock: Number(stockStr) || 0 });
          }
        }
      }

      const finalSizes = sizes.length > 0 ? sizes : [
        { size: 'S', stock: 10 },
        { size: 'M', stock: 15 },
        { size: 'L', stock: 15 },
        { size: 'XL', stock: 10 }
      ];

      const product = new Product({
        name,
        description,
        price: Number(price) || 0,
        category,
        images: parsedImages,
        sizes: finalSizes,
        featured: featured === 'true' || featured === '1' || featured === true,
      });

      const savedProduct = await product.save();
      createdProducts.push(savedProduct);

      // Log inventory creation
      for (const sizeObj of savedProduct.sizes) {
        if (sizeObj.stock > 0) {
          await InventoryLog.create({
            product: savedProduct._id,
            productName: savedProduct.name,
            size: sizeObj.size,
            changeType: 'manual-add',
            quantity: sizeObj.stock,
            description: 'Bulk CSV product upload initial stock setup',
            performedBy: req.user ? req.user.name : 'Admin',
          });
        }
      }
    }

    res.status(201).json({
      message: `Successfully imported ${createdProducts.length} products.`,
      count: createdProducts.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Bulk upload failed' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getRelatedProducts,
  bulkUploadProducts,
};

