import axios from 'axios';

const API_BASE_URL = 'http://localhost:5003/api';

const testOrderAPI = async () => {
  try {
    console.log('🧪 Testing Order API endpoints...\n');

    // Test 1: Get all orders (should be empty initially)
    console.log('1. Testing GET /api/orders');
    try {
      const response = await axios.get(`${API_BASE_URL}/orders`);
      console.log('✅ GET /api/orders - Success:', response.data.length, 'orders found');
    } catch (error) {
      console.log('❌ GET /api/orders - Error:', error.response?.data?.message || error.message);
    }

    // Test 2: Create a new order
    console.log('\n2. Testing POST /api/orders');
    const testOrderData = {
      user: '507f1f77bcf86cd799439011', // Dummy user ID
      fuelStation: '507f1f77bcf86cd799439012', // Dummy fuel station ID
      fuelType: 'premium',
      quantity: 15,
      totalPrice: 67.80,
      deliveryAddress: '456 API Test Street, Test City',
      deliveryTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
      specialInstructions: 'Please call upon arrival'
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/orders`, testOrderData);
      console.log('✅ POST /api/orders - Success:', response.data._id);
      const orderId = response.data._id;

      // Test 3: Get specific order
      console.log('\n3. Testing GET /api/orders/:id');
      const getOrderResponse = await axios.get(`${API_BASE_URL}/orders/${orderId}`);
      console.log('✅ GET /api/orders/:id - Success:', getOrderResponse.data.fuelType, getOrderResponse.data.quantity);

      // Test 4: Update order status
      console.log('\n4. Testing PUT /api/orders/:id/status');
      const updateResponse = await axios.put(`${API_BASE_URL}/orders/${orderId}/status`, { status: 'confirmed' });
      console.log('✅ PUT /api/orders/:id/status - Success:', updateResponse.data.status);

    } catch (error) {
      console.log('❌ POST /api/orders - Error:', error.response?.data?.message || error.message);
    }

    console.log('\n🎉 Order API testing completed!');

  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
};

// Only run if backend is running
testOrderAPI();
