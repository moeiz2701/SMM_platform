const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  reviewer: {
    type: mongoose.Schema.ObjectId,
    ref: 'Client',
    required: true
  },
  comment: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const RequestSchema = new mongoose.Schema({
  Client: {
    type: mongoose.Schema.ObjectId,
    ref: 'Client',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, { _id: false });

const ManagerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  phone: String,
  department: String,
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  profilePhoto: {
    type: String, // Cloudinary URL
    default: ''
  },
  website: {
    type: String,
    default: ''
  },
  socialMedia: {
    linkedin: { type: String, default: '' },
    facebook: { type: String, default: '' },
    twitter: { type: String, default: '' },
    instagram: { type: String, default: '' }
  },
  managedClients: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Client'
  }],
  requests: [RequestSchema],

  // ✅ New fields
  experience: {
    type: Number,
    default: 0 // in years
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: [ReviewSchema],

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Manager', ManagerSchema);
