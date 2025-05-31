
const express = require('express');
const { updateTaskStatus, getCRTasks } = require('../controllers/taskController');

const router = express.Router();

// GET /api/tasks/cr/:crId - Get tasks for a specific CR
router.get('/cr/:crId', getCRTasks);

// PATCH /api/tasks/:taskId/status - Update task status
router.patch('/:taskId/status', updateTaskStatus);

module.exports = router;
