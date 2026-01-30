const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

const testUsers = [
  {
    fullName: 'Branch Admin',
    email: 'branchadmin@gmail.com',
    password: '123456',
    phone: '+923001234567',
    role: 'branch_admin'
  },
  {
    fullName: 'Teacher User',
    email: 'teacher@gmail.com',
    password: '12345',
    phone: '+923001234568',
    role: 'teacher'
  }
];

async function registerUsers() {
  console.log('🚀 Registering test users...\n');

  for (const user of testUsers) {
    try {
      console.log(`📝 Registering: ${user.fullName} (${user.email})`);

      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        fullName: user.fullName,
        email: user.email,
        password: user.password,
        phone: user.phone,
        role: user.role
      });

      if (response.data.success) {
        console.log(`✅ Successfully registered: ${user.email}\n`);
      } else {
        console.log(`❌ Failed to register ${user.email}:`, response.data.message, '\n');
      }
    } catch (error) {
      console.log(`❌ Error registering ${user.email}:`, error.response?.data?.message || error.message, '\n');
    }
  }

  console.log('🎉 Registration process completed!');
}

registerUsers();
