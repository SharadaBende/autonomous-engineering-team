// backend/routes/users.js

// Import required modules
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql');
const redis = require('redis');

// Database connection settings
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'todoapp'
});

// Redis client
const client = redis.createClient({
  host: 'localhost',
  port: 6379
});

// Connect to database
db.connect((err) => {
  if (err) {
    console.error('error connecting:', err);
    return;
  }
  console.log('connected as id ' + db.threadId);
});

// Register user
router.post('/register', (req, res) => {
  // Check if user already exists
  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [req.body.email], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send({ message: 'Error registering user' });
    } else if (results.length > 0) {
      res.status(400).send({ message: 'User already exists' });
    } else {
      // Hash password
      const hashedPassword = bcrypt.hashSync(req.body.password, 10);
      // Insert user into database
      const query = 'INSERT INTO users SET ?';
      db.query(query, { name: req.body.name, email: req.body.email, password: hashedPassword }, (err, results) => {
        if (err) {
          console.error(err);
          res.status(500).send({ message: 'Error registering user' });
        } else {
          res.send({ message: 'User registered successfully' });
        }
      });
    }
  });
});

// Login user
router.post('/login', (req, res) => {
  // Check if user exists
  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [req.body.email], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send({ message: 'Error logging in user' });
    } else if (results.length === 0) {
      res.status(401).send({ message: 'Invalid email or password' });
    } else {
      // Compare passwords
      const isValidPassword = bcrypt.compareSync(req.body.password, results[0].password);
      if (!isValidPassword) {
        res.status(401).send({ message: 'Invalid email or password' });
      } else {
        // Generate JWT token
        const token = jwt.sign({ userId: results[0].id }, 'secretkey', { expiresIn: '1h' });
        // Set token in Redis
        client.set(results[0].id, token, (err) => {
          if (err) {
            console.error(err);
          }
        });
        res.send({ token: token });
      }
    }
  });
});

// Get user profile
router.get('/profile', authenticateToken, (req, res) => {
  // Get user from database
  const query = 'SELECT * FROM users WHERE id = ?';
  db.query(query, [req.user.userId], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send({ message: 'Error getting user profile' });
    } else {
      res.send(results[0]);
    }
  });
});

// Middleware to authenticate token
function authenticateToken(req, res, next) {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).send({ message: 'Access denied. No token provided.' });
  client.get(req.header('x-auth-token'), (err, reply) => {
    if (err) {
      console.error(err);
      res.status(500).send({ message: 'Error authenticating token' });
    } else if (!reply) {
      res.status(401).send({ message: 'Invalid token' });
    } else {
      jwt.verify(token, 'secretkey', (err, user) => {
        if (err) {
          res.status(401).send({ message: 'Invalid token' });
        } else {
          req.user = user;
          next();
        }
      });
    }
  });
}

module.exports = router;