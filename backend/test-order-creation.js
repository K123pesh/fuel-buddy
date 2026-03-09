import axios from 'axios';

const API_BASE_URL = 'http://localhost:5003/api';

async function testOrderCreation() {
  try {
    console.log('🧪 Testing order creation...');
    
    // First, login as test user to get token
    console.log('📝 Logging in as test user...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'testuser@example.com',
      password: 'MyPass123!'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful, token received');
    
    // Create test order
    console.log('📦 Creating test order...');
    const orderResponse = await axios.post(`${API_BASE_URL}/orders`, {
      serviceType: 'fuel_delivery',
      fuelStation: null, // Test without fuel station
      fuelType: 'regular',
      quantity: 10,
      totalPrice: 1063.10,
      deliveryAddress: '123 Test Street, Mumbai',
      deliveryTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      specialInstructions: 'Test order',
      paymentMethod: 'cash_on_delivery'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Order created successfully!');
    console.log('Order ID:', orderResponse.data._id);
    console.log('Order details:', {
      id: orderResponse.data._id,
      status: orderResponse.data.status,
      fuelType: orderResponse.data.fuelType,
      quantity: orderResponse.data.quantity,
      totalPrice: orderResponse.data.totalPrice
    });
    
    // Test admin access to orders
    console.log('🔐 Testing admin access to orders...');
    
    // Login as admin
    const adminLoginResponse = await axios.post(`${API_BASE_URL}/admin/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    const adminToken = adminLoginResponse.data.token;
    console.log('✅ Admin login successful');
    
    // Get orders as admin
    const adminOrdersResponse = await axios.get(`${API_BASE_URL}/admin/orders`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Admin orders retrieved successfully!');
    console.log('Total orders:', adminOrdersResponse.data.orders.length);
    
    if (adminOrdersResponse.data.orders.length > 0) {
      const latestOrder = adminOrdersResponse.data.orders[0];
      console.log('Latest order:', {
        id: latestOrder._id,
        status: latestOrder.status,
        user: latestOrder.user?.full_name || latestOrder.user?.email,
        fuelType: latestOrder.fuelType,
        quantity: latestOrder.quantity,
        totalPrice: latestOrder.totalPrice,
        createdAt: latestOrder.createdAt
      });
    }
    
    console.log('🎉 All tests passed! Orders are working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

testOrderCreation();
