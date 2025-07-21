const axios = require('axios');
const SocialAccount = require('../models/SocialAccount');
require('dotenv').config();

exports.redirectToOAuth = (req, res) => {
  const { platform } = req.params;
  const redirectUri = `http://localhost:3000/v1/api/oauth/${platform}/callback`;
  let authUrl = '';

  if (platform === 'linkedin') {
    authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.LINKEDIN_CLIENT_ID}&redirect_uri=${redirectUri}&scope=r_liteprofile%20r_emailaddress%20w_member_social`;
  } else if (platform === 'facebook') {
    authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${process.env.FACEBOOK_CLIENT_ID}&redirect_uri=${redirectUri}&scope=pages_manage_posts,pages_read_engagement,pages_show_list,public_profile&response_type=code`;
  }

  res.redirect(authUrl);
};

exports.handleOAuthCallback = async (req, res) => {
  const { platform } = req.params;
  const { code } = req.query;

  try {
    if (platform === 'linkedin') {
      const tokenRes = await axios.post(
        'https://www.linkedin.com/oauth/v2/accessToken',
        new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: `http://localhost:5000/api/oauth/linkedin/callback`,
          client_id: process.env.LINKEDIN_CLIENT_ID,
          client_secret: process.env.LINKEDIN_CLIENT_SECRET
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      const accessToken = tokenRes.data.access_token;

      const profile = await axios.get('https://api.linkedin.com/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });


      // Find client for the current user
      const Client = require('../models/Client');
      const clientDoc = await Client.findOne({ user: req.user.id });

      await SocialAccount.create({
        platform: 'linkedin',
        accountName: profile.data.localizedFirstName,
        accountId: profile.data.id,
        accessToken,
        user: req.user.id,
        client: clientDoc ? clientDoc._id : undefined
      });

      return res.redirect('/dashboard?linked=linkedin');
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

      const accessToken = tokenRes.data.access_token;

      const profileRes = await axios.get(`https://graph.facebook.com/me?access_token=${accessToken}`);
      

      // Find client for the current user
      const Client = require('../models/Client');
      const clientDoc = await Client.findOne({ user: req.user.id });

      await SocialAccount.create({
        platform: 'facebook',
        accountName: profileRes.data.name,
        accountId: profileRes.data.id,
        accessToken,
        user: req.user.id,
        client: clientDoc ? clientDoc._id : undefined
      });

      return res.redirect('/dashboard?linked=facebook');
    }

    res.status(400).send('Unsupported platform');

  } catch (err) {
    console.error(err);
    res.status(500).send('OAuth callback failed');
  }
};
