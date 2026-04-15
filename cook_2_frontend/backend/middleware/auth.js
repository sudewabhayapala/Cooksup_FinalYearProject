const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT authentication middleware - verifies user tokens and attaches user info to request
const auth = async (req, res, next) => {
  try {
    // Extract JWT token from Authorization header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify and decode the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'Invalid authentication' });
    }

    // Attach user information to request object for use in route handlers
    req.user = {
      id: user.id,
      email: user.email,
      userType: user.user_type,
      firstName: user.first_name,
      lastName: user.last_name
    };
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate' });
  }
};

// Middleware to ensure user is a chef
const isChef = (req, res, next) => {
  if (req.user.userType !== 'chef') {
    return res.status(403).json({ error: 'Access denied. Chef account required' });
  }
  next();
};

// Middleware to ensure user is a customer
const isCustomer = (req, res, next) => {
  if (req.user.userType !== 'customer') {
    return res.status(403).json({ error: 'Access denied. Customer account required' });
  }
  next();
};

module.exports = { auth, isChef, isCustomer };
