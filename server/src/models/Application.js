const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: [true, 'Job is required']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  resumeUrl: {
    type: String,
    required: [true, 'Resume URL is required'],
    trim: true
  },
  coverLetter: {
    type: String,
    trim: true,
    maxlength: [2000, 'Cover letter cannot exceed 2000 characters']
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['applied', 'reviewing', 'rejected', 'hired'],
    default: 'applied'
  },
  matchScore: {
    type: Number,
    min: [0, 'Match score cannot be less than 0'],
    max: [100, 'Match score cannot be more than 100'],
    default: 0
  },
  matchedDetails: {
    skillsMatch: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    experienceMatch: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    locationMatch: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    salaryMatch: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    matchedSkills: [{
      type: String,
      trim: true
    }],
    missingSkills: [{
      type: String,
      trim: true
    }],
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    }
  }
}, {
  timestamps: true
});

// Indexes
applicationSchema.index({ job: 1 });
applicationSchema.index({ user: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ appliedAt: -1 });
applicationSchema.index({ matchScore: -1 });
applicationSchema.index({ job: 1, user: 1 }, { unique: true }); // Prevent duplicate applications

// Virtual for formatted application date
applicationSchema.virtual('formattedAppliedAt').get(function() {
  return this.appliedAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Virtual for status display
applicationSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    'applied': 'Applied',
    'reviewing': 'Under Review',
    'rejected': 'Rejected',
    'hired': 'Hired'
  };
  return statusMap[this.status] || this.status;
});

// Method to update match score
applicationSchema.methods.updateMatchScore = function(scores) {
  if (scores.skillsMatch !== undefined) {
    this.matchedDetails.skillsMatch = scores.skillsMatch;
  }
  if (scores.experienceMatch !== undefined) {
    this.matchedDetails.experienceMatch = scores.experienceMatch;
  }
  if (scores.locationMatch !== undefined) {
    this.matchedDetails.locationMatch = scores.locationMatch;
  }
  if (scores.salaryMatch !== undefined) {
    this.matchedDetails.salaryMatch = scores.salaryMatch;
  }
  if (scores.matchedSkills) {
    this.matchedDetails.matchedSkills = scores.matchedSkills;
  }
  if (scores.missingSkills) {
    this.matchedDetails.missingSkills = scores.missingSkills;
  }
  if (scores.notes) {
    this.matchedDetails.notes = scores.notes;
  }
  
  // Calculate overall match score as average of individual scores
  const individualScores = [
    this.matchedDetails.skillsMatch,
    this.matchedDetails.experienceMatch,
    this.matchedDetails.locationMatch,
    this.matchedDetails.salaryMatch
  ].filter(score => score > 0);
  
  if (individualScores.length > 0) {
    this.matchScore = Math.round(
      individualScores.reduce((sum, score) => sum + score, 0) / individualScores.length
    );
  }
  
  return this.save();
};

// Method to update status
applicationSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  return this.save();
};

// Pre-save middleware to update job's applicants count
applicationSchema.post('save', async function(doc) {
  if (doc.isNew) {
    await mongoose.model('Job').findByIdAndUpdate(
      doc.job,
      { $inc: { applicantsCount: 1 } }
    );
  }
});

// Pre-remove middleware to update job's applicants count
applicationSchema.pre('remove', async function() {
  await mongoose.model('Job').findByIdAndUpdate(
    this.job,
    { $inc: { applicantsCount: -1 } }
  );
});

module.exports = mongoose.model('Application', applicationSchema);
