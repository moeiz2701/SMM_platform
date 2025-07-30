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
});

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
  paymentInfo: {
    stripePaymentMethodId: String, // Stripe Payment Method ID
    cardLast4: String, // Last 4 digits for display
    cardBrand: String, // visa, mastercard, etc.
    cardExpMonth: Number,
    cardExpYear: Number,
    cardHolderName: String,
    isDefault: {
      type: Boolean,
      default: true
    }
  },
  stripeCustomerId: {
    type: String,
    default: ''
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

// Delete a request (by request index or managerId)
ClientSchema.statics.deleteRequest = async function(clientId, requestId) {
  const client = await this.findById(clientId);
  if (!client) throw new Error('Client not found');
  // requestId can be the request's _id (ObjectId)
  const initialLength = client.requests.length;
  client.requests = client.requests.filter(r => r._id.toString() !== requestId);
  if (client.requests.length === initialLength) throw new Error('Request not found');
  await client.save();
  return client;
};

module.exports = mongoose.model('Client', ClientSchema);