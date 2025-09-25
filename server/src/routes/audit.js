const express = require('express');
const { verifyToken, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/auditController');

const router = express.Router();

router.post('/', verifyToken, ctrl.logEvent);
router.get('/', verifyToken, authorize('admin'), ctrl.listEvents);
router.get('/export', verifyToken, authorize('admin'), ctrl.exportEvents);

module.exports = router;


