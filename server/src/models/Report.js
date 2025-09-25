const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: { type: String, required: true, enum: ['applications', 'jobs', 'users', 'recruiters', 'performance', 'custom'] },
  format: { type: String, required: true, enum: ['json', 'csv', 'xlsx', 'pdf'], default: 'json' },
  dateRange: {
    from: { type: Date },
    to: { type: Date }
  },
  filters: { type: Object, default: {} },
  template: { type: mongoose.Schema.Types.ObjectId, ref: 'ReportTemplate' },
  status: { type: String, enum: ['queued', 'running', 'completed', 'failed'], default: 'queued' },
  fileUrl: { type: String },
  scheduledAt: { type: Date },
  generatedAt: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Report', ReportSchema);


