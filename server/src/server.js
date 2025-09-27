const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const dotenv = require('dotenv');
const { connectDB, ensureConnection } = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// Load environment variables
dotenv.config();

// Import routes
const routes = require('./routes');
// Initialize scheduled jobs
require('./jobs/profileReminderCron');
require('./jobs/atsRecommendationCron');
require('./jobs/reportSchedulerCron');
require('./jobs/profileCompletionCron');

// Initialize Express app
const app = express();

// Connect to MongoDB (only in non-serverless environments)
if (process.env.VERCEL !== '1') {
  connectDB();
}

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}));

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000', 
  'http://localhost:5173',
  'https://job-portal-git-main-kiran-kattis-projects.vercel.app',
  process.env.FRONTEND_URL || 'https://job-app-client.vercel.app',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  optionsSuccessStatus: 200
}));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database connection middleware for serverless
app.use(async (req, res, next) => {
  try {
    await ensureConnection();
    next();
  } catch (error) {
    logger.error('Database connection failed:', error);
    res.status(500).json({
      success: false,
      message: 'Database connection failed'
    });
  }
});

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Job Portal API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    endpoints: {
      health: '/health',
      api: '/api',
      docs: '/api/docs'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Job Portal API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Database health check endpoint
app.get('/health/db', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const dbStatus = mongoose.connection.readyState;
    const dbStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    res.status(200).json({
      success: true,
      message: 'Database health check',
      database: {
        status: dbStates[dbStatus] || 'unknown',
        readyState: dbStatus,
        host: mongoose.connection.host || 'not connected',
        name: mongoose.connection.name || 'not connected'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API routes
app.use('/api', routes);

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use(errorHandler);

// Start server (skip in test environment)
let server;
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000;
  server = app.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  if (server) server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  if (server) server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

module.exports = app;


