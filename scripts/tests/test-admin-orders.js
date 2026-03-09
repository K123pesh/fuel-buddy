/**
 * Script to test admin panel order retrieval functionality
 */
import axios from 'axios';
import mongoose from 'mongoose';
import Order from './backend/models/Order.js';
import Admin from './backend/models/Admin.js';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = 'http://localhost:5003/api';

async function testAdminOrdersEndpoint() {
  try {
    console.log('🔧 Testing admin panel order retrieval functionality...\n');

    // First, let's check if we can connect to the database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fuel-buddy');
    console.log('✅ Connected to MongoDB');

    // Check if admin exists
    const adminExists = await Admin.exists({ username: 'admin' });
    console.log(`🔑 Admin account exists: ${!!adminExists}`);

    // Count orders in DB
    const dbOrderCount = await Order.countDocuments();
    console.log(`📊 Orders in database: ${dbOrderCount}\n`);

    if (dbOrderCount > 0) {
      const sampleOrders = await Order.find().limit(3);
      console.log('📋 Sample orders from DB:');
      sampleOrders.forEach((order, idx) => {
        console.log(`  ${idx + 1}. ID: ${order._id}, Status: ${order.status}, Price: ₹${order.totalPrice}`);
      });
      console.log('');
    }

    // Attempt to login as admin
    console.log('🔐 Attempting to login as admin...');
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/admin/login`, {
        username: 'admin',
        password: 'admin123'
      });

      console.log('✅ Admin login successful');
      const adminToken = loginResponse.data.token;
      console.log(`Token: ${adminToken.substring(0, 20)}...`);

      // Now try to get orders via admin endpoint
      console.log('\n🔍 Attempting to fetch orders via admin endpoint...');
      const ordersResponse = await axios.get(`${API_BASE_URL}/admin/orders`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      console.log('✅ Admin orders endpoint responded successfully');
      console.log(`📊 Orders returned by admin endpoint: ${ordersResponse.data.orders.length}`);

      if (ordersResponse.data.orders.length > 0) {
        console.log('\n📋 Sample orders from admin endpoint:');
        ordersResponse.data.orders.slice(0, 3).forEach((order, idx) => {
          console.log(`  ${idx + 1}. ID: ${order._id?.substring(0, 8)}, Status: ${order.status}, User: ${order.user?.full_name || 'N/A'}, Price: ₹${order.totalPrice}`);
        });
      }

      // Compare with direct DB query
      console.log('\n🔄 Comparing with direct DB query...');
      const directOrders = await Order.find()
        .populate('user', 'full_name email')
        .populate('fuelStation', 'name')
        .sort({ createdAt: -1 })
        .limit(20);

      console.log(`Direct DB query returned: ${directOrders.length} orders`);
      
      if (directOrders.length !== ordersResponse.data.orders.length) {
        console.log('⚠️ Discrepancy detected between DB and API response!');
        console.log(`   DB count: ${directOrders.length}`);
        console.log(`   API count: ${ordersResponse.data.orders.length}`);
      } else {
        console.log('✅ Counts match between DB and API');
      }

    } catch (loginError) {
      console.error('❌ Admin login failed:', loginError.response?.data?.message || loginError.message);
      
      // Try to create admin if it doesn't exist
      if (!adminExists) {
        console.log('\n📝 Attempting to create admin account...');
        try {
          const setupResponse = await axios.post(`${API_BASE_URL}/admin/setup`, {
            username: 'admin',
            email: 'admin@fuelbuddy.com',
            password: 'admin123',
            role: 'super_admin'
          });
          
          console.log('✅ Admin account created successfully');
        } catch (setupError) {
          console.error('❌ Failed to create admin account:', setupError.response?.data?.message || setupError.message);
        }
      }
    }

    await mongoose.connection.close();
    console.log('\n🔒 Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error in admin order test:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 The backend server might not be running. Please start it with:');
      console.error('   cd backend && npm run dev');
    }
  }
}

// Run the test
console.log('🚀 Starting admin panel order test...\n');
testAdminOrdersEndpoint();