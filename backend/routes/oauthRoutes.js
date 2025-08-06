const express = require('express');
const router = express.Router();
const { redirectToOAuth, handleOAuthCallback } = require('../controllers/oauthController');
const { protect } = require('../middleware/auth');

// Step 1: Redirect user to LinkedIn/Facebook
router.get('/:platform', protect,redirectToOAuth);

// Step 2: Handle OAuth callback
router.get('/:platform/callback', protect, handleOAuthCallback);

module.exports = router;
