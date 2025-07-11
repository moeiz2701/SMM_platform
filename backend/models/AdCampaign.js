const mongoose = require('mongoose');

const AdCampaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a campaign name']
  },
  objective: {
    type: String,
    required: [true, 'Please add a campaign objective'],
    enum: ['awareness', 'traffic', 'engagement', 'leads', 'sales', 'conversions']
  },
  startDate: {
    type: Date,
    required: [true, 'Please add a start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please add an end date']
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'completed', 'archived'],
    default: 'draft'
  },
  targetAudience: {
    ageRange: {
      min: Number,
      max: Number
    },
    genders: [String],
    locations: [String],
    interests: [String],
    languages: [String]
  },
  platforms: [
    {
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
      campaignId: String, // ID returned by platform
      status: String,
      dailyBudget: Number
    }
  ],
  client: {
    type: mongoose.Schema.ObjectId,
    ref: 'Client',
    required: true
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
AdCampaignSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('AdCampaign', AdCampaignSchema);