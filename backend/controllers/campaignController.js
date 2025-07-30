const AdCampaign = require('../models/AdCampaign');

// Utility to determine campaign status
function computeCampaignStatus(startDate, endDate) {
  const now = new Date();
  if (now < startDate) return 'draft';
  if (now >= startDate && now <= endDate) return 'active';
  if (now > endDate) return 'completed';
  return 'paused'; // fallback
}

// Auto-update status before returning any campaign
const attachComputedStatus = (campaign) => {
  const status = computeCampaignStatus(campaign.startDate, campaign.endDate);
  if (campaign.status !== 'paused' && campaign.status !== 'archived') {
    campaign.status = status;
  }
  return campaign;
};

// @desc    Create new ad campaign
exports.createAdCampaign = async (req, res) => {
  try {
    const body = req.body;

    const newCampaign = await AdCampaign.create({
      ...body,
      user: req.user.id,
      status: computeCampaignStatus(new Date(body.startDate), new Date(body.endDate)),
    });

    res.status(201).json({ success: true, data: newCampaign });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get all ad campaigns with updated status
exports.getAdCampaigns = async (req, res) => {
  try {
    const campaigns = await AdCampaign.find()
      .populate('client user platforms.account');

    // Auto-update statuses
    const updatedCampaigns = campaigns.map((campaign) => attachComputedStatus(campaign));

    res.status(200).json({ success: true, data: updatedCampaigns });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get single ad campaign
exports.getAdCampaign = async (req, res) => {
  try {
    const campaign = await AdCampaign.findById(req.params.id)
      .populate('client user platforms.account');

    if (!campaign) {
      return res.status(404).json({ success: false, error: 'Campaign not found' });
    }

    attachComputedStatus(campaign);
    res.status(200).json({ success: true, data: campaign });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Update ad campaign
exports.updateAdCampaign = async (req, res) => {
  try {
    const campaign = await AdCampaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, error: 'Campaign not found' });
    }

    // If status is not paused or archived, recalculate status
    const { startDate, endDate } = req.body;
    if ((startDate || endDate) && campaign.status !== 'paused' && campaign.status !== 'archived') {
      const newStart = startDate ? new Date(startDate) : campaign.startDate;
      const newEnd = endDate ? new Date(endDate) : campaign.endDate;
      campaign.status = computeCampaignStatus(newStart, newEnd);
    }

    Object.assign(campaign, req.body);
    await campaign.save();

    res.status(200).json({ success: true, data: campaign });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Pause campaign manually
exports.pauseCampaign = async (req, res) => {
  try {
    const campaign = await AdCampaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, error: 'Campaign not found' });
    }

    campaign.status = 'paused';
    await campaign.save();

    res.status(200).json({ success: true, data: campaign });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Resume a paused campaign
exports.resumeCampaign = async (req, res) => {
  try {
    const campaign = await AdCampaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, error: 'Campaign not found' });
    }

    if (campaign.status !== 'paused') {
      return res.status(400).json({ success: false, error: 'Campaign is not paused' });
    }

    // Only resume if it's within date range
    const status = computeCampaignStatus(campaign.startDate, campaign.endDate);
    if (status === 'completed' || status === 'draft') {
      return res.status(400).json({ success: false, error: 'Campaign cannot be resumed' });
    }

    campaign.status = 'active';
    await campaign.save();

    res.status(200).json({ success: true, data: campaign });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Archive campaign
exports.archiveCampaign = async (req, res) => {
  try {
    const campaign = await AdCampaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, error: 'Campaign not found' });
    }

    campaign.status = 'archived';
    await campaign.save();

    res.status(200).json({ success: true, data: campaign });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Delete campaign
exports.deleteAdCampaign = async (req, res) => {
  try {
    const campaign = await AdCampaign.findByIdAndDelete(req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, error: 'Campaign not found' });
    }

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
