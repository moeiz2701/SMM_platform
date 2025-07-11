const AnalyticsReport = require('../models/AnalyticsReport');
const Post = require('../models/post');
const AdCampaign = require('../models/AdCampaign');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { generatePDFReport } = require('../utils/analyticsHelpers');

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