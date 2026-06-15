// Import required modules
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Database connection settings
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// Create a database connection pool
async function createPool() {
  try {
    const pool = mysql.createPool(dbConfig);
    console.log('Database connection pool created successfully');
    return pool;
  } catch (error) {
    console.error('Error creating database connection pool:', error);
    throw error;
  }
}

// Get a connection from the pool
async function getConnection(pool) {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection acquired successfully');
    return connection;
  } catch (error) {
    console.error('Error acquiring database connection:', error);
    throw error;
  }
}

// Release a connection back to the pool
async function releaseConnection(connection) {
  try {
    await connection.release();
    console.log('Database connection released successfully');
  } catch (error) {
    console.error('Error releasing database connection:', error);
    throw error;
  }
}

// Execute a query on the database
async function executeQuery(pool, query, params) {
  try {
    const connection = await getConnection(pool);
    try {
      const [results] = await connection.execute(query, params);
      await releaseConnection(connection);
      return results;
    } catch (error) {
      await releaseConnection(connection);
      throw error;
    }
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
}

// Initialize the database connection pool
let pool;
async function init() {
  pool = await createPool();
}

// Export the database functions
module.exports = {
  init,
  executeQuery,
};