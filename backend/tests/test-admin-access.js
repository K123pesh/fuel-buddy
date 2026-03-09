import http from 'http';

const testAdminAccess = () => {
  const options = {
    hostname: 'localhost',
    port: 8084,
    path: '/admin/login',
    method: 'GET',
    headers: {
      'User-Agent': 'Admin-Test-Script'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('🌐 Admin Login Page Status:', res.statusCode);
      if (res.statusCode === 200) {
        console.log('✅ Admin login page is accessible');
        console.log('📱 Open http://localhost:8084/admin/login in your browser');
        console.log('🔑 Use credentials: admin / admin123');
      } else {
        console.log('❌ Admin login page not accessible');
      }
    });
  });

  req.on('error', (err) => {
    console.error('❌ Request failed:', err.message);
  });

  req.end();
};

testAdminAccess();
