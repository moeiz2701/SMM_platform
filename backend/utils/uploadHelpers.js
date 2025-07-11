const axios = require('axios');
const UploadLog = require('../models/UploadLog');
const { createPostStatusNotification } = require('./notificationHelpers');

// Mock social media upload (in a real app, this would use platform APIs)
exports.uploadToSocialMedia = async (post, platform, logId) => {
  try {
    const log = await UploadLog.findById(logId);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // In a real implementation, this would call the platform's API
    // For example, for LinkedIn:
    // const response = await axios.post('https://api.linkedin.com/v2/ugcPosts', {
    //   author: `urn:li:person:${platform.accountId}`,
    //   lifecycleState: "PUBLISHED",
    //   specificContent: {
    //     "com.linkedin.ugc.ShareContent": {
    //       shareCommentary: {
    //         text: post.content
    //       },
    //       shareMediaCategory: "IMAGE",
    //       media: post.media.map(m => ({
    //         status: "READY",
    //         description: {
    //           text: m.caption
    //         },
    //         media: m.url
    //       }))
    //     }
    //   },
    //   visibility: {
    //     "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
    //   }
    // }, {
    //   headers: {
    //     'Authorization': `Bearer ${platform.accessToken}`,
    //     'X-Restli-Protocol-Version': '2.0.0'
    //   }
    // });

    // Mock response
    const success = Math.random() > 0.2; // 80% success rate for simulation

    if (success) {
      log.status = 'success';
      log.response = {
        id: `mock_${Date.now()}`,
        url: `https://${platform.platform}.com/mock-post`
      };
      
      // Update post platform status
      const postPlatform = post.platforms.find(
        p => p.platform === platform.platform && p.account.toString() === platform.account.toString()
      );
      if (postPlatform) {
        postPlatform.status = 'published';
        postPlatform.publishedAt = new Date();
        postPlatform.url = log.response.url;
        await post.save();
      }

      // Create success notification
      await createPostStatusNotification(post, platform.platform, 'success');
    } else {
      log.status = 'failed';
      log.error = {
        message: 'Mock upload failure',
        code: 'MOCK_ERROR',
        details: 'Simulated upload failure for testing purposes'
      };

      // Create failure notification
      await createPostStatusNotification(post, platform.platform, 'failed');
    }

    log.lastAttempt = new Date();
    await log.save();
  } catch (err) {
    console.error('Upload error:', err);
    
    const log = await UploadLog.findById(logId);
    log.status = 'failed';
    log.error = {
      message: err.message,
      code: err.code || 'UNKNOWN_ERROR',
      details: err.response?.data || err.stack
    };
    log.lastAttempt = new Date();
    await log.save();

    // Create failure notification
    await createPostStatusNotification(post, platform.platform, 'failed');
  }
};

// Get platform API client
exports.getPlatformApiClient = (platform, accessToken) => {
  const baseURLs = {
    linkedin: 'https://api.linkedin.com/v2',
    instagram: 'https://graph.facebook.com/v12.0',
    facebook: 'https://graph.facebook.com/v12.0',
    twitter: 'https://api.twitter.com/2',
    tiktok: 'https://open-api.tiktok.com'
  };

  return axios.create({
    baseURL: baseURLs[platform],
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });
};

// Verify platform credentials
exports.verifyPlatformCredentials = async (platform, accessToken) => {
  try {
    // In a real implementation, this would verify the token with the platform
    // For example, for LinkedIn:
    // const response = await axios.get('https://api.linkedin.com/v2/me', {
    //   headers: {
    //     'Authorization': `Bearer ${accessToken}`
    //   }
    // });
    // return response.status === 200;

    // Mock verification
    return true;
  } catch (err) {
    console.error('Verification error:', err);
    return false;
  }
};