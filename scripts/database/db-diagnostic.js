/**
 * Database Diagnostic Script for Fuel Buddy
 * Checks MongoDB connection and investigates order data
 */

import mongoose from 'mongoose';
import Order from './backend/models/Order.js';
import User from './backend/models/User.js';
import Admin from './backend/models/Admin.js';
import FuelStation from './backend/models/FuelStation.js';
import dotenv from 'dotenv';

dotenv.config();

async function runDiagnostic() {
  console.log('🔍 Starting database diagnostic...\n');
  
  try {
    // Connect to database
    console.log('📡 Connecting to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fuel-buddy');
    console.log('✅ Connected to MongoDB:', conn.connection.host);
    
    // Check collections exist and have data
    console.log('\n📋 Checking collections...');
    
    // Check users collection
    const userCount = await User.countDocuments();
    console.log(`👥 Users: ${userCount}`);
    if (userCount > 0) {
      const sampleUser = await User.findOne().select('full_name email role').lean();
      console.log(`   Sample user: ${sampleUser.full_name} (${sampleUser.email})`);
    }
    
    // Check orders collection
    const orderCount = await Order.countDocuments();
    console.log(`📦 Orders: ${orderCount}`);
    
    // Get sample orders to see their structure
    if (orderCount > 0) {
      const sampleOrders = await Order.find()
        .populate('user', 'full_name email')
        .populate('fuelStation', 'name')
        .limit(5)
        .lean();
      
      console.log('   Sample orders:');
      sampleOrders.forEach((order, idx) => {
        console.log(`     ${idx + 1}. ID: ${order._id} | Status: ${order.status} | User: ${order.user?.full_name || 'N/A'} | Price: ₹${order.totalPrice}`);
      });
    } else {
      console.log('   ⚠️  No orders found in database');
    }
    
    // Check admin collection
    const adminCount = await Admin.countDocuments();
    console.log(`🛡️  Admins: ${adminCount}`);
    
    if (adminCount > 0) {
      const sampleAdmin = await Admin.findOne().select('username email role permissions').lean();
      console.log(`   Sample admin: ${sampleAdmin.username} | Role: ${sampleAdmin.role}`);
      console.log(`   Permissions: ${sampleAdmin.permissions.join(', ')}`);
      
      // Check if admin has manage_orders permission
      if (!sampleAdmin.permissions.includes('manage_orders')) {
        console.log('   ❌ Admin does not have "manage_orders" permission - this explains why orders are not showing!');
      } else {
        console.log('   ✅ Admin has "manage_orders" permission');
      }
    } else {
      console.log('   ⚠️  No admin accounts found - create one with: node scripts/setup-admin.js');
    }
    
    // Check fuel stations
    const stationCount = await FuelStation.countDocuments();
    console.log(`⛽ Fuel Stations: ${stationCount}`);
    
    // Check recent orders specifically
    console.log('\n🕒 Checking recent orders...');
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'full_name email')
      .lean();
    
    if (recentOrders.length > 0) {
      console.log('   Recent orders (most recent first):');
      recentOrders.forEach((order, idx) => {
        console.log(`     ${idx + 1}. ${new Date(order.createdAt).toLocaleString()} | ${order.status} | ${order.user?.full_name || 'N/A'} | ₹${order.totalPrice}`);
      });
    } else {
      console.log('   No recent orders found');
    }
    
    // Check if there are orders with specific statuses that might be filtered out
    const statusCounts = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);
    
    console.log('\n📊 Order status breakdown:');
    if (statusCounts.length > 0) {
      statusCounts.forEach(status => {
        console.log(`   ${status._id}: ${status.count}`);
      });
    } else {
      console.log('   No orders found to analyze');
    }
    
    // Check if orders are being created without user references (could be an issue)
    const orphanedOrders = await Order.countDocuments({ user: { $exists: false } });
    console.log(`\n👻 Orders without user reference: ${orphanedOrders}`);
    
    if (orphanedOrders > 0) {
      console.log('   ⚠️  Found orders without user references - this could cause issues in admin panel');
      const sampleOrphans = await Order.find({ user: { $exists: false } }).limit(3).lean();
      sampleOrphans.forEach((order, idx) => {
        console.log(`     ${idx + 1}. ID: ${order._id} | Status: ${order.status} | Created: ${order.createdAt}`);
      });
    }
    
    // Check if the issue might be with populate
    console.log('\n🔍 Testing populate functionality...');
    const orderWithPopulate = await Order.findOne()
      .populate('user', 'full_name email')
      .populate('fuelStation', 'name')
      .lean();
    
    if (orderWithPopulate) {
      console.log('   Populate test - sample order with populated data:');
      console.log(`     Order ID: ${orderWithPopulate._id}`);
      console.log(`     User populated: ${!!orderWithPopulate.user} (${orderWithPopulate.user?.full_name || 'N/A'})`);
      console.log(`     Fuel Station populated: ${!!orderWithPopulate.fuelStation} (${orderWithPopulate.fuelStation?.name || 'N/A'})`);
    }
    
    console.log('\n✅ Database diagnostic completed successfully');
    
    // Summary of potential issues
    console.log('\n📋 SUMMARY OF FINDINGS:');
    if (adminCount === 0) {
      console.log('   • No admin accounts exist - create one first');
    }
    if (orderCount === 0) {
      console.log('   • No orders exist - create test orders');
    }
    if (adminCount > 0) {
      const admin = await Admin.findOne().select('permissions').lean();
      if (!admin.permissions.includes('manage_orders')) {
        console.log('   • Admin lacks "manage_orders" permission - this prevents orders from showing in admin panel');
      }
    }
    if (orphanedOrders > 0) {
      console.log('   • Some orders lack user references - this may cause issues');
    }
    
  } catch (error) {
    console.error('❌ Database diagnostic failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔒 Disconnected from MongoDB');
  }
}

// Run the diagnostic
runDiagnostic();