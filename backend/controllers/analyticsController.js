const AnalyticsReport = require('../models/AnalyticsReport');
const Post = require('../models/post');
const AdCampaign = require('../models/AdCampaign');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { generatePDFReport } = require('../utils/analyticsHelpers');
const axios = require('axios');


// Add this to your analyticsController.js
//http://localhost:3000/api/v1/analytics/facebook-report
//body { 
//  "access_token": "your_facebook_access_token"}
exports.getFacebookReport = asyncHandler(async (req, res, next) => {
  const { access_token } = req.body;
  
  if (!access_token) {
    return next(new ErrorResponse('Access token is required', 400));
  }

  // Get page ID from environment variable
  const pageId = process.env.FACEBOOK_TEST_PAGE_ID;
  if (!pageId) {
    return next(new ErrorResponse('FACEBOOK_TEST_PAGE_ID environment variable not set', 500));
  }

  try {
    console.log('Fetching Facebook analytics for page:', pageId);

    // Step 1: Get basic page information
    const basicInfoResponse = await axios.get(`https://graph.facebook.com/v23.0/${pageId}`, {
      params: {
        fields: 'id,name,fan_count,followers_count,talking_about_count,category,website',
        access_token: access_token
      }
    });

    console.log('Basic page info:', basicInfoResponse.data);

    // Step 2: Get page insights (if available)
    let insightsData = {
      page_impressions_unique: 0,
      page_impressions_paid: 0,
      page_reach_unique: 0,
      page_engaged_users: 0,
      page_fans: 0,
      page_fan_adds: 0,
      page_fan_removes: 0
    };

    try {
      // Try to get insights data
      const insightsResponse = await axios.get(`https://graph.facebook.com/v23.0/${pageId}/insights`, {
        params: {
          metric: 'page_impressions_unique,page_impressions_paid,page_reach_unique,page_engaged_users,page_fans,page_fan_adds,page_fan_removes',
          access_token: access_token
        }
      });

      console.log('Insights response:', insightsResponse.data);

      // Process insights data if available
      if (insightsResponse.data.data && insightsResponse.data.data.length > 0) {
        insightsResponse.data.data.forEach(metric => {
          if (metric.values && metric.values.length > 0) {
            // Get the most recent value
            const latestValue = metric.values[metric.values.length - 1];
            insightsData[metric.name] = latestValue.value || 0;
          }
        });
      }
    } catch (insightsError) {
      console.log('Insights not available:', insightsError.response?.data?.error?.message || insightsError.message);
      // Keep default zeros if insights are not available
    }

    // Step 3: Get recent posts data for additional metrics
    let postsData = {
      total_posts: 0,
      total_likes: 0,
      total_comments: 0,
      total_shares: 0,
      average_engagement: 0
    };

    try {
      const postsResponse = await axios.get(`https://graph.facebook.com/v23.0/${pageId}/posts`, {
        params: {
          fields: 'id,message,created_time,likes.summary(true),comments.summary(true),shares',
          limit: 25,
          access_token: access_token
        }
      });

      if (postsResponse.data.data && postsResponse.data.data.length > 0) {
        const posts = postsResponse.data.data;
        postsData.total_posts = posts.length;

        posts.forEach(post => {
          postsData.total_likes += post.likes?.summary?.total_count || 0;
          postsData.total_comments += post.comments?.summary?.total_count || 0;
          postsData.total_shares += post.shares?.count || 0;
        });

        // Calculate average engagement per post
        const totalEngagement = postsData.total_likes + postsData.total_comments + postsData.total_shares;
        postsData.average_engagement = postsData.total_posts > 0 ? 
          Math.round(totalEngagement / postsData.total_posts) : 0;
      }
    } catch (postsError) {
      console.log('Posts data not available:', postsError.response?.data?.error?.message || postsError.message);
    }

    // Step 4: Prepare comprehensive report
    const facebookReport = {
      success: true,
      page_info: {
        id: basicInfoResponse.data.id,
        name: basicInfoResponse.data.name,
        category: basicInfoResponse.data.category,
        website: basicInfoResponse.data.website,
        current_fans: basicInfoResponse.data.fan_count || 0,
        followers_count: basicInfoResponse.data.followers_count || 0,
        talking_about_count: basicInfoResponse.data.talking_about_count || 0
      },
      insights: {
        page_views: insightsData.page_reach_unique || 0, // Using reach as page views equivalent
        page_impressions_unique: insightsData.page_impressions_unique || 0,
        page_impressions_paid: insightsData.page_impressions_paid || 0,
        page_reach: insightsData.page_reach_unique || 0,
        page_engaged_users: insightsData.page_engaged_users || 0,
        page_fans_total: insightsData.page_fans || basicInfoResponse.data.fan_count || 0,
        page_fan_adds: insightsData.page_fan_adds || 0,
        page_fan_removes: insightsData.page_fan_removes || 0,
        net_fan_growth: (insightsData.page_fan_adds || 0) - (insightsData.page_fan_removes || 0)
      },
      content_metrics: {
        total_posts: postsData.total_posts,
        total_likes: postsData.total_likes,
        total_comments: postsData.total_comments,
        total_shares: postsData.total_shares,
        total_engagement: postsData.total_likes + postsData.total_comments + postsData.total_shares,
        average_engagement_per_post: postsData.average_engagement,
        engagement_rate: basicInfoResponse.data.fan_count > 0 ? 
          Math.round(((postsData.total_likes + postsData.total_comments + postsData.total_shares) / basicInfoResponse.data.fan_count) * 100 * 100) / 100 : 0
      },
      report_generated_at: new Date().toISOString(),
      data_source: 'Facebook Graph API v23.0'
    };

    console.log('Final Facebook report:', facebookReport);

    res.status(200).json(facebookReport);

  } catch (error) {
    console.error('Facebook analytics error:', error.response?.data || error.message);

    // Return error with zero values
    return next(new ErrorResponse(
      `Facebook analytics failed: ${error.response?.data?.error?.message || error.message}`,
      500
    ));
  }
});

