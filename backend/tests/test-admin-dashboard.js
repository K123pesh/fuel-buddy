import axios from 'axios';

const API_BASE_URL = 'http://localhost:5003/api';

const testAdminDashboard = async () => {
  try {
    console.log('🧪 Testing Admin Dashboard with Real Data...\n');

    // Test admin login first
    console.log('1. Testing admin login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/admin/login`, {
      username: 'admin',
      password: 'admin123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Admin login successful');

    // Test dashboard data fetch
    console.log('\n2. Testing dashboard data...');
    const dashboardResponse = await axios.get(`${API_BASE_URL}/admin/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const dashboard = dashboardResponse.data.dashboard;
    console.log('✅ Dashboard data retrieved:');
    console.log('   Total Users:', dashboard.totalUsers);
    console.log('   Total Orders:', dashboard.totalOrders);
    console.log('   Total Stations:', dashboard.totalStations);
    console.log('   Total Revenue:', `$${dashboard.totalRevenue.toFixed(2)}`);

    // Test users data fetch
    console.log('\n3. Testing users data...');
    const usersResponse = await axios.get(`${API_BASE_URL}/admin/users`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Users data retrieved:', usersResponse.data.users.length, 'users');
    console.log('   Sample user:', usersResponse.data.users[0]?.full_name);

    // Test orders data fetch
    console.log('\n4. Testing orders data...');
    const ordersResponse = await axios.get(`${API_BASE_URL}/admin/orders`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Orders data retrieved:', ordersResponse.data.orders.length, 'orders');
    console.log('   Sample order:', `$${ordersResponse.data.orders[0]?.totalPrice}`);

    console.log('\n🎉 Admin dashboard real data test completed successfully!');
    console.log('\n📊 Summary:');
    console.log('   - Dashboard API: ✅ Working');
    console.log('   - Users API: ✅ Working');
    console.log('   - Orders API: ✅ Working');
    console.log('   - Authentication: ✅ Working');
    console.log('\n🌐 Access your admin dashboard at:');
    console.log('   http://localhost:8084/admin/dashboard');
    console.log('\n🔑 Login credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');

  } catch (error) {
    console.error('❌ Admin dashboard test failed:', error.response?.data || error.message);
  }
};

testAdminDashboard();
