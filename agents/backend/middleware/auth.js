// backend/middleware/auth.js

const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');

// Authentication middleware function
const authenticate = async (req, res, next) => {
  try {
    // Get the authorization header
    const authHeader = req.header('Authorization');

    // Check if the authorization header is present
    if (!authHeader) {
      throw new Error('Unauthorized: Missing authorization header');
    }

    // Extract the token from the authorization header
    const token = authHeader.replace('Bearer ', '');

    // Verify the token
    const decoded = jwt.verify(token, config.jwtSecret);

    // Find the user associated with the token
    const user = await User.findById(decoded.userId);

    // Check if the user exists
    if (!user) {
      throw new Error('Unauthorized: User not found');
    }

    // Add the user to the request object
    req.user = user;

    // Call the next middleware function
    next();
  } catch (error) {
    // Handle token verification errors
    if (error.name === 'TokenExpiredError') {
      res.status(401).send({ error: 'Unauthorized: Token has expired' });
    } else if (error.name === 'JsonWebTokenError') {
      res.status(401).send({ error: 'Unauthorized: Invalid token' });
    } else {
      // Handle other errors
      res.status(500).send({ error: 'Internal Server Error' });
    }
  }
};

module.exports = authenticate;