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
 * Create a new session
 */
async function createSession(name, code, sessionYear, description = '') {
  console.log(`\n📅 Creating session: ${name} (${sessionYear})`);

  try {
    const response = await axios.post(`${API_BASE_URL}/api/super-admin/sessions`, {
      name,
      code,
      sessionYear,
      description
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      console.log('✅ Session created successfully!');
      const session = response.data.data;
      console.log(`   Name: ${session.name}`);
      console.log(`   Year: ${session.sessionYear}`);
      console.log(`   ID: ${session._id}`);
      return session;
    } else {
      console.log('❌ Failed to create session:', response.data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Create session error:', error.response?.data?.message || error.message);
    return null;
  }
}

/**
 * Create default sessions
 */
async function createDefaultSessions() {
  console.log('\n📅 Creating default sessions...');

  const defaultSessions = [
    { name: 'Session 2025', code: 'SESS-2025', sessionYear: 2025, description: 'Academic Session 2025' },
    { name: 'Session 2026', code: 'SESS-2026', sessionYear: 2026, description: 'Academic Session 2026' }
  ];

  const createdSessions = [];

  for (const session of defaultSessions) {
    const created = await createSession(session.name, session.code, session.sessionYear, session.description);
    if (created) {
      createdSessions.push(created);
    }
    // Small delay to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`\n✅ Created ${createdSessions.length} default sessions!`);
  return createdSessions;
}

/**
 * Create a new faculty
 */
async function createFaculty(name, code, description = '') {
  console.log(`\n🏫 Creating faculty: ${name}`);

  try {
    const response = await axios.post(`${API_BASE_URL}/api/super-admin/faculties`, {
      name,
      code,
      description
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      console.log('✅ Faculty created successfully!');
      const faculty = response.data.data;
      console.log(`   Name: ${faculty.name}`);
      console.log(`   Code: ${faculty.code}`);
      console.log(`   ID: ${faculty._id}`);
      return faculty;
    } else {
      console.log('❌ Failed to create faculty:', response.data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Create faculty error:', error.response?.data?.message || error.message);
    return null;
  }
}

/**
 * Create default faculties
 */
async function createDefaultFaculties() {
  console.log('\n🏫 Creating default faculties...');

  const defaultFaculties = [
    { name: 'Pre-Engineering', code: 'PRE_ENG', description: 'Faculty for Pre-Engineering students' },
    { name: 'Pre-Medical', code: 'PRE_MED', description: 'Faculty for Pre-Medical students' },
    { name: 'Computer Science', code: 'CS', description: 'Faculty for Computer Science students' },
    { name: 'Commerce', code: 'COM', description: 'Faculty for Commerce students' },
    { name: 'Arts', code: 'ARTS', description: 'Faculty for Arts students' }
  ];

  const createdFaculties = [];

  for (const faculty of defaultFaculties) {
    const created = await createFaculty(faculty.name, faculty.code, faculty.description);
    if (created) {
      createdFaculties.push(created);
    }
    // Small delay to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`\n✅ Created ${createdFaculties.length} default faculties!`);
  return createdFaculties;
}

/**
 * Fetch all sessions
 */
async function fetchSessions() {
  console.log('\n📅 Fetching all sessions...');

  try {
    const response = await axios.get(`${API_BASE_URL}/api/super-admin/sessions`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      console.log('✅ Sessions fetched successfully!');
      console.log(`📊 Total sessions: ${response.data.data.length}`);

      if (response.data.data.length > 0) {
        console.log('\n📅 Session Details:');
        console.log('=' .repeat(60));

        response.data.data.forEach((session, index) => {
          console.log(`${index + 1}. ${session.name}`);
          console.log(`   Year: ${session.sessionYear}`);
          console.log(`   Description: ${session.description || 'No description'}`);
          console.log(`   ID: ${session._id}`);
          console.log(`   Created: ${new Date(session.createdAt).toLocaleDateString()}`);
          console.log('-'.repeat(40));
        });
      }

      return response.data.data;
    } else {
      console.log('❌ Failed to fetch sessions:', response.data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Fetch sessions error:', error.response?.data?.message || error.message);
    return null;
  }
}

/**
 * Fetch all faculties
 */
async function fetchFaculties() {
  console.log('\n🏫 Fetching all faculties...');

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
        console.log('\n🏫 Faculty Details:');
        console.log('=' .repeat(60));

        response.data.data.forEach((faculty, index) => {
          console.log(`${index + 1}. ${faculty.name}`);
          console.log(`   Code: ${faculty.code}`);
          console.log(`   Description: ${faculty.description || 'No description'}`);
          console.log(`   ID: ${faculty._id}`);
          console.log(`   Created: ${new Date(faculty.createdAt).toLocaleDateString()}`);
          console.log('-'.repeat(40));
        });
      }

      return response.data.data;
    } else {
      console.log('❌ Failed to fetch faculties:', response.data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Fetch faculties error:', error.response?.data?.message || error.message);
    return null;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Adding Sessions and Faculties through Super Admin APIs');
  console.log('=' .repeat(70));

  // Step 1: Login as super admin
  const loginSuccess = await loginSuperAdmin();
  if (!loginSuccess) {
    console.log('❌ Script failed: Could not login as super admin');
    return;
  }

  // Step 2: Create default sessions
  console.log('\n📅 Creating Sessions...');
  const sessions = await createDefaultSessions();
  if (!sessions) {
    console.log('❌ Script failed: Could not create sessions');
    return;
  }

  // Step 3: Create default faculties
  console.log('\n🏫 Creating Faculties...');
  const faculties = await createDefaultFaculties();
  if (!faculties) {
    console.log('❌ Script failed: Could not create faculties');
    return;
  }

  // Step 4: Fetch and display all sessions
  await fetchSessions();

  // Step 5: Fetch and display all faculties
  await fetchFaculties();

  console.log('\n🎉 Sessions and faculties setup completed successfully!');
  console.log('=' .repeat(70));
}

// Run the script
main().catch(console.error);
