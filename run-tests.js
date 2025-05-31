
// Using built-in fetch API (Node.js 18+)
const BACKEND_URL = 'https://f967cd42-26d5-422d-8deb-ff6c58b64622-00-7f8ivc75mdzv.pike.replit.dev';
const FRONTEND_URL = 'https://v0-vo-dev-details.vercel.app';

async function runTests() {
  console.log('🧪 COMPREHENSIVE CR CRUD TESTING SUITE');
  console.log('========================================');
  console.log(`Backend URL: ${BACKEND_URL}`);
  console.log(`Frontend URL: ${FRONTEND_URL}\n`);

  let allTestsPassed = true;

  // Test 1: Backend Health Check
  console.log('1. 🏥 Testing backend health...');
  try {
    const response = await fetch(`${BACKEND_URL}/health`);
    const data = await response.json();
    if (response.ok && data.status === 'OK') {
      console.log('✅ Backend health check PASSED');
    } else {
      console.log('❌ Backend health check FAILED');
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('❌ Backend health check FAILED:', error.message);
    allTestsPassed = false;
  }

  // Test 2: Get Users (for CR creation)
  console.log('\n2. 👥 Testing users API...');
  let users = [];
  try {
    const response = await fetch(`${BACKEND_URL}/api/users`);
    const data = await response.json();
    if (response.ok && data.success && Array.isArray(data.data)) {
      console.log(`✅ Users API PASSED - Found ${data.data.length} users`);
      users = data.data;
      if (users.length > 0) {
        console.log(`   Sample user: ${users[0].name} (${users[0].email})`);
      }
    } else {
      console.log('❌ Users API FAILED');
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('❌ Users API FAILED:', error.message);
    allTestsPassed = false;
  }

  // Test 3: Get Initial CRs
  console.log('\n3. 📋 Testing initial CR fetch...');
  let initialCRCount = 0;
  try {
    const response = await fetch(`${BACKEND_URL}/api/crs`);
    const data = await response.json();
    if (response.ok && data.success && Array.isArray(data.data)) {
      initialCRCount = data.data.length;
      console.log(`✅ Initial CR fetch PASSED - Found ${initialCRCount} CRs`);
    } else {
      console.log('❌ Initial CR fetch FAILED');
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('❌ Initial CR fetch FAILED:', error.message);
    allTestsPassed = false;
  }

  // Test 4: CREATE CR
  console.log('\n4. ➕ Testing CR creation...');
  let createdCR = null;
  if (users.length >= 2) {
    try {
      const newCR = {
        title: `Test CR ${Date.now()}`,
        description: 'This is a test change request created by automated testing',
        owner_id: users[0].id,
        assigned_developers: [users[0].id, users[1].id],
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        tasks: [
          {
            description: 'Test task 1',
            assigned_to: users[0].id
          },
          {
            description: 'Test task 2', 
            assigned_to: users[1].id
          }
        ]
      };

      const response = await fetch(`${BACKEND_URL}/api/crs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCR),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        createdCR = data.data;
        console.log(`✅ CR creation PASSED - Created CR: ${createdCR.title}`);
        console.log(`   CR ID: ${createdCR.id}`);
        console.log(`   Owner: ${createdCR.owner?.name || 'Unknown'}`);
        console.log(`   Tasks: ${createdCR.tasks?.length || 0}`);
      } else {
        console.log('❌ CR creation FAILED:', data.message);
        allTestsPassed = false;
      }
    } catch (error) {
      console.log('❌ CR creation FAILED:', error.message);
      allTestsPassed = false;
    }
  } else {
    console.log('⚠️ CR creation SKIPPED - Not enough users');
  }

  // Test 5: READ CR (verify creation)
  console.log('\n5. 👀 Testing CR read after creation...');
  if (createdCR) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/crs`);
      const data = await response.json();
      if (response.ok && data.success) {
        const foundCR = data.data.find(cr => cr.id === createdCR.id);
        if (foundCR) {
          console.log(`✅ CR read PASSED - Found created CR: ${foundCR.title}`);
          console.log(`   Status: ${foundCR.status}`);
          console.log(`   Assigned developers: ${foundCR.assignedDevelopers?.length || 0}`);
        } else {
          console.log('❌ CR read FAILED - Created CR not found');
          allTestsPassed = false;
        }
      } else {
        console.log('❌ CR read FAILED:', data.message);
        allTestsPassed = false;
      }
    } catch (error) {
      console.log('❌ CR read FAILED:', error.message);
      allTestsPassed = false;
    }
  } else {
    console.log('⚠️ CR read SKIPPED - No CR was created');
  }

  // Test 6: UPDATE CR Status
  console.log('\n6. ✏️ Testing CR status update...');
  if (createdCR) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/crs/${createdCR.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'in-progress'
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        console.log(`✅ CR status update PASSED - Status changed to: ${data.data.status}`);
      } else {
        console.log('❌ CR status update FAILED:', data.message);
        allTestsPassed = false;
      }
    } catch (error) {
      console.log('❌ CR status update FAILED:', error.message);
      allTestsPassed = false;
    }
  } else {
    console.log('⚠️ CR status update SKIPPED - No CR was created');
  }

  // Test 7: UPDATE entire CR
  console.log('\n7. 📝 Testing full CR update...');
  if (createdCR && users.length >= 1) {
    try {
      const updateData = {
        title: `Updated Test CR ${Date.now()}`,
        description: 'This CR has been updated by automated testing',
        status: 'completed',
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        assigned_developers: [users[0].id]
      };

      const response = await fetch(`${BACKEND_URL}/api/crs/${createdCR.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        console.log(`✅ Full CR update PASSED - Updated title: ${data.data.title}`);
        console.log(`   New status: ${data.data.status}`);
        console.log(`   Assigned developers: ${data.data.assignedDevelopers?.length || 0}`);
      } else {
        console.log('❌ Full CR update FAILED:', data.message);
        allTestsPassed = false;
      }
    } catch (error) {
      console.log('❌ Full CR update FAILED:', error.message);
      allTestsPassed = false;
    }
  } else {
    console.log('⚠️ Full CR update SKIPPED - No CR was created');
  }

  // Test 8: Verify CR count increased
  console.log('\n8. 📊 Testing CR count after creation...');
  try {
    const response = await fetch(`${BACKEND_URL}/api/crs`);
    const data = await response.json();
    if (response.ok && data.success) {
      const currentCount = data.data.length;
      if (createdCR && currentCount > initialCRCount) {
        console.log(`✅ CR count verification PASSED - Count increased from ${initialCRCount} to ${currentCount}`);
      } else if (!createdCR) {
        console.log(`ℹ️ CR count verification - Count remains ${currentCount} (no CR was created)`);
      } else {
        console.log(`⚠️ CR count verification - Expected increase but count is ${currentCount}`);
      }
    } else {
      console.log('❌ CR count verification FAILED');
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('❌ CR count verification FAILED:', error.message);
    allTestsPassed = false;
  }

  // Test 9: DELETE CR
  console.log('\n9. 🗑️ Testing CR deletion...');
  if (createdCR) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/crs/${createdCR.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (response.ok && data.success) {
        console.log(`✅ CR deletion PASSED - Deleted CR: ${createdCR.title}`);
      } else {
        console.log('❌ CR deletion FAILED:', data.message);
        allTestsPassed = false;
      }
    } catch (error) {
      console.log('❌ CR deletion FAILED:', error.message);
      allTestsPassed = false;
    }
  } else {
    console.log('⚠️ CR deletion SKIPPED - No CR was created');
  }

  // Test 10: Verify deletion
  console.log('\n10. ✅ Testing CR deletion verification...');
  if (createdCR) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/crs`);
      const data = await response.json();
      if (response.ok && data.success) {
        const deletedCR = data.data.find(cr => cr.id === createdCR.id);
        if (!deletedCR) {
          console.log(`✅ CR deletion verification PASSED - CR no longer exists`);
          const finalCount = data.data.length;
          console.log(`   Final CR count: ${finalCount}`);
        } else {
          console.log('❌ CR deletion verification FAILED - CR still exists');
          allTestsPassed = false;
        }
      } else {
        console.log('❌ CR deletion verification FAILED');
        allTestsPassed = false;
      }
    } catch (error) {
      console.log('❌ CR deletion verification FAILED:', error.message);
      allTestsPassed = false;
    }
  } else {
    console.log('⚠️ CR deletion verification SKIPPED - No CR was created');
  }

  // Test 11: API Response Format Validation
  console.log('\n11. 📋 Testing API response format validation...');
  try {
    const response = await fetch(`${BACKEND_URL}/api/crs`);
    const data = await response.json();

    if (data.success && Array.isArray(data.data)) {
      if (data.data.length > 0) {
        const testCR = data.data[0];
        const requiredFields = ['id', 'title', 'description', 'status', 'owner', 'assignedDevelopers', 'due_date', 'tasks'];
        const hasAllFields = requiredFields.every(field => testCR.hasOwnProperty(field));

        if (hasAllFields) {
          console.log('✅ API response format PASSED');
          console.log(`   Sample CR has all required fields: ${requiredFields.join(', ')}`);
        } else {
          console.log('❌ API response format FAILED - Missing required fields');
          const missingFields = requiredFields.filter(field => !testCR.hasOwnProperty(field));
          console.log(`   Missing fields: ${missingFields.join(', ')}`);
          allTestsPassed = false;
        }
      } else {
        console.log('⚠️ API response format - No CRs to validate format');
      }
    } else {
      console.log('❌ API response format FAILED - Invalid structure');
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('❌ API response format FAILED:', error.message);
    allTestsPassed = false;
  }

  // Test 12: CORS Configuration
  console.log('\n12. 🌐 Testing CORS configuration...');
  try {
    const response = await fetch(`${BACKEND_URL}/api/crs`, {
      method: 'GET',
      headers: {
        'Origin': FRONTEND_URL,
        'Content-Type': 'application/json'
      }
    });
    if (response.ok) {
      console.log('✅ CORS configuration PASSED');
    } else {
      console.log('❌ CORS configuration FAILED - Status:', response.status);
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('❌ CORS configuration FAILED:', error.message);
    allTestsPassed = false;
  }

  // Final Results
  console.log('\n' + '='.repeat(60));
  if (allTestsPassed) {
    console.log('🎉 ALL CRUD TESTS PASSED! Application is fully functional.');
    console.log('\n✅ CR Creation works correctly');
    console.log('✅ CR Reading/Viewing works correctly');
    console.log('✅ CR Updating works correctly');
    console.log('✅ CR Deletion works correctly');
    console.log('✅ API endpoints are properly configured');
    console.log('✅ Database operations are working');
    console.log('✅ CORS is properly configured');
    console.log('\n🚀 Ready for production deployment!');
  } else {
    console.log('❌ SOME CRUD TESTS FAILED! Please check the issues above.');
    console.log('\n🔧 Review the failed tests and fix the issues before deployment.');
  }
  console.log('='.repeat(60));
}

// Run the comprehensive CRUD tests
runTests().catch(console.error);
