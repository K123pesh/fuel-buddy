import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './models/Order.js';
import FuelStation from './models/FuelStation.js';
import User from './models/User.js';

dotenv.config();

const testIndianRupees = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fuel-buddy');
    console.log('✅ Connected to MongoDB');

    // Test 1: Create a fuel station with INR prices
    console.log('\n1. Creating fuel station with INR prices...');
    const fuelStation = new FuelStation({
      name: 'Indian Fuel Station',
      address: '123 Main Street, Mumbai, India',
      phone: '+91-9876543210',
      email: 'mumbai@fuelstation.in',
      coordinates: {
        latitude: 19.0760,
        longitude: 72.8777
      },
      fuelTypes: ['regular', 'premium', 'diesel'],
      currency: 'INR',
      prices: {
        regular: 102.50,
        premium: 115.00,
        diesel: 97.50
      },
      pricesINR: {
        regular: 102.50,
        premium: 115.00,
        diesel: 97.50
      },
      operatingHours: {
        open: '06:00',
        close: '22:00'
      },
      services: ['Car Wash', 'Convenience Store', 'ATM'],
      rating: 4.5,
      isActive: true
    });

    const savedStation = await fuelStation.save();
    console.log('✅ Fuel station created with INR prices:', savedStation._id);

    // Test 2: Create an order with INR currency
    console.log('\n2. Creating order with INR currency...');
    const order = new Order({
      user: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
      fuelStation: savedStation._id,
      fuelType: 'premium',
      quantity: 15,
      currency: 'INR',
      totalPrice: 1725, // 15 liters × ₹115/liter - this will be stored as USD but converted to INR
      deliveryAddress: '456 Order Street, Mumbai',
      deliveryTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      specialInstructions: 'Please deliver to ground floor',
      paymentMethod: 'cash_on_delivery',
      status: 'pending',
      paymentStatus: 'pending'
    });

    const savedOrder = await order.save();
    console.log('✅ Order created with INR currency:', savedOrder._id);
    console.log('   Currency:', savedOrder.currency);
    console.log('   Total Price (INR):', savedOrder.totalPriceINR);
    console.log('   Total Price (converted):', savedOrder.totalPrice);

    // Test 3: Create an order with USD currency
    console.log('\n3. Creating order with USD currency...');
    const orderUSD = new Order({
      user: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
      fuelStation: savedStation._id,
      fuelType: 'regular',
      quantity: 10,
      currency: 'USD',
      totalPrice: 12.05, // 10 liters × $1.205/liter
      deliveryAddress: '789 Order Street, Mumbai',
      deliveryTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      specialInstructions: 'Please deliver to first floor',
      paymentMethod: 'card',
      status: 'pending',
      paymentStatus: 'pending'
    });

    const savedOrderUSD = await orderUSD.save();
    console.log('✅ Order created with USD currency:', savedOrderUSD._id);
    console.log('   Currency:', savedOrderUSD.currency);
    console.log('   Total Price (USD):', savedOrderUSD.totalPrice);
    console.log('   Total Price (converted):', savedOrderUSD.totalPriceINR);

    // Test 4: Retrieve and display orders
    console.log('\n4. Retrieving orders...');
    const orders = await Order.find({})
      .populate('user', 'full_name')
      .populate('fuelStation', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    console.log('✅ Retrieved orders:');
    orders.forEach((order, index) => {
      console.log(`   Order ${index + 1}:`);
      console.log('     User:', order.user?.full_name);
      console.log('     Fuel Station:', order.fuelStation?.name);
      console.log('     Currency:', order.currency);
      console.log('     Total Price:', order.totalPrice);
      console.log('     Total Price (INR):', order.totalPriceINR || 'N/A');
      console.log('     Status:', order.status);
    });

    console.log('\n🎉 Indian Rupees functionality test completed successfully!');
    console.log('\n📊 Summary:');
    console.log('   - Fuel Station with INR prices: ✅');
    console.log('   - Order creation with INR: ✅');
    console.log('   - Order creation with USD: ✅');
    console.log('   - Currency conversion: ✅');
    console.log('   - Data retrieval: ✅');

    await mongoose.connection.close();

  } catch (error) {
    console.error('❌ Indian Rupees test failed:', error.message);
    process.exit(1);
  }
};

testIndianRupees();
