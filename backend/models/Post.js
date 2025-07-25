const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title']
  },
  content: {
    type: String,
    required: [true, 'Please add content']
  },
  media: [
    {
      url: String,
      publicId: String,
      mediaType: {
        type: String,
        enum: ['image', 'video', 'gif']
      },
      caption: String
    }
  ],
  hashtags: {
    type: [String],
    default: []
  },
  scheduledTime: {
    type: Date,
    required: [true, 'Please add scheduled time']
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'published', 'failed'],
    default: 'draft'
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
      postId: String, // ID returned by platform after posting
      status: {
        type: String,
        enum: ['pending', 'published', 'failed'],
        default: 'pending'
      },
      publishedAt: Date,
      url: String,
      analytics: {
        likes: Number,
        comments: Number,
        shares: Number,
        reach: Number,
        impressions: Number,
        engagementRate: Number
      }
    }
  ],
  isSimulated: {
    type: Boolean,
    default: false
  },
  client: {
    type: mongoose.Schema.ObjectId,
    ref: 'Client',
    required: true
  },
  Manager: {
    type: mongoose.Schema.ObjectId,
    ref: 'Manager',
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
PostSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Post', PostSchema);