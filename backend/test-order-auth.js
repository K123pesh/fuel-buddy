import axios from 'axios';

const testOrderCreation = async () => {
    try {
        // Login first
        console.log('1. Logging in...');
        const loginResponse = await axios.post('http://localhost:5003/api/auth/login', {
            email: 'test@example.com',
            password: 'password123'
        });
        
        console.log('✅ Login successful');
        console.log('User ID:', loginResponse.data.user.user_id);
        console.log('Token:', loginResponse.data.token.substring(0, 20) + '...');
        
        const token = loginResponse.data.token;
        const userId = loginResponse.data.user.user_id;
        
        // Test order creation with authentication
        console.log('\n2. Creating order with authentication...');
        const orderData = {
            user: userId,
            serviceType: 'fuel_delivery',
            fuelStation: '000000000000000000000000',
            fuelType: 'regular',
            quantity: 10,
            totalPrice: 1000,
            deliveryAddress: 'Test Address',
            deliveryTime: new Date().toISOString()
        };
        
        const orderResponse = await axios.post('http://localhost:5003/api/orders', orderData, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✅ Order created successfully:', orderResponse.data._id);
        
        // Test order creation without authentication
        console.log('\n3. Testing order creation without authentication...');
        try {
            const noAuthResponse = await axios.post('http://localhost:5003/api/orders', orderData);
            console.log('❌ Order creation without auth succeeded (unexpected):', noAuthResponse.data._id);
        } catch (error) {
            console.log('✅ Order creation without auth failed as expected:', error.response?.data?.message || error.message);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
};

testOrderCreation();