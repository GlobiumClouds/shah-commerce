const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

const SUPER_ADMIN_EMAIL = 'superadmin@gmail.com';
const SUPER_ADMIN_PASSWORD = 'password123';

let authToken = null;

/**
 * Login as Super Admin
 */
async function loginSuperAdmin() {
  console.log('🔐 Logging in as Super Admin...');

  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: SUPER_ADMIN_EMAIL,
      password: SUPER_ADMIN_PASSWORD
    });

    if (response.data.success) {
      authToken = response.data.data?.accessToken || response.data.data?.token;
      console.log('✅ Login successful!');
      console.log(`🔑 Token: ${authToken ? authToken.substring(0, 50) + '...' : 'No token received'}`);
      return true;
    } else {
      console.log('❌ Login failed:', response.data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Login error:', error.response?.data?.message || error.message);
    return false;
  }
}

/**
 * Fetch all faculties
 */
async function fetchFaculties() {
  console.log('\n📋 Fetching all faculties...');

  try {
    const response = await axios.get(`${API_BASE_URL}/api/super-admin/faculties`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      console.log('✅ Faculties fetched successfully!');
      console.log(`📊 Total faculties: ${response.data.data.length}`);

      if (response.data.data.length > 0) {
        console.log('\n📋 Faculty Details:');
        console.log('=' .repeat(60));

        response.data.data.forEach((faculty, index) => {
          console.log(`${index + 1}. ${faculty.name}`);
          console.log(`   Code: ${faculty.code}`);
          console.log(`   Description: ${faculty.description || 'No description'}`);
          console.log(`   ID: ${faculty._id}`);
          console.log(`   Created: ${new Date(faculty.createdAt).toLocaleDateString()}`);
          console.log(`   Updated: ${new Date(faculty.updatedAt).toLocaleDateString()}`);
          console.log('-'.repeat(40));
        });
      } else {
        console.log('📝 No faculties found. Create some faculties first.');
      }

      return response.data.data;
    } else {
      console.log('❌ Failed to fetch faculties:', response.data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Fetch faculties error:', error.response?.data?.message || error.message);
    console.log('❌ Status code:', error.response?.status);
    return null;
  }
}

/**
 * Fetch faculties with stats
 */
async function fetchFacultiesWithStats() {
  console.log('\n📊 Fetching faculties with subject count stats...');

  try {
    const response = await axios.get(`${API_BASE_URL}/api/super-admin/faculties?stats=true`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      console.log('✅ Faculties with stats fetched successfully!');
      console.log(`📊 Total faculties: ${response.data.data.length}`);

      if (response.data.data.length > 0) {
        console.log('\n📋 Faculty Stats:');
        console.log('=' .repeat(60));

        response.data.data.forEach((faculty, index) => {
          console.log(`${index + 1}. ${faculty.name} (${faculty.code})`);
          console.log(`   Subject Count: ${faculty.subjectCount || 0}`);
          console.log(`   Description: ${faculty.description || 'No description'}`);
          console.log('-'.repeat(40));
        });
      }

      return response.data.data;
    } else {
      console.log('❌ Failed to fetch faculties with stats:', response.data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Fetch faculties with stats error:', error.response?.data?.message || error.message);
    return null;
  }
}

/**
 * Fetch single faculty by ID
 */
async function fetchFacultyById(facultyId) {
  console.log(`\n🔍 Fetching faculty by ID: ${facultyId}`);

  try {
    const response = await axios.get(`${API_BASE_URL}/api/super-admin/faculties/${facultyId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      console.log('✅ Faculty fetched successfully!');
      const faculty = response.data.data;
      console.log(`📋 Faculty Details:`);
      console.log(`   Name: ${faculty.name}`);
      console.log(`   Code: ${faculty.code}`);
      console.log(`   Description: ${faculty.description || 'No description'}`);
      console.log(`   ID: ${faculty._id}`);
      console.log(`   Created: ${new Date(faculty.createdAt).toLocaleDateString()}`);
      console.log(`   Updated: ${new Date(faculty.updatedAt).toLocaleDateString()}`);
      return faculty;
    } else {
      console.log('❌ Failed to fetch faculty:', response.data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Fetch faculty by ID error:', error.response?.data?.message || error.message);
    return null;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Fetching Faculties through API');
  console.log('=' .repeat(50));

  // Step 1: Login as super admin
  const loginSuccess = await loginSuperAdmin();
  if (!loginSuccess) {
    console.log('❌ Script failed: Could not login as super admin');
    return;
  }

  // Step 2: Fetch all faculties
  const faculties = await fetchFaculties();
  if (!faculties) {
    console.log('❌ Script failed: Could not fetch faculties');
    return;
  }

  // Step 3: Fetch faculties with stats
  await fetchFacultiesWithStats();

  // Step 4: If we have faculties, fetch one by ID
  if (faculties.length > 0) {
    const firstFacultyId = faculties[0]._id;
    await fetchFacultyById(firstFacultyId);
  }

  console.log('\n🎉 Faculty fetching completed successfully!');
  console.log('=' .repeat(50));
}

// Run the script
main().catch(console.error);
