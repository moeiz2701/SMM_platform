const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  conversationId: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create a compound index for efficient querying of conversations
MessageSchema.index({ conversationId: 1, createdAt: -1 });

module.exports = mongoose.model('Message', MessageSchema);
