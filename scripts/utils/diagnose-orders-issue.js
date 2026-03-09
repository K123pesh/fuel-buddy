/**
 * Diagnostic script to identify why orders are not appearing in the admin panel
 * Run this script after starting your backend server
 */

import axios from 'axios';
import mongoose from 'mongoose';
import Order from './backend/models/Order.js';
import User from './backend/models/User.js';
import Admin from './backend/models/Admin.js';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = 'http://localhost:5003/api';

async function diagnoseIssue() {
  console.log('🔍 Starting diagnosis of order storage issue...\n');
  
  try {
    // 1. Check database connectivity
    console.log('1️⃣  Checking database connection...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fuel-buddy');
    console.log('✅ Database connection successful\n');

    // 2. Check if any orders exist in the database
    console.log('2️⃣  Checking for existing orders in database...');
    const totalOrders = await Order.countDocuments();
    console.log(`📊 Total orders in database: ${totalOrders}`);
    
    if (totalOrders > 0) {
      const sampleOrders = await Order.find().populate('user', 'full_name email').limit(3);
      console.log('📋 Sample orders from DB:');
      sampleOrders.forEach((order, idx) => {
        console.log(`   ${idx + 1}. ID: ${order._id}, Status: ${order.status}, User: ${order.user?.full_name || 'N/A'}, Price: ₹${order.totalPrice}`);
      });
    } else {
      console.log('   ℹ️  No orders found in database');
    }
    console.log('');

    // 3. Check if admin exists
    console.log('3️⃣  Checking admin account...');
    const adminExists = await Admin.exists({ username: 'admin' });
    console.log(`🔑 Admin account exists: ${!!adminExists}`);
    if (!adminExists) {
      console.log('   ⚠️  Admin account not found - this could prevent admin panel access');
    }
    console.log('');

    // 4. Check if users exist
    console.log('4️⃣  Checking for existing users...');
    const userCount = await User.countDocuments();
    console.log(`👥 Total users in database: ${userCount}`);
    
    if (userCount > 0) {
      const sampleUser = await User.findOne().select('full_name email');
      console.log(`   📋 Sample user: ${sampleUser.full_name} (${sampleUser.email})`);
    } else {
      console.log('   ⚠️  No users found - orders typically require a user to be created');
    }
    console.log('');

    // 5. Test server connectivity
    console.log('5️⃣  Testing server connectivity...');
    try {
      const healthCheck = await axios.get(`${API_BASE_URL}/health`);
      console.log('✅ Server is responding to health check');
    } catch (error) {
      console.log('❌ Server is not responding. Is the backend running?');
      console.log(`   Error: ${error.message}`);
      console.log('   💡 Tip: Run "cd backend && npm run dev" to start the server');
      return; // Stop if server isn't running
    }
    console.log('');

    // 6. Try to login as admin (if admin exists)
    if (adminExists) {
      console.log('6️⃣  Testing admin login...');
      try {
        const adminLoginResponse = await axios.post(`${API_BASE_URL}/admin/login`, {
          username: 'admin',
          password: 'admin123'
        });
        
        const adminToken = adminLoginResponse.data.token;
        console.log('✅ Admin login successful');
        
        // 7. Test fetching orders as admin
        console.log('7️⃣  Testing admin orders endpoint...');
        try {
          const ordersResponse = await axios.get(`${API_BASE_URL}/admin/orders`, {
            headers: {
              'Authorization': `Bearer ${adminToken}`
            }
          });
          
          console.log(`✅ Admin orders endpoint responded successfully`);
          console.log(`📊 Orders returned by admin endpoint: ${ordersResponse.data.orders.length}`);
          
          if (ordersResponse.data.orders.length > 0) {
            console.log('📋 Orders visible to admin:');
            ordersResponse.data.orders.slice(0, 3).forEach((order, idx) => {
              console.log(`   ${idx + 1}. ID: ${order._id?.substring(0, 8)}, Status: ${order.status}, User: ${order.user?.full_name || 'N/A'}, Price: ₹${order.totalPrice}`);
            });
          } else {
            console.log('   ⚠️  No orders returned by admin endpoint despite having ${totalOrders} in DB');
            
            // This suggests an issue with the admin orders endpoint
            console.log('   🛠️  Potential issues:');
            console.log('      - Admin permissions might not include "manage_orders"');
            console.log('      - There might be a filter in the admin endpoint hiding orders');
            console.log('      - The populate logic might be failing');
          }
        } catch (ordersError) {
          console.log(`❌ Failed to fetch orders via admin endpoint: ${ordersError.message}`);
          if (ordersError.response) {
            console.log(`   Status: ${ordersError.response.status}`);
            console.log(`   Data: ${JSON.stringify(ordersError.response.data)}`);
          }
        }
      } catch (adminError) {
        console.log(`❌ Admin login failed: ${adminError.message}`);
        if (adminError.response) {
          console.log(`   Status: ${adminError.response.status}`);
          console.log(`   Data: ${JSON.stringify(adminError.response.data)}`);
        }
      }
    } else {
      console.log('6️⃣  Skipping admin tests - no admin account found');
    }
    
    // 8. Check admin permissions if admin exists
    if (adminExists) {
      console.log('\n8️⃣  Checking admin permissions...');
      const admin = await Admin.findOne({ username: 'admin' }).select('permissions');
      console.log(`   Permissions: ${admin.permissions.join(', ')}`);
      
      if (!admin.permissions.includes('manage_orders')) {
        console.log('   ⚠️  Admin does not have "manage_orders" permission!');
        console.log('      This would prevent the admin from seeing orders in the panel.');
      }
    }
    
    console.log('\n--- DIAGNOSIS COMPLETE ---');
    
    // Summary of potential issues
    console.log('\n📋 SUMMARY OF POTENTIAL ISSUES:');
    
    if (totalOrders === 0) {
      console.log('   • No orders exist in the database');
      console.log('     → Need to create test orders first');
    }
    
    if (!adminExists) {
      console.log('   • No admin account exists');
      console.log('     → Run setup-admin script or create admin account');
    }
    
    if (adminExists && totalOrders > 0) {
      // If we have both admin and orders but can't see them, check the discrepancy
      try {
        const adminLoginResponse = await axios.post(`${API_BASE_URL}/admin/login`, {
          username: 'admin',
          password: 'admin123'
        });
        
        const adminToken = adminLoginResponse.data.token;
        const ordersResponse = await axios.get(`${API_BASE_URL}/admin/orders`, {
          headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        
        if (ordersResponse.data.orders.length === 0 && totalOrders > 0) {
          console.log('   • Orders exist in DB but not returned by admin endpoint');
          console.log('     → Issue with admin orders endpoint logic');
          console.log('     → Check filters, populate logic, or permissions');
        }
      } catch (e) {
        console.log('   • Unable to test admin endpoint communication');
      }
    }
    
    console.log('\n🔧 TO FIX THE ISSUE:');
    console.log('   1. Ensure backend server is running: cd backend && npm run dev');
    console.log('   2. Create an admin account if needed: node scripts/setup-admin.js');
    console.log('   3. Create a test order via the frontend');
    console.log('   4. Check server logs for any error messages');
    console.log('   5. Verify that admin has "manage_orders" permission');
    
  } catch (error) {
    console.error('❌ Error during diagnosis:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔒 Database connection closed');
  }
}

// Run the diagnosis
diagnoseIssue();