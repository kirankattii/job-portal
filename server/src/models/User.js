const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { generateEmbedding } = require('../services/aiService');

/**
 * User Schema for Job Portal
 * Supports different user roles: user, recruiter, admin
 */
const userSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
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
    select: false // Don't include password in queries by default
  },
  
  // Role and Status
  role: {
    type: String,
    enum: ['user', 'recruiter', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  
  // Profile Information
  phone: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  avatar: {
    type: String, // URL to avatar image
    default: null
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  
  // Location
  location: {
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  
  // For Recruiters
  company: {
    name: String,
    website: String,
    description: String,
    logo: String,
    size: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']
    }
  },
  
  // For Users (Job Seekers)
  skills: [{
    name: String,
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert']
    }
  }],
  experience: [{
    title: String,
    company: String,
    location: String,
    startDate: Date,
    endDate: Date,
    current: Boolean,
    description: String
  }],
  education: [{
    institution: String,
    degree: String,
    field: String,
    startDate: Date,
    endDate: Date,
    current: Boolean,
    description: String
  }],
  
  // Additional fields for job seekers
  currentLocation: {
    type: String,
    trim: true
  },
  preferredLocation: {
    type: String,
    trim: true
  },
  experienceYears: {
    type: Number,
    min: [0, 'Experience years cannot be negative']
  },
  currentPosition: {
    type: String,
    trim: true
  },
  currentCompany: {
    type: String,
    trim: true
  },
  currentSalary: {
    type: Number,
    min: [0, 'Current salary cannot be negative']
  },
  expectedSalary: {
    type: Number,
    min: [0, 'Expected salary cannot be negative']
  },
  resumeUrl: {
    type: String,
    trim: true
  },
  avatarUrl: {
    type: String,
    trim: true
  },
  lastProfileUpdatedAt: {
    type: Date,
    default: Date.now
  },
  profileCompletion: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  embeddings: [{
    type: Number
  }],
  
  // Account Settings
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    jobAlerts: {
      type: Boolean,
      default: true
    },
    profileVisibility: {
      type: String,
      enum: ['public', 'private', 'recruiters-only'],
      default: 'public'
    }
  },
  
  // Timestamps
  lastLogin: Date,
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date
}, {
  timestamps: true
});

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ 'location.city': 1 });
userSchema.index({ 'skills.name': 1 });
userSchema.index({ currentLocation: 1 });
userSchema.index({ preferredLocation: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Method to compute profile completion percentage
userSchema.methods.computeProfileCompletion = function() {
  const fields = [
    'firstName', 'lastName', 'email', 'phone', 'bio', 'skills', 'experience', 'education',
    'currentLocation', 'preferredLocation', 'experienceYears', 'currentPosition', 
    'currentCompany', 'currentSalary', 'expectedSalary', 'resumeUrl', 'avatarUrl'
  ];
  
  let filledFields = 0;
  fields.forEach(field => {
    if (this[field] !== undefined && this[field] !== null && this[field] !== '') {
      if (Array.isArray(this[field])) {
        if (this[field].length > 0) filledFields++;
      } else {
        filledFields++;
      }
    }
  });
  
  const completionPercentage = Math.round((filledFields / fields.length) * 100);
  this.profileCompletion = completionPercentage;
  this.lastProfileUpdatedAt = new Date();
  
  return completionPercentage;
};

// Generate and save embeddings for the user's profile text
userSchema.methods.updateEmbeddings = async function() {
  const name = `${this.firstName || ''} ${this.lastName || ''}`.trim();
  const skillsArr = Array.isArray(this.skills) ? this.skills.map(s => (typeof s === 'string' ? s : s?.name)).filter(Boolean) : [];
  const skills = skillsArr.join(', ');
  const text = `${name} ${this.currentPosition || ''} ${skills} experience: ${this.experienceYears != null ? String(this.experienceYears) : ''} ${this.currentLocation || ''} ${this.preferredLocation || ''}`.trim();
  try {
    const vec = await generateEmbedding(text);
    this.embeddings = Array.isArray(vec) ? vec : [];
    return this.embeddings;
  } catch (err) {
    // Do not block save if embeddings fail
    return this.embeddings || [];
  }
};

// Pre-save middleware to hash password and compute profile completion
userSchema.pre('save', async function(next) {
  // Hash password if modified
  if (this.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(12);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      return next(error);
    }
  }
  
  // Compute profile completion
  this.computeProfileCompletion();

  // If profile fields affecting embeddings changed, recompute embeddings
  const embeddingFields = ['firstName', 'lastName', 'skills', 'experienceYears', 'currentPosition', 'currentLocation', 'preferredLocation'];
  const shouldUpdateEmbeddings = embeddingFields.some(f => this.isModified(f));
  if (shouldUpdateEmbeddings) {
    try {
      await this.updateEmbeddings();
    } catch (_) {
      // Ignore embedding errors
    }
  }
  
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive data when converting to JSON
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.emailVerificationToken;
  delete userObject.emailVerificationExpires;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetExpires;
  delete userObject.embeddings; // Remove embeddings from JSON response (huge array of numbers)
  return userObject;
};

module.exports = mongoose.model('User', userSchema);