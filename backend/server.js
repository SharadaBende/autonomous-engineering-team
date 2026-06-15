// Import required modules
const express = require('express');
const mysql = require('mysql');
const redis = require('redis');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Create a new Express app
const app = express();

// Set up MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Connect to MySQL database
db.connect((err) => {
  if (err) {
    console.error('error connecting to MySQL:', err);
    return;
  }
  console.log('connected to MySQL');
});

// Set up Redis client
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});

// Connect to Redis
redisClient.on('connect', () => {
  console.log('connected to Redis');
});

// Set up Express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define routes
const todoRoutes = require('./routes/todo');
app.use('/api/todos', todoRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send({ message: 'Internal Server Error' });
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`server started on port ${port}`);
});

// Close MySQL connection on exit
process.on('exit', () => {
  db.end();
});

// Close Redis connection on exit
process.on('exit', () => {
  redisClient.quit();
});