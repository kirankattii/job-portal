const Report = require('../models/Report');
const ReportTemplate = require('../models/ReportTemplate');
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const logger = require('../utils/logger');

function parseDateRange(query) {
  const { from, to } = query;
  const range = {};
  if (from) range.$gte = new Date(from);
  if (to) range.$lte = new Date(to);
  return Object.keys(range).length ? range : undefined;
}

async function generateDataset(type, filters, dateRange) {
  const createdFilter = dateRange ? { createdAt: dateRange } : {};
  switch (type) {
    case 'applications':
      return Application.find({ ...filters, ...createdFilter }).lean();
    case 'jobs':
      return Job.find({ ...filters, ...createdFilter }).lean();
    case 'users':
      return User.find({ ...filters, ...createdFilter }).lean();
    case 'recruiters':
      return User.find({ role: 'recruiter', ...filters, ...createdFilter }).lean();
    default:
      return [];
  }
}

function toCSV(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const escape = (v) => {
    if (v === null || v === undefined) return '';
    const s = typeof v === 'object' ? JSON.stringify(v) : String(v);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const lines = [headers.join(',')];
  for (const r of rows) {
    lines.push(headers.map(h => escape(r[h])).join(','));
  }
  return lines.join('\n');
}

exports.createReport = async (req, res) => {
  try {
    const { name, type, format = 'json', templateId, filters = {} } = req.body;
    const dateRange = parseDateRange(req.body);

    const report = await Report.create({
      name,
      type,
      format,
      template: templateId || null,
      filters,
      dateRange: dateRange ? { from: dateRange.$gte, to: dateRange.$lte } : undefined,
      createdBy: req.user._id,
      status: 'running'
    });

    const data = await generateDataset(type, filters, dateRange);

    report.status = 'completed';
    report.generatedAt = new Date();
    await report.save();

    if (format === 'csv') {
      const csv = toCSV(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${name || type}-report.csv"`);
      return res.status(201).send(csv);
    }

    return res.status(201).json({ success: true, data: { report, result: data } });
  } catch (err) {
    logger.error('createReport failed', err);
    return res.status(500).json({ success: false, message: 'Failed to create report', error: err.message });
  }
};

exports.listReports = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [items, total] = await Promise.all([
      Report.find().sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      Report.countDocuments()
    ]);
    return res.json({ success: true, data: { items, total, page: parseInt(page), limit: parseInt(limit) } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to list reports', error: err.message });
  }
};

exports.getReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).lean();
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
    return res.json({ success: true, data: report });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to get report', error: err.message });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    await Report.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Report deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete report', error: err.message });
  }
};

exports.createTemplate = async (req, res) => {
  try {
    const template = await ReportTemplate.create({ ...req.body, createdBy: req.user._id });
    return res.status(201).json({ success: true, data: template });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create template', error: err.message });
  }
};

exports.listTemplates = async (req, res) => {
  try {
    const items = await ReportTemplate.find().sort({ createdAt: -1 }).lean();
    return res.json({ success: true, data: items });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to list templates', error: err.message });
  }
};

exports.deleteTemplate = async (req, res) => {
  try {
    await ReportTemplate.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Template deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete template', error: err.message });
  }
};


