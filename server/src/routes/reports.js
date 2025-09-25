const express = require('express');
const { verifyToken, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/reportController');

const router = express.Router();

router.use(verifyToken, authorize('admin'));

// Reports
router.post('/', ctrl.createReport);
router.get('/', ctrl.listReports);
router.get('/:id', ctrl.getReport);
router.delete('/:id', ctrl.deleteReport);

// Templates
router.post('/templates', ctrl.createTemplate);
router.get('/templates', ctrl.listTemplates);
router.delete('/templates/:id', ctrl.deleteTemplate);

module.exports = router;


