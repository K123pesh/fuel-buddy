import axios from 'axios';

const testPasswords = async () => {
    const passwords = ['Test123!', 'MyPass123!', 'Password1!', 'Admin123!', 'test123', 'password123', 'Password123!'];
    const email = 'test@example.com';
    
    for (const password of passwords) {
        try {
            const response = await axios.post('http://localhost:5003/api/auth/login', {
                email,
                password
            });
            console.log(`✅ SUCCESS with password '${password}':`, response.data.user.email);
            return;
        } catch (error) {
            console.log(`❌ FAILED with password '${password}':`, error.response?.data?.message || 'Error');
        }
    }
    
    console.log('No valid password found for test@example.com');
};

testPasswords();