import axios from 'axios';

const API_BASE_URL = 'http://localhost:5003/api';

const setupAdmin = async () => {
  try {
    console.log('🔧 Setting up Admin Account...\n');

    // Create initial admin account
    const adminData = {
      username: 'admin',
      email: 'admin@fuelbuddy.com',
      password: 'admin123',
      role: 'super_admin'
    };

    console.log('1. Creating admin account...');
    const response = await axios.post(`${API_BASE_URL}/admin/setup`, adminData);
    console.log('✅ Admin account created:', response.data.admin.username);
    console.log('   Email:', response.data.admin.email);
    console.log('   Role:', response.data.admin.role);
    console.log('   Permissions:', response.data.admin.permissions.join(', '));

    // Test admin login
    console.log('\n2. Testing admin login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/admin/login`, {
      username: 'admin',
      password: 'admin123'
    });

    console.log('✅ Admin login successful');
    console.log('   Admin ID:', loginResponse.data.admin.admin_id);
    console.log('   Token received:', !!loginResponse.data.token);

    // Test admin dashboard
    console.log('\n3. Testing admin dashboard...');
    const dashboardResponse = await axios.get(`${API_BASE_URL}/admin/dashboard`, {
      headers: {
        'Authorization': `Bearer ${loginResponse.data.token}`
      }
    });

    const dashboard = dashboardResponse.data.dashboard;
    console.log('✅ Dashboard data retrieved:');
    console.log('   Total Users:', dashboard.totalUsers);
    console.log('   Total Orders:', dashboard.totalOrders);
    console.log('   Total Stations:', dashboard.totalStations);
    console.log('   Total Revenue:', `$${dashboard.totalRevenue.toFixed(2)}`);

    console.log('\n🎉 Admin setup completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('   URL: http://localhost:5003/api/admin/login');

  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
      console.log('ℹ️ Admin account already exists');
      console.log('🔑 Try logging in with:');
      console.log('   Username: admin');
      console.log('   Password: admin123');
    } else {
      console.error('❌ Admin setup failed:', error.response?.data || error.message);
    }
  }
};

setupAdmin();
