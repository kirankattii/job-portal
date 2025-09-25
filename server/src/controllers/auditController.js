const AuditLog = require('../models/AuditLog');

exports.logEvent = async (req, res) => {
  try {
    const { action, entity, entityId, metadata, severity = 'info' } = req.body;
    const item = await AuditLog.create({
      actor: req.user?._id,
      action,
      entity,
      entityId,
      metadata,
      severity,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
    return res.status(201).json({ success: true, data: item });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to log event', error: err.message });
  }
};

exports.listEvents = async (req, res) => {
  try {
    const { q, entity, severity, from, to, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (entity) filter.entity = entity;
    if (severity) filter.severity = severity;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }
    if (q) {
      filter.$or = [
        { action: new RegExp(q, 'i') },
        { entity: new RegExp(q, 'i') },
        { entityId: new RegExp(q, 'i') }
      ];
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [items, total] = await Promise.all([
      AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      AuditLog.countDocuments(filter)
    ]);
    return res.json({ success: true, data: { items, total, page: parseInt(page), limit: parseInt(limit) } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to list events', error: err.message });
  }
};

exports.exportEvents = async (req, res) => {
  try {
    const items = await AuditLog.find().sort({ createdAt: -1 }).lean();
    return res.json({ success: true, data: items });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to export events', error: err.message });
  }
};


