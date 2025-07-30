const express = require('express');
const {
  createAdCampaign,
  getAdCampaigns,
  getAdCampaign,
  updateAdCampaign,
  deleteAdCampaign,
  pauseCampaign,
  resumeCampaign,
  archiveCampaign
} = require('../controllers/campaignController');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .post(protect, authorize('admin', 'manager'), createAdCampaign)
  .get(protect, authorize('admin', 'manager'), getAdCampaigns);

router
  .route('/:id')
  .get(protect, authorize('admin', 'manager'), getAdCampaign)
  .put(protect, authorize('admin', 'manager'), updateAdCampaign)
  .delete(protect, authorize('admin', 'manager'), deleteAdCampaign);

// Special campaign state routes
router.put('/:id/pause', protect, authorize('admin', 'manager'), pauseCampaign);
router.put('/:id/resume', protect, authorize('admin', 'manager'), resumeCampaign);
router.put('/:id/archive', protect, authorize('admin', 'manager'), archiveCampaign);

module.exports = router;
