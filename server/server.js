
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Supabase setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(cors({
  origin: '*',
  credentials: false
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('name');

    if (error) throw error;

    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// Get all change requests
app.get('/api/crs', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('change_requests')
      .select(`
        *,
        owner:users!change_requests_owner_id_fkey(id, name, email, avatar),
        cr_developers(
          users(id, name, email, avatar)
        ),
        tasks(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform data
    const transformedCRs = (data || []).map(cr => ({
      ...cr,
      assignedDevelopers: (cr.cr_developers || []).map(cd => cd.users).filter(Boolean)
    }));

    res.json({
      success: true,
      data: transformedCRs
    });
  } catch (error) {
    console.error('Error fetching CRs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch change requests',
      error: error.message
    });
  }
});

// Create new CR
app.post('/api/crs', async (req, res) => {
  try {
    const { title, description, owner_id, assigned_developers = [], due_date, tasks = [] } = req.body;

    // Create the change request
    const { data: cr, error: crError } = await supabase
      .from('change_requests')
      .insert({
        title,
        description,
        owner_id,
        due_date,
        status: 'pending'
      })
      .select()
      .single();

    if (crError) throw crError;

    // Assign developers
    if (assigned_developers.length > 0) {
      const developerAssignments = assigned_developers.map(userId => ({
        change_request_id: cr.id,
        user_id: userId
      }));

      const { error: devError } = await supabase
        .from('cr_developers')
        .insert(developerAssignments);

      if (devError) console.error('Error assigning developers:', devError);
    }

    // Create tasks
    if (tasks.length > 0) {
      const taskInserts = tasks.map(task => ({
        change_request_id: cr.id,
        description: task.description,
        assigned_to: task.assigned_to,
        status: 'not-started'
      }));

      const { error: taskError } = await supabase
        .from('tasks')
        .insert(taskInserts);

      if (taskError) console.error('Error creating tasks:', taskError);
    }

    res.status(201).json({
      success: true,
      data: cr,
      message: 'Change request created successfully'
    });
  } catch (error) {
    console.error('Error creating CR:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create change request',
      error: error.message
    });
  }
});

// Update CR status
app.patch('/api/crs/:crId/status', async (req, res) => {
  try {
    const { crId } = req.params;
    const { status } = req.body;

    const { data, error } = await supabase
      .from('change_requests')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', crId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data,
      message: 'Status updated successfully'
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update status',
      error: error.message
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
