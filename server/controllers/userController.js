
const supabase = require('../db/supabase');
const { createUserSchema } = require('../validators/crValidators');

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};

// Create a new user
const createUser = async (req, res) => {
  try {
    const { error: validationError } = createUserSchema.validate(req.body);
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: validationError.details[0].message
      });
    }

    const { name, email, avatar } = req.body;

    const { data: user, error } = await supabase
      .from('users')
      .insert({ name, email, avatar })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists'
        });
      }
      throw error;
    }

    res.status(201).json({
      success: true,
      data: user,
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error.message
    });
  }
};

module.exports = {
  getAllUsers,
  createUser
};
