const Manager = require('../models/Manager');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const mongoose = require('mongoose');

// @desc    Add or update review to manager
// @route   POST /api/v1/managers/:managerId/reviews
// @route   PUT /api/v1/managers/:managerId/reviews/:reviewId
// @access  Private (Client only)
exports.addOrUpdateReview = asyncHandler(async (req, res, next) => {
  const { managerId, reviewId } = req.params;
  const { rating, comment } = req.body;
  
  // Validate input
  if (!rating || rating < 1 || rating > 5) {
    return next(new ErrorResponse('Please provide a rating between 1 and 5', 400));
  }

  const manager = await Manager.findById(managerId);
  if (!manager) {
    return next(new ErrorResponse(`Manager not found with id of ${managerId}`, 404));
  }

  // Prepare review data
  const reviewData = {
    reviewer: req.user.id,
    rating: Number(rating),
    comment,
    date: Date.now()
  };

  let reviewIndex = -1;
  
  if (reviewId) {
    // Update existing review
    reviewIndex = manager.reviews.findIndex(r => r._id.toString() === reviewId);
    
    if (reviewIndex === -1) {
      return next(new ErrorResponse(`Review not found with id of ${reviewId}`, 404));
    }
    
    // Verify ownership
    if (manager.reviews[reviewIndex].reviewer.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to update this review', 401));
    }
    
    // Preserve existing ID
    reviewData._id = manager.reviews[reviewIndex]._id;
    manager.reviews[reviewIndex] = reviewData;
  } else {
    // Handle new review or existing user review
    reviewIndex = manager.reviews.findIndex(
      r => r.reviewer.toString() === req.user.id
    );
    
    if (reviewIndex !== -1) {
      // Update existing user review
      reviewData._id = manager.reviews[reviewIndex]._id;
      manager.reviews[reviewIndex] = reviewData;
    } else {
      // Create new review
      reviewData._id = new mongoose.Types.ObjectId();
      manager.reviews.push(reviewData);
    }
  }

  // Recalculate average rating
  const totalRatings = manager.reviews.reduce((sum, review) => sum + review.rating, 0);
  manager.rating = manager.reviews.length > 0 
    ? totalRatings / manager.reviews.length 
    : 0;

  await manager.save();

  // Populate reviewer details
const updatedManager = await Manager.findById(managerId)
  .populate({
    path: 'reviews.reviewer',
    select: 'name', // Make sure to include the name field
    model: 'Client' // Explicitly specify the model if needed
  });

  // Find the exact review we just updated/created
  const responseReview = updatedManager.reviews.find(
    r => r._id.toString() === reviewData._id.toString()
  );

  res.status(reviewId ? 200 : 201).json({
    success: true,
    data: responseReview
  });
});

// @desc    Get all reviews for a manager
// @route   GET /api/v1/managers/:managerId/reviews
// @access  Public
exports.getReviews = asyncHandler(async (req, res, next) => {
  const manager = await Manager.findById(req.params.managerId)
    .populate({
      path: 'reviews.reviewer',
      select: 'name profilePhoto'
    });

  if (!manager) {
    return next(
      new ErrorResponse(`Manager not found with id of ${req.params.managerId}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    count: manager.reviews.length,
    data: manager.reviews
  });
});

// @desc    Delete a review
// @route   DELETE /api/v1/managers/:managerId/reviews/:reviewId
// @access  Private (Review author or admin)
// In your reviewController.js
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const { managerId, reviewId } = req.params;

  if (!managerId || !reviewId) {
    return next(new ErrorResponse('Manager ID and Review ID are required', 400));
  }

  const manager = await Manager.findById(managerId);
  if (!manager) {
    return next(new ErrorResponse(`Manager not found`, 404));
  }

  // Find the review index
  const reviewIndex = manager.reviews.findIndex(
    r => r._id.toString() === reviewId
  );

  if (reviewIndex === -1) {
    return next(new ErrorResponse(`Review not found`, 404));
  }

  // Check permissions
  const review = manager.reviews[reviewIndex];
  if (review.reviewer.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to delete this review', 403));
  }

  // Remove the review
  manager.reviews.splice(reviewIndex, 1);

  // Recalculate rating
  manager.rating = manager.reviews.length > 0 
    ? manager.reviews.reduce((sum, r) => sum + r.rating, 0) / manager.reviews.length
    : 0;

  await manager.save();

  res.status(200).json({
    success: true,
    data: {}
  });
});