const express = require('express');
const { verifyToken, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/contentController');

const router = express.Router();

router.get('/', ctrl.listContent);
router.get('/:key', ctrl.getContent);

router.post('/', verifyToken, authorize('admin'), ctrl.upsertContent);
router.delete('/:key', verifyToken, authorize('admin'), ctrl.deleteContent);

module.exports = router;


