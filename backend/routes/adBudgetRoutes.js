const express = require('express');
const router = express.Router();
const {
  getBudgets,
  getBudget,
  createBudget,
  updateBudget,
  deleteBudget,
  trackBudgetSpending,
  simulateBudgetPerformance
} = require('../controllers/adBudgetController');
const { protect, authorize, checkOwnership } = require('../middleware/auth');
const AdBudget = require('../models/AdBudget');
const advancedResults = require('../middleware/advancedResults');

router
  .route('/')
  .get(
    protect,
    advancedResults(AdBudget, {
      path: 'campaign',
      select: 'name objective status'
    }),
    getBudgets
  )
  .post(protect, createBudget);

router
  .route('/:id')
  .get(protect, protect, getBudget)
  .put(protect, checkOwnership(AdBudget), updateBudget)
  .delete(protect, checkOwnership(AdBudget), deleteBudget);

router
  .route('/:id/track')
  .get(protect, checkOwnership(AdBudget), trackBudgetSpending);

router
  .route('/:id/simulate')
  .post(protect, checkOwnership(AdBudget), simulateBudgetPerformance);

module.exports = router;