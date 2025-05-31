
const fetch = require('node-fetch');

const FRONTEND_URL = process.env.NODE_ENV === 'production' 
  ? 'https://v0-vo-dev-details.vercel.app'
  : 'http://localhost:3000';

const BACKEND_URL = process.env.NODE_ENV === 'production'
  ? 'https://f967cd42-26d5-422d-8deb-ff6c58b64622-00-7f8ivc75mdzv.pike.replit.dev'
  : 'http://localhost:5000';

async function runTests() {
  console.log('🧪 Running comprehensive application tests...\n');

  // Test 1: Backend Health Check
  console.log('1. Testing backend health...');
  try {
    const response = await fetch(`${BACKEND_URL}/health`);
    const data = await response.json();
    console.log(`✅ Backend health: ${data.status}`);
  } catch (error) {
    console.log('❌ Backend health check failed:', error.message);
    return;
  }

  // Test 2: Database Connection (Users endpoint)
  console.log('\n2. Testing database connection via users endpoint...');
  try {
    const response = await fetch(`${BACKEND_URL}/api/users`);
    const data = await response.json();
    if (data.success && Array.isArray(data.data)) {
      console.log(`✅ Database connection successful - Found ${data.data.length} users`);
      
      // Display first few users
      data.data.slice(0, 3).forEach(user => {
        console.log(`   - ${user.name} (${user.email})`);
      });
    } else {
      console.log('❌ Database connection failed or no data returned');
    }
  } catch (error) {
    console.log('❌ Users endpoint failed:', error.message);
  }

  // Test 3: Change Requests endpoint
  console.log('\n3. Testing change requests endpoint...');
  try {
    const response = await fetch(`${BACKEND_URL}/api/crs`);
    const data = await response.json();
    if (data.success && Array.isArray(data.data)) {
      console.log(`✅ Change requests endpoint successful - Found ${data.data.length} CRs`);
      
      // Display first few CRs
      data.data.slice(0, 3).forEach(cr => {
        const taskCount = cr.tasks?.length || 0;
        const devCount = cr.assignedDevelopers?.length || 0;
        console.log(`   - "${cr.title}" (${cr.status}) - ${taskCount} tasks, ${devCount} devs`);
      });
    } else {
      console.log('❌ Change requests endpoint failed or no data returned');
    }
  } catch (error) {
    console.log('❌ Change requests endpoint failed:', error.message);
  }

  // Test 4: CORS Test
  console.log('\n4. Testing CORS configuration...');
  try {
    const response = await fetch(`${BACKEND_URL}/api/users`, {
      method: 'GET',
      headers: {
        'Origin': FRONTEND_URL,
        'Content-Type': 'application/json'
      }
    });
    console.log(`✅ CORS test successful - Status: ${response.status}`);
  } catch (error) {
    console.log('❌ CORS test failed:', error.message);
  }

  // Test 5: Data Structure Validation
  console.log('\n5. Validating data structure consistency...');
  try {
    const response = await fetch(`${BACKEND_URL}/api/crs`);
    const data = await response.json();
    
    if (data.success && data.data.length > 0) {
      const cr = data.data[0];
      const hasRequiredFields = cr.id && cr.title && cr.status && cr.owner;
      const hasProperStructure = cr.owner && typeof cr.owner === 'object';
      const hasTasksArray = Array.isArray(cr.tasks);
      const hasDevsArray = Array.isArray(cr.assignedDevelopers);
      
      if (hasRequiredFields && hasProperStructure && hasTasksArray && hasDevsArray) {
        console.log('✅ Data structure validation passed');
        console.log(`   - CR has owner: ${cr.owner.name}`);
        console.log(`   - Tasks count: ${cr.tasks.length}`);
        console.log(`   - Assigned developers: ${cr.assignedDevelopers.length}`);
      } else {
        console.log('❌ Data structure validation failed');
        console.log(`   - Required fields: ${hasRequiredFields}`);
        console.log(`   - Proper structure: ${hasProperStructure}`);
        console.log(`   - Tasks array: ${hasTasksArray}`);
        console.log(`   - Devs array: ${hasDevsArray}`);
      }
    }
  } catch (error) {
    console.log('❌ Data structure validation failed:', error.message);
  }

  console.log('\n📊 Test Summary:');
  console.log(`   Backend URL: ${BACKEND_URL}`);
  console.log(`   Frontend URL: ${FRONTEND_URL}`);
  console.log('\n🎯 Next Steps:');
  console.log('   1. If all tests pass, your application should be working');
  console.log('   2. Open the frontend URL to verify the dashboard loads');
  console.log('   3. Check that data displays correctly on the dashboard');
  console.log('   4. Try filtering and searching functionality');
}

if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = runTests;
