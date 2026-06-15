// backend/models/Article.js

const mysql = require('mysql2/promise');
const dbConfig = require('../config/dbConfig');
const logger = require('../utils/logger');

class Article {
  /**
   * Create a new article
   * @param {object} articleData - Article data
   * @param {string} articleData.title - Article title
   * @param {string} articleData.content - Article content
   * @param {string} articleData.author - Article author
   * @returns {Promise<object>} Created article
   */
  async create(articleData) {
    try {
      const connection = await mysql.createConnection(dbConfig);
      const query = 'INSERT INTO articles SET ?';
      const [result] = await connection.execute(query, articleData);
      await connection.end();
      return { id: result.insertId, ...articleData };
    } catch (error) {
      logger.error('Error creating article:', error);
      throw error;
    }
  }

  /**
   * Get all articles
   * @returns {Promise<object[]>} List of articles
   */
  async getAll() {
    try {
      const connection = await mysql.createConnection(dbConfig);
      const query = 'SELECT * FROM articles';
      const [rows] = await connection.execute(query);
      await connection.end();
      return rows;
    } catch (error) {
      logger.error('Error getting all articles:', error);
      throw error;
    }
  }

  /**
   * Get article by ID
   * @param {number} id - Article ID
   * @returns {Promise<object>} Article
   */
  async getById(id) {
    try {
      const connection = await mysql.createConnection(dbConfig);
      const query = 'SELECT * FROM articles WHERE id = ?';
      const [rows] = await connection.execute(query, [id]);
      await connection.end();
      return rows[0];
    } catch (error) {
      logger.error('Error getting article by ID:', error);
      throw error;
    }
  }

  /**
   * Update article
   * @param {number} id - Article ID
   * @param {object} articleData - Article data
   * @param {string} articleData.title - Article title
   * @param {string} articleData.content - Article content
   * @param {string} articleData.author - Article author
   * @returns {Promise<object>} Updated article
   */
  async update(id, articleData) {
    try {
      const connection = await mysql.createConnection(dbConfig);
      const query = 'UPDATE articles SET ? WHERE id = ?';
      const [result] = await connection.execute(query, [articleData, id]);
      await connection.end();
      return { id, ...articleData };
    } catch (error) {
      logger.error('Error updating article:', error);
      throw error;
    }
  }

  /**
   * Delete article
   * @param {number} id - Article ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    try {
      const connection = await mysql.createConnection(dbConfig);
      const query = 'DELETE FROM articles WHERE id = ?';
      await connection.execute(query, [id]);
      await connection.end();
    } catch (error) {
      logger.error('Error deleting article:', error);
      throw error;
    }
  }
}

module.exports = Article;