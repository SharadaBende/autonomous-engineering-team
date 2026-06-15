// backend/models/Task.js

const mysql = require('mysql2/promise');
const dbConfig = require('../config/dbConfig');
const logger = require('../utils/logger');

class Task {
  /**
   * Create a new task
   * @param {object} task - Task object
   * @param {string} task.title - Task title
   * @param {string} task.description - Task description
   * @param {boolean} task.completed - Task completion status
   * @returns {Promise<object>} Created task object
   */
  async createTask(task) {
    try {
      const connection = await mysql.createConnection(dbConfig);
      const query = 'INSERT INTO tasks (title, description, completed) VALUES (?, ?, ?)';
      const [result] = await connection.execute(query, [task.title, task.description, task.completed]);
      await connection.end();
      return { id: result.insertId, ...task };
    } catch (error) {
      logger.error('Error creating task:', error);
      throw error;
    }
  }

  /**
   * Get all tasks
   * @returns {Promise<object[]>} Array of task objects
   */
  async getAllTasks() {
    try {
      const connection = await mysql.createConnection(dbConfig);
      const query = 'SELECT * FROM tasks';
      const [rows] = await connection.execute(query);
      await connection.end();
      return rows;
    } catch (error) {
      logger.error('Error getting all tasks:', error);
      throw error;
    }
  }

  /**
   * Get task by id
   * @param {number} id - Task id
   * @returns {Promise<object>} Task object
   */
  async getTaskById(id) {
    try {
      const connection = await mysql.createConnection(dbConfig);
      const query = 'SELECT * FROM tasks WHERE id = ?';
      const [rows] = await connection.execute(query, [id]);
      await connection.end();
      return rows[0];
    } catch (error) {
      logger.error('Error getting task by id:', error);
      throw error;
    }
  }

  /**
   * Update task
   * @param {number} id - Task id
   * @param {object} task - Task object
   * @param {string} task.title - Task title
   * @param {string} task.description - Task description
   * @param {boolean} task.completed - Task completion status
   * @returns {Promise<object>} Updated task object
   */
  async updateTask(id, task) {
    try {
      const connection = await mysql.createConnection(dbConfig);
      const query = 'UPDATE tasks SET title = ?, description = ?, completed = ? WHERE id = ?';
      await connection.execute(query, [task.title, task.description, task.completed, id]);
      await connection.end();
      return { id, ...task };
    } catch (error) {
      logger.error('Error updating task:', error);
      throw error;
    }
  }

  /**
   * Delete task
   * @param {number} id - Task id
   * @returns {Promise<void>}
   */
  async deleteTask(id) {
    try {
      const connection = await mysql.createConnection(dbConfig);
      const query = 'DELETE FROM tasks WHERE id = ?';
      await connection.execute(query, [id]);
      await connection.end();
    } catch (error) {
      logger.error('Error deleting task:', error);
      throw error;
    }
  }
}

module.exports = Task;