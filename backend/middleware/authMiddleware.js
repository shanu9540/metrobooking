const jwt = require('jsonwebtoken');
const User = require('../models/User');

const mongoose = require('mongoose');
const { mockUsers } = require('../config/mockDb');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwttokenkeyforauth12345');
      
      // If DB is offline or token is mock, load mock user from memory
      if (mongoose.connection.readyState !== 1 || decoded.id.startsWith('mock-')) {
        const mockUser = mockUsers.find(u => u._id === decoded.id) || {
          _id: decoded.id,
          name: decoded.id.includes('admin') ? 'Metro Admin' : 'Demo User',
          email: decoded.id.includes('admin') ? 'admin@metro.com' : 'user@test.com',
          role: decoded.id.includes('admin') ? 'ADMIN' : 'USER'
        };
        req.user = mockUser;
      } else {
        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user) {
          return res.status(401).json({ success: false, message: 'User not found, authorization denied' });
        }
      }
      
      next();
    } catch (error) {
      console.error('Auth verification error:', error);
      res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied: Admin role required' });
  }
};

module.exports = {
  protect,
  isAdmin
};
