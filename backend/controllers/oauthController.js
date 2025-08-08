const axios = require('axios');
const SocialAccount = require('../models/SocialAccount');
require('dotenv').config();

exports.redirectToOAuth = (req, res) => {
  const { platform } = req.params;
  const redirectUri = `http://localhost:3000/api/v1/oauth/${platform}/callback`;
  let authUrl = '';
  
  if (platform === 'linkedin') {
    authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.LINKEDIN_CLIENT_ID}&redirect_uri=${redirectUri}&scope=openid%20profile%20email%20w_member_social`;
  } else if (platform === 'facebook') {
    authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${process.env.FACEBOOK_CLIENT_ID}&redirect_uri=${redirectUri}&scope=pages_manage_posts,pages_read_engagement,pages_show_list,pages_manage_engagement,email&&response_type=code`;
  } else if (platform === 'instagram') {
    // Instagram uses Facebook's OAuth with Instagram-specific scopes
    authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${process.env.FACEBOOK_CLIENT_ID}&redirect_uri=${redirectUri}&scope=instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement&response_type=code`;
  }
  
  console.log(platform, 'OAuth redirect URL:', authUrl);
  res.redirect(authUrl);
};

exports.handleOAuthCallback = async (req, res) => {
  const { platform } = req.params;
  const { code } = req.query;
  console.log('OAuth callback for platform:', platform);
  
  try {
    // Get client ID and user ID from the /me route using the user's token
    let clientId = null;
    let userId = null;
    try {
      // Extract token from request (same logic as in protect middleware)
      let token;
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
      } else if (req.cookies.token) {
        token = req.cookies.token;
      }
      
      if (token) {
        // Make internal API call to get client data
        const clientResponse = await axios.get('http://localhost:3000/api/v1/clients/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (clientResponse.data.success && clientResponse.data.data) {
          clientId = clientResponse.data.data._id;
          userId = clientResponse.data.data.user._id; // Get user ID from populated user field
          console.log('Client ID retrieved from /me route:', clientId);
          console.log('User ID retrieved from /me route:', userId);
        } else {
          console.log('No client found for user');
          // If no client, we still need user ID, so fall back to req.user.id
          userId = req.user.id;
        }
      }
    } catch (clientError) {
      console.error('Error fetching client data:', clientError.message);
      // Continue with fallback user ID from middleware
      userId = req.user.id;
    }

    if (platform === 'linkedin') {
      const tokenRes = await axios.post(
        'https://www.linkedin.com/oauth/v2/accessToken',
        new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: `http://localhost:3000/api/v1/oauth/${platform}/callback`,
          client_id: process.env.LINKEDIN_CLIENT_ID,
          client_secret: process.env.LINKEDIN_CLIENT_SECRET
        }),
        { 
          headers: { 
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          } 
        }
      );
      
      const accessToken = tokenRes.data.access_token;
      const profile = await axios.get('https://api.linkedin.com/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      console.log('LinkedIn profile data:', profile.data);
      
      await SocialAccount.create({
        platform: 'linkedin',
        accountName: profile.data.name,
        accountId: profile.data.sub,
        accessToken,
        user: userId, // Use user ID from /me route
        client: clientId // Use the client ID from /me route
      });
      
      return res.redirect('http://localhost:3001/client/accounts');
    }
    
    if (platform === 'facebook') {
      const tokenRes = await axios.get('https://graph.facebook.com/v19.0/oauth/access_token', {
        params: {
          client_id: process.env.FACEBOOK_CLIENT_ID,
          client_secret: process.env.FACEBOOK_CLIENT_SECRET,
          redirect_uri: `http://localhost:3000/api/v1/oauth/facebook/callback`,
          code
        }
      });

      console.log("Facebook OAuth working");
      
      const accessToken = tokenRes.data.access_token;
      const profileRes = await axios.get(`https://graph.facebook.com/me?access_token=${accessToken}`);
      
      await SocialAccount.create({
        platform: 'facebook',
        accountName: profileRes.data.name,
        accountId: profileRes.data.id,
        accessToken,
        user: userId,
        client: clientId
      });
      
      return res.redirect('http://localhost:3001/client/accounts');
    }

    if (platform === 'instagram') {
      // Step 1: Exchange code for access token (same as Facebook)
      const tokenRes = await axios.get('https://graph.facebook.com/v19.0/oauth/access_token', {
        params: {
          client_id: process.env.FACEBOOK_CLIENT_ID,
          client_secret: process.env.FACEBOOK_CLIENT_SECRET,
          redirect_uri: `http://localhost:3000/api/v1/oauth/instagram/callback`,
          code
        }
      });

      console.log("Instagram OAuth working");
      
      const accessToken = tokenRes.data.access_token;
      console.log('Access Token:', accessToken);

      // Step 2: Get Instagram business account from your specific page
      const pageInstagramRes = await axios.get(
        `https://graph.facebook.com/v19.0/${process.env.INSTAGRAM_PAGE_ID}?fields=instagram_business_account&access_token=${accessToken}`
      );
      
      console.log('Page Instagram Response:', pageInstagramRes.data);
      
      // Step 3: Extract Instagram business account ID
      if (!pageInstagramRes.data.instagram_business_account) {
        console.log('No Instagram business account found for the specified page');
        return res.redirect('http://localhost:3001/client/accounts?error=no_instagram_account');
      }
      
      const instagramBusinessAccountId = pageInstagramRes.data.instagram_business_account.id;
      console.log('Instagram Business Account ID:', instagramBusinessAccountId);
      
      // Step 4: Get Instagram account details
      const instagramDetailsRes = await axios.get(
        `https://graph.facebook.com/v19.0/${instagramBusinessAccountId}?fields=id,username,name,profile_picture_url,followers_count,follows_count,media_count&access_token=${accessToken}`
      );
      
      console.log('Instagram Details Response:', instagramDetailsRes.data);
      
      const instagramData = instagramDetailsRes.data;
      
      // Step 5: Save Instagram account to database
      await SocialAccount.create({
        platform: 'instagram',
        accountName: instagramData.name || instagramData.username,
        accountId: instagramData.id,
        username: instagramData.username,
        accessToken: accessToken,
        isBusinessAccount: true,
        status: 'connected',
        additionalData: {
          profilePicture: instagramData.profile_picture_url,
          followersCount: instagramData.followers_count,
          followsCount: instagramData.follows_count,
          mediaCount: instagramData.media_count,
          pageId: process.env.INSTAGRAM_PAGE_ID
        },
        user: userId,
        client: clientId,
        scopes: [],
        description: ''
      });
      
      console.log('Instagram account connected:', instagramData.username);
      
      return res.redirect('http://localhost:3001/client/accounts');
    }
    
    res.status(400).send('Unsupported platform');
  } catch (err) {
    console.error('OAuth callback error:', err);
    res.status(500).send('OAuth callback failed');
  }
};