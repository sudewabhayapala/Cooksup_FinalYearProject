const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const db = require('./config/database');

const authRoutes = require('./routes/auth');
const chefRoutes = require('./routes/chefs');
const menuRoutes = require('./routes/menus');
const bookingRoutes = require('./routes/bookings');
const reviewRoutes = require('./routes/reviews');
const uploadRoutes = require('./routes/upload');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

const configuredOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const isAllowedDevLocalhostOrigin = (origin) => {
  if (process.env.NODE_ENV !== 'development') {
    return false;
  }

  return /^https?:\/\/(localhost|127\.0\.0\.1):(\d+)$/.test(origin);
};

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests without Origin (Postman/curl/server-to-server).
    if (!origin) {
      return callback(null, true);
    }

    if (configuredOrigins.includes(origin) || isAllowedDevLocalhostOrigin(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true
};

// Middleware
app.use(helmet({
  // Frontend runs on a different origin in development (localhost:3000),
  // so uploaded images must be embeddable cross-origin.
  crossOriginResourcePolicy: { policy: 'cross-origin' }
})); // Security headers
app.use(cors(corsOptions));
app.use(morgan('dev')); // Logging
app.use(compression()); // Compress responses
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Static files for uploads
app.get('/uploads/profile/:filename', (req, res, next) => {
  const profilePath = path.join(process.cwd(), 'uploads', 'profile', req.params.filename);
  if (fs.existsSync(profilePath)) {
    return res.sendFile(profilePath);
  }

  const generalPath = path.join(process.cwd(), 'uploads', 'general', req.params.filename);
  if (fs.existsSync(generalPath)) {
    return res.sendFile(generalPath);
  }

  return next();
});

app.use('/uploads', express.static('uploads'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/chefs', chefRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use(errorHandler);

// Start server with DB check
const startServer = async () => {
  try {
    await db.query('SELECT 1');
    console.log('✅ Database connected successfully');

    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on port ${PORT}`);
      console.log(`📍 API URL: http://localhost:${PORT}/api`);
      console.log(`🌐 Allowed Origins: ${configuredOrigins.join(', ')}${process.env.NODE_ENV === 'development' ? ' + localhost:* (dev)' : ''}\n`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to database:', error.message);
    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});
