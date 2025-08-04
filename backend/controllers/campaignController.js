const AdCampaign = require('../models/AdCampaign');
const Manager = require('../models/Manager')
const AdBudget= require('../models/AdBudget')
const Invoice= require('../models/Invoice')

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

function getCampaignDurationInDays(startDateStr, endDateStr) {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // include both start and end day
}
exports.createAdCampaign = async (req, res) => {
  try {
    const body = req.body;

    const manager = await Manager.findOne({ user: req.user.id });

    if (!manager) {
      return res.status(404).json({
        success: false,
        message: "Manager not found for the current user.",
      });
    }

    const newCampaign = await AdCampaign.create({
      ...body,
      manager: manager._id,
      status: computeCampaignStatus(new Date(body.startDate), new Date(body.endDate)),
    });
    console.log("Campaign is created");

    // === Automatically create budget ===
    if (!body.platforms || !Array.isArray(body.platforms)) {
      return res.status(400).json({
        success: false,
        message: "Platforms must be provided as an array.",
      });
    }

    // Create budgetAllocation from platform info
    const budgetAllocation = body.platforms.map((p) => ({
      platform: p.platform, // Already lowercased and formatted
      allocatedAmount: p.dailyBudget * getCampaignDurationInDays(body.startDate, body.endDate),
      dailyLimit: p.dailyBudget,
      spentAmount: 0, // Initialize to 0
    }));

    const totalBudget = budgetAllocation.reduce((sum, entry) => sum + entry.allocatedAmount, 0);

    const budgetData = {
      user: req.user.id,
      campaign: newCampaign._id,
      manager: manager._id,
      client: body.client,
      totalBudget,
      budgetAllocation,
    };

    const createdBudget = await AdBudget.create(budgetData);
    const invoiceData = {
      campaign: newCampaign._id,
      budget: createdBudget._id,
      manager: manager._id,
      client: body.client,
      amount: totalBudget,
      status: 'pending', // or 'unpaid'
      issuedDate: new Date(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days later
    };

    const createdInvoice = await Invoice.create(invoiceData);

    res.status(201).json({
      success: true,
      data: {
        campaign: newCampaign,
        budget: createdBudget,
        invoice: createdInvoice,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, error: err.message });
  }
};

// Utility to calculate number of campaign days (inclusive


// @desc    Get all ad campaigns with updated status
exports.getAdCampaigns = async (req, res) => {
  try {
    const campaigns = await AdCampaign.find()
     
    res.status(200).json({ success: true, data: campaigns });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get single ad campaign
exports.getAdCampaign = async (req, res) => {
  try {
    const campaign = await AdCampaign.findById(req.params.id)
      

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
