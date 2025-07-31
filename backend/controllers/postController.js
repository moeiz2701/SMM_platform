const Post = require('../models/post');
const Manager = require('../models/Manager');
const Client = require('../models/Client');
const SocialAccount = require('../models/SocialAccount');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const cloudinaryUtils = require('../utils/cloudinary');
// Then use cloudinaryUtils.uploadToCloudinary and cloudinaryUtils.deleteFromCloudinary
const mongoose = require('mongoose');

// @desc    Get all posts
// @route   GET /api/v1/posts
// @route   GET /api/v1/clients/:clientId/posts
// @access  Private
exports.getPosts = asyncHandler(async (req, res, next) => {
  if (!req.params.clientId) {
    return next(new ErrorResponse('Client ID is required', 400));
  }

  // Verify client exists
  const client = await Client.findById(req.params.clientId);
  if (!client) {
    return next(new ErrorResponse(`Client not found with id ${req.params.clientId}`, 404));
  }

  // Check if manager is assigned to this client
  let isAuthorized = false;
  
  // Admins can see all posts
  if (req.user.role === 'admin') {
    isAuthorized = true;
  }
  // Check if manager is assigned to this client
  else if (req.user.role === 'manager') {
    const manager = await Manager.findOne({ user: req.user.id });
    isAuthorized = manager?.managedClients.includes(req.params.clientId);
  }
  // Client users can only see their own posts
  else if (req.user.role === 'client' && req.user.client.toString() === req.params.clientId) {
    isAuthorized = true;
  }

  if (!isAuthorized) {
    return next(new ErrorResponse('Not authorized to access these posts', 403));
  }

  const posts = await Post.find({ client: req.params.clientId })
    .populate('client')
    .populate('platforms.account')
    .sort({ scheduledTime: -1 });

  res.status(200).json({
    success: true,
    count: posts.length,
    data: posts
  });
});

