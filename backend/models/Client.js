const mongoose = require('mongoose');



const RequestSchema = new mongoose.Schema({
  manager: {
    type: mongoose.Schema.ObjectId,
    ref: 'Manager',
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
    ref: 'Manager', // Role: manager
  },
  requests: [RequestSchema]
});

// Add a request (sendRequest)
ClientSchema.statics.sendRequest = async function(clientId, managerId) {
  const client = await this.findById(clientId);
  if (!client) throw new Error('Client not found');
  client.requests.push({ manager: managerId });
  await client.save();
  return client;
};

// Get all requests for a client
ClientSchema.statics.getRequests = async function(clientId) {
  const client = await this.findById(clientId)
    .populate({
      path: 'requests.manager',
      model: 'Manager',
      populate: {
        path: 'user',
        model: 'User',
        select: 'name email'
      },
      select: 'profilePhoto user'
    });
  if (!client) throw new Error('Client not found');
  return client.requests;
};

module.exports = mongoose.model('Client', ClientSchema);


module.exports = mongoose.model('Client', ClientSchema);