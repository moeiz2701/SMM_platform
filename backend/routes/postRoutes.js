const express = require('express');
const router = express.Router();
const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  simulatePost
} = require('../controllers/postController');
const { protect, authorize, checkOwnership } = require('../middleware/auth');
const Post = require('../models/post');

// Include other resource routers
const uploadRoutes = require('./uploadRoutes');

// Re-route into other resource routers
router.use('/:postId/upload', uploadRoutes);

router
  .route('/')
  .get(protect, getPosts)
  .post(protect, createPost);

router
  .route('/:id')
  .get(protect, checkOwnership(Post), getPost)
  .put(protect, checkOwnership(Post), updatePost)
  .delete(protect, checkOwnership(Post), deletePost);

router
  .route('/:id/simulate')
  .post(protect, checkOwnership(Post), simulatePost);

module.exports = router;