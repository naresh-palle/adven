const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const InventoryLog = require('../models/InventoryLog');
const Review = require('../models/Review');
const Order = require('../models/Order');

dotenv.config({ path: require('path').resolve(__dirname, '../../.env') });

const users = [
  {
    name: 'Adven Admin',
    email: 'admin@adven.com',
    password: 'admin123',
    role: 'admin',
  },
  {
    name: 'John Doe',
    email: 'user@adven.com',
    password: 'user123',
    role: 'customer',
  },
];

const products = [
  {
    name: 'Adven Premium Linen Shirt',
    description: 'Woven from premium organic flax, this linen shirt offers unmatched breathability and a relaxed yet refined fit. Perfect for warm summer evenings.',
    price: 2999,
    category: 'Shirts',
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800&auto=format&fit=crop&q=80',
    ],
    sizes: [
      { size: 'S', stock: 15 },
      { size: 'M', stock: 20 },
      { size: 'L', stock: 25 },
      { size: 'XL', stock: 10 },
    ],
    featured: true,
  },
  {
    name: 'Adven Luxury Pima Tee',
    description: 'Crafted from ultra-soft Peruvian Pima cotton. Extremely durable, silk-like drape, and maintains shape wash after wash.',
    price: 1499,
    category: 'T-Shirts',
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80',
    ],
    sizes: [
      { size: 'S', stock: 3 }, // low stock warning test
      { size: 'M', stock: 18 },
      { size: 'L', stock: 22 },
      { size: 'XL', stock: 15 },
    ],
    featured: true,
  },
  {
    name: 'Adven Classic Tailored Chino',
    description: 'The ultimate smart-casual staple. Features stretch twill, clean tailoring, and custom hardware detailing for everyday luxury.',
    price: 3999,
    category: 'Trousers',
    images: [
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80',
    ],
    sizes: [
      { size: '30', stock: 12 },
      { size: '32', stock: 15 },
      { size: '34', stock: 15 },
      { size: '36', stock: 8 },
    ],
    featured: true,
  },
  {
    name: 'Adven Premium Indigo Denim',
    description: 'Japanese raw selvedge denim. Built to break in beautifully, conforming uniquely to your style and silhouette over time.',
    price: 4999,
    category: 'Jeans',
    images: [
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&auto=format&fit=crop&q=80',
    ],
    sizes: [
      { size: '30', stock: 8 },
      { size: '32', stock: 10 },
      { size: '34', stock: 12 },
    ],
    featured: false,
  },
  {
    name: 'Adven Modern Chino Shorts',
    description: 'Cotton-twill shorts washed for extra softness. Features a clean 7-inch inseam and minimal detailing.',
    price: 2499,
    category: 'Cotton Shorts',
    images: [
      'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&auto=format&fit=crop&q=80',
    ],
    sizes: [
      { size: '30', stock: 10 },
      { size: '32', stock: 12 },
      { size: '34', stock: 10 },
    ],
    featured: false,
  },
  {
    name: 'Adven Cargo Utility Pants',
    description: 'Tough ripstop cargo trousers modernized with a tapered slim silhouette. Heavy-duty utility pockets with secure snaps.',
    price: 3899,
    category: 'Cargos',
    images: [
      'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=800&auto=format&fit=crop&q=80',
    ],
    sizes: [
      { size: '30', stock: 0 }, // Out of stock warning test
      { size: '32', stock: 5 },
      { size: '34', stock: 6 },
    ],
    featured: true,
  },
  {
    name: 'Adven Active Performance Joggers',
    description: 'Moisture-wicking, four-way stretch joggers designed for dynamic movement or premium leisure. Stealth zip pockets.',
    price: 2999,
    category: 'Sports Trousers',
    images: [
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=80',
    ],
    sizes: [
      { size: 'S', stock: 10 },
      { size: 'M', stock: 15 },
      { size: 'L', stock: 15 },
    ],
    featured: false,
  },
  {
    name: 'Adven Lightweight Running Shorts',
    description: 'Ultra-lightweight mesh shorts with compression liner. Engineered with breathable venting zones and a card key zip pocket.',
    price: 1899,
    category: 'Sports Shorts',
    images: [
      'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&auto=format&fit=crop&q=80',
    ],
    sizes: [
      { size: 'S', stock: 12 },
      { size: 'M', stock: 12 },
      { size: 'L', stock: 12 },
    ],
    featured: false,
  },
];

const coupons = [
  {
    code: 'ADVEN10',
    discountType: 'percentage',
    discountValue: 10,
    minPurchaseAmount: 1999,
    expirationDate: new Date('2028-12-31'),
  },
  {
    code: 'ADVEN500',
    discountType: 'flat',
    discountValue: 500,
    minPurchaseAmount: 2999,
    expirationDate: new Date('2028-12-31'),
  },
];

const seedDatabase = async () => {
  // Clean existing database items
  await User.deleteMany();
  await Product.deleteMany();
  await Coupon.deleteMany();
  await InventoryLog.deleteMany();
  await Review.deleteMany();
  await Order.deleteMany();

  console.log('Database wiped.');

  // Import users
  const createdUsers = await User.create(users);
  const adminUser = createdUsers.find(u => u.role === 'admin');

  console.log('Seeded Users.');

  // Import products
  const createdProducts = await Product.create(products);
  console.log('Seeded Products.');

  // Seed initial Inventory Logs for the products
  for (const prod of createdProducts) {
    for (const sizeObj of prod.sizes) {
      if (sizeObj.stock > 0) {
        await InventoryLog.create({
          product: prod._id,
          productName: prod.name,
          size: sizeObj.size,
          changeType: 'manual-add',
          quantity: sizeObj.stock,
          description: 'Seed initial database stock',
          performedBy: adminUser.name,
        });
      }
    }
  }
  console.log('Seeded Inventory Logs.');

  // Import coupons
  await Coupon.create(coupons);
  console.log('Seeded Coupons.');

  // Create a mock review
  const sampleCustomer = createdUsers.find(u => u.role === 'customer');
  const sampleProduct = createdProducts[0];
  await Review.create({
    product: sampleProduct._id,
    user: sampleCustomer._id,
    name: sampleCustomer.name,
    rating: 5,
    comment: 'Absolutely stunning quality! The linen fabric feels premium, and it fits perfectly. Worth every rupee.',
  });
  console.log('Seeded Sample Review.');
};

const importData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/adven';
    console.log(`Connecting to: ${mongoUri} to seed database...`);
    
    await mongoose.connect(mongoUri);
    await seedDatabase();

    console.log('Data Imported Successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Error with data seeding: ${error.message}`);
    process.exit(1);
  }
};

if (require.main === module) {
  importData();
}

module.exports = {
  seedDatabase,
  users,
  products,
  coupons
};
