const mongoose = require('mongoose');

const UploadLogSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.ObjectId,
    ref: 'Post',
    required: true
  },
  platform: {
    type: String,
    enum: ['instagram', 'linkedin', 'facebook', 'twitter', 'tiktok'],
    required: true
  },
  account: {
    type: mongoose.Schema.ObjectId,
    ref: 'SocialAccount',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'success', 'failed', 'retrying'],
    default: 'pending'
  },
  attemptCount: {
    type: Number,
    default: 1
  },
  lastAttempt: {
    type: Date
  },
  response: {
    type: mongoose.Schema.Types.Mixed
  },
  error: {
    message: String,
    code: String,
    details: mongoose.Schema.Types.Mixed
  },
  isSimulated: {
    type: Boolean,
    default: false
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
UploadLogSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('UploadLog', UploadLogSchema);