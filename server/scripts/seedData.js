
const supabase = require('../db/supabase');

const mockUsers = [
  {
    name: "Alice Johnson",
    email: "alice@company.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice"
  },
  {
    name: "Bob Smith",
    email: "bob@company.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob"
  },
  {
    name: "Carol Davis",
    email: "carol@company.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carol"
  },
  {
    name: "David Wilson",
    email: "david@company.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David"
  },
  {
    name: "Eva Martinez",
    email: "eva@company.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Eva"
  },
  {
    name: "Frank Brown",
    email: "frank@company.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Frank"
  },
  {
    name: "Grace Lee",
    email: "grace@company.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Grace"
  },
  {
    name: "Henry Taylor",
    email: "henry@company.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Henry"
  },
  {
    name: "Ivy Chen",
    email: "ivy@company.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ivy"
  },
  {
    name: "Jack Morgan",
    email: "jack@company.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jack"
  }
];

const mockCRs = [
  {
    title: "Implement User Authentication System",
    description: "Add comprehensive user authentication with login, registration, password reset, and session management.",
    status: "in-progress",
    due_date: "2024-02-15"
  },
  {
    title: "Dashboard Performance Optimization",
    description: "Optimize dashboard loading times and implement caching strategies for better user experience.",
    status: "pending",
    due_date: "2024-02-10"
  },
  {
    title: "Mobile App API Integration",
    description: "Create REST API endpoints for mobile application integration with proper documentation.",
    status: "completed",
    due_date: "2024-01-30"
  },
  {
    title: "Security Audit Implementation",
    description: "Conduct comprehensive security audit and implement recommended security measures.",
    status: "blocked",
    due_date: "2024-02-05"
  },
  {
    title: "Email Notification System",
    description: "Build automated email notification system for user actions and system events.",
    status: "in-progress",
    due_date: "2024-02-20"
  }
];

async function seedData() {
  try {
    console.log('🌱 Starting data seeding...');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await supabase.from('tasks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('cr_developers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('change_requests').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Insert users
    console.log('👥 Inserting users...');
    const { data: users, error: userError } = await supabase
      .from('users')
      .insert(mockUsers)
      .select();

    if (userError) throw userError;
    console.log(`✅ Created ${users.length} users`);

    // Insert change requests
    console.log('📋 Inserting change requests...');
    const crsWithOwners = mockCRs.map((cr, index) => ({
      ...cr,
      owner_id: users[index % users.length].id
    }));

    const { data: crs, error: crError } = await supabase
      .from('change_requests')
      .insert(crsWithOwners)
      .select();

    if (crError) throw crError;
    console.log(`✅ Created ${crs.length} change requests`);

    // Assign developers to CRs
    console.log('👨‍💻 Assigning developers to CRs...');
    const developerAssignments = [];
    crs.forEach((cr, index) => {
      // Assign 2-3 random developers to each CR
      const numDevs = Math.floor(Math.random() * 2) + 2;
      const assignedDevs = [...users]
        .sort(() => Math.random() - 0.5)
        .slice(0, numDevs);
      
      assignedDevs.forEach(dev => {
        developerAssignments.push({
          change_request_id: cr.id,
          user_id: dev.id
        });
      });
    });

    const { error: devError } = await supabase
      .from('cr_developers')
      .insert(developerAssignments);

    if (devError) throw devError;
    console.log(`✅ Created ${developerAssignments.length} developer assignments`);

    // Create sample tasks
    console.log('📝 Creating sample tasks...');
    const tasks = [];
    crs.forEach((cr, crIndex) => {
      const taskCount = Math.floor(Math.random() * 3) + 2; // 2-4 tasks per CR
      const taskStatuses = ['not-started', 'in-progress', 'completed'];
      
      for (let i = 0; i < taskCount; i++) {
        tasks.push({
          change_request_id: cr.id,
          description: `Task ${i + 1} for ${cr.title}`,
          status: taskStatuses[Math.floor(Math.random() * taskStatuses.length)],
          assigned_to: users[Math.floor(Math.random() * users.length)].id
        });
      }
    });

    const { error: taskError } = await supabase
      .from('tasks')
      .insert(tasks);

    if (taskError) throw taskError;
    console.log(`✅ Created ${tasks.length} tasks`);

    console.log('🎉 Data seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Change Requests: ${crs.length}`);
    console.log(`   Developer Assignments: ${developerAssignments.length}`);
    console.log(`   Tasks: ${tasks.length}`);

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  seedData().then(() => process.exit(0));
}

module.exports = seedData;
