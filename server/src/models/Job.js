const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  recruiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recruiter is required']
  },
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [200, 'Job title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    trim: true
  },
  requiredSkills: [{
    type: String,
    trim: true
  }],
  experienceMin: {
    type: Number,
    required: [true, 'Minimum experience is required'],
    min: [0, 'Minimum experience cannot be negative']
  },
  experienceMax: {
    type: Number,
    required: [true, 'Maximum experience is required'],
    min: [0, 'Maximum experience cannot be negative']
  },
  location: {
    type: String,
    required: [true, 'Job location is required'],
    trim: true
  },
  remote: {
    type: Boolean,
    default: false
  },
  salaryRange: {
    min: {
      type: Number,
      required: [true, 'Minimum salary is required'],
      min: [0, 'Minimum salary cannot be negative']
    },
    max: {
      type: Number,
      required: [true, 'Maximum salary is required'],
      min: [0, 'Maximum salary cannot be negative']
    }
  },
  applicantsCount: {
    type: Number,
    default: 0,
    min: [0, 'Applicants count cannot be negative']
  },
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open'
  }
}, {
  timestamps: true
});

// Pre-save validation for salary range
jobSchema.pre('save', function(next) {
  if (this.salaryRange && this.salaryRange.min && this.salaryRange.max) {
    if (this.salaryRange.max < this.salaryRange.min) {
      const error = new Error('Maximum salary must be greater than or equal to minimum salary');
      return next(error);
    }
  }
  next();
});

// Indexes
jobSchema.index({ recruiter: 1 });
jobSchema.index({ title: 1 });
jobSchema.index({ requiredSkills: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ remote: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ createdAt: -1 });
jobSchema.index({ 'salaryRange.min': 1, 'salaryRange.max': 1 });
jobSchema.index({ experienceMin: 1, experienceMax: 1 });

// Virtual for formatted salary range
jobSchema.virtual('formattedSalaryRange').get(function() {
  if (this.salaryRange.min && this.salaryRange.max) {
    return `$${this.salaryRange.min.toLocaleString()} - $${this.salaryRange.max.toLocaleString()}`;
  }
  return 'Salary not specified';
});

// Virtual for formatted experience range
jobSchema.virtual('formattedExperienceRange').get(function() {
  if (this.experienceMin !== undefined && this.experienceMax !== undefined) {
    if (this.experienceMin === this.experienceMax) {
      return `${this.experienceMin} year${this.experienceMin !== 1 ? 's' : ''}`;
    }
    return `${this.experienceMin} - ${this.experienceMax} years`;
  }
  return 'Experience not specified';
});

// Method to increment applicants count
jobSchema.methods.incrementApplicantsCount = function() {
  this.applicantsCount += 1;
  return this.save();
};

// Method to decrement applicants count
jobSchema.methods.decrementApplicantsCount = function() {
  if (this.applicantsCount > 0) {
    this.applicantsCount -= 1;
    return this.save();
  }
  return Promise.resolve(this);
};

module.exports = mongoose.model('Job', jobSchema);
