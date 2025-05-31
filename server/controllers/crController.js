
const supabase = require('../db/supabase');
const { createCRSchema, updateCRStatusSchema } = require('../validators/crValidators');

// Get all CRs with user assignments
const getAllCRs = async (req, res) => {
  try {
    const { data: crs, error } = await supabase
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

    // Transform data to match frontend structure
    const transformedCRs = crs.map(cr => ({
      ...cr,
      assignedDevelopers: cr.cr_developers.map(cd => cd.users)
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
};

// Get CRs for a specific user
const getUserCRs = async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: crs, error } = await supabase
      .from('change_requests')
      .select(`
        *,
        owner:users!change_requests_owner_id_fkey(id, name, email, avatar),
        cr_developers(
          users(id, name, email, avatar)
        ),
        tasks(*)
      `)
      .or(`owner_id.eq.${userId},cr_developers.user_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform data to match frontend structure
    const transformedCRs = crs.map(cr => ({
      ...cr,
      assignedDevelopers: cr.cr_developers.map(cd => cd.users)
    }));

    res.json({
      success: true,
      data: transformedCRs
    });
  } catch (error) {
    console.error('Error fetching user CRs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user change requests',
      error: error.message
    });
  }
};

// Create a new CR
const createCR = async (req, res) => {
  try {
    const { error: validationError } = createCRSchema.validate(req.body);
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: validationError.details[0].message
      });
    }

    const { title, description, owner_id, assigned_developers, due_date, tasks = [] } = req.body;

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

    // Assign developers to the CR
    const developerAssignments = assigned_developers.map(userId => ({
      change_request_id: cr.id,
      user_id: userId
    }));

    const { error: devError } = await supabase
      .from('cr_developers')
      .insert(developerAssignments);

    if (devError) throw devError;

    // Create tasks if provided
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

      if (taskError) throw taskError;
    }

    // Fetch the complete CR with relations
    const { data: completeCR, error: fetchError } = await supabase
      .from('change_requests')
      .select(`
        *,
        owner:users!change_requests_owner_id_fkey(id, name, email, avatar),
        cr_developers(
          users(id, name, email, avatar)
        ),
        tasks(*)
      `)
      .eq('id', cr.id)
      .single();

    if (fetchError) throw fetchError;

    res.status(201).json({
      success: true,
      data: {
        ...completeCR,
        assignedDevelopers: completeCR.cr_developers.map(cd => cd.users)
      },
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
};

// Update CR status
const updateCRStatus = async (req, res) => {
  try {
    const { crId } = req.params;
    const { error: validationError } = updateCRStatusSchema.validate(req.body);
    
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: validationError.details[0].message
      });
    }

    const { status } = req.body;

    const { data: updatedCR, error } = await supabase
      .from('change_requests')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', crId)
      .select(`
        *,
        owner:users!change_requests_owner_id_fkey(id, name, email, avatar),
        cr_developers(
          users(id, name, email, avatar)
        ),
        tasks(*)
      `)
      .single();

    if (error) throw error;

    if (!updatedCR) {
      return res.status(404).json({
        success: false,
        message: 'Change request not found'
      });
    }

    res.json({
      success: true,
      data: {
        ...updatedCR,
        assignedDevelopers: updatedCR.cr_developers.map(cd => cd.users)
      },
      message: 'Change request status updated successfully'
    });
  } catch (error) {
    console.error('Error updating CR status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update change request status',
      error: error.message
    });
  }
};

module.exports = {
  getAllCRs,
  getUserCRs,
  createCR,
  updateCRStatus
};