// @desc    Create new post
// @route   POST /api/v1/posts
// @route   POST /api/v1/clients/:clientId/posts
// @access  Private
// In your createPost controller
exports.createPost = asyncHandler(async (req, res, next) => {
  if (req.user.role === 'manager') {
    const manager = await Manager.findOne({ user: req.user.id });
    if (manager) {
      req.body.Manager = manager._id;
    }
  }

  // Get client ID
  const clientId = req.body.client || 
                 (req.files && req.files.attachments && req.files.attachments.client && 
                  req.files.attachments.client.name === 'client' && 
                  req.files.attachments.client.data.toString());
  
  if (!clientId) {
    return next(new ErrorResponse("Client ID is required", 400));
  }

  req.body.client = clientId;

  const client = await Client.findById(clientId);
  if (!client) {
    return next(new ErrorResponse(`No client with the id of ${clientId}`, 404));
  }

  // Verify scheduledTime exists and is valid
  if (!req.body.scheduledTime) {
    return next(new ErrorResponse("Scheduled time is required", 400));
  }

  // Parse the scheduled time
  req.body.scheduledTime = new Date(req.body.scheduledTime);

  // Verify manager is assigned to this client
  if (req.body.Manager) {
    const manager = await Manager.findById(req.body.Manager);
    if (!manager || !manager.managedClients.includes(clientId)) {
      return next(
        new ErrorResponse(`Manager is not assigned to client ${clientId}`, 403)
      );
    }
  }
    // Handle status - respect what comes from frontend
  if (req.body.status) {
    req.body.status = req.body.status.toLowerCase();
    
    // Additional validation if status is scheduled
    if (req.body.status === 'scheduled') {
      if (!req.body.scheduledTime) {
        return next(new ErrorResponse("Scheduled time is required for scheduled posts", 400));
      }
      if (new Date(req.body.scheduledTime) <= new Date()) {
        return next(new ErrorResponse("Scheduled time must be in the future", 400));
      }
    }
    
    // If status is draft, ignore any scheduled time for status purposes
    if (req.body.status === 'draft') {
      // Keep any scheduled time but don't let it affect status
    }
  } else {
    // Default status only if not specified
    req.body.status = 'draft';
  }
  // Handle platforms
  if (req.body.platforms) {
    try {
      req.body.platforms = JSON.parse(req.body.platforms);
    } catch (err) {
      return next(new ErrorResponse('Invalid platforms data', 400));
    }
  }

  // Handle media uploads
  if (req.files && req.files.attachments) {
    const mediaFiles = Array.isArray(req.files.attachments) 
      ? req.files.attachments 
      : [req.files.attachments];
    req.body.media = [];

    for (const file of mediaFiles) {
      // Skip if this is the client ID "file"
      if (file.name === 'client') continue;

      const result = await cloudinaryUtils.uploadToCloudinary(file.tempFilePath || file.data, 'posts');
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
  res.status(201).json({ success: true, data: post });
});

// @desc    Update post
// @route   PUT /api/v1/posts/:id
// @access  Private
exports.updatePost = asyncHandler(async (req, res, next) => {
  try {
    const postId = req.params.id;
    const existingPost = await Post.findById(postId);
    
    if (!existingPost) {
      return res.status(404).json({
        success: false,
        error: `Post not found with id ${postId}`
      });
    }

    // Parse existing media to keep
    let mediaToKeep = [];
    try {
      mediaToKeep = JSON.parse(req.body.existingMedia);
    } catch (err) {
      mediaToKeep = [];
    }

    // Handle tags - they can come in different formats
 // Handle tags - works with both array and repeated fields
    let tags = [];
    if (Array.isArray(req.body.hashtags)) {
      tags = req.body.hashtags;
    } else if (req.body.hashtags) {
      // Handle case where tags come as separate fields
      tags = Object.entries(req.body)
        .filter(([key]) => key.startsWith('hashtags'))
        .map(([_, value]) => value);
    } else {
      // Keep existing tags if none provided
      tags = existingPost.hashtags;
    }

    // Process new media uploads
    const newMedia = [];
    if (req.files && req.files.attachments) {
      const uploads = Array.isArray(req.files.attachments) 
        ? req.files.attachments 
        : [req.files.attachments];

      for (const file of uploads) {
        const result = await cloudinaryUtils.uploadToCloudinary(file.tempFilePath || file.data, 'posts');
        newMedia.push({
          url: result.secure_url,
          publicId: result.public_id,
          mediaType: file.mimetype.startsWith('image') ? 'image' : 'video',
          caption: file.name
        });
      }
    }

    // Handle platforms if they exist in the request
    let platforms = [];
    if (req.body.platforms) {
      // If platforms come as array entries (from FormData)
      if (Array.isArray(req.body.platforms)) {
        platforms = req.body.platforms;
      } 
      // If platforms come as individual entries (from multipart form)
      else if (typeof req.body.platforms === 'object') {
        platforms = Object.keys(req.body.platforms).map(key => {
          const index = key.match(/\[(\d+)\]\[platform\]/)?.[1];
          if (index !== undefined) {
            return {
              platform: req.body.platforms[key],
              status: req.body.platforms[`[${index}][status]`] || 'pending'
            };
          }
          return null;
        }).filter(Boolean);
      }
      // If platforms come as JSON string
      else if (typeof req.body.platforms === 'string') {
        try {
          platforms = JSON.parse(req.body.platforms);
        } catch (err) {
          console.error('Failed to parse platforms:', err);
        }
      }
    }

    // Delete removed media from Cloudinary
    const mediaToDelete = existingPost.media.filter(
      existing => !mediaToKeep.some(keep => keep.publicId === existing.publicId)
    );

    for (const media of mediaToDelete) {
      if (media.publicId) {
        await cloudinaryUtils.deleteFromCloudinary(media.publicId);
      }
    }

    // Combine kept and new media
    const updatedMedia = [
      ...mediaToKeep,
      ...newMedia
    ];

    // Prepare update object
    const updateData = {
      ...req.body,
      media: updatedMedia,
      hashtags: tags,
    };

    // Only update platforms if they were provided
    if (platforms.length) {
      updateData.platforms = platforms;
    }

    // Only update tags if they were provided
    if (tags.length) {
      updateData.hashtags = tags;
    }

    // Update the post
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedPost
    });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({
      success: false,
      error: 'Server error during post update'
    });
  }
});
// @desc    Delete post
// @route   DELETE /api/v1/posts/:id
// @access  Private
exports.deletePost = asyncHandler(async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return next(new ErrorResponse(`No post with id ${req.params.id}`, 404));
    }

    // Check authorization - admins can always delete
    if (req.user.role === 'admin') {
      // Proceed with deletion
    } 
    // Check if user is the post owner
    else if (post.user && post.user.toString() === req.user.id) {
      // Proceed with deletion
    }
    // Check if user is manager assigned to this client
    else if (req.user.role === 'manager') {
      const manager = await Manager.findOne({ user: req.user.id });
      if (!manager || !manager.managedClients.includes(post.client.toString())) {
        return next(new ErrorResponse('Not authorized to delete this post', 403));
      }
    }
    else {
      return next(new ErrorResponse('Not authorized to delete this post', 403));
    }

    // Delete media from cloudinary if exists
    if (post.media && post.media.length > 0) {
      try {
        for (const media of post.media) {
          if (media.publicId) {
            await cloudinaryUtils.deleteFromCloudinary(media.publicId);
          }
        }
      } catch (cloudinaryError) {
        console.error('Cloudinary deletion error:', cloudinaryError);
        // Continue with post deletion even if media deletion fails
      }
    }

    await post.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error('Delete post error:', err);
    next(new ErrorResponse('Failed to delete post', 500));
  }
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

  // Make sure user is post owner, admin, or manager
  let isManager = false;
  if (req.user && req.user.id) {
    const manager = await Manager.findById(req.user.id);
    if (manager) isManager = true;
  }
  if (post.user.toString() !== req.user.id && req.user.role !== 'admin' && !isManager) {
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

// @desc    Get all posts by manager ID
// @route   GET /api/v1/posts/manager/:managerId
// @access  Private (Manager or Admin)
// In postController.js
exports.getPostsByManager = async (req, res, next) => {
  try {
    const { managerId } = req.params;
    
    // Your controller logic here
    const posts = await Post.find({ Manager: managerId })
      .populate({
        path: 'client',
        select: 'name' // Only get the name field from Client
      })
      .populate('platforms.account');
    
    res.status(200).json({
      success: true,
      data: posts
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all posts for a specific client with filtering options
// @route   GET /api/v1/posts/client/:clientId
// @access  Private (Client, Manager, or Admin)
exports.getPostsByClient = asyncHandler(async (req, res, next) => {
  const { clientId } = req.params;
  console.log('Received request for client ID:', clientId); // Debug log

  // Verify client exists
  const client = await Client.findById(clientId);
  if (!client) {
    console.log('Client not found:', clientId); // Debug log
    return next(new ErrorResponse(`Client not found with id ${clientId}`, 404));
  }

  // Check authorization
  let isAuthorized = false;
  
  // Admin has full access
  if (req.user.role === 'admin') {
    isAuthorized = true;
  } 
  // Manager must have this client in their managedClients
  else if (req.user.role === 'manager') {
    const manager = await Manager.findOne({ user: req.user.id });
    isAuthorized = manager?.managedClients.includes(clientId);
  }
  // Client must either have role 'client' or 'user' and match the client's user ID
  else if (
    (req.user.role === 'client' || req.user.role === 'user') && 
    client.user.toString() === req.user.id.toString()
  ) {
    isAuthorized = true;
  }

  if (!isAuthorized) {
    return next(new ErrorResponse('Not authorized to access these posts', 403));
  }

  // Extract query parameters
  const { 
    status, 
    startDate, 
    endDate, 
    platform,
    search,
    sort = '-scheduledTime',
    limit = 100,
    page = 1
  } = req.query;

  const query = { client: clientId };
  
  if (status) {
    query.status = { $in: status.split(',') };
  }
  
  if (startDate && endDate) {
    query.scheduledTime = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  } else if (startDate) {
    query.scheduledTime = { $gte: new Date(startDate) };
  } else if (endDate) {
    query.scheduledTime = { $lte: new Date(endDate) };
  }
  
  if (platform) {
    query['platforms.platform'] = { $in: platform.split(',') };
  }
  
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } }
    ];
  }

  const pageInt = parseInt(page);
  const limitInt = parseInt(limit);
  const skip = (pageInt - 1) * limitInt;

  const posts = await Post.find(query)
    .populate('client', 'name email')
    .populate('platforms.account', 'username platform')
    .populate('Manager', 'firstName lastName')
    .sort(sort)
    .skip(skip)
    .limit(limitInt);

  const total = await Post.countDocuments(query);

  res.status(200).json({
    success: true,
    count: posts.length,
    total,
    page: pageInt,
    pages: Math.ceil(total / limitInt),
    data: posts
  });
});