/**
 * Script to create test orders and verify they appear in the admin panel
 */

import axios from 'axios';
import mongoose from 'mongoose';
import Order from './backend/models/Order.js';
import User from './backend/models/User.js';
import FuelStation from './backend/models/FuelStation.js';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = 'http://localhost:5003/api';

async function createTestOrders() {
  try {
    console.log('🔧 Setting up test orders for admin panel verification...\n');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fuel-buddy');
    console.log('✅ Connected to MongoDB');

    // Check for existing test user or create one
    let testUser = await User.findOne({ email: 'testuser@example.com' });
    if (!testUser) {
      console.log('👤 Creating test user...');
      testUser = await User.create({
        email: 'testuser@example.com',
        password: 'TestPass123!',
        full_name: 'Test User',
        phone: '+1234567890',
        address: '123 Test Street, Test City'
      });
      console.log('✅ Test user created:', testUser.full_name);
    } else {
      console.log('👤 Using existing test user:', testUser.full_name);
    }

    // Check for existing fuel station or create one
    let fuelStation = await FuelStation.findOne();
    if (!fuelStation) {
      console.log('⛽ Creating test fuel station...');
      fuelStation = await FuelStation.create({
        name: 'Test Fuel Station',
        address: '456 Fuel Street, Test City',
        phone: '+1987654321',
        email: 'station@test.com',
        coordinates: { lat: 19.0760, lng: 72.8777 }, // Mumbai coordinates
        fuelTypes: ['regular', 'premium', 'diesel'],
        prices: {
          regular: 95,
          premium: 110,
          diesel: 85
        },
        operatingHours: {
          Monday: '6:00 AM - 10:00 PM',
          Tuesday: '6:00 AM - 10:00 PM',
          Wednesday: '6:00 AM - 10:00 PM',
          Thursday: '6:00 AM - 10:00 PM',
          Friday: '6:00 AM - 10:00 PM',
          Saturday: '6:00 AM - 10:00 PM',
          Sunday: '6:00 AM - 10:00 PM'
        },
        services: ['fuel', 'car_wash', 'oil_change'],
        rating: 4.5
      });
      console.log('✅ Test fuel station created:', fuelStation.name);
    } else {
      console.log('⛽ Using existing fuel station:', fuelStation.name);
    }

    // Check if we can login with the test user to get a token
    let userToken;
    try {
      console.log('\n🔐 Logging in as test user...');
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: 'testuser@example.com',
        password: 'TestPass123!'
      });
      
      userToken = loginResponse.data.token;
      console.log('✅ Test user login successful');
    } catch (loginError) {
      console.error('❌ Test user login failed:', loginError.response?.data?.message || loginError.message);
      
      // Register the user if login failed
      console.log('📝 Registering test user...');
      const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
        email: 'testuser@example.com',
        password: 'TestPass123!',
        full_name: 'Test User',
        phone: '+1234567890',
        address: '123 Test Street, Test City'
      });
      
      userToken = registerResponse.data.token;
      console.log('✅ Test user registered and logged in');
    }

    // Count orders before creating new ones
    const ordersBefore = await Order.countDocuments();
    console.log(`📊 Orders before test: ${ordersBefore}`);

    // Create several test orders with different statuses
    const testOrders = [
      {
        serviceType: 'fuel_delivery',
        fuelStation: fuelStation._id,
        fuelType: 'regular',
        quantity: 10,
        totalPrice: 950,
        deliveryAddress: '123 Test Street, Test City',
        deliveryTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        specialInstructions: 'Test order 1 - Regular fuel',
        paymentMethod: 'cash_on_delivery',
        status: 'pending'
      },
      {
        serviceType: 'fuel_delivery',
        fuelStation: fuelStation._id,
        fuelType: 'premium',
        quantity: 15,
        totalPrice: 1650,
        deliveryAddress: '456 Sample Avenue, Sample City',
        deliveryTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // In 2 days
        specialInstructions: 'Test order 2 - Premium fuel',
        paymentMethod: 'card',
        status: 'confirmed'
      },
      {
        serviceType: 'fuel_delivery',
        fuelStation: fuelStation._id,
        fuelType: 'diesel',
        quantity: 20,
        totalPrice: 1700,
        deliveryAddress: '789 Demo Road, Demo Town',
        deliveryTime: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(), // In 3 days
        specialInstructions: 'Test order 3 - Diesel fuel',
        paymentMethod: 'wallet',
        status: 'delivered'
      }
    ];

    console.log('\n📦 Creating test orders...');
    const createdOrders = [];
    
    for (let i = 0; i < testOrders.length; i++) {
      try {
        console.log(`   Creating order ${i + 1}/${testOrders.length}...`);
        const response = await axios.post(`${API_BASE_URL}/orders`, testOrders[i], {
          headers: {
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        createdOrders.push(response.data);
        console.log(`   ✅ Order ${i + 1} created: ${response.data._id} (Status: ${response.data.status})`);
      } catch (orderError) {
        console.error(`   ❌ Failed to create order ${i + 1}:`, orderError.response?.data?.message || orderError.message);
      }
    }

    // Count orders after creation
    const ordersAfter = await Order.countDocuments();
    console.log(`\n📊 Orders after test: ${ordersAfter}`);
    console.log(`📈 Orders created: ${ordersAfter - ordersBefore}`);

    // Now let's try to login as admin and fetch these orders
    console.log('\n🔑 Attempting admin login to verify orders...');
    try {
      const adminLoginResponse = await axios.post(`${API_BASE_URL}/admin/login`, {
        username: 'admin',
        password: 'admin123'
      });
      
      const adminToken = adminLoginResponse.data.token;
      console.log('✅ Admin login successful');

      // Fetch orders as admin
      console.log('🔍 Fetching orders via admin panel endpoint...');
      const adminOrdersResponse = await axios.get(`${API_BASE_URL}/admin/orders`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      console.log('✅ Admin orders retrieved successfully');
      console.log(`📊 Orders in admin panel: ${adminOrdersResponse.data.orders.length}`);

      if (adminOrdersResponse.data.orders.length > 0) {
        console.log('\n📋 Orders visible in admin panel:');
        adminOrdersResponse.data.orders.slice(0, 5).forEach((order, idx) => {
          console.log(`  ${idx + 1}. ${order._id?.substring(0, 8)} | ${order.status} | ${order.user?.full_name || 'Unknown'} | ₹${order.totalPrice}`);
        });
      }

      // Check if our newly created orders are visible
      const newlyCreatedIds = createdOrders.map(order => order._id);
      const adminOrderIds = adminOrdersResponse.data.orders.map(order => order._id);
      
      const visibleOrders = newlyCreatedIds.filter(id => adminOrderIds.includes(id));
      const missingOrders = newlyCreatedIds.filter(id => !adminOrderIds.includes(id));
      
      console.log(`\n🔍 Visibility check:`);
      console.log(`   Newly created orders: ${newlyCreatedIds.length}`);
      console.log(`   Visible in admin: ${visibleOrders.length}`);
      console.log(`   Missing from admin: ${missingOrders.length}`);
      
      if (missingOrders.length > 0) {
        console.log('   Missing order IDs:', missingOrders);
        console.log('   ⚠️ Some orders are not visible in the admin panel!');
      } else {
        console.log('   ✅ All newly created orders are visible in admin panel');
      }

    } catch (adminError) {
      console.error('❌ Admin login failed:', adminError.response?.data?.message || adminError.message);
      console.log('💡 Make sure admin credentials are correct (username: admin, password: admin123)');
    }

    await mongoose.connection.close();
    console.log('\n🔒 Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error in test order creation:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
console.log('🚀 Starting test order creation and admin panel verification...\n');
createTestOrders();