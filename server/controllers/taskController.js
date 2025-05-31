
const supabase = require('../db/supabase');
const { updateTaskStatusSchema } = require('../validators/crValidators');

// Update task status
const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { error: validationError } = updateTaskStatusSchema.validate(req.body);
    
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: validationError.details[0].message
      });
    }

    const { status } = req.body;

    const { data: updatedTask, error } = await supabase
      .from('tasks')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .select(`
        *,
        assigned_to_user:users!tasks_assigned_to_fkey(id, name, email, avatar)
      `)
      .single();

    if (error) throw error;

    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      data: updatedTask,
      message: 'Task status updated successfully'
    });
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update task status',
      error: error.message
    });
  }
};

// Get tasks for a specific CR
const getCRTasks = async (req, res) => {
  try {
    const { crId } = req.params;

    const { data: tasks, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assigned_to_user:users!tasks_assigned_to_fkey(id, name, email, avatar)
      `)
      .eq('change_request_id', crId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error('Error fetching CR tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks',
      error: error.message
    });
  }
};

module.exports = {
  updateTaskStatus,
  getCRTasks
};
