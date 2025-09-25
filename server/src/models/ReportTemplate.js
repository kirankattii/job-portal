const mongoose = require('mongoose');

const ReportTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: { type: String, required: true, enum: ['applications', 'jobs', 'users', 'recruiters', 'performance', 'custom'] },
  description: { type: String, trim: true },
  defaultFormat: { type: String, enum: ['json', 'csv', 'xlsx', 'pdf'], default: 'json' },
  fields: [{ key: String, label: String }],
  filtersSchema: { type: Object, default: {} },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('ReportTemplate', ReportTemplateSchema);


