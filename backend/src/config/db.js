const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/adven';
  
  try {
    // Attempt connecting to the configured URI with a short timeout to fail fast if local db is down
    const isLocal = mongoUri.includes('127.0.0.1') || mongoUri.includes('localhost');
    const options = isLocal ? { serverSelectionTimeoutMS: 3000 } : {};
    
    const conn = await mongoose.connect(mongoUri, options);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    
    const isLocal = mongoUri.includes('127.0.0.1') || mongoUri.includes('localhost');
    if (isLocal) {
      console.log('Attempting fallback to in-memory MongoDB database server (mongodb-memory-server)...');
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongod = await MongoMemoryServer.create({
          instance: {
            dbName: 'adven'
          }
        });
        const memoryUri = mongod.getUri();
        console.log(`In-Memory MongoDB Server started at: ${memoryUri}`);
        
        // Update MONGO_URI in process.env so seeder and other modules can reference it if needed
        process.env.MONGO_URI = memoryUri;
        
        const conn = await mongoose.connect(memoryUri);
        console.log(`Successfully connected to Fallback In-Memory MongoDB: ${conn.connection.host}`);
        
        // Seed the in-memory database
        console.log('Seeding in-memory database with default records...');
        const { seedDatabase } = require('../utils/seeder');
        await seedDatabase();
        console.log('In-memory database seeding complete!');
      } catch (fallbackError) {
        console.error(`In-Memory MongoDB Fallback failed: ${fallbackError.message}`);
        console.log('Ensure MongoDB is installed and running locally, or configure a valid MONGO_URI in backend/.env');
      }
    } else {
      console.log('Ensure the remote MongoDB cluster is accessible and your credentials are correct.');
    }
  }
};

module.exports = connectDB;
