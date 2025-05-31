
const Joi = require('joi');

const createCRSchema = Joi.object({
  title: Joi.string().min(3).max(500).required(),
  description: Joi.string().max(2000).optional(),
  owner_id: Joi.string().uuid().required(),
  assigned_developers: Joi.array().items(Joi.string().uuid()).min(1).required(),
  due_date: Joi.date().iso().min('now').required(),
  tasks: Joi.array().items(
    Joi.object({
      description: Joi.string().min(3).max(1000).required(),
      assigned_to: Joi.string().uuid().required()
    })
  ).optional()
});

const updateCRStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'in-progress', 'completed', 'blocked').required()
});

const updateTaskStatusSchema = Joi.object({
  status: Joi.string().valid('not-started', 'in-progress', 'completed').required()
});

const createUserSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  email: Joi.string().email().required(),
  avatar: Joi.string().uri().optional()
});

module.exports = {
  createCRSchema,
  updateCRStatusSchema,
  updateTaskStatusSchema,
  createUserSchema
};
