import mongoose from 'mongoose';
import User from './models/User.js';
import Order from './models/Order.js';
import FuelStation from './models/FuelStation.js';
import Loyalty from './models/Loyalty.js';
import dotenv from 'dotenv';

dotenv.config();

const testDataSaving = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fuel-buddy');
    console.log('✅ Connected to MongoDB');

    // Test 1: Create a fuel station
    console.log('\n🧪 Testing Fuel Station creation...');
    const fuelStation = new FuelStation({
      name: 'Test Fuel Station',
      address: '123 Test Street, Test City',
      phone: '+1234567890',
      email: 'test@fuelstation.com',
      coordinates: {
        latitude: 40.7128,
        longitude: -74.0060
      },
      fuelTypes: ['regular', 'premium', 'diesel'],
      prices: {
        regular: 3.50,
        premium: 4.00,
        diesel: 3.80
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
    console.log('✅ Fuel Station saved:', savedStation._id);

    // Test 2: Create a user
    console.log('\n🧪 Testing User creation...');
    const user = new User({
      email: 'testuser@fuelbuddy.com',
      password: 'password123',
      full_name: 'Test User',
      phone: '+1234567890',
      address: '456 User Street, Test City'
    });

    const savedUser = await user.save();
    console.log('✅ User saved:', savedUser._id);

    // Test 3: Create an order
    console.log('\n🧪 Testing Order creation...');
    const order = new Order({
      user: savedUser._id,
      fuelStation: savedStation._id,
      fuelType: 'premium',
      quantity: 15,
      totalPrice: 60.00,
      deliveryAddress: '789 Order Street, Test City',
      deliveryTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      specialInstructions: 'Please deliver to front door',
      paymentMethod: 'cash_on_delivery',
      status: 'pending',
      paymentStatus: 'pending'
    });

    const savedOrder = await order.save();
    console.log('✅ Order saved:', savedOrder._id);

    // Test 4: Create loyalty record
    console.log('\n🧪 Testing Loyalty creation...');
    const loyalty = new Loyalty({
      user: savedUser._id,
      totalPoints: 150,
      pointsHistory: [{
        type: 'earned',
        points: 150,
        orderId: savedOrder._id,
        description: 'Earned from fuel order'
      }],
      tier: 'bronze',
      isActive: true
    });

    const savedLoyalty = await loyalty.save();
    console.log('✅ Loyalty saved:', savedLoyalty._id);

    // Test 5: Verify data retrieval
    console.log('\n🔍 Verifying data retrieval...');
    const stationsCount = await FuelStation.countDocuments();
    const usersCount = await User.countDocuments();
    const ordersCount = await Order.countDocuments();
    const loyaltyCount = await Loyalty.countDocuments();

    console.log('📊 Database Summary:');
    console.log(`   Fuel Stations: ${stationsCount}`);
    console.log(`   Users: ${usersCount}`);
    console.log(`   Orders: ${ordersCount}`);
    console.log(`   Loyalty Records: ${loyaltyCount}`);

    console.log('\n🎉 All data saving tests completed successfully!');

    await mongoose.connection.close();

  } catch (error) {
    console.error('❌ Error during data saving test:', error.message);
    process.exit(1);
  }
};

testDataSaving();
