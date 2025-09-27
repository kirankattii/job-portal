const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Connect to MongoDB database
 * Uses environment variables for connection string
 * Optimized for serverless environments
 */
const connectDB = async () => {
  try {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      logger.info('MongoDB already connected');
      return;
    }

    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error('MongoDB URI not found in environment variables');
    }

    const conn = await mongoose.connect(mongoURI, {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false, // Disable mongoose buffering
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });

    // Graceful shutdown (only in non-serverless environments)
    if (process.env.VERCEL !== '1') {
      process.on('SIGINT', async () => {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed through app termination');
        process.exit(0);
      });
    }

  } catch (error) {
    logger.error('Database connection failed:', error.message);
    if (process.env.VERCEL !== '1') {
      process.exit(1);
    }
    throw error;
  }
};

/**
 * Ensure database connection for serverless functions
 */
const ensureConnection = async () => {
  if (mongoose.connection.readyState !== 1) {
    await connectDB();
  }
};

module.exports = { connectDB, ensureConnection };
