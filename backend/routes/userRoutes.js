// routes/users.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getUser,getUsersBatch } = require('../controllers/userController');
router.get('/:id', protect, getUser);
router.post('/batch', protect, getUsersBatch);

module.exports = router;