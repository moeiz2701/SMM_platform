const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect, authorize } = require('../middleware/auth');
const {
  addOrUpdateReview,
  getReviews,
  deleteReview
} = require('../controllers/reviewController');

router.route('/')
  .post(protect, authorize('client'), addOrUpdateReview) // Create review
  .get(getReviews); // Get all reviews

router.route('/:reviewId')
  .put(protect, authorize('client'), addOrUpdateReview) // Update review
  .delete(protect, deleteReview); // Delete review

module.exports = router;