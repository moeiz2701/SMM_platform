const Post = require('../models/post');
const Client = require('../models/Client');
const SocialAccount = require('../models/SocialAccount');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { uploadToCloudinary } = require('../utils/cloudinary');

// @desc    Get all posts
// @route   GET /api/v1/posts
// @route   GET /api/v1/clients/:clientId/posts
// @access  Private
exports.getPosts = asyncHandler(async (req, res, next) => {
  if (req.params.clientId) {
    const posts = await Post.find({ client: req.params.clientId, user: req.user.id })
      .populate('client')
      .populate('platforms.account');

    return res.status(200).json({
      success: true,
      count: posts.length,
      data: posts
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc    Get single post
// @route   GET /api/v1/posts/:id
// @access  Private
exports.getPost = asyncHandler(async (req, res, next) => {
  const post = await Post.findOne({
    _id: req.params.id,
    user: req.user.id
  }).populate('client platforms.account');

  if (!post) {
    return next(
      new ErrorResponse(`No post found with the id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: post
  });
});

// @desc    Create new post
// @route   POST /api/v1/posts
// @route   POST /api/v1/clients/:clientId/posts
// @access  Private
exports.createPost = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;

  if (req.params.clientId) {
    req.body.client = req.params.clientId;
  }

  const client = await Client.findById(req.body.client);

  if (!client) {
    return next(
      new ErrorResponse(`No client with the id of ${req.body.client}`, 404)
    );
  }

  // Verify all social accounts belong to the client
  if (req.body.platforms && req.body.platforms.length > 0) {
    for (const platform of req.body.platforms) {
      const account = await SocialAccount.findOne({
        _id: platform.account,
        client: req.body.client
      });

      if (!account) {
        return next(
          new ErrorResponse(
            `Social account ${platform.account} does not belong to client ${req.body.client}`,
            400
          )
        );
      }
    }
  }

  // Handle media uploads
  if (req.files && req.files.media) {
    const mediaFiles = Array.isArray(req.files.media) ? req.files.media : [req.files.media];
    req.body.media = [];

    for (const file of mediaFiles) {
      const result = await uploadToCloudinary(file.tempFilePath, 'posts');
      req.body.media.push({
        url: result.secure_url,
        publicId: result.public_id,
        mediaType: file.mimetype.startsWith('image') ? 'image' : 
                 file.mimetype.startsWith('video') ? 'video' : 'gif',
        caption: file.name
      });
    }
  }

  const post = await Post.create(req.body);

  res.status(201).json({
    success: true,
    data: post
  });
});

// @desc    Update post
// @route   PUT /api/v1/posts/:id
// @access  Private
exports.updatePost = asyncHandler(async (req, res, next) => {
  let post = await Post.findById(req.params.id);

  if (!post) {
    return next(
      new ErrorResponse(`No post with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is post owner
  if (post.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this post`,
        401
      )
    );
  }

  // Verify all social accounts belong to the client
  if (req.body.platforms && req.body.platforms.length > 0) {
    for (const platform of req.body.platforms) {
      const account = await SocialAccount.findOne({
        _id: platform.account,
        client: post.client
      });

      if (!account) {
        return next(
          new ErrorResponse(
            `Social account ${platform.account} does not belong to client ${post.client}`,
            400
          )
        );
      }
    }
  }

  // Handle media uploads
  if (req.files && req.files.media) {
    const mediaFiles = Array.isArray(req.files.media) ? req.files.media : [req.files.media];
    req.body.media = post.media || [];

    for (const file of mediaFiles) {
      const result = await uploadToCloudinary(file.tempFilePath, 'posts');
      req.body.media.push({
        url: result.secure_url,
        publicId: result.public_id,
        mediaType: file.mimetype.startsWith('image') ? 'image' : 
                 file.mimetype.startsWith('video') ? 'video' : 'gif',
        caption: file.name
      });
    }
  }

  post = await Post.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: post
  });
});

// @desc    Delete post
// @route   DELETE /api/v1/posts/:id
// @access  Private
exports.deletePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(
      new ErrorResponse(`No post with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is post owner
  if (post.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this post`,
        401
      )
    );
  }

  // Delete media from cloudinary
  if (post.media && post.media.length > 0) {
    for (const media of post.media) {
      await deleteFromCloudinary(media.publicId);
    }
  }

  await post.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Simulate post publishing
// @route   POST /api/v1/posts/:id/simulate
// @access  Private
exports.simulatePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(
      new ErrorResponse(`No post with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is post owner
  if (post.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to simulate this post`,
        401
      )
    );
  }

  // Update post status to simulate publishing
  post.isSimulated = true;
  post.status = 'published';
  post.platforms = post.platforms.map(platform => ({
    ...platform.toObject(),
    status: 'published',
    publishedAt: Date.now()
  }));

  await post.save();

  res.status(200).json({
    success: true,
    data: post
  });
});