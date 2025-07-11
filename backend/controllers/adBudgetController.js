const AdBudget = require('../models/AdBudget');
const AdCampaign = require('../models/AdCampaign');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all budgets
// @route   GET /api/v1/budgets
// @route   GET /api/v1/campaigns/:campaignId/budgets
// @access  Private
exports.getBudgets = asyncHandler(async (req, res, next) => {
  if (req.params.campaignId) {
    const budgets = await AdBudget.find({ 
      campaign: req.params.campaignId,
      user: req.user.id 
    }).populate('campaign');

    return res.status(200).json({
      success: true,
      count: budgets.length,
      data: budgets
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc    Get single budget
// @route   GET /api/v1/budgets/:id
// @access  Private
exports.getBudget = asyncHandler(async (req, res, next) => {
  const budget = await AdBudget.findOne({
    _id: req.params.id,
    user: req.user.id
  }).populate('campaign');

  if (!budget) {
    return next(
      new ErrorResponse(`No budget found with the id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: budget
  });
});

// @desc    Create new budget
// @route   POST /api/v1/budgets
// @route   POST /api/v1/campaigns/:campaignId/budgets
// @access  Private
exports.createBudget = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;

  if (req.params.campaignId) {
    req.body.campaign = req.params.campaignId;
  }

  const campaign = await AdCampaign.findById(req.body.campaign);

  if (!campaign) {
    return next(
      new ErrorResponse(`No campaign with the id of ${req.body.campaign}`, 404)
    );
  }

  // Make sure campaign belongs to user
  if (campaign.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to add a budget to this campaign`,
        401
      )
    );
  }

  // Verify platforms in budget allocation match campaign platforms
  const campaignPlatforms = campaign.platforms.map(p => p.platform);
  const budgetPlatforms = req.body.budgetAllocation.map(a => a.platform);

  const hasAllPlatforms = budgetPlatforms.every(p => campaignPlatforms.includes(p));
  if (!hasAllPlatforms) {
    return next(
      new ErrorResponse(
        `Budget allocation includes platforms not in the campaign`,
        400
      )
    );
  }

  const budget = await AdBudget.create(req.body);

  res.status(201).json({
    success: true,
    data: budget
  });
});

// @desc    Update budget
// @route   PUT /api/v1/budgets/:id
// @access  Private
exports.updateBudget = asyncHandler(async (req, res, next) => {
  let budget = await AdBudget.findById(req.params.id);

  if (!budget) {
    return next(
      new ErrorResponse(`No budget with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is budget owner
  if (budget.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this budget`,
        401
      )
    );
  }

  // Verify platforms in budget allocation match campaign platforms
  if (req.body.budgetAllocation) {
    const campaign = await AdCampaign.findById(budget.campaign);
    const campaignPlatforms = campaign.platforms.map(p => p.platform);
    const budgetPlatforms = req.body.budgetAllocation.map(a => a.platform);

    const hasAllPlatforms = budgetPlatforms.every(p => campaignPlatforms.includes(p));
    if (!hasAllPlatforms) {
      return next(
        new ErrorResponse(
          `Budget allocation includes platforms not in the campaign`,
          400
        )
      );
    }
  }

  budget = await AdBudget.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: budget
  });
});

// @desc    Delete budget
// @route   DELETE /api/v1/budgets/:id
// @access  Private
exports.deleteBudget = asyncHandler(async (req, res, next) => {
  const budget = await AdBudget.findById(req.params.id);

  if (!budget) {
    return next(
      new ErrorResponse(`No budget with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is budget owner
  if (budget.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this budget`,
        401
      )
    );
  }

  await budget.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Track budget spending
// @route   GET /api/v1/budgets/:id/track
// @access  Private
exports.trackBudgetSpending = asyncHandler(async (req, res, next) => {
  const budget = await AdBudget.findOne({
    _id: req.params.id,
    user: req.user.id
  });

  if (!budget) {
    return next(
      new ErrorResponse(`No budget found with the id of ${req.params.id}`, 404)
    );
  }

  const utilization = await AdBudget.calculateUtilization(req.params.id);

  res.status(200).json({
    success: true,
    data: {
      budget,
      utilization
    }
  });
});

// @desc    Simulate budget performance
// @route   POST /api/v1/budgets/:id/simulate
// @access  Private
exports.simulateBudgetPerformance = asyncHandler(async (req, res, next) => {
  const budget = await AdBudget.findOne({
    _id: req.params.id,
    user: req.user.id
  });

  if (!budget) {
    return next(
      new ErrorResponse(`No budget found with the id of ${req.params.id}`, 404)
    );
  }

  // Simulate performance based on historical data (mock implementation)
  const simulationResults = {
    estimatedClicks: Math.floor(Math.random() * 10000),
    estimatedConversions: Math.floor(Math.random() * 100),
    estimatedROI: (Math.random() * 10).toFixed(2),
    recommendedAdjustments: [
      "Increase budget for top performing platforms",
      "Reallocate 20% of budget from underperforming platforms"
    ]
  };

  res.status(200).json({
    success: true,
    data: {
      budget,
      simulation: simulationResults
    }
  });
});