// @desc    Get all analytics reports
// @route   GET /api/v1/analytics/reports
// @access  Private
exports.getReports = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single analytics report
// @route   GET /api/v1/analytics/reports/:id
// @access  Private
exports.getReport = asyncHandler(async (req, res, next) => {
  const report = await AnalyticsReport.findOne({
    _id: req.params.id,
    user: req.user.id
  });

  if (!report) {
    return next(
      new ErrorResponse(`No report found with the id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: report
  });
});

// @desc    Create new analytics report
// @route   POST /api/v1/analytics/reports
// @access  Private
exports.createReport = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;

  // Validate client exists
  if (!req.body.client) {
    return next(
      new ErrorResponse('Please specify a client for the report', 400)
    );
  }

  // Calculate metrics based on period
  const { startDate, endDate } = req.body.period;

  // Get posts in period
  const posts = await Post.find({
    client: req.body.client,
    user: req.user.id,
    'platforms.publishedAt': {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  });

  // Get campaigns in period
  const campaigns = await AdCampaign.find({
    client: req.body.client,
    user: req.user.id,
    startDate: { $lte: new Date(endDate) },
    endDate: { $gte: new Date(startDate) }
  });

  // Calculate metrics (simplified for example)
  const metrics = {
    totalPosts: posts.length,
    totalCampaigns: campaigns.length,
    totalSpend: campaigns.reduce((sum, campaign) => sum + (campaign.totalBudget || 0), 0),
    totalEngagements: posts.reduce((sum, post) => {
      return sum + post.platforms.reduce((platformSum, platform) => {
        return platformSum + (platform.analytics?.engagements || 0);
      }, 0);
    }, 0),
    totalReach: posts.reduce((sum, post) => {
      return sum + post.platforms.reduce((platformSum, platform) => {
        return platformSum + (platform.analytics?.reach || 0);
      }, 0);
    }, 0)
  };

  // Create report
  req.body.metrics = metrics;
  const report = await AnalyticsReport.create(req.body);

  res.status(201).json({
    success: true,
    data: report
  });
});

// @desc    Export analytics report to PDF
// @route   GET /api/v1/analytics/reports/:id/export
// @access  Private
exports.exportReport = asyncHandler(async (req, res, next) => {
  const report = await AnalyticsReport.findOne({
    _id: req.params.id,
    user: req.user.id
  });

  if (!report) {
    return next(
      new ErrorResponse(`No report found with the id of ${req.params.id}`, 404)
    );
  }

  try {
    const pdfPath = await generatePDFReport(report);

    report.isExported = true;
    report.exportPath = pdfPath;
    await report.save();

    res.download(pdfPath, `report-${report._id}.pdf`, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
      }
      // Optionally delete the file after download
      // fs.unlinkSync(pdfPath);
    });
  } catch (err) {
    return next(
      new ErrorResponse('Failed to generate PDF report', 500)
    );
  }
});

// @desc    Get client performance summary
// @route   GET /api/v1/analytics/clients/:clientId/summary
// @access  Private
exports.getClientSummary = asyncHandler(async (req, res, next) => {
  // Get all posts for client
  const posts = await Post.find({
    client: req.params.clientId,
    user: req.user.id
  });

  // Get all campaigns for client
  const campaigns = await AdCampaign.find({
    client: req.params.clientId,
    user: req.user.id
  });

  // Calculate summary metrics
  const summary = {
    totalPosts: posts.length,
    totalCampaigns: campaigns.length,
    totalSpend: campaigns.reduce((sum, campaign) => sum + (campaign.totalBudget || 0), 0),
    engagementRate: posts.length > 0 ? 
      (posts.reduce((sum, post) => {
        return sum + post.platforms.reduce((platformSum, platform) => {
          return platformSum + (platform.analytics?.engagementRate || 0);
        }, 0);
      }, 0) / posts.length).toFixed(2) : 0,
    topPerformingPosts: posts
      .sort((a, b) => {
        const aEngagement = a.platforms.reduce((sum, p) => sum + (p.analytics?.engagements || 0), 0);
        const bEngagement = b.platforms.reduce((sum, p) => sum + (p.analytics?.engagements || 0), 0);
        return bEngagement - aEngagement;
      })
      .slice(0, 3)
      .map(post => ({
        id: post._id,
        title: post.title,
        engagement: post.platforms.reduce((sum, p) => sum + (p.analytics?.engagements || 0), 0)
      }))
  };

  res.status(200).json({
    success: true,
    data: summary
  });
});