const axios = require('axios');
const SocialAccount = require('../models/SocialAccount');
const UploadLog = require('../models/UploadLog');

// Main upload function that handles all platforms
exports.uploadToSocialMedia = async (post, platform, uploadLogId) => {
  try {
    const uploadLog = await UploadLog.findById(uploadLogId);
    if (!uploadLog) {
      console.error('Upload log not found:', uploadLogId);
      return;
    }

    // Get the social account with access token
    const socialAccount = await SocialAccount.findById(platform.account);
    if (!socialAccount) {
      await updateUploadLog(uploadLogId, 'failed', 'Social account not found');
      return;
    }

    if (!socialAccount.accessToken) {
      await updateUploadLog(uploadLogId, 'failed', 'Access token not available');
      return;
    }

    let result;
    switch (platform.platform.toLowerCase()) {
      case 'linkedin':
        result = await uploadToLinkedin(post, socialAccount);
        break;
      case 'facebook':
        result = await uploadToFacebook(post, socialAccount);
        break;
      case 'instagram':
        result = await uploadToInstagram(post, socialAccount);
        break;
      default:
        throw new Error(`Unsupported platform: ${platform.platform}`);
    }

    await updateUploadLog(uploadLogId, 'success', 'Posted successfully', result);
  } catch (error) {
    console.error('Upload error:', error);
    await updateUploadLog(uploadLogId, 'failed', error.message);
  }
};

// LinkedIn posting function
const uploadToLinkedin = async (post, socialAccount) => {
  try {
    // First, get the user's LinkedIn profile ID
    const profileResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${socialAccount.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const authorUrn = `urn:li:person:${profileResponse.data.sub}`;

    // Prepare the post content
    const postData = {
      author: authorUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: post.content
          },
          shareMediaCategory: post.media && post.media.length > 0 ? 'IMAGE' : 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };

    // If there are images, handle media upload
    if (post.media && post.media.length > 0) {
      try {
        const mediaAssets = [];
        const imageMedia = post.media.filter(media => media.type === 'image');
        
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
              text: media.description || ''
            },
            media: asset,
            title: {
              text: media.title || ''
            }
          });
        }

        if (mediaAssets.length > 0) {
          postData.specificContent['com.linkedin.ugc.ShareContent'].media = mediaAssets;
        }
      } catch (mediaError) {
        console.error('LinkedIn media upload error:', mediaError.response?.data || mediaError.message);
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

    return {
      platformPostId: response.data.id,
      platformResponse: response.data,
      postUrl: `https://www.linkedin.com/feed/update/${response.data.id}`
    };

  } catch (error) {
    console.error('LinkedIn upload error:', error.response?.data || error.message);
    throw new Error(`LinkedIn upload failed: ${error.response?.data?.message || error.message}`);
  }
};

// Updated Facebook posting function for uploadHelpers.js
const uploadToFacebook = async (post, socialAccount) => {
  try {
    let targetId = 'me'; // Default to user's personal profile
    let pageAccessToken = socialAccount.accessToken;

    // If pageId is specified in socialAccount, use that page
    if (socialAccount.pageId) {
      const pagesResponse = await axios.get(`https://graph.facebook.com/me/accounts`, {
        params: {
          access_token: socialAccount.accessToken
        }
      });

      const page = pagesResponse.data.data?.find(p => p.id === socialAccount.pageId);
      if (page) {
        targetId = socialAccount.pageId;
        pageAccessToken = page.access_token;
      }
    }

    // Prepare content with hashtags
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
      access_token: pageAccessToken
    };

    let response;

    // Handle media if present
    if (post.media && post.media.length > 0) {
      const imageMedia = post.media.filter(media => media.mediaType === 'image');
      const videoMedia = post.media.filter(media => media.mediaType === 'video');

      if (videoMedia.length > 0) {
        // Post first video found
        const video = videoMedia[0];
        
        // For video uploads, we need to upload the file directly
        try {
          const videoResponse = await axios.get(video.url, { responseType: 'stream' });
          
          const formData = new FormData();
          formData.append('source', videoResponse.data);
          formData.append('description', video.caption || contentWithTags);
          formData.append('access_token', pageAccessToken);

          response = await axios.post(`https://graph.facebook.com/${targetId}/videos`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
        } catch (videoError) {
          console.error('Video upload failed, posting as link:', videoError.message);
          // Fallback to posting video URL as link
          postData.link = video.url;
          response = await axios.post(`https://graph.facebook.com/${targetId}/feed`, postData);
        }
      } else if (imageMedia.length === 1) {
        // Single image post
        const image = imageMedia[0];
        postData.url = image.url;
        if (image.caption) {
          postData.caption = image.caption;
        }
        response = await axios.post(`https://graph.facebook.com/${targetId}/photos`, postData);
      } else if (imageMedia.length > 1) {
        // Multiple images - create album
        try {
          const albumResponse = await axios.post(`https://graph.facebook.com/${targetId}/albums`, {
            name: 'Social Media Post',
            message: contentWithTags,
            access_token: pageAccessToken
          });

          const albumId = albumResponse.data.id;

          // Upload images to album
          for (const image of imageMedia) {
            await axios.post(`https://graph.facebook.com/${albumId}/photos`, {
              url: image.url,
              caption: image.caption || '',
              access_token: pageAccessToken
            });
          }

          response = albumResponse;
        } catch (albumError) {
          console.error('Album creation failed, posting first image only:', albumError.message);
          // Fallback to single image
          const firstImage = imageMedia[0];
          postData.url = firstImage.url;
          if (firstImage.caption) {
            postData.caption = firstImage.caption;
          }
          response = await axios.post(`https://graph.facebook.com/${targetId}/photos`, postData);
        }
      } else {
        // No supported media, post as text
        response = await axios.post(`https://graph.facebook.com/${targetId}/feed`, postData);
      }
    } else {
      // Text-only post
      response = await axios.post(`https://graph.facebook.com/${targetId}/feed`, postData);
    }

    return {
      platformPostId: response.data.id,
      platformResponse: response.data,
      postUrl: `https://www.facebook.com/${response.data.id}`
    };

  } catch (error) {
    console.error('Facebook upload error:', error.response?.data || error.message);
    throw new Error(`Facebook upload failed: ${error.response?.data?.error?.message || error.message}`);
  }
};

// Instagram posting function (placeholder - implement based on your needs)
const uploadToInstagram = async (post, socialAccount) => {
  try {
    // Instagram posting is more complex and requires Facebook Business API
    // This is a simplified version
    throw new Error('Instagram posting not implemented yet');
  } catch (error) {
    console.error('Instagram upload error:', error);
    throw new Error(`Instagram upload failed: ${error.message}`);
  }
};

// Helper function to update upload log
const updateUploadLog = async (uploadLogId, status, message, result = null) => {
  try {
    const updateData = {
      status,
      message,
      updatedAt: new Date()
    };

    if (result) {
      updateData.platformPostId = result.platformPostId;
      updateData.platformResponse = result.platformResponse;
      updateData.postUrl = result.postUrl;
    }

    await UploadLog.findByIdAndUpdate(uploadLogId, updateData);
  } catch (error) {
    console.error('Error updating upload log:', error);
  }
};