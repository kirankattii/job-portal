const mongoose = require('mongoose');

const MonitoringMetricSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: Number, required: true },
  labels: { type: Object, default: {} },
  collectedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('MonitoringMetric', MonitoringMetricSchema);


