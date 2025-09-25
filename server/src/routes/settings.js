const express = require('express');
const { verifyToken, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/settingsController');

const router = express.Router();

router.use(verifyToken, authorize('admin'));

router.get('/', ctrl.getAllSettings);
router.get('/:group', ctrl.getSettingsByGroup);
router.post('/', ctrl.upsertSetting);
router.delete('/:key', ctrl.deleteSetting);

module.exports = router;


