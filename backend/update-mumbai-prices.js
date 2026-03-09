import mongoose from 'mongoose';
import FuelStation from './models/FuelStation.js';

mongoose.connect('mongodb://localhost:27017/fuel-buddy').then(async () => {
  console.log('Connected to MongoDB');
  
  // Update existing fuel station or create new one with Mumbai prices
  const station = await FuelStation.findOneAndUpdate(
    { name: 'Default Fuel Station' },
    {
      $set: {
        'prices.regular': 106.31,  // Petrol price
        'prices.premium': 119.87,  // Premium petrol (estimated)
        'prices.diesel': 94.27,    // Diesel price
        'pricesINR.regular': 106.31,
        'pricesINR.premium': 119.87,
        'pricesINR.diesel': 94.27,
        currency: 'INR'
      },
      $addToSet: {
        fuelTypes: 'cng'  // Add CNG to fuel types if not already present
      }
    },
    { new: true, upsert: true }
  );
  
  if (station) {
    console.log('✅ Fuel station updated with Mumbai prices:');
    console.log(`   Petrol (Regular): ₹${station.pricesINR.regular}`);
    console.log(`   Premium: ₹${station.pricesINR.premium}`);
    console.log(`   Diesel: ₹${station.pricesINR.diesel}`);
    console.log(`   Station ID: ${station._id}`);
  } else {
    // Create new station if none exists
    const newStation = new FuelStation({
      name: 'Mumbai Fuel Station',
      address: '123 Main Street, Mumbai, Maharashtra 400001',
      phone: '+91-22-12345678',
      email: 'mumbai@fuelbuddy.com',
      coordinates: {
        latitude: 19.0760,
        longitude: 72.8777
      },
      fuelTypes: ['regular', 'premium', 'diesel'],
      prices: {
        regular: 106.31,
        premium: 119.87,
        diesel: 94.27
      },
      pricesINR: {
        regular: 106.31,
        premium: 119.87,
        diesel: 94.27
      },
      currency: 'INR',
      operatingHours: {
        monday: { open: '06:00', close: '22:00' },
        tuesday: { open: '06:00', close: '22:00' },
        wednesday: { open: '06:00', close: '22:00' },
        thursday: { open: '06:00', close: '22:00' },
        friday: { open: '06:00', close: '22:00' },
        saturday: { open: '06:00', close: '22:00' },
        sunday: { open: '06:00', close: '22:00' }
      },
      services: ['fuel_delivery', 'air_check', 'tire_pressure'],
      rating: 4.5,
      isActive: true
    });
    
    await newStation.save();
    console.log('✅ New Mumbai fuel station created with current prices:');
    console.log(`   Petrol (Regular): ₹${newStation.pricesINR.regular}`);
    console.log(`   Premium: ₹${newStation.pricesINR.premium}`);
    console.log(`   Diesel: ₹${newStation.pricesINR.diesel}`);
    console.log(`   Station ID: ${newStation._id}`);
  }
  
  console.log('\n📝 Note: CNG price (₹76.59) noted but not yet supported in current schema');
  console.log('   Consider updating the FuelStation schema to include CNG support');
  
  mongoose.connection.close();
}).catch(console.error);
