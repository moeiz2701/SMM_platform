const Post = require('../models/post');
const UploadLog = require('../models/UploadLog');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { uploadToSocialMedia } = require('../utils/uploadHelpers');

// @desc    Upload post to social media platforms
// @route   POST /api/v1/upload/:postId
// @access  Private
exports.uploadPost = asyncHandler(async (req, res, next) => {
  const post = await Post.findOne({
    _id: req.params.postId,
    user: req.user.id
  });

  if (!post) {
    return next(
      new ErrorResponse(`No post found with the id of ${req.params.postId}`, 404)
    );
  }

  // Check if post is scheduled for future
  if (post.scheduledTime > new Date() && !req.query.force) {
    return next(
      new ErrorResponse('Post is scheduled for future publishing', 400)
    );
  }

  // Create upload logs for each platform
  const uploadLogs = [];
  
  for (const platform of post.platforms) {
    const uploadLog = await UploadLog.create({
      post: post._id,
      platform: platform.platform,
      account: platform.account,
      status: 'pending',
      user: req.user.id
    });

    uploadLogs.push(uploadLog);

    // Process upload in background
    uploadToSocialMedia(post, platform, uploadLog._id);
  }

  // Update post status
  post.status = 'published';
  await post.save();

  res.status(200).json({
    success: true,
    data: uploadLogs
  });
});

// @desc    Get upload logs for a post
// @route   GET /api/v1/upload/:postId/logs
// @access  Private
exports.getUploadLogs = asyncHandler(async (req, res, next) => {
  const logs = await UploadLog.find({
    post: req.params.postId,
    user: req.user.id
  }).sort('-createdAt');

  res.status(200).json({
    success: true,
    count: logs.length,
    data: logs
  });
});

// @desc    Retry failed upload
// @route   POST /api/v1/upload/logs/:logId/retry
// @access  Private
exports.retryUpload = asyncHandler(async (req, res, next) => {
  const log = await UploadLog.findOne({
    _id: req.params.logId,
    user: req.user.id
  });

  if (!log) {
    return next(
      new ErrorResponse(`No upload log found with the id of ${req.params.logId}`, 404)
    );
  }

  if (log.status !== 'failed') {
    return next(
      new ErrorResponse('Only failed uploads can be retried', 400)
    );
  }

  const post = await Post.findById(log.post);

  if (!post) {
    return next(
      new ErrorResponse('Associated post not found', 404)
    );
  }

  // Find the platform in the post
  const platform = post.platforms.find(
    p => p.platform === log.platform && p.account.toString() === log.account.toString()
  );

  if (!platform) {
    return next(
      new ErrorResponse('Platform configuration not found in post', 404)
    );
  }

  // Update log status
  log.status = 'retrying';
  log.attemptCount += 1;
  await log.save();

  // Process upload in background
  uploadToSocialMedia(post, platform, log._id);

  res.status(200).json({
    success: true,
    data: log
  });
});

// @desc    Get upload status summary
// @route   GET /api/v1/upload/status
// @access  Private
exports.getUploadStatus = asyncHandler(async (req, res, next) => {
  const [recentLogs, failedCount, pendingCount] = await Promise.all([
    UploadLog.find({ user: req.user.id })
      .sort('-createdAt')
      .limit(5)
      .populate('post', 'title scheduledTime'),
    UploadLog.countDocuments({ user: req.user.id, status: 'failed' }),
    UploadLog.countDocuments({ user: req.user.id, status: 'pending' })
  ]);

  res.status(200).json({
    success: true,
    data: {
      recentLogs,
      failedCount,
      pendingCount
    }
  });
});