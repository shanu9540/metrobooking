const User = require('../models/User');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { mockUsers } = require('../config/mockDb');

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretjwttokenkeyforauth12345', {
    expiresIn: '30d'
  });
};

/**
 * Register new user
 * POST /api/auth/register
 */
const registerUser = async (req, res, next) => {
  const { name, email, phone, password } = req.body;

  try {
    if (!name || !email || !phone || !password) {
      res.status(400);
      throw new Error('All fields are required');
    }

    if (mongoose.connection.readyState !== 1) {
      const mockId = `mock-user-${Date.now()}`;
      const mockUser = {
        _id: mockId,
        name,
        email,
        phone,
        role: 'USER'
      };
      mockUsers.push(mockUser);
      return res.status(201).json({
        success: true,
        token: generateToken(mockId),
        user: mockUser
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists with this email');
    }

    const user = await User.create({
      name,
      email,
      phone,
      password
    });

    if (user) {
      res.status(201).json({
        success: true,
        token: generateToken(user._id),
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        }
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Auth user & get token
 * POST /api/auth/login
 */
const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide email and password');
    }

    if (mongoose.connection.readyState !== 1) {
      const role = email.toLowerCase().includes('admin') ? 'ADMIN' : 'USER';
      const mockId = role === 'ADMIN' ? 'mock-admin-id' : 'mock-user-id';
      let mockUser = mockUsers.find(u => u.email === email) || mockUsers.find(u => u._id === mockId);
      if (!mockUser) {
        mockUser = {
          _id: mockId,
          name: role === 'ADMIN' ? 'Metro Admin' : 'Demo User',
          email,
          phone: '9999999999',
          role
        };
        mockUsers.push(mockUser);
      }
      return res.status(200).json({
        success: true,
        token: generateToken(mockUser._id),
        user: mockUser
      });
    }

    const user = await User.findOne({ email });
    if (user && (await user.comparePassword(password))) {
      res.json({
        success: true,
        token: generateToken(user._id),
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        }
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        success: true,
        user: req.user
      });
    }
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json({
        success: true,
        user
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 * PUT /api/auth/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const mockUser = mockUsers.find(u => u._id === req.user._id);
      if (mockUser) {
        mockUser.name = req.body.name || mockUser.name;
        mockUser.phone = req.body.phone || mockUser.phone;
        mockUser.email = req.body.email || mockUser.email;
      }
      return res.json({
        success: true,
        token: generateToken(req.user._id),
        user: mockUser || req.user
      });
    }
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.phone = req.body.phone || user.phone;
      
      if (req.body.email) {
        // Check if email already taken by someone else
        const emailTaken = await User.findOne({ email: req.body.email, _id: { $ne: user._id } });
        if (emailTaken) {
          res.status(400);
          throw new Error('Email is already in use by another user');
        }
        user.email = req.body.email;
      }

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();
      
      res.json({
        success: true,
        token: generateToken(updatedUser._id),
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          role: updatedUser.role
        }
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile
};
