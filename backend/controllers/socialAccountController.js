// @desc    Get all social accounts for the current user's client
// @route   GET /api/v1/social-accounts
// @access  Private

const SocialAccount = require('../models/SocialAccount');
const Client = require('../models/Client');
const Manager = require('../models/Manager');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Add a social account
// @route   POST /api/v1/social-accounts/:platform
// @access  Private


exports.addSocialAccount = asyncHandler(async (req, res, next) => {
  const { platform } = req.params;
  // Allow client owner or manager to add social account
  let isManager = false;
  if (req.user && req.user.id) {
    const manager = await Manager.findById(req.user.id);
    if (manager) isManager = true;
  }
  let client;
  if (isManager) {
    // Manager can add for any client they manage (assume manager id is in client.manager)
    client = await Client.findOne({ manager: req.user.id });
  } else {
    client = await Client.findOne({ user: req.user.id });
  }
  if (!client) {
    return next(new ErrorResponse('Client not found for user or manager', 404));
  }

  // Use client name as accountName, random string for token
  const randomToken = Math.random().toString(36).substring(2, 18);


  // Platform-specific random values
  let followersCount = Math.floor(Math.random() * 10000) + 100;
  let postCount = Math.floor(Math.random() * 500) + 10;
  if (platform === 'facebook') {
    followersCount = Math.floor(Math.random() * 50000) + 500;
    postCount = Math.floor(Math.random() * 1000) + 50;
  } else if (platform === 'linkedin') {
    followersCount = Math.floor(Math.random() * 20000) + 200;
    postCount = Math.floor(Math.random() * 300) + 5;
  } else if (platform === 'instagram') {
    followersCount = Math.floor(Math.random() * 100000) + 1000;
    postCount = Math.floor(Math.random() * 2000) + 100;
  }

  // Random bios for demo
  const bios = [
    'Software engineering student passionate about building scalable web apps.',
    'Aspiring full-stack developer and tech enthusiast.',
    'Loves coding, coffee, and cloud computing.',
    'React, Node.js, and MongoDB fan. Always learning.',
    'Building the future, one line of code at a time.'
  ];
  const description = bios[Math.floor(Math.random() * bios.length)];

  const socialAccount = await SocialAccount.create({
    platform,
    accountName: client.name,
    accountId: client._id.toString(),
    accessToken: randomToken,
    user: req.user.id,
    client: client._id,
    followersCount,
    postCount,
    description
  });

  res.status(201).json({
    success: true,
    data: socialAccount
  });
});

// @desc    Delete a social account
// @route   DELETE /api/v1/social-accounts/:platform
// @access  Private
exports.deleteSocialAccount = asyncHandler(async (req, res, next) => {
  const { platform } = req.params;
  // Allow client owner or manager to delete social account
  let isManager = false;
  if (req.user && req.user.id) {
    const manager = await Manager.findById(req.user.id);
    if (manager) isManager = true;
  }
  let client;
  if (isManager) {
    client = await Client.findOne({ manager: req.user.id });
  } else {
    client = await Client.findOne({ user: req.user.id });
  }
  if (!client) {
    return next(new ErrorResponse('Client not found for user or manager', 404));
  }

  const deleted = await SocialAccount.findOneAndDelete({
    platform,
    user: req.user.id,
    client: client._id
  });

  if (!deleted) {
    return next(new ErrorResponse('Social account not found', 404));
  }

  res.status(200).json({
    success: true,
    data: {}
  });
});

exports.getSocialAccounts = asyncHandler(async (req, res, next) => {
  // Allow client owner or manager to get social accounts
  let isManager = false;
  let manager;
  if (req.user && req.user.id) {
    manager = await Manager.findById(req.user._id);
    if (manager) isManager = true;
  }
  let client;
  if (isManager) {
    client = await Client.findOne({ manager: req.user._id });
  } else {
    client = await Client.findOne({ user: req.user._id });
  }
  if (!client) {
    client = await Client.findOne({ manager: req.user._id });
  }

  console.log('Client:', client);
  console.log(req.user._id);

  if (!client) {
    return next(new ErrorResponse('Client not found for user or manager', 404));
  }

  // Find all social accounts for this client
  const accounts = await SocialAccount.find({ client: client._id });

  res.status(200).json({
    success: true,
    count: accounts.length,
    data: accounts
  });
});
exports.getSocialAccountsByClient = async (req, res) => {
  try {
    const { clientId } = req.params;

    const accounts = await SocialAccount.find({ client: clientId }).select(
      'platform accountName accountId profilePicture status followersCount postCount description createdAt accessToken'
    );

    if (!accounts || accounts.length === 0) {
      return res.status(404).json({ success: false, message: 'No social accounts found for this client.' });
    }

    return res.status(200).json({ success: true, count: accounts.length, data: accounts });
  } catch (error) {
    console.error('Error fetching social accounts:', error);
    return res.status(500).json({ success: false, message: 'Server error while fetching social accounts.' });
  }
};