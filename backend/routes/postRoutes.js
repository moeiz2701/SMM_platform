const express = require('express');
const fileUpload = require('express-fileupload');
const router = express.Router();
const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  simulatePost,
  getPostsByManager,
  getPostsByClient
} = require('../controllers/postController');
const { protect, authorize, checkOwnership } = require('../middleware/auth');
const Post = require('../models/post');
router.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  createParentPath: true
}));
// Include other resource routers
const uploadRoutes = require('./uploadRoutes');

// Re-route into other resource routers
router.use('/:postId/upload', uploadRoutes);
router.get('/client/:clientId', getPostsByClient);
router.get('/by-manager/:managerId', protect, getPostsByManager);
router
  .route('/')
  .get(protect, getPosts)
  .post(protect, createPost);

router
  .route('/:id')
  .get(protect, getPost)
  .put(protect, updatePost)
  .delete(protect, deletePost);

router
  .route('/:id/simulate')
  .post(protect, checkOwnership(Post), simulatePost);

module.exports = router;