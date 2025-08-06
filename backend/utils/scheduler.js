const cron = require('node-cron');
const axios = require('axios');
const Post = require('../models/post');
const SocialAccount = require('../models/SocialAccount');
const UploadLog = require('../models/UploadLog');

const initScheduler = () => {
  console.log('Initializing post scheduler...');
  
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      console.log(`\n=== Scheduler Run at ${now.toISOString()} ===`);

      // Find posts due for publishing
      const postsToPublish = await Post.find({
        status: 'scheduled',
        scheduledTime: { $lte: now }
      });

      console.log(`Found ${postsToPublish.length} posts ready to publish`);
      
      for (const post of postsToPublish) {
        try {
          console.log(`\nProcessing post ${post._id} (${post.title})`);
          
          // Get client's social accounts (like frontend does)
          const socialAccounts = await SocialAccount.find({
            client: post.client._id || post.client
          });

          if (socialAccounts.length === 0) {
            console.error('❌ No social accounts found for client');
            post.status = 'failed';
            await post.save();
            continue;
          }

          let atLeastOneSuccess = false;
          
          for (const postPlatform of post.platforms) {
            try {
              // Find matching account (like frontend does)
              const matchingAccount = socialAccounts.find(account => 
                account.platform.toLowerCase() === postPlatform.platform.toLowerCase()
              );
              
              if (!matchingAccount) {
                console.error(`❌ No account found for ${postPlatform.platform}`);
                continue;
              }

              console.log(`Found ${postPlatform.platform} account: ${matchingAccount.accountName}`);

              // Create upload log
              const uploadLog = await UploadLog.create({
                post: post._id,
                platform: postPlatform.platform,
                account: matchingAccount._id,
                status: 'pending',
                user: post.Manager || post.user
              });

              // Call the same API endpoint your frontend uses
              let endpoint;
              switch (postPlatform.platform.toLowerCase()) {
                case 'linkedin':
                  endpoint = `http://localhost:3000/api/v1/upload/linkedin/${post._id}`;
                  break;
                case 'facebook':
                  endpoint = `http://localhost:3000/api/v1/upload/facebook/${post._id}`;
                  break;
                default:
                  console.error(`Unsupported platform: ${postPlatform.platform}`);
                  continue;
              }

              // Make request to your API (like frontend does)
              const response = await axios.post(endpoint, {
                accountId: matchingAccount._id
              }, {
                headers: {
                  'Content-Type': 'application/json'
                }
              });

              console.log(`✅ Successfully uploaded to ${postPlatform.platform}`);
              atLeastOneSuccess = true;

            } catch (platformError) {
              console.error(`❌ Failed ${postPlatform.platform}:`, 
                platformError.response?.data?.message || platformError.message);
            }
          }

          // Update post status
          post.status = atLeastOneSuccess ? 'published' : 'failed';
          post.publishedAt = atLeastOneSuccess ? new Date() : undefined;
          await post.save();

          console.log(`✔ Post ${post._id} marked as ${post.status}`);

        } catch (postError) {
          console.error(`❌ Critical error processing post ${post._id}:`, postError.message);
          post.status = 'failed';
          await post.save();
        }
      }

    } catch (err) {
      console.error('⚠️ Scheduler error:', err.message);
    }
  });
};

module.exports = initScheduler;