const dotenv = require('dotenv');
// Load environment variables before importing app
dotenv.config();

const app = require('./app');
const connectDB = async () => {
  const db = require('./config/db');
  await db();
};

// Establish database connection
connectDB();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  // Keep server running but log error
});
