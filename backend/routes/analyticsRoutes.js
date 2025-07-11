const express = require('express');
const router = express.Router();
const {
  getReports,
  getReport,
  createReport,
  exportReport,
  getClientSummary
} = require('../controllers/analyticsController');
const { protect, authorize, checkOwnership } = require('../middleware/auth');
const AnalyticsReport = require('../models/AnalyticsReport');
const advancedResults = require('../middleware/advancedResults');

router
  .route('/reports')
  .get(
    protect,
    advancedResults(AnalyticsReport, {
      path: 'client',
      select: 'name industry'
    }),
    getReports
  )
  .post(protect, createReport);

router
  .route('/reports/:id')
  .get(protect, checkOwnership(AnalyticsReport), getReport);

router
  .route('/reports/:id/export')
  .get(protect, checkOwnership(AnalyticsReport), exportReport);

router
  .route('/clients/:clientId/summary')
  .get(protect, getClientSummary);

module.exports = router;