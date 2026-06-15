// backend/models/User.js

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/db');

/**
 * User model class.
 */
class User {
  /**
   * Create a new user.
   * @param {string} name - User name.
   * @param {string} email - User email.
   * @param {string} password - User password.
   * @returns {Promise<Object>} Created user.
   */
  async create(name, email, password) {
    try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create a new user
      const [result] = await pool.execute(
        'INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)',
        [uuidv4(), name, email, hashedPassword]
      );

      // Return the created user
      return { id: result.insertId, name, email };
    } catch (error) {
      // Handle errors
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  /**
   * Find a user by email.
   * @param {string} email - User email.
   * @returns {Promise<Object>} Found user.
   */
  async findByEmail(email) {
    try {
      // Find a user by email
      const [result] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);

      // Return the found user
      return result[0];
    } catch (error) {
      // Handle errors
      throw new Error(`Failed to find user: ${error.message}`);
    }
  }

  /**
   * Verify a user's password.
   * @param {string} password - User password.
   * @param {string} hashedPassword - Hashed user password.
   * @returns {Promise<boolean>} True if the password is valid, false otherwise.
   */
  async verifyPassword(password, hashedPassword) {
    try {
      // Compare the password with the hashed password
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      // Handle errors
      throw new Error(`Failed to verify password: ${error.message}`);
    }
  }

  /**
   * Update a user's name.
   * @param {string} id - User ID.
   * @param {string} name - New user name.
   * @returns {Promise<void>}
   */
  async updateName(id, name) {
    try {
      // Update the user's name
      await pool.execute('UPDATE users SET name = ? WHERE id = ?', [name, id]);
    } catch (error) {
      // Handle errors
      throw new Error(`Failed to update user name: ${error.message}`);
    }
  }

  /**
   * Update a user's email.
   * @param {string} id - User ID.
   * @param {string} email - New user email.
   * @returns {Promise<void>}
   */
  async updateEmail(id, email) {
    try {
      // Update the user's email
      await pool.execute('UPDATE users SET email = ? WHERE id = ?', [email, id]);
    } catch (error) {
      // Handle errors
      throw new Error(`Failed to update user email: ${error.message}`);
    }
  }

  /**
   * Update a user's password.
   * @param {string} id - User ID.
   * @param {string} password - New user password.
   * @returns {Promise<void>}
   */
  async updatePassword(id, password) {
    try {
      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update the user's password
      await pool.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);
    } catch (error) {
      // Handle errors
      throw new Error(`Failed to update user password: ${error.message}`);
    }
  }

  /**
   * Delete a user.
   * @param {string} id - User ID.
   * @returns {Promise<void>}
   */
  async delete(id) {
    try {
      // Delete the user
      await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    } catch (error) {
      // Handle errors
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }
}

module.exports = User;