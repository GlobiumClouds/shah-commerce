const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

async function debugBranches() {
  try {
    console.log('🔍 Debugging branch deletion issue...\n');

    // First, login as super admin
    console.log('🔐 Logging in as super admin...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: 'superadmin@easeacademy.com',
      password: 'SuperAdmin123!'
    });

    const token = loginResponse.data?.data?.token;
    if (!token) {
      console.log('❌ No token received from login');
      return;
    }
    console.log('✅ Login successful, token received\n');

    // Set authorization header for subsequent requests
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Fetch all branches
    console.log('📋 Fetching all branches...');
    const branchesResponse = await axios.get(`${API_BASE_URL}/api/super-admin/branches`, { headers });

    if (branchesResponse.data.success) {
      const branches = branchesResponse.data.data.branches || [];
      console.log(`✅ Found ${branches.length} branches:\n`);

      branches.forEach((branch, index) => {
        console.log(`${index + 1}. ID: ${branch._id}`);
        console.log(`   Name: ${branch.name}`);
        console.log(`   Code: ${branch.code}`);
        console.log(`   Status: ${branch.status}`);
        console.log('');
      });

      if (branches.length > 0) {
        // Try to delete the first branch
        const branchToDelete = branches[0];
        console.log(`🗑️  Attempting to delete branch: ${branchToDelete.name} (ID: ${branchToDelete._id})`);

        try {
          const deleteResponse = await axios.delete(`${API_BASE_URL}/api/super-admin/branches/${branchToDelete._id}`, { headers });
          console.log('✅ Delete response:', deleteResponse.data);
        } catch (deleteError) {
          console.log('❌ Delete failed:', deleteError.response?.data || deleteError.message);
        }
      }
    } else {
      console.log('❌ Failed to fetch branches:', branchesResponse.data);
    }

  } catch (error) {
    console.error('❌ Error during debugging:', error.response?.data || error.message);
  }
}

debugBranches();
