require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

const path = require('path');

// Import routes
const authRoutes = require('./routes/authRoutes');
const stationRoutes = require('./routes/stationRoutes');
const routeRoutes = require('./routes/routeRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const adminRoutes = require('./routes/adminRoutes');
const mapsRoutes = require('./routes/mapsRoutes');

// Initialize app
const app = express();

// Connect Database
connectDB();

// Global Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false // Allows loading local visual media cross-domain if needed
}));
app.use(cors({
  origin: true, // Allow CORS from any origin or proxy dynamically
  credentials: true
}));
app.use(express.json());

// Serve Static Frontend Built Assets
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per window
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes.' }
});
app.use('/api/', limiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/fare', routeRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/maps', mapsRoutes);

// Dynamic Config Endpoint for frontend client
app.get('/api/config/google-maps-key', (req, res) => {
  res.json({
    success: true,
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || 'mock'
  });
});

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: "ok",
    service: "metro-ticket-app"
  });
});

// SPA Catch-All wild card redirect
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Centralized error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

module.exports = { app, server };
