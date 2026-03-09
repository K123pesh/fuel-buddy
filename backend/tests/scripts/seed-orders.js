import mongoose from 'mongoose';
import Order from './models/Order.js';
import User from './models/User.js';
import FuelStation from './models/FuelStation.js';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/fuel-buddy')
  .then(async () => {
    console.log('Connected to MongoDB');

    try {
      // Get existing users
      const users = await User.find();
      console.log(`Found ${users.length} users`);

      if (users.length === 0) {
        console.log('No users found. Creating sample user...');
        const sampleUser = new User({
          email: 'test@example.com',
          password: 'password123',
          full_name: 'Test User',
          phone: '+1234567890',
          address: '123 Test Street'
        });
        await sampleUser.save();
        users.push(sampleUser);
        console.log('Sample user created');
      }

      // Get or create a fuel station
      let fuelStation = await FuelStation.findOne();
      if (!fuelStation) {
        console.log('No fuel station found. Creating sample station...');
        fuelStation = new FuelStation({
          name: 'Test Fuel Station',
          address: '456 Station Road',
          phone: '+0987654321',
          regularPrice: 95,
          premiumPrice: 105,
          dieselPrice: 85,
          isActive: true
        });
        await fuelStation.save();
        console.log('Sample fuel station created');
      }

      // Create sample orders
      const sampleOrders = [
        {
          user: users[0]._id,
          fuelStation: fuelStation._id,
          fuelType: 'regular',
          quantity: 10,
          totalPrice: 950,
          deliveryAddress: '123 Delivery Address',
          deliveryTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          paymentMethod: 'cash_on_delivery',
          status: 'pending'
        },
        {
          user: users[0]._id,
          fuelStation: fuelStation._id,
          fuelType: 'premium',
          quantity: 15,
          totalPrice: 1575,
          deliveryAddress: '456 Delivery Address',
          deliveryTime: new Date(Date.now() + 48 * 60 * 60 * 1000), // Day after tomorrow
          paymentMethod: 'card',
          status: 'confirmed'
        },
        {
          user: users[0]._id,
          fuelStation: fuelStation._id,
          fuelType: 'diesel',
          quantity: 20,
          totalPrice: 1700,
          deliveryAddress: '789 Delivery Address',
          deliveryTime: new Date(Date.now() + 72 * 60 * 60 * 1000), // 3 days from now
          paymentMethod: 'wallet',
          status: 'dispatched'
        }
      ];

      // Clear existing orders
      await Order.deleteMany({});
      console.log('Cleared existing orders');

      // Create new orders
      const createdOrders = await Order.insertMany(sampleOrders);
      console.log(`Created ${createdOrders.length} sample orders`);

      // Verify orders with populated user data
      const populatedOrders = await Order.find()
        .populate('user', 'full_name email')
        .populate('fuelStation', 'name address');

      console.log('\nPopulated Orders:');
      populatedOrders.forEach((order, index) => {
        console.log(`\nOrder ${index + 1}:`);
        console.log('  ID:', order._id);
        console.log('  User:', order.user ? order.user.full_name : 'NULL');
        console.log('  Email:', order.user ? order.user.email : 'NULL');
        console.log('  Fuel Type:', order.fuelType);
        console.log('  Status:', order.status);
      });

    } catch (error) {
      console.error('Error:', error);
    } finally {
      mongoose.connection.close();
      console.log('\nDisconnected from MongoDB');
    }
  })
  .catch(console.error);
