const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  otp: {
    type: String,
    required: [true, 'OTP is required'],
    select: false // Don't include OTP in queries by default
  },
  expiresAt: {
    type: Date,
    required: [true, 'Expiration date is required'],
    index: { expireAfterSeconds: 0 } // TTL index for automatic cleanup
  },
  purpose: {
    type: String,
    enum: ['registration', 'password_reset'],
    required: [true, 'Purpose is required']
  },
  attempts: {
    type: Number,
    default: 0,
    max: [5, 'Maximum attempts exceeded']
  },
  isUsed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
otpSchema.index({ email: 1 });
otpSchema.index({ purpose: 1 });
otpSchema.index({ expiresAt: 1 });
otpSchema.index({ email: 1, purpose: 1 });
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 }); // Auto-delete after 1 hour

// Pre-save middleware to hash OTP
otpSchema.pre('save', async function(next) {
  if (!this.isModified('otp')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.otp = await bcrypt.hash(this.otp, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to verify OTP
otpSchema.methods.verifyOtp = async function(candidateOtp) {
  // Check if OTP is expired
  if (this.expiresAt < new Date()) {
    throw new Error('OTP has expired');
  }
  
  // Check if OTP is already used
  if (this.isUsed) {
    throw new Error('OTP has already been used');
  }
  
  // Check if maximum attempts exceeded
  if (this.attempts >= 5) {
    throw new Error('Maximum verification attempts exceeded');
  }
  
  // Verify OTP first
  const isMatch = await bcrypt.compare(candidateOtp, this.otp);
  
  // Increment attempts and save
  this.attempts += 1;
  
  if (isMatch) {
    this.isUsed = true;
  }
  
  await this.save();
  
  return isMatch;
};

// Static method to generate OTP
otpSchema.statics.generateOtp = function() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

// Static method to create OTP for email
otpSchema.statics.createOtp = async function(email, purpose, expirationMinutes = 10) {
  // Delete any existing OTPs for this email and purpose
  await this.deleteMany({ email, purpose });
  
  const otp = this.generateOtp();
  const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);
  
  const otpDoc = new this({
    email,
    otp,
    expiresAt,
    purpose
  });
  
  return await otpDoc.save();
};

// Static method to verify OTP for email
otpSchema.statics.verifyOtpForEmail = async function(email, otp, purpose) {
  // Must explicitly select '+otp' because the schema sets select: false
  // Sort by createdAt desc to get the most recent OTP
  const otpDoc = await this.findOne({ 
    email, 
    purpose,
    isUsed: false,
    expiresAt: { $gt: new Date() }
  }).select('+otp').sort({ createdAt: -1 });
  
  if (!otpDoc) {
    throw new Error('Invalid or expired OTP');
  }
  
  return await otpDoc.verifyOtp(otp);
};

// Method to check if OTP is valid (not expired, not used, not exceeded attempts)
otpSchema.methods.isValid = function() {
  return !this.isUsed && 
         this.expiresAt > new Date() && 
         this.attempts < 5;
};

// Remove sensitive data when converting to JSON
otpSchema.methods.toJSON = function() {
  const otpObject = this.toObject();
  delete otpObject.otp;
  return otpObject;
};

module.exports = mongoose.model('Otp', otpSchema);
