const Content = require('../models/Content');

exports.listContent = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = type ? { type } : {};
    const items = await Content.find(filter).sort({ updatedAt: -1 }).lean();
    return res.json({ success: true, data: items });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to list content', error: err.message });
  }
};

exports.getContent = async (req, res) => {
  try {
    const item = await Content.findOne({ key: req.params.key }).lean();
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    return res.json({ success: true, data: item });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to get content', error: err.message });
  }
};

exports.upsertContent = async (req, res) => {
  try {
    const { key, title, body, type, metadata } = req.body;
    const updated = await Content.findOneAndUpdate(
      { key },
      { title, body, type, metadata, updatedBy: req.user._id },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return res.status(201).json({ success: true, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to upsert content', error: err.message });
  }
};

exports.deleteContent = async (req, res) => {
  try {
    await Content.findOneAndDelete({ key: req.params.key });
    return res.json({ success: true, message: 'Content deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete content', error: err.message });
  }
};


