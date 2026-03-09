@echo off
cd /d "c:\Users\kalpe\Downloads\fuel-buddy-on-demand-main\backend"
set PATH=C:\Program Files\nodejs;%PATH%
echo Creating a default fuel station...
"C:\Program Files\nodejs\node.exe" -e "
import mongoose from 'mongoose';
import FuelStation from './models/FuelStation.js';

mongoose.connect('mongodb://localhost:27017/fuel-buddy').then(async () => {
  console.log('Connected to MongoDB');
  
  // Check if station already exists
  const existingStation = await FuelStation.findOne({ name: 'Default Fuel Station' });
  if (existingStation) {
    console.log('Default fuel station already exists');
    process.exit(0);
  }
  
  // Create default fuel station
  const station = new FuelStation({
    name: 'Default Fuel Station',
    address: '123 Main Street, Mumbai, Maharashtra 400001',
    phone: '+91-22-12345678',
    email: 'fuel@fuelbuddy.com',
    coordinates: {
      latitude: 19.0760,
      longitude: 72.8777
    },
    fuelTypes: ['petrol', 'diesel'],
    prices: {
      regular: 106.31,
      premium: 119.87,
      diesel: 94.27
    },
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
  
  await station.save();
  console.log('Default fuel station created successfully!');
  console.log('Station ID:', station._id);
  
  mongoose.connection.close();
}).catch(console.error);
"
if %ERRORLEVEL% NEQ 0 (
    echo Error occurred: %ERRORLEVEL%
    pause
)
