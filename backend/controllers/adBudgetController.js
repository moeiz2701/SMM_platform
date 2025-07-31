const AdBudget = require('../models/AdBudget');
const AdCampaign = require('../models/AdCampaign');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

function getWeekOfYear(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function getMonthAndYear(date) {
  return {
    month: date.getMonth() + 1, // Jan = 0 in JS
    year: date.getFullYear(),
  };
}


// @desc    Get all budgets
// @route   GET /api/v1/budgets
// @route   GET /api/v1/campaigns/:campaignId/budgets
// @access  Private

exports.updateMonthlyBreakdown = async (budgetId) => {
  const budget = await AdBudget.findById(budgetId);
  if (!budget) throw new Error("Budget not found");

  const map = new Map();

  for (const alloc of budget.budgetAllocation) {
    const duration = alloc.allocatedAmount / alloc.dailyLimit;
    let current = new Date();
    for (let i = 0; i < duration; i++) {
      const date = new Date(current);
      date.setDate(current.getDate() + i);
      const { month, year } = getMonthAndYear(date);
      const key = `${month}-${year}`;
      const daily = alloc.dailyLimit;

      if (!map.has(key)) {
        map.set(key, { month, year, allocatedAmount: 0, spentAmount: 0 });
      }

      map.get(key).allocatedAmount += daily;
    }
  }

  budget.monthlyBreakdown = Array.from(map.values());
  await budget.save();
  return budget.monthlyBreakdown;
};
exports.checkAndNotifyThresholds = async (budgetId) => {
  const budget = await AdBudget.findById(budgetId);
  if (!budget) throw new Error(`Budget ${budgetId} not found`);

  // Calculate total spent
  const totalSpent = budget.budgetAllocation.reduce((sum, allocation) => sum + allocation.spentAmount, 0);
  const utilization = (totalSpent / budget.totalBudget) * 100;

  let updated = false;

  for (const threshold of budget.thresholds) {
    if (!threshold.notified && utilization >= threshold.percentage) {
      // Mark as notified
      threshold.notified = true;
      updated = true;

      // Here you could trigger a notification
      console.log(
        `[THRESHOLD] Budget ${budget._id} reached ${threshold.percentage}% utilization.`
      );
    }
  }

  if (updated) {
    await budget.save();
  }
};

exports.updateWeeklyBreakdown = async (budgetId) => {
  const budget = await AdBudget.findById(budgetId);
  if (!budget) throw new Error("Budget not found");

  const map = new Map();

  for (const alloc of budget.budgetAllocation) {
    const duration = alloc.allocatedAmount / alloc.dailyLimit;
    let current = new Date();
    for (let i = 0; i < duration; i++) {
      const date = new Date(current);
      date.setDate(current.getDate() + i);
      const week = getWeekOfYear(date);
      const year = date.getFullYear();
      const key = `${week}-${year}`;
      const daily = alloc.dailyLimit;

      if (!map.has(key)) {
        map.set(key, { week, year, allocatedAmount: 0, spentAmount: 0 });
      }

      map.get(key).allocatedAmount += daily;
    }
  }

  budget.weeklyBreakdown = Array.from(map.values());
  await budget.save();
  return budget.weeklyBreakdown;
};

exports.checkAndUpdateThresholds = async (budgetId) => {
  const budget = await AdBudget.findById(budgetId);
  if (!budget) throw new Error("Budget not found");

  const totalSpent = budget.budgetAllocation.reduce((sum, alloc) => sum + alloc.spentAmount, 0);
  const utilization = (totalSpent / budget.totalBudget) * 100;

  const triggered = [];

  for (let threshold of budget.thresholds) {
    if (!threshold.notified && utilization >= threshold.percentage) {
      threshold.notified = true;
      triggered.push(threshold.percentage);

      // OPTIONAL: Trigger alert (email/SMS/push)
      console.log(`[ALERT] Campaign ${budget.campaign} crossed ${threshold.percentage}% of budget.`);
    }
  }

  await budget.save();
  return triggered; // Returns array of triggered percentages
};


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