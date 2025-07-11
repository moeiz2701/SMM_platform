const mongoose = require('mongoose');

const AnalyticsReportSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a report name']
  },
  type: {
    type: String,
    enum: ['post', 'campaign', 'client', 'platform'],
    required: true
  },
  period: {
    startDate: Date,
    endDate: Date
  },
  metrics: {
    reach: Number,
    impressions: Number,
    engagements: Number,
    engagementRate: Number,
    clicks: Number,
    conversions: Number,
    spend: Number,
    cpm: Number,
    cpc: Number,
    cpe: Number,
    cpa: Number,
    roas: Number
  },
  comparison: {
    previousPeriod: {
      reach: Number,
      impressions: Number,
      engagements: Number,
      engagementRate: Number,
      clicks: Number,
      conversions: Number,
      spend: Number
    },
    percentageChange: {
      reach: Number,
      impressions: Number,
      engagements: Number,
      engagementRate: Number,
      clicks: Number,
      conversions: Number,
      spend: Number
    }
  },
  topPerforming: [
    {
      itemId: mongoose.Schema.Types.ObjectId,
      itemType: String, // 'post' or 'campaign'
      name: String,
      metric: String,
      value: Number
    }
  ],
  insights: [String],
  recommendations: [String],
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
  isExported: {
    type: Boolean,
    default: false
  },
  exportPath: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AnalyticsReport', AnalyticsReportSchema);