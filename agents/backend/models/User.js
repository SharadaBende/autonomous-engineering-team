// backend/models/User.js

const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

// Database connection
const db = require('../utils/db');

class User {
  /**
   * Create a new user
   * @param {string} name - User name
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<object>} - Created user
   */
  async create(name, email, password) {
    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const [results] = await db.execute(
        'INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)',
        [uuidv4(), name, email, hashedPassword]
      );

      // Return created user
      return {
        id: results.insertId,
        name,
        email,
      };
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Get user by id
   * @param {string} id - User id
   * @returns {Promise<object>} - User
   */
  async getById(id) {
    try {
      const [results] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
      return results[0];
    } catch (error) {
      logger.error('Error getting user by id:', error);
      throw error;
    }
  }

  /**
   * Get user by email
   * @param {string} email - User email
   * @returns {Promise<object>} - User
   */
  async getByEmail(email) {
    try {
      const [results] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
      return results[0];
    } catch (error) {
      logger.error('Error getting user by email:', error);
      throw error;
    }
  }

  /**
   * Update user
   * @param {string} id - User id
   * @param {object} updates - User updates
   * @returns {Promise<object>} - Updated user
   */
  async update(id, updates) {
    try {
      const [results] = await db.execute(
        'UPDATE users SET ? WHERE id = ?',
        [updates, id]
      );

      // Return updated user
      return {
        id,
        ...updates,
      };
    } catch (error) {
      logger.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Delete user
   * @param {string} id - User id
   * @returns {Promise<void>}
   */
  async delete(id) {
    try {
      await db.execute('DELETE FROM users WHERE id = ?', [id]);
    } catch (error) {
      logger.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Verify user password
   * @param {string} password - User password
   * @param {string} hashedPassword - Hashed user password
   * @returns {Promise<boolean>} - Password verification result
   */
  async verifyPassword(password, hashedPassword) {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      logger.error('Error verifying user password:', error);
      throw error;
    }
  }
}

module.exports = User;