const Post = require('../models/post');
const UploadLog = require('../models/UploadLog');
const SocialAccount = require('../models/SocialAccount');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { uploadToSocialMedia } = require('../utils/uploadHelpers');
const axios = require('axios');

// @desc Upload post to social media platforms
// @route POST /api/v1/upload/:postId
// @access Private
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

// @desc Post directly to LinkedIn
// @route POST /api/v1/upload/linkedin
// @access Private
exports.postToLinkedin = asyncHandler(async (req, res, next) => {
  const { content, accountId, mediaUrls } = req.body;

  if (!content) {
    return next(new ErrorResponse('Post content is required', 400));
  }

  if (!accountId) {
    return next(new ErrorResponse('LinkedIn account ID is required', 400));
  }

  // Get the LinkedIn social account
  const socialAccount = await SocialAccount.findOne({
    _id: accountId,
    user: req.user.id,
    platform: 'linkedin'
  });

  if (!socialAccount) {
    return next(new ErrorResponse('LinkedIn account not found', 404));
  }

  if (!socialAccount.accessToken) {
    return next(new ErrorResponse('LinkedIn access token not available', 400));
  }

  try {
    // Get user's LinkedIn profile
    const profileResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${socialAccount.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const authorUrn = `urn:li:person:${profileResponse.data.sub}`;

    // Prepare post data
    const postData = {
      author: authorUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: content
          },
          shareMediaCategory: mediaUrls && mediaUrls.length > 0 ? 'IMAGE' : 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };

    // Handle media if provided
    if (mediaUrls && mediaUrls.length > 0) {
      try {
        const mediaAssets = [];
        
        for (const mediaUrl of mediaUrls) {
          // Step 1: Register upload for image
          const registerUploadResponse = await axios.post('https://api.linkedin.com/v2/assets?action=registerUpload', {
            registerUploadRequest: {
              recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
              owner: authorUrn,
              serviceRelationships: [{
                relationshipType: 'OWNER',
                identifier: 'urn:li:userGeneratedContent'
              }]
            }
          }, {
            headers: {
              'Authorization': `Bearer ${socialAccount.accessToken}`,
              'Content-Type': 'application/json'
            }
          });

          const uploadUrl = registerUploadResponse.data.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
          const asset = registerUploadResponse.data.value.asset;

          // Step 2: Upload the image binary
          const imageResponse = await axios.get(mediaUrl, { responseType: 'arraybuffer' });
          await axios.put(uploadUrl, imageResponse.data, {
            headers: {
              'Content-Type': 'application/octet-stream'
            }
          });

          // Add the asset to media assets
          mediaAssets.push({
            status: 'READY',
            description: {
              text: ''
            },
            media: asset,
            title: {
              text: ''
            }
          });
        }

        if (mediaAssets.length > 0) {
          postData.specificContent['com.linkedin.ugc.ShareContent'].media = mediaAssets;
        }
      } catch (mediaError) {
        console.error('Media upload error:', mediaError.response?.data || mediaError.message);
        // Continue without media if upload fails
        postData.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory = 'NONE';
      }
    }

    // Post to LinkedIn
    const response = await axios.post('https://api.linkedin.com/v2/ugcPosts', postData, {
      headers: {
        'Authorization': `Bearer ${socialAccount.accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      }
    });

    res.status(200).json({
      success: true,
      data: {
        platformPostId: response.data.id,
        postUrl: `https://www.linkedin.com/feed/update/${response.data.id}`,
        message: 'Posted successfully to LinkedIn'
      }
    });

  } catch (error) {
    console.error('LinkedIn posting error:', error.response?.data || error.message);
    return next(new ErrorResponse(
      `LinkedIn posting failed: ${error.response?.data?.message || error.message}`, 
      500
    ));
  }
});

