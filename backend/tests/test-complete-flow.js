import axios from 'axios';

const API_BASE_URL = 'http://localhost:5003/api';

const testCompleteDataFlow = async () => {
  try {
    console.log('🧪 Testing Complete Data Flow...\n');

    // Test 1: Create fuel station
    console.log('1. Creating Fuel Station...');
    const stationData = {
      name: 'Test Complete Station',
      address: '789 Complete Street, Test City',
      phone: '+1234567890',
      email: 'complete@station.com',
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
      services: ['Car Wash', 'Convenience Store'],
      rating: 4.5
    };

    const stationResponse = await axios.post(`${API_BASE_URL}/fuel-stations`, stationData);
    console.log('✅ Fuel Station created:', stationResponse.data._id);
    const stationId = stationResponse.data._id;

    // Test 2: Create user
    console.log('\n2. Creating User...');
    const userData = {
      email: 'complete@user.com',
      password: 'password123',
      full_name: 'Complete Test User',
      phone: '+1234567890',
      address: '456 Complete Street'
    };

    const userResponse = await axios.post(`${API_BASE_URL}/auth/register`, userData);
    console.log('✅ User created:', userResponse.data.user.user_id);
    const userId = userResponse.data.user.user_id;
    const userToken = userResponse.data.token;

    // Test 3: Create order
    console.log('\n3. Creating Order...');
    const orderData = {
      user: userId,
      fuelStation: stationId,
      fuelType: 'premium',
      quantity: 20,
      totalPrice: 80.00,
      deliveryAddress: '123 Order Street, Test City',
      deliveryTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      specialInstructions: 'Test order complete flow',
      paymentMethod: 'cash_on_delivery'
    };

    const orderResponse = await axios.post(`${API_BASE_URL}/orders`, orderData);
    console.log('✅ Order created:', orderResponse.data._id);
    const orderId = orderResponse.data._id;

    // Test 4: Earn loyalty points
    console.log('\n4. Earning Loyalty Points...');
    const loyaltyData = {
      userId: userId,
      points: 80,
      orderId: orderId,
      description: 'Points earned from fuel order'
    };

    const loyaltyResponse = await axios.post(`${API_BASE_URL}/loyalty/earn`, loyaltyData);
    console.log('✅ Loyalty points earned:', loyaltyResponse.data.totalPoints);

    // Test 5: Get all fuel stations
    console.log('\n5. Getting All Fuel Stations...');
    const stationsResponse = await axios.get(`${API_BASE_URL}/fuel-stations`);
    console.log('✅ Retrieved stations:', stationsResponse.data.length, 'stations');

    // Test 6: Get user orders
    console.log('\n6. Getting User Orders...');
    const ordersResponse = await axios.get(`${API_BASE_URL}/orders?userId=${userId}`);
    console.log('✅ Retrieved orders:', ordersResponse.data.length, 'orders');

    // Test 7: Get loyalty points
    console.log('\n7. Getting Loyalty Points...');
    const loyaltyPointsResponse = await axios.get(`${API_BASE_URL}/loyalty/points?userId=${userId}`);
    console.log('✅ User loyalty points:', loyaltyPointsResponse.data.totalPoints);
    console.log('✅ User tier:', loyaltyPointsResponse.data.tier);

    console.log('\n🎉 Complete data flow test successful!');
    console.log('\n📊 Summary:');
    console.log(`   - Fuel Stations: ${stationsResponse.data.length}`);
    console.log(`   - User Orders: ${ordersResponse.data.length}`);
    console.log(`   - Loyalty Points: ${loyaltyPointsResponse.data.totalPoints}`);
    console.log(`   - User Tier: ${loyaltyPointsResponse.data.tier}`);

  } catch (error) {
    console.error('❌ Complete data flow test failed:', error.response?.data || error.message);
  }
};

testCompleteDataFlow();
