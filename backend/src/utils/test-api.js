const app = require('../app');
const connectDB = require('../config/db');
const mongoose = require('mongoose');

const PORT = 5055;
const BASE_URL = `http://127.0.0.1:${PORT}`;

let server;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const runTests = async () => {
  console.log('--- STARTING BACKEND INTEGRATION TESTS ---');
  
  // 1. Establish DB Connection (which will spin up and seed memory-db since local isn't running)
  await connectDB();
  
  // 2. Start Express Server
  server = app.listen(PORT, async () => {
    console.log(`Test server listening on port ${PORT}`);
    
    try {
      let testFailures = 0;
      
      // Test Case 1: GET /api/products
      console.log('\n[Test 1] Fetching all products...');
      const prodRes = await fetch(`${BASE_URL}/api/products`);
      if (prodRes.ok) {
        const products = await prodRes.json();
        console.log(`✅ Success! Fetched ${products.length} products.`);
        if (products.length !== 8) {
          console.error(`❌ Expected 8 products, got ${products.length}`);
          testFailures++;
        }
      } else {
        console.error(`❌ Failed to fetch products: ${prodRes.status}`);
        testFailures++;
      }

      // Test Case 2: POST /api/auth/login (customer login)
      console.log('\n[Test 2] Logging in as customer...');
      const custLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'user@adven.com', password: 'user123' })
      });
      let customerToken = '';
      if (custLoginRes.ok) {
        const data = await custLoginRes.json();
        console.log('✅ Success! Customer logged in.');
        customerToken = data.token;
        if (!customerToken) {
          console.error('❌ Token was not returned in login response.');
          testFailures++;
        }
      } else {
        console.error(`❌ Failed customer login: ${custLoginRes.status}`);
        testFailures++;
      }

      // Test Case 3: POST /api/auth/login (invalid password)
      console.log('\n[Test 3] Logging in with invalid password...');
      const badLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'user@adven.com', password: 'wrongpassword' })
      });
      if (badLoginRes.status === 401) {
        console.log('✅ Success! Rejected bad login with 401 Unauthorized.');
      } else {
        console.error(`❌ Expected 401 for bad login, got ${badLoginRes.status}`);
        testFailures++;
      }

      // Test Case 4: POST /api/auth/login (admin login)
      console.log('\n[Test 4] Logging in as admin...');
      const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@adven.com', password: 'admin123' })
      });
      let adminToken = '';
      if (adminLoginRes.ok) {
        const data = await adminLoginRes.json();
        console.log('✅ Success! Admin logged in.');
        adminToken = data.token;
      } else {
        console.error(`❌ Failed admin login: ${adminLoginRes.status}`);
        testFailures++;
      }

      // Test Case 5: GET /api/coupons without token (protected admin route)
      console.log('\n[Test 5] Fetching coupons without token...');
      const noTokenRes = await fetch(`${BASE_URL}/api/coupons`);
      if (noTokenRes.status === 401) {
        console.log('✅ Success! Rejected request without token with 401.');
      } else {
        console.error(`❌ Expected 401 without token, got ${noTokenRes.status}`);
        testFailures++;
      }

      // Test Case 6: GET /api/coupons with customer token (should fail admin check)
      console.log('\n[Test 6] Fetching coupons with customer token...');
      const custTokenRes = await fetch(`${BASE_URL}/api/coupons`, {
        headers: { 'Authorization': `Bearer ${customerToken}` }
      });
      if (custTokenRes.status === 403) {
        console.log('✅ Success! Access forbidden for non-admins with 403.');
      } else {
        console.error(`❌ Expected 403 for customer access to admin route, got ${custTokenRes.status}`);
        testFailures++;
      }

      // Test Case 7: GET /api/coupons with admin token (should succeed)
      console.log('\n[Test 7] Fetching coupons with admin token...');
      const adminTokenRes = await fetch(`${BASE_URL}/api/coupons`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (adminTokenRes.ok) {
        const coupons = await adminTokenRes.json();
        console.log(`✅ Success! Fetched ${coupons.length} coupons.`);
        if (coupons.length !== 2) {
          console.error(`❌ Expected 2 coupons, got ${coupons.length}`);
          testFailures++;
        }
      } else {
        console.error(`❌ Failed to fetch coupons with admin token: ${adminTokenRes.status}`);
        testFailures++;
      }

      // Test Case 8: POST /api/coupons/validate (validate coupon code)
      console.log('\n[Test 8] Validating coupon ADVEN10...');
      const validateRes = await fetch(`${BASE_URL}/api/coupons/validate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${customerToken}`
        },
        body: JSON.stringify({ code: 'ADVEN10', cartAmount: 2500 })
      });
      if (validateRes.ok) {
        const validation = await validateRes.json();
        console.log(`✅ Success! Coupon validated. Discount amount calculated: ₹${validation.discountAmount}`);
        if (validation.discountAmount !== 250) { // 10% of 2500
          console.error(`❌ Expected 250 discount, got ${validation.discountAmount}`);
          testFailures++;
        }
      } else {
        console.error(`❌ Failed to validate coupon: ${validateRes.status}`);
        testFailures++;
      }

      // Test Case 9: POST /api/auth/google (Google login simulation)
      console.log('\n[Test 9] Logging in via Google simulation...');
      const googleRes = await fetch(`${BASE_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'google.test@gmail.com', name: 'Google Test User' })
      });
      if (googleRes.ok) {
        const data = await googleRes.json();
        console.log(`✅ Success! Google user authenticated. Name: ${data.name}, Token: ${data.token ? 'Present' : 'Missing'}`);
        if (data.name !== 'Google Test User') {
          console.error(`❌ Expected user name "Google Test User", got "${data.name}"`);
          testFailures++;
        }
      } else {
        console.error(`❌ Failed Google authentication: ${googleRes.status}`);
        testFailures++;
      }

      // Final Results
      console.log('\n-----------------------------------------');
      if (testFailures === 0) {
        console.log('🏆 ALL INTEGRATION TESTS PASSED SUCCESSFULLY!');
        cleanupAndExit(0);
      } else {
        console.error(`💥 TESTS FAILED WITH ${testFailures} ERRORS.`);
        cleanupAndExit(1);
      }
    } catch (testError) {
      console.error(`💥 Runtime error during test execution: ${testError.message}`);
      cleanupAndExit(1);
    }
  });
};

const cleanupAndExit = async (code) => {
  console.log('\nCleaning up resources...');
  if (server) {
    server.close(() => {
      console.log('Test server closed.');
    });
  }
  await mongoose.connection.close();
  console.log('Mongoose connection closed.');
  
  // Wait a small timeout to allow logs to flush
  setTimeout(() => {
    process.exit(code);
  }, 1000);
};

runTests();
