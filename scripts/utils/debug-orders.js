/**
 * Script to debug order storage and retrieval in the admin panel
 */
import mongoose from 'mongoose';
import Order from './backend/models/Order.js';
import User from './backend/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function debugOrders() {
  try {
    // Connect to database
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fuel-buddy');
    console.log('✅ Connected to MongoDB:', conn.connection.host);

    // Count total orders
    const totalOrders = await Order.countDocuments();
    console.log(`📊 Total orders in database: ${totalOrders}`);

    if (totalOrders > 0) {
      console.log('\n📋 Fetching sample orders with population...');
      
      // Get orders with user and fuel station populated
      const orders = await Order.find()
        .populate('user', 'full_name email')
        .populate('fuelStation', 'name address')
        .sort({ createdAt: -1 })
        .limit(10); // Get latest 10 orders
      
      console.log(`Fetched ${orders.length} orders:`);
      
      orders.forEach((order, index) => {
        console.log(`\n${index + 1}. Order ID: ${order._id}`);
        console.log(`   Status: ${order.status}`);
        console.log(`   User: ${order.user?.full_name || 'N/A'} (${order.user?.email || 'no email'})`);
        console.log(`   Service Type: ${order.serviceType || 'N/A'}`);
        console.log(`   Fuel Type: ${order.fuelType || 'N/A'}`);
        console.log(`   Quantity: ${order.quantity || 'N/A'}L`);
        console.log(`   Total Price: ₹${order.totalPrice || 0}`);
        console.log(`   Fuel Station: ${order.fuelStation?.name || 'N/A'}`);
        console.log(`   Delivery Address: ${order.deliveryAddress || 'N/A'}`);
        console.log(`   Created At: ${order.createdAt}`);
        console.log(`   Updated At: ${order.updatedAt}`);
      });
    } else {
      console.log('\n⚠️ No orders found in the database');
      console.log('This could mean either:');
      console.log('  1. No orders have been created yet');
      console.log('  2. There is an issue with order creation');
      console.log('  3. Orders are being created in a different database');
      
      // Check if users exist
      const userCount = await User.countDocuments();
      console.log(`\n👤 Total users in database: ${userCount}`);
      
      if (userCount > 0) {
        const sampleUser = await User.findOne().select('full_name email');
        console.log(`Sample user: ${sampleUser.full_name} (${sampleUser.email})`);
      }
    }

    // Test a specific query that the admin panel would use
    console.log('\n🔍 Testing admin panel order query...');
    const adminPanelOrders = await Order.find({})
      .populate('user', 'full_name email')
      .populate('fuelStation', 'name address')
      .sort({ createdAt: -1 })
      .limit(20);
    
    console.log(`Admin panel would show: ${adminPanelOrders.length} orders`);

    // Close connection
    await mongoose.connection.close();
    console.log('\n🔒 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error in debug script:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Also test the specific filters that might be used
async function testFilters() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fuel-buddy');
    
    console.log('\n🔍 Testing various order filters used by admin panel...');
    
    // Test different status counts
    const statusCounts = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);
    
    console.log('Order status breakdown:');
    statusCounts.forEach(status => {
      console.log(`  ${status._id}: ${status.count}`);
    });
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error in filter test:', error.message);
  }
}

// Run the debug functions
console.log('🔧 Starting order debug process...');
debugOrders().then(() => testFilters()).catch(console.error);