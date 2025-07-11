const express = require('express');
const router = express.Router();
const {
  uploadPost,
  getUploadLogs,
  retryUpload,
  getUploadStatus
} = require('../controllers/uploadController');
const { protect, checkOwnership } = require('../middleware/auth');
const Post = require('../models/post');

router
  .route('/')
  .post(protect, checkOwnership(Post), uploadPost);

router
  .route('/logs')
  .get(protect, checkOwnership(Post), getUploadLogs);

router
  .route('/logs/:logId/retry')
  .post(protect, retryUpload);

router
  .route('/status')
  .get(protect, getUploadStatus);

module.exports = router;