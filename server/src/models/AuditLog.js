const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  entity: { type: String, required: true },
  entityId: { type: String },
  metadata: { type: Object, default: {} },
  ip: { type: String },
  userAgent: { type: String },
  severity: { type: String, enum: ['info', 'warning', 'security', 'critical'], default: 'info' }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', AuditLogSchema);


