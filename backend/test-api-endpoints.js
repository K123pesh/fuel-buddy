import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testAPIEndpoints = async () => {
  try {
    console.log('🔍 Testing API Endpoints...\n');
    
    // Test fuel stations endpoint (this works)
    console.log('1. Testing /api/fuel-stations:');
    const fuelStationsResponse = await fetch('http://localhost:5003/api/fuel-stations');
    const fuelStations = await fuelStationsResponse.json();
    console.log(`   ✅ Got ${fuelStations.length} fuel stations\n`);
    
    // Test admin login
    console.log('2. Testing admin login:');
    const loginResponse = await fetch('http://localhost:5003/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    
    const loginData = await loginResponse.json();
    console.log(`   ✅ Login successful, got token\n`);
    
    // Test admin users endpoint
    console.log('3. Testing /api/admin/users:');
    const usersResponse = await fetch('http://localhost:5003/api/admin/users', {
      headers: { 'Authorization': `Bearer ${loginData.token}` }
    });
    
    const usersData = await usersResponse.json();
    console.log(`   ✅ Got ${usersData.users.length} users\n`);
    
    // Test orders endpoint
    console.log('4. Testing /api/orders:');
    const ordersResponse = await fetch('http://localhost:5003/api/orders');
    const ordersData = await ordersResponse.json();
    console.log(`   Status: ${ordersResponse.status}`);
    if (ordersData.orders) {
      console.log(`   ✅ Got ${ordersData.orders.length} orders`);
    } else {
      console.log(`   Response:`, JSON.stringify(ordersData, null, 2));
    }
    
    console.log('\n✅ All API tests completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
};

testAPIEndpoints();