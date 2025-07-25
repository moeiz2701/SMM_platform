const mongoose = require('mongoose');

const SocialAccountSchema = new mongoose.Schema({
  platform: {
    type: String,
    required: true,
    enum: ['instagram', 'linkedin', 'facebook', 'twitter', 'tiktok']
  },
  accountName: {
    type: String,
    required: true
  },
  accountId: {
    type: String,
    required: true
  },
  accessToken: {
    type: String,
    required: true
  },
  refreshToken: {
    type: String
  },
  tokenExpiry: {
    type: Date
  },
  isBusinessAccount: {
    type: Boolean,
    default: false
  },
  profilePicture: {
    type: String
  },
  followersCount: {
    type: Number
  },
  postCount: {
    type: Number
  },
  status: {
    type: String,
    enum: ['connected', 'disconnected', 'error'],
    default: 'connected'
  },
  lastSync: {
    type: Date
  },
  client: {
    type: mongoose.Schema.ObjectId,
    ref: 'Client',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'Manager',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  scopes: {
    type: [String],
    default: []
  },
  platformDetails: {
    type: mongoose.Schema.Types.Mixed // for extra info returned from OAuth
  },
  description: {
    type: String,
    default: ''
  }

});

module.exports = mongoose.model('SocialAccount', SocialAccountSchema);