const mongoose = require('mongoose');



const ClientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a client name']
  },
  description: String,
  industry: String,
  contactPerson: {
    name: String,
    email: String,
    phone: String
  },
  billingInfo: {
    address: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  tags: {
    type: [String],
    default: []
  },
  profilePhoto: {
    type: String, // Cloudinary URL
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  manager: {
    type: mongoose.Schema.ObjectId,
    ref: 'User', // Role: manager
  }
});

module.exports = mongoose.model('Client', ClientSchema);


module.exports = mongoose.model('Client', ClientSchema);