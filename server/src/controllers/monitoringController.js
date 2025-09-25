const mongoose = require('mongoose');
const MonitoringMetric = require('../models/MonitoringMetric');

exports.overview = async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState; // 1 connected
    const uptimeSec = process.uptime();
    return res.json({ success: true, data: { dbState, uptimeSec, memory: process.memoryUsage() } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to get overview', error: err.message });
  }
};

exports.metrics = async (req, res) => {
  try {
    const { name, from, to } = req.query;
    const filter = {};
    if (name) filter.name = name;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }
    const items = await MonitoringMetric.find(filter).sort({ createdAt: -1 }).limit(500).lean();
    return res.json({ success: true, data: items });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to get metrics', error: err.message });
  }
};

exports.healthcheck = async (req, res) => {
  try {
    const dbOk = mongoose.connection.readyState === 1;
    if (!dbOk) return res.status(503).json({ success: false, message: 'Database not connected' });
    return res.json({ success: true, message: 'OK' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Healthcheck failed', error: err.message });
  }
};


