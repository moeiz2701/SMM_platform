const express = require('express');
const router = express.Router();
const { redirectToOAuth, handleOAuthCallback } = require('../controllers/oauthController');

// Step 1: Redirect user to LinkedIn/Facebook
router.get('/:platform', redirectToOAuth);

// Step 2: Handle OAuth callback
router.get('/:platform/callback', handleOAuthCallback);

module.exports = router;
