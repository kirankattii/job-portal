const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const recruiterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [200, 'Company name cannot exceed 200 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'recruiter', 'admin'],
    default: 'recruiter'
  },
  verified: {
    type: Boolean,
    default: false
  },
  profileUrl: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes
recruiterSchema.index({ email: 1 });
recruiterSchema.index({ role: 1 });
recruiterSchema.index({ verified: 1 });
recruiterSchema.index({ companyName: 1 });

// Pre-save middleware to hash password
recruiterSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
recruiterSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive data when converting to JSON
recruiterSchema.methods.toJSON = function() {
  const recruiterObject = this.toObject();
  delete recruiterObject.password;
  return recruiterObject;
};

module.exports = mongoose.model('Recruiter', recruiterSchema);
