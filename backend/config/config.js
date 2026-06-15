// backend/config/config.js

const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Configuration object
const config = {
  // Environment
  env: process.env.NODE_ENV || 'development',
  // Port
  port: process.env.PORT || 3000,
  // Database
  db: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'todoapp',
  },
  // Cache
  cache: {
    host: process.env.CACHE_HOST || 'localhost',
    port: process.env.CACHE_PORT || 6379,
  },
  // Secret key for JWT
  secretKey: process.env.SECRET_KEY || 'secretkey',
};

// Validate configuration
function validateConfig() {
  if (!config.db.host || !config.db.user || !config.db.password || !config.db.database) {
    throw new Error('Database configuration is not complete');
  }
  if (!config.cache.host || !config.cache.port) {
    throw new Error('Cache configuration is not complete');
  }
  if (!config.secretKey) {
    throw new Error('Secret key is not set');
  }
}

// Validate configuration
try {
  validateConfig();
} catch (error) {
  console.error('Error validating configuration:', error);
  process.exit(1);
}

module.exports = config;