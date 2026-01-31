const fetch = require('node-fetch');

async function addSampleData() {
  try {
    console.log('Logging in as super admin...');

    // Login
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'superadmin@example.com',
        password: 'password123'
      })
    });

    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);

    if (!loginData.success) {
      console.error('Login failed:', loginData.message);
      return;
    }

    const token = loginData.data.accessToken;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    console.log('Adding sample sessions...');

    // Add sessions
    const sessions = [
      { name: '2024 Academic Year', code: '2024', sessionYear: 2024, description: 'Academic year 2024' },
      { name: '2025 Academic Year', code: '2025', sessionYear: 2025, description: 'Academic year 2025', isActive: true },
      { name: '2026 Academic Year', code: '2026', sessionYear: 2026, description: 'Academic year 2026' }
    ];

    for (const session of sessions) {
      const response = await fetch('http://localhost:3000/api/super-admin/sessions', {
        method: 'POST',
        headers,
        body: JSON.stringify(session)
      });
      const data = await response.json();
      console.log(`Session ${session.name}:`, data.success ? 'Added' : data.message);
    }

    console.log('Adding sample faculties...');

    // Add faculties
    const faculties = [
      { name: 'Pre-Engineering', code: 'PE', description: 'Pre-Engineering faculty' },
      { name: 'Pre-Medical', code: 'PM', description: 'Pre-Medical faculty' },
      { name: 'Computer Science', code: 'CS', description: 'Computer Science faculty' }
    ];

    for (const faculty of faculties) {
      const response = await fetch('http://localhost:3000/api/super-admin/faculties', {
        method: 'POST',
        headers,
        body: JSON.stringify(faculty)
      });
      const data = await response.json();
      console.log(`Faculty ${faculty.name}:`, data.success ? 'Added' : data.message);
    }

    console.log('\nFetching sessions...');
    const sessionsResponse = await fetch('http://localhost:3000/api/super-admin/sessions', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const sessionsData = await sessionsResponse.json();
    console.log('Sessions:', sessionsData.data?.length || 0, 'found');

    console.log('Fetching faculties...');
    const facultiesResponse = await fetch('http://localhost:3000/api/super-admin/faculties', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const facultiesData = await facultiesResponse.json();
    console.log('Faculties:', facultiesData.data?.length || 0, 'found');

  } catch (error) {
    console.error('Error:', error);
  }
}

addSampleData();
