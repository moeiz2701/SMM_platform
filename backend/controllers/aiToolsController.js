const AITemplate = require('../models/AITemplate');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { generateAIContent } = require('../utils/aiHelpers');

// @desc    Get all AI templates
// @route   GET /api/v1/ai-tools/templates
// @access  Private
exports.getTemplates = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single AI template
// @route   GET /api/v1/ai-tools/templates/:id
// @access  Private
exports.getTemplate = asyncHandler(async (req, res, next) => {
  const template = await AITemplate.findOne({
    _id: req.params.id,
    user: req.user.id
  });

  if (!template) {
    return next(
      new ErrorResponse(`No template found with the id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: template
  });
});

// @desc    Create new AI template
// @route   POST /api/v1/ai-tools/templates
// @access  Private
exports.createTemplate = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;

  const template = await AITemplate.create(req.body);

  res.status(201).json({
    success: true,
    data: template
  });
});

// @desc    Update AI template
// @route   PUT /api/v1/ai-tools/templates/:id
// @access  Private
exports.updateTemplate = asyncHandler(async (req, res, next) => {
  let template = await AITemplate.findById(req.params.id);

  if (!template) {
    return next(
      new ErrorResponse(`No template with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is template owner
  if (template.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this template`,
        401
      )
    );
  }

  template = await AITemplate.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: template
  });
});

// @desc    Delete AI template
// @route   DELETE /api/v1/ai-tools/templates/:id
// @access  Private
exports.deleteTemplate = asyncHandler(async (req, res, next) => {
  const template = await AITemplate.findById(req.params.id);

  if (!template) {
    return next(
      new ErrorResponse(`No template with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is template owner
  if (template.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this template`,
        401
      )
    );
  }

  // Fixed: Use deleteOne() instead of remove()
  await template.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Generate AI content
// @route   POST /api/v1/ai-tools/generate
// @access  Private
exports.generateContent = asyncHandler(async (req, res, next) => {
  const { contentType, prompt, tone, length, variables } = req.body;

  if (!contentType || !prompt) {
    return next(
      new ErrorResponse('Please provide contentType and prompt', 400)
    );
  }

  try {
    const generatedContent = await generateAIContent({
      contentType,
      prompt,
      tone,
      length,
      variables
    });

    res.status(200).json({
      success: true,
      data: generatedContent
    });
  } catch (err) {
    return next(
      new ErrorResponse('AI content generation failed', 500)
    );
  }
});

// @desc    Optimize budget with AI
// @route   POST /api/v1/ai-tools/optimize-budget
// @access  Private
exports.optimizeBudget = asyncHandler(async (req, res, next) => {
  const { budgetId } = req.body;

  if (!budgetId) {
    return next(
      new ErrorResponse('Please provide budgetId', 400)
    );
  }

  const budget = await AdBudget.findOne({
    _id: budgetId,
    user: req.user.id
  });

  if (!budget) {
    return next(
      new ErrorResponse(`No budget found with the id of ${budgetId}`, 404)
    );
  }

  // Simulate AI optimization (mock implementation)
  const optimizationResult = {
    recommendedAllocation: budget.budgetAllocation.map(allocation => ({
      platform: allocation.platform,
      currentAllocation: allocation.allocatedAmount,
      recommendedAllocation: Math.floor(allocation.allocatedAmount * (0.8 + Math.random() * 0.4)),
      reason: "Predicted higher ROI based on historical performance"
    })),
    estimatedImprovement: (Math.random() * 30).toFixed(2) + "%"
  };

  res.status(200).json({
    success: true,
    data: optimizationResult
  });
});