// Import required modules
const express = require('express');
const mysql = require('mysql2/promise');
const redis = require('redis');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables from .env file
dotenv.config();

// Create Express app
const app = express();

// Enable CORS
app.use(cors());

// Parse JSON requests
app.use(express.json());

// Database connection settings
const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;

// Redis connection settings
const redisHost = process.env.REDIS_HOST;
const redisPort = process.env.REDIS_PORT;

// Create MySQL database connection pool
const db = mysql.createPool({
  host: dbHost,
  user: dbUser,
  password: dbPassword,
  database: dbName,
});

// Create Redis client
const redisClient = redis.createClient({
  host: redisHost,
  port: redisPort,
});

// Initialize Redis client
redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

// Define routes
const blogRoutes = require('./routes/blogRoutes');
app.use('/api/blogs', blogRoutes);

// Define error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

// Export app for testing
module.exports = app;