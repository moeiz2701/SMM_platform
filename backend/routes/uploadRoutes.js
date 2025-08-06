const express = require('express');
const router = express.Router();
const {
  uploadPost,
  getUploadLogs,
  retryUpload,
  getUploadStatus,
  postToLinkedin,              // New
  postExistingToLinkedin,      // New
  testLinkedinConnection,
  postToFacebook,
  postExistingToFacebook,
  testFacebookConnection,
  getFacebookPages
} = require('../controllers/uploadController');
const { protect, checkOwnership } = require('../middleware/auth');
const Post = require('../models/post');

router
  .route('/')
  .post(protect, uploadPost);

router
  .route('/logs')
  .get(protect, getUploadLogs);

router
  .route('/logs/:logId/retry')
  .post(protect, retryUpload);

router
  .route('/status')
  .get(protect, getUploadStatus);

router.post('/linkedin',protect, postToLinkedin);
router.post('/linkedin/:postId',postExistingToLinkedin);
router.get('/linkedin/test/:accountId', protect,testLinkedinConnection);

// Facebook specific routes
router.post('/facebook', protect, postToFacebook);
router.post('/facebook/:postId', postExistingToFacebook);
router.get('/facebook/test/:accountId', protect, testFacebookConnection);
router.get('/facebook/:accountId/pages', protect, getFacebookPages);

module.exports = router;