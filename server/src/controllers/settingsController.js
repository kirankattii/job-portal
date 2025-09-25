const SystemSetting = require('../models/SystemSetting');
const logger = require('../utils/logger');

exports.getAllSettings = async (req, res) => {
  try {
    const items = await SystemSetting.find().lean();
    return res.json({ success: true, data: items });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch settings', error: err.message });
  }
};

exports.getSettingsByGroup = async (req, res) => {
  try {
    const items = await SystemSetting.find({ group: req.params.group }).lean();
    return res.json({ success: true, data: items });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch settings group', error: err.message });
  }
};

exports.upsertSetting = async (req, res) => {
  try {
    const { key, value, group } = req.body;
    const updated = await SystemSetting.findOneAndUpdate(
      { key },
      { value, group, updatedBy: req.user._id },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return res.status(201).json({ success: true, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to upsert setting', error: err.message });
  }
};

exports.deleteSetting = async (req, res) => {
  try {
    await SystemSetting.findOneAndDelete({ key: req.params.key });
    return res.json({ success: true, message: 'Setting deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete setting', error: err.message });
  }
};


