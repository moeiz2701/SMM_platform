const mongoose = require('mongoose');

const AITemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a template name']
  },
  type: {
    type: String,
    enum: ['caption', 'hashtag', 'post', 'ad_copy'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  variables: [
    {
      name: String,
      description: String,
      example: String
    }
  ],
  tone: {
    type: String,
    enum: ['professional', 'casual', 'friendly', 'enthusiastic', 'humorous', 'inspirational'],
    default: 'professional'
  },
  length: {
    type: String,
    enum: ['short', 'medium', 'long'],
    default: 'medium'
  },
  platform: {
    type: String,
    enum: ['instagram', 'linkedin', 'facebook', 'twitter', 'tiktok', 'all'],
    default: 'all'
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  usageCount: {
    type: Number,
    default: 0
  },
  lastUsed: {
    type: Date
  },
  client: {
    type: mongoose.Schema.ObjectId,
    ref: 'Client'
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
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
AITemplateSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('AITemplate', AITemplateSchema);