const { startConversation } = require('../controllers/messageController');
// Start a new conversation

const express = require('express');
const {
  getConversation,
  getConversations,
  markAsRead,
  sendMessage
} = require('../controllers/messageController');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getConversations);

router.route('/:userId')
  .get(getConversation);

router.route('/read/:conversationId')
  .put(markAsRead);

router.post('/', sendMessage);

router.post('/start', startConversation);

module.exports = router;
