const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'Invalid authentication' });
    }

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

const isChef = (req, res, next) => {
  if (req.user.userType !== 'chef') {
    return res.status(403).json({ error: 'Access denied. Chef account required' });
  }
  next();
};

const isCustomer = (req, res, next) => {
  if (req.user.userType !== 'customer') {
    return res.status(403).json({ error: 'Access denied. Customer account required' });
  }
  next();
};

module.exports = { auth, isChef, isCustomer };
