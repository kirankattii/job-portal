const mongoose = require('mongoose');

/**
 * Profile Update Token Schema
 * Used for secure profile updates from email links
 */
const profileUpdateTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  },
  used: {
    type: Boolean,
    default: false
  },
  usedAt: {
    type: Date,
    default: null
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Indexes
profileUpdateTokenSchema.index({ token: 1 });
profileUpdateTokenSchema.index({ userId: 1 });
profileUpdateTokenSchema.index({ expiresAt: 1 });

// Static method to generate a secure token
profileUpdateTokenSchema.statics.generateToken = function() {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
};

// Static method to create a new token for a user
profileUpdateTokenSchema.statics.createForUser = async function(userId) {
  // Delete any existing tokens for this user
  await this.deleteMany({ userId });
  
  const token = this.generateToken();
  const tokenDoc = new this({
    userId,
    token
  });
  
  await tokenDoc.save();
  return tokenDoc;
};

// Static method to verify and use a token
profileUpdateTokenSchema.statics.verifyAndUse = async function(token, ipAddress = null, userAgent = null) {
  const tokenDoc = await this.findOne({ 
    token, 
    used: false, 
    expiresAt: { $gt: new Date() } 
  }).populate('userId');
  
  if (!tokenDoc) {
    return null;
  }
  
  // Mark token as used
  tokenDoc.used = true;
  tokenDoc.usedAt = new Date();
  tokenDoc.ipAddress = ipAddress;
  tokenDoc.userAgent = userAgent;
  await tokenDoc.save();
  
  return tokenDoc;
};

// Clean up expired tokens (can be called periodically)
profileUpdateTokenSchema.statics.cleanupExpired = async function() {
  const result = await this.deleteMany({ 
    $or: [
      { expiresAt: { $lt: new Date() } },
      { used: true, usedAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } // Delete used tokens older than 7 days
    ]
  });
  return result.deletedCount;
};

module.exports = mongoose.model('ProfileUpdateToken', profileUpdateTokenSchema);




