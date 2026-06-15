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
async function createConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('Database connection established successfully');
    return connection;
  } catch (error) {
    console.error('Error establishing database connection:', error);
    throw error;
  }
}

// Create a database connection pool
async function createPool() {
  try {
    const pool = await mysql.createPool(dbConfig);
    console.log('Database connection pool created successfully');
    return pool;
  } catch (error) {
    console.error('Error creating database connection pool:', error);
    throw error;
  }
}

// Export the database connection functions
module.exports = {
  createConnection,
  createPool,
};