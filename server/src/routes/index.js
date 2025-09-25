const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const userRoutes = require('./users');
const recruiterRoutes = require('./recruiter');
const adminRoutes = require('./admin');
const jobRoutes = require('./jobs');
const uploadRoutes = require('./uploads');
const aiRoutes = require('./match');
const ampEmailRoutes = require('./ampEmail');
const reportRoutes = require('./reports');
const settingsRoutes = require('./settings');
const contentRoutes = require('./content');
const auditRoutes = require('./audit');
const monitoringRoutes = require('./monitoring');

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/recruiter', recruiterRoutes);
router.use('/admin', adminRoutes);
router.use('/jobs', jobRoutes);
router.use('/uploads', uploadRoutes);
router.use('/ai', aiRoutes);
router.use('/email', ampEmailRoutes);
router.use('/reports', reportRoutes);
router.use('/settings', settingsRoutes);
router.use('/content', contentRoutes);
router.use('/audit', auditRoutes);
router.use('/monitoring', monitoringRoutes);

// API documentation route (placeholder for Swagger)
router.get('/docs', (req, res) => {
  res.json({
    success: true,
    message: 'API Documentation',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      recruiter: '/api/recruiter',
      admin: '/api/admin',
      jobs: '/api/jobs'
    },
    documentation: 'Swagger documentation will be available at /api-docs'
  });
});

module.exports = router;
