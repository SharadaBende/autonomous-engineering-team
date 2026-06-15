// backend/routes/tasks.js

const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');

// Apply authentication middleware to all task routes
router.use(authMiddleware.authenticate);

// Get all tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await taskController.getAllTasks(req.user.id);
    res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to retrieve tasks' });
  }
});

// Get task by id
router.get('/:id', async (req, res) => {
  try {
    const taskId = req.params.id;
    const task = await taskController.getTaskById(taskId, req.user.id);
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
    } else {
      res.status(200).json(task);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to retrieve task' });
  }
});

// Create new task
router.post('/', async (req, res) => {
  try {
    const taskData = req.body;
    const newTask = await taskController.createTask(taskData, req.user.id);
    res.status(201).json(newTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create task' });
  }
});

// Update task
router.put('/:id', async (req, res) => {
  try {
    const taskId = req.params.id;
    const taskData = req.body;
    const updatedTask = await taskController.updateTask(taskId, taskData, req.user.id);
    if (!updatedTask) {
      res.status(404).json({ message: 'Task not found' });
    } else {
      res.status(200).json(updatedTask);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update task' });
  }
});

// Delete task
router.delete('/:id', async (req, res) => {
  try {
    const taskId = req.params.id;
    await taskController.deleteTask(taskId, req.user.id);
    res.status(204).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete task' });
  }
});

module.exports = router;