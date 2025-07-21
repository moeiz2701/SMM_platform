
const express = require('express');
const { addSocialAccount, deleteSocialAccount, getSocialAccounts } = require('../controllers/socialAccountController');
const { protect } = require('../middleware/auth');

const router = express.Router();


// Get all social accounts for current user's client
router.get('/', protect, getSocialAccounts);

// Add a social account
router.post('/:platform', protect, addSocialAccount);

// Delete a social account
router.delete('/:platform', protect, deleteSocialAccount);

module.exports = router;
