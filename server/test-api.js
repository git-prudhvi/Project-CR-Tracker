
const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:5000';

async function testAPI() {
  console.log('🧪 Testing API endpoints...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.status);

    // Test 2: Get users
    console.log('\n2. Testing users endpoint...');
    const usersResponse = await fetch(`${API_BASE_URL}/api/users`);
    const usersData = await usersResponse.json();
    console.log(`✅ Users endpoint: ${usersData.success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`   Found ${usersData.data?.length || 0} users`);

    // Test 3: Get CRs
    console.log('\n3. Testing CRs endpoint...');
    const crsResponse = await fetch(`${API_BASE_URL}/api/crs`);
    const crsData = await crsResponse.json();
    console.log(`✅ CRs endpoint: ${crsData.success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`   Found ${crsData.data?.length || 0} change requests`);

    // Test 4: Create a test CR (if users exist)
    if (usersData.data && usersData.data.length > 0) {
      console.log('\n4. Testing CR creation...');
      const testCR = {
        title: 'Test CR from API test',
        description: 'This is a test change request created by the API test script',
        owner_id: usersData.data[0].id,
        assigned_developers: [usersData.data[0].id],
        due_date: '2024-03-01'
      };

      const createResponse = await fetch(`${API_BASE_URL}/api/crs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCR),
      });

      const createData = await createResponse.json();
      console.log(`✅ CR creation: ${createData.success ? 'SUCCESS' : 'FAILED'}`);
      if (createData.success) {
        console.log(`   Created CR with ID: ${createData.data.id}`);
      }
    }

    console.log('\n🎉 All API tests completed!');

  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

if (require.main === module) {
  testAPI();
}

module.exports = testAPI;
