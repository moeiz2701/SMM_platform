const express = require('express');
const router = express.Router();
const {
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  generateContent,
  optimizeBudget
} = require('../controllers/aiToolsController');
const { protect, authorize, checkOwnership } = require('../middleware/auth');
const AITemplate = require('../models/AITemplate');
const advancedResults = require('../middleware/advancedResults');

// Template routes
router
  .route('/templates')
  .get(
    protect,
    advancedResults(AITemplate, null, {
      path: 'client',
      select: 'name industry'
    }),
    getTemplates
  )
  .post(protect, createTemplate);

router
  .route('/templates/:id')
  .get(protect, checkOwnership(AITemplate), getTemplate)
  .put(protect, checkOwnership(AITemplate), updateTemplate)
  .delete(protect, checkOwnership(AITemplate), deleteTemplate);

// AI Generation routes
router
  .route('/generate')
  .post(protect, generateContent);

router
  .route('/optimize-budget')
  .post(protect, optimizeBudget);

module.exports = router;