// backend/services/scheduler.js
const cron = require('node-cron');
const Post = require('../models/post');
const { uploadToSocialMedia } = require('../utils/uploadHelpers');

const initScheduler = () => {
  console.log('Initializing post scheduler...');
  
  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      await Post.checkOverduePosts();
      console.log(`Checking for scheduled posts at ${now.toISOString()}`);
      
      // Find posts scheduled to be published now or earlier
      const posts = await Post.find({
        status: 'scheduled',
        scheduledTime: { $lte: now }
      }).populate('platforms.account');

      console.log(`Found ${posts.length} posts to publish`);
      
      for (const post of posts) {
        try {
          console.log(`Processing post ${post._id}...`);
          
          // Upload to each platform (commented out as in your example)
          // for (const platform of post.platforms) {
          //   await uploadToSocialMedia(post, platform);
          // }

          // Update status to published
          post.status = 'published';
          post.publishedAt = new Date();
          await post.save();

          console.log(`Successfully published post ${post._id}`);
        } catch (postError) {
          console.error(`Failed to publish post ${post._id}:`, postError);
          post.status = 'failed';
          await post.save();
        }
      }
    } catch (err) {
      console.error('Scheduler error:', err);
    }
  });
};

module.exports = initScheduler;