// @desc Post existing post to LinkedIn
// @route POST /api/v1/upload/linkedin/:postId
// @access Private
exports.postExistingToLinkedin = asyncHandler(async (req, res, next) => {
  const { accountId } = req.body;

  console.log(accountId)

  if (!accountId) {
    return next(new ErrorResponse('LinkedIn account ID is required', 400));
  }

  // Get the post
  const post = await Post.findOne({
    _id: req.params.postId,
  });

  console.log('Post:', post);

  if (!post) {
    return next(new ErrorResponse(`No post found with the id of ${req.params.postId}`, 404));
  }

  console.log('Post to LinkedIn:', post);

  // Get the LinkedIn social account
  const socialAccount = await SocialAccount.findOne({
    _id: accountId,
    platform: 'linkedin'
  });

  console.log('Social Account:', socialAccount);

  if (!socialAccount) {
    return next(new ErrorResponse('LinkedIn account not found', 404));
  }

  if (!socialAccount.accessToken) {
    return next(new ErrorResponse('LinkedIn access token not available', 400));
  }

  let uploadLog;
  try {
    //Create upload log
    uploadLog = await UploadLog.create({
      post: post._id,
      platform: 'linkedin',
      account: socialAccount._id,
      status: 'pending'
    });

    console.log('Upload Log Created:', uploadLog);

    // Get user's LinkedIn profile
    const profileResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${socialAccount.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const authorUrn = `urn:li:person:${profileResponse.data.sub}`;

    let contentWithTags = post.content || '';

    console.log(post.hashtags)
    
    if (post.hashtags && Array.isArray(post.hashtags) && post.hashtags.length > 0) {
      const hashtags = post.hashtags
        .filter(tag => tag && tag.trim()) // Filter out empty/null tags
        .map(tag => {
          // Remove existing # if present and add it back
          const cleanTag = tag.replace(/^#/, '').trim();
          return `#${cleanTag}`;
        })
        .join(' ');
      
      // Add hashtags to content (with spacing)
      if (hashtags) {
        contentWithTags = contentWithTags.trim() + (contentWithTags.trim() ? '\n\n' : '') + hashtags;
      }
    }

    console.log('Content with tags:', contentWithTags);

    // Prepare post data
    const postData = {
      author: authorUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: contentWithTags
          },
          shareMediaCategory: post.media && post.media.length > 0 ? 'IMAGE' : 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };

    if (post.media && post.media.length > 0) {
  try {
    const mediaAssets = [];
    // Fixed: Use mediaType instead of type
    const imageMedia = post.media.filter(media => media.mediaType === 'image');
    
    console.log('Total media items:', post.media.length);
    console.log('Image media items found:', imageMedia.length);
    console.log('Media details:', post.media.map(m => ({ mediaType: m.mediaType, url: m.url })));
    
    for (const media of imageMedia) {
      // Step 1: Register upload for image
      const registerUploadResponse = await axios.post('https://api.linkedin.com/v2/assets?action=registerUpload', {
        registerUploadRequest: {
          recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
          owner: authorUrn,
          serviceRelationships: [{
            relationshipType: 'OWNER',
            identifier: 'urn:li:userGeneratedContent'
          }]
        }
      }, {
        headers: {
          'Authorization': `Bearer ${socialAccount.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      const uploadUrl = registerUploadResponse.data.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
      const asset = registerUploadResponse.data.value.asset;

      // Step 2: Upload the image binary
      const imageResponse = await axios.get(media.url, { responseType: 'arraybuffer' });
      await axios.put(uploadUrl, imageResponse.data, {
        headers: {
          'Content-Type': 'application/octet-stream'
        }
      });

      // Add the asset to media assets
      mediaAssets.push({
        status: 'READY',
        description: {
          text: media.caption || '' // Also fixed: use caption instead of description
        },
        media: asset,
        title: {
          text: media.caption || '' // Use caption for title as well
        }
      });
    }

    if (mediaAssets.length > 0) {
      postData.specificContent['com.linkedin.ugc.ShareContent'].media = mediaAssets;
      console.log('Successfully processed media assets:', mediaAssets.length);
    } else {
      console.log('No image media found, setting shareMediaCategory to NONE');
      postData.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory = 'NONE';
    }
  } catch (mediaError) {
    console.error('Media upload error:', mediaError.response?.data || mediaError.message);
    // Continue without media if upload fails
    postData.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory = 'NONE';
  }
}

    // Post to LinkedIn
    const response = await axios.post('https://api.linkedin.com/v2/ugcPosts', postData, {
      headers: {
        'Authorization': `Bearer ${socialAccount.accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      }
    });

    // Update upload log with success
    await UploadLog.findByIdAndUpdate(uploadLog._id, {
      status: 'success',
      message: 'Posted successfully to LinkedIn',
      platformPostId: response.data.id,
      platformResponse: response.data,
      postUrl: `https://www.linkedin.com/feed/update/${response.data.id}`,
      publishedAt: new Date(),
      updatedAt: new Date()
    });

    res.status(200).json({
      success: true,
      data: {
        uploadLog: uploadLog._id,
        platformPostId: response.data.id,
        postUrl: `https://www.linkedin.com/feed/update/${response.data.id}`,
        message: 'Posted successfully to LinkedIn'
      }
    });

  } catch (error) {
    console.error('LinkedIn posting error:', error.response?.data || error.message);
    
    // Update upload log with failure
    if (uploadLog) {
      await UploadLog.findByIdAndUpdate(uploadLog._id, {
        status: 'failed',
        message: error.response?.data?.message || error.message,
        error: {
          code: error.response?.status,
          message: error.response?.data?.message || error.message,
          details: error.response?.data
        },
        updatedAt: new Date()
      });
    }

    return next(new ErrorResponse(
      `LinkedIn posting failed: ${error.response?.data?.message || error.message}`, 
      500
    ));
  }
});

// @desc Test LinkedIn connection
// @route GET /api/v1/upload/linkedin/test/:accountId
// @access Private
exports.testLinkedinConnection = asyncHandler(async (req, res, next) => {
  const { accountId } = req.params;

  // Get the LinkedIn social account
  const socialAccount = await SocialAccount.findOne({
    _id: accountId,
    user: req.user.id,
    platform: 'linkedin'
  });

  if (!socialAccount) {
    return next(new ErrorResponse('LinkedIn account not found', 404));
  }

  if (!socialAccount.accessToken) {
    return next(new ErrorResponse('LinkedIn access token not available', 400));
  }

  try {
    const profileResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${socialAccount.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    res.status(200).json({
      success: true,
      message: 'LinkedIn connection is working',
      data: {
        accountName: profileResponse.data.name,
        connected: true,
        tokenValid: true,
        profile: profileResponse.data
      }
    });

  } catch (error) {
    console.error('LinkedIn connection test error:', error.response?.data || error.message);
    
    // Check if it's an authentication error
    const isAuthError = error.response?.status === 401;
    
    res.status(200).json({
      success: false,
      message: isAuthError ? 'LinkedIn access token expired or invalid' : 'LinkedIn connection failed',
      data: {
        connected: false,
        tokenValid: !isAuthError,
        error: error.response?.data?.message || error.message
      }
    });
  }
});

// @desc Get upload logs for a post
// @route GET /api/v1/upload/:postId/logs
// @access Private
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

// @desc Retry failed upload
// @route POST /api/v1/upload/logs/:logId/retry
// @access Private
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

// @desc Get upload status summary
// @route GET /api/v1/upload/status
// @access Private
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

// @desc Post directly to Facebook
// @route POST /api/v1/upload/facebook
// @access Private
// @desc Post existing post to Facebook - FIXED VERSION
// @route POST /api/v1/upload/facebook/:postId
// @access Private
// Updated OAuth URL with all required permissions
// Updated OAuth URL with all required permissions
// Fixed posting function
exports.postExistingToFacebook = asyncHandler(async (req, res, next) => {
  const { accountId, pageId } = req.body;
  console.log('Request body:', req.body);
  
  if (!accountId) {
    return next(new ErrorResponse('Facebook account ID is required', 400));
  }

  // Get the post
  const post = await Post.findOne({ _id: req.params.postId });
  if (!post) {
    return next(new ErrorResponse(`No post found with the id of ${req.params.postId}`, 404));
  }

  // Get the Facebook social account
  const socialAccount = await SocialAccount.findOne({
    _id: accountId,
    platform: 'facebook'
  });

  if (!socialAccount || !socialAccount.accessToken) {
    return next(new ErrorResponse('Facebook account or access token not found', 400));
  }

  let uploadLog;
  try {
    // Create upload log
    uploadLog = await UploadLog.create({
      post: post._id,
      platform: 'facebook',
      account: socialAccount._id,
      status: 'pending'
    });

    let targetId, accessToken;

    if (pageId) {
      // POSTING TO A PAGE - Use page access token
      console.log('Posting to page:', pageId);
      
      try {
        // Get page access token
        const pagesResponse = await axios.get(`https://graph.facebook.com/me/accounts`, {
          params: { access_token: socialAccount.accessToken }
        });
        
        const page = pagesResponse.data.data?.find(p => p.id === pageId);
        if (!page) {
          throw new Error(`Page ${pageId} not found or you don't have access to it`);
        }
        
        // Check if user has required permissions on this page
        const pageData = await axios.get(`https://graph.facebook.com/${pageId}`, {
          params: {
            fields: 'id,name,tasks',
            access_token: page.access_token
          }
        });
        
        console.log('Page data:', pageData.data);
        
        targetId = pageId;
        accessToken = page.access_token; // Use PAGE access token, not user token
        
      } catch (pageError) {
        console.error('Page access error:', pageError.response?.data || pageError.message);
        throw new Error(`Cannot access page: ${pageError.response?.data?.error?.message || pageError.message}`);
      }
    } else {
      // POSTING TO USER PROFILE - Use user access token
      console.log('Posting to user profile');
      targetId = 'me';
      accessToken = socialAccount.accessToken;
    }

    // Validate the target and permissions
    try {
      const testResponse = await axios.get(`https://graph.facebook.com/${targetId}`, {
        params: {
          fields: 'id,name',
          access_token: accessToken
        }
      });
      console.log('Target validation successful:', testResponse.data);
    } catch (testError) {
      console.error('Target validation failed:', testError.response?.data);
      throw new Error(`Invalid target: ${testError.response?.data?.error?.message || testError.message}`);
    }

    // Prepare content
    let contentWithTags = post.content || '';
    if (post.hashtags && Array.isArray(post.hashtags) && post.hashtags.length > 0) {
      const hashtags = post.hashtags
        .filter(tag => tag && tag.trim())
        .map(tag => {
          const cleanTag = tag.replace(/^#/, '').trim();
          return `#${cleanTag}`;
        })
        .join(' ');
      
      if (hashtags) {
        contentWithTags = contentWithTags.trim() + (contentWithTags.trim() ? '\n\n' : '') + hashtags;
      }
    }

    const postData = {
      message: contentWithTags,
      access_token: accessToken // Use the correct access token
    };

    let response;
    let endpoint;

    // Handle media
    if (post.media && post.media.length > 0) {
      const imageMedia = post.media.filter(media => media.mediaType === 'image');
      const videoMedia = post.media.filter(media => media.mediaType === 'video');

      if (videoMedia.length > 0) {
        // Video post
        postData.source = videoMedia[0].url;
        endpoint = `https://graph.facebook.com/${targetId}/videos`;
      } else if (imageMedia.length === 1) {
        // Single image
        postData.url = imageMedia[0].url;
        endpoint = `https://graph.facebook.com/${targetId}/photos`;
      } else if (imageMedia.length > 1) {
        // Multiple images - create photo album or post links
        const imageLinks = imageMedia.map((img, idx) => `Image ${idx + 1}: ${img.url}`).join('\n');
        postData.message = contentWithTags + '\n\n' + imageLinks;
        endpoint = `https://graph.facebook.com/${targetId}/feed`;
      } else {
        // Text only
        endpoint = `https://graph.facebook.com/${targetId}/feed`;
      }
    } else {
      // Text only
      endpoint = `https://graph.facebook.com/${targetId}/feed`;
    }

    console.log('Posting to endpoint:', endpoint);
    console.log('Post data:', { ...postData, access_token: '[REDACTED]' });

    response = await axios.post(endpoint, postData);
    console.log('Facebook API Response:', response.data);

    // Update upload log with success
    await UploadLog.findByIdAndUpdate(uploadLog._id, {
      status: 'success',
      message: 'Posted successfully to Facebook',
      platformPostId: response.data.id,
      platformResponse: response.data,
      postUrl: `https://www.facebook.com/${response.data.id}`,
      publishedAt: new Date(),
      updatedAt: new Date()
    });

    res.status(200).json({
      success: true,
      data: {
        uploadLog: uploadLog._id,
        platformPostId: response.data.id,
        postUrl: `https://www.facebook.com/${response.data.id}`,
        message: 'Posted successfully to Facebook'
      }
    });

  } catch (error) {
    console.error('Facebook posting error:', error.response?.data || error.message);
    
    // Update upload log with failure
    if (uploadLog) {
      await UploadLog.findByIdAndUpdate(uploadLog._id, {
        status: 'failed',
        message: error.response?.data?.error?.message || error.message,
        error: {
          code: error.response?.status,
          message: error.response?.data?.error?.message || error.message,
          details: error.response?.data
        },
        updatedAt: new Date()
      });
    }

    return next(new ErrorResponse(
      `Facebook posting failed: ${error.response?.data?.error?.message || error.message}`,
      500
    ));
  }
});

// Helper function to debug access token permissions
exports.debugFacebookToken = asyncHandler(async (req, res, next) => {
  const { accountId } = req.params;
  
  const socialAccount = await SocialAccount.findOne({
    _id: accountId,
    platform: 'facebook'
  });

  if (!socialAccount?.accessToken) {
    return next(new ErrorResponse('Facebook account or token not found', 404));
  }

  try {
    // Debug the access token
    const debugResponse = await axios.get(`https://graph.facebook.com/debug_token`, {
      params: {
        input_token: socialAccount.accessToken,
        access_token: `${process.env.FACEBOOK_CLIENT_ID}|${process.env.FACEBOOK_CLIENT_SECRET}`
      }
    });

    // Get user permissions
    const permissionsResponse = await axios.get(`https://graph.facebook.com/me/permissions`, {
      params: { access_token: socialAccount.accessToken }
    });

    // Get accessible pages
    const pagesResponse = await axios.get(`https://graph.facebook.com/me/accounts`, {
      params: { access_token: socialAccount.accessToken }
    });

    res.status(200).json({
      success: true,
      data: {
        tokenDebug: debugResponse.data,
        permissions: permissionsResponse.data,
        pages: pagesResponse.data
      }
    });

  } catch (error) {
    console.error('Debug error:', error.response?.data || error.message);
    return next(new ErrorResponse('Failed to debug token', 500));
  }
});

// @desc Post directly to Facebook - FIXED VERSION
// @route POST /api/v1/upload/facebook
// @access Private
exports.postToFacebook = asyncHandler(async (req, res, next) => {
  const { content, accountId, mediaUrls, pageId } = req.body;
  console.log('Direct Facebook post request:', { 
    content: content?.substring(0, 50), 
    accountId, 
    pageId, 
    mediaCount: mediaUrls?.length 
  });

  if (!content) {
    return next(new ErrorResponse('Post content is required', 400));
  }

  if (!accountId) {
    return next(new ErrorResponse('Facebook account ID is required', 400));
  }

  // Get the Facebook social account
  const socialAccount = await SocialAccount.findOne({
    _id: accountId,
    platform: 'facebook'
  });

  if (!socialAccount) {
    return next(new ErrorResponse('Facebook account not found', 404));
  }

  if (!socialAccount.accessToken) {
    return next(new ErrorResponse('Facebook access token not available', 400));
  }

  try {
    let targetId, accessToken;

    if (pageId) {
      // POSTING TO A PAGE - Use page access token
      console.log('Posting to page:', pageId);
      
      try {
        // Get page access token
        const pagesResponse = await axios.get(`https://graph.facebook.com/me/accounts`, {
          params: { access_token: socialAccount.accessToken }
        });
        
        const page = pagesResponse.data.data?.find(p => p.id === pageId);
        if (!page) {
          throw new Error(`Page ${pageId} not found or you don't have access to it`);
        }
        
        targetId = pageId;
        accessToken = page.access_token; // Use PAGE access token
        console.log('Using page:', page.name);
        
      } catch (pageError) {
        console.error('Page access error:', pageError.response?.data || pageError.message);
        throw new Error(`Cannot access page: ${pageError.response?.data?.error?.message || pageError.message}`);
      }
    } else {
      // POSTING TO USER PROFILE - Use user access token
      console.log('Posting to user profile');
      targetId = 'me';
      accessToken = socialAccount.accessToken;
    }

    // Validate the target and permissions
    try {
      const testResponse = await axios.get(`https://graph.facebook.com/${targetId}`, {
        params: {
          fields: 'id,name',
          access_token: accessToken
        }
      });
      console.log('Target validation successful:', testResponse.data);
    } catch (testError) {
      console.error('Target validation failed:', testError.response?.data);
      throw new Error(`Invalid target: ${testError.response?.data?.error?.message || testError.message}`);
    }

    // Prepare post data
    const postData = {
      message: content,
      access_token: accessToken // Use the correct access token
    };

    let response;
    let endpoint;

    // Handle media if provided
    if (mediaUrls && mediaUrls.length > 0) {
      if (mediaUrls.length === 1) {
        // Single media post
        const mediaUrl = mediaUrls[0];
        // Check if it's a video (simple check)
        const isVideo = mediaUrl.toLowerCase().match(/\.(mp4|mov|avi|webm)(\?|$)/);
        
        if (isVideo) {
          // Video post
          postData.source = mediaUrl;
          endpoint = `https://graph.facebook.com/${targetId}/videos`;
        } else {
          // Image post
          postData.url = mediaUrl;
          endpoint = `https://graph.facebook.com/${targetId}/photos`;
        }
      } else {
        // Multiple media - post as links for now
        const mediaLinks = mediaUrls.map((url, index) => `Media ${index + 1}: ${url}`).join('\n');
        postData.message = content + '\n\n' + mediaLinks;
        endpoint = `https://graph.facebook.com/${targetId}/feed`;
      }
    } else {
      // Text-only post
      endpoint = `https://graph.facebook.com/${targetId}/feed`;
    }

    console.log('Posting to endpoint:', endpoint);
    console.log('Post data:', { ...postData, access_token: '[REDACTED]' });

    response = await axios.post(endpoint, postData);
    console.log('Facebook API Response:', response.data);

    res.status(200).json({
      success: true,
      data: {
        platformPostId: response.data.id,
        postUrl: `https://www.facebook.com/${response.data.id}`,
        message: 'Posted successfully to Facebook'
      }
    });

  } catch (error) {
    console.error('Facebook posting error:', error.response?.data || error.message);
    return next(new ErrorResponse(
      `Facebook posting failed: ${error.response?.data?.error?.message || error.message}`,
      500
    ));
  }
});
// @desc Test Facebook connection
// @route GET /api/v1/upload/facebook/test/:accountId
// @access Private
exports.testFacebookConnection = asyncHandler(async (req, res, next) => {
  const { accountId } = req.params;

  // Get the Facebook social account
  const socialAccount = await SocialAccount.findOne({
    _id: accountId,
    user: req.user.id,
    platform: 'facebook'
  });

  if (!socialAccount) {
    return next(new ErrorResponse('Facebook account not found', 404));
  }

  if (!socialAccount.accessToken) {
    return next(new ErrorResponse('Facebook access token not available', 400));
  }

  try {
    // Test the connection by getting user info
    const userResponse = await axios.get('https://graph.facebook.com/me', {
      params: {
        fields: 'id,name,email',
        access_token: socialAccount.accessToken
      }
    });

    // Also get pages if available
    let pages = [];
    try {
      const pagesResponse = await axios.get('https://graph.facebook.com/me/accounts', {
        params: {
          access_token: socialAccount.accessToken
        }
      });
      pages = pagesResponse.data.data || [];
    } catch (pageError) {
      console.log('Could not fetch pages:', pageError.message);
    }

    res.status(200).json({
      success: true,
      message: 'Facebook connection is working',
      data: {
        accountName: userResponse.data.name,
        accountId: userResponse.data.id,
        connected: true,
        tokenValid: true,
        profile: userResponse.data,
        pages: pages.map(page => ({
          id: page.id,
          name: page.name,
          category: page.category
        }))
      }
    });

  } catch (error) {
    console.error('Facebook connection test error:', error.response?.data || error.message);
    
    // Check if it's an authentication error
    const isAuthError = error.response?.status === 401 || 
                       error.response?.data?.error?.code === 190;
    
    res.status(200).json({
      success: false,
      message: isAuthError ? 'Facebook access token expired or invalid' : 'Facebook connection failed',
      data: {
        connected: false,
        tokenValid: !isAuthError,
        error: error.response?.data?.error?.message || error.message
      }
    });
  }
});

// @desc Get Facebook pages for an account
// @route GET /api/v1/upload/facebook/:accountId/pages
// @access Private
exports.getFacebookPages = asyncHandler(async (req, res, next) => {
  const { accountId } = req.params;

  // Get the Facebook social account
  const socialAccount = await SocialAccount.findOne({
    _id: accountId,
    user: req.user.id,
    platform: 'facebook'
  });

  if (!socialAccount) {
    return next(new ErrorResponse('Facebook account not found', 404));
  }

  if (!socialAccount.accessToken) {
    return next(new ErrorResponse('Facebook access token not available', 400));
  }

  try {
    const pagesResponse = await axios.get('https://graph.facebook.com/me/accounts', {
      params: {
        access_token: socialAccount.accessToken
      }
    });

    const pages = pagesResponse.data.data || [];

    res.status(200).json({
      success: true,
      count: pages.length,
      data: pages.map(page => ({
        id: page.id,
        name: page.name,
        category: page.category,
        tasks: page.tasks
      }))
    });

  } catch (error) {
    console.error('Facebook pages fetch error:', error.response?.data || error.message);
    return next(new ErrorResponse(
      `Failed to fetch Facebook pages: ${error.response?.data?.error?.message || error.message}`, 
      500
    ));
  }
});