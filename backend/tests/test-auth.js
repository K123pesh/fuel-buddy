import axios from 'axios';

const API_BASE_URL = 'http://localhost:5003/api';

const testAuth = async () => {
  try {
    console.log('🧪 Testing Authentication Flow...\n');

    // Test 1: Register a new user
    console.log('1. Testing Registration');
    const registerData = {
      email: 'testuser@example.com',
      password: 'password123',
      full_name: 'Test User',
      phone: '+1234567890',
      address: '123 Test Street'
    };

    try {
      const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, registerData);
      console.log('✅ Registration successful:', {
        user_id: registerResponse.data.user.user_id,
        email: registerResponse.data.user.email,
        token_received: !!registerResponse.data.token
      });
      
      // Test 2: Login with the same user
      console.log('\n2. Testing Login');
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: 'testuser@example.com',
        password: 'password123'
      });
      
      console.log('✅ Login successful:', {
        user_id: loginResponse.data.user.user_id,
        email: loginResponse.data.user.email,
        token_received: !!loginResponse.data.token
      });

      // Test 3: Validate token with /me endpoint
      console.log('\n3. Testing Token Validation');
      const token = loginResponse.data.token;
      const meResponse = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Token validation successful:', {
        user_id: meResponse.data.user_id,
        email: meResponse.data.email,
        full_name: meResponse.data.full_name
      });

      console.log('\n🎉 Authentication flow test completed successfully!');

    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        console.log('ℹ️ User already exists, testing login...');
        
        // Test login directly
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
          email: 'testuser@example.com',
          password: 'password123'
        });
        
        console.log('✅ Login successful:', {
          user_id: loginResponse.data.user.user_id,
          email: loginResponse.data.user.email,
          token_received: !!loginResponse.data.token
        });

        // Test token validation
        const token = loginResponse.data.token;
        const meResponse = await axios.get(`${API_BASE_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('✅ Token validation successful:', {
          user_id: meResponse.data.user_id,
          email: meResponse.data.email,
          full_name: meResponse.data.full_name
        });

        console.log('\n🎉 Authentication flow test completed successfully!');
      } else {
        throw error;
      }
    }

  } catch (error) {
    console.error('❌ Authentication test failed:', error.response?.data || error.message);
  }
};

testAuth();
