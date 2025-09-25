const express = require('express');
const { verifyToken, authorize, optionalAuth } = require('../middleware/auth');
const ctrl = require('../controllers/monitoringController');

const router = express.Router();

router.get('/overview', optionalAuth, ctrl.overview);
router.get('/metrics', verifyToken, authorize('admin'), ctrl.metrics);
router.get('/health', ctrl.healthcheck);

module.exports = router;


