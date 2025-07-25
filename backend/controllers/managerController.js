// @desc    Get manager by user id
// @route   GET /api/v1/managers/user/:userId
// @access  Private/Admin/Manager

const Manager = require('../models/Manager');
const Client = require('../models/Client');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all managers
// @route   GET /api/v1/managers
// @access  Private/Admin


exports.getManagerByUserId = asyncHandler(async (req, res, next) => {
  const manager = await Manager.findOne({ user: req.params.userId }).populate('user', 'name email');
  if (!manager) {
    return next(new ErrorResponse(`Manager not found for user id ${req.params.userId}`, 404));
  }
  // Only admin or the manager themself can access
  if (req.user.role !== 'admin') {
    const selfManager = await Manager.findOne({ user: req.user._id });
    if (!selfManager || String(selfManager.user) !== String(req.params.userId)) {
      return next(new ErrorResponse('Not authorized to access this manager', 401));
    }
  }
  res.status(200).json({ success: true, data: manager });
});


exports.getManagers = asyncHandler(async (req, res, next) => {
  const managers = await Manager.find().populate('user', 'name email');
  res.status(200).json({ success: true, count: managers.length, data: managers });
});



// @desc    Get single manager
// @route   GET /api/v1/managers/:id
// @access  Private/Admin/Manager
exports.getManager = asyncHandler(async (req, res, next) => {
  const manager = await Manager.findById(req.params.id).populate('user', 'name email');
  if (!manager) {
    return next(new ErrorResponse(`Manager not found with id of ${req.params.id}`, 404));
  }
  // Only admin or the manager themself can access
  if (req.user.role !== 'admin') {
    const selfManager = await Manager.findOne({ user: req.user._id });
    if (!selfManager || String(selfManager._id) !== String(req.params.id)) {
      return next(new ErrorResponse('Not authorized to access this manager', 401));
    }
  }
  res.status(200).json({ success: true, data: manager });
});

// @desc    Create new manager
// @route   POST /api/v1/managers
// @access  Private/Admin/Manager
exports.createManager = asyncHandler(async (req, res, next) => {
  // Only admin or manager can create managers
  if (req.user.role !== 'admin' && req.user.role !== 'manager') {
    return next(new ErrorResponse('Only admin or manager can create managers', 403));
  }
  const manager = await Manager.create(req.body);
  res.status(201).json({ success: true, data: manager });
});

// @desc    Update manager
// @route   PUT /api/v1/managers/:id
// @access  Private/Admin/Manager
exports.updateManager = asyncHandler(async (req, res, next) => {
  // Only admin or the manager themself can update
  let manager = await Manager.findById(req.params.id);
  if (!manager) {
    return next(new ErrorResponse(`Manager not found with id of ${req.params.id}`, 404));
  }
  if (req.user.role !== 'admin') {
    const selfManager = await Manager.findOne({ user: req.user._id });
    if (!selfManager || String(selfManager._id) !== String(req.params.id)) {
      return next(new ErrorResponse('Not authorized to update this manager', 401));
    }
  }
  manager = await Manager.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.status(200).json({ success: true, data: manager });
});

// @desc    Delete manager
// @route   DELETE /api/v1/managers/:id
// @access  Private/Admin
exports.deleteManager = asyncHandler(async (req, res, next) => {
  const manager = await Manager.findById(req.params.id);
  if (!manager) {
    return next(new ErrorResponse(`Manager not found with id of ${req.params.id}`, 404));
  }
  // Only admin can delete
  if (req.user.role !== 'admin') {
    return next(new ErrorResponse('Only admin can delete managers', 403));
  }
  await manager.remove();
  res.status(200).json({ success: true, data: {} });
});

// @desc    Get all clients for a manager
// @route   GET /api/v1/managers/:id/clients
// @access  Private/Admin/Manager
exports.getClientsForManager = asyncHandler(async (req, res, next) => {
  const manager = await Manager.findById(req.params.id);
  if (!manager) {
    return next(new ErrorResponse(`Manager not found with id of ${req.params.id}`, 404));
  }
  // Only admin or the manager themself can access
  if (req.user.role !== 'admin') {
    const selfManager = await Manager.findOne({ user: req.user._id });
    if (!selfManager || String(selfManager._id) !== String(req.params.id)) {
      return next(new ErrorResponse('Not authorized to access this manager', 401));
    }
  }
  // Option 1: Use managedClients array
  const clients = await Client.find({ _id: { $in: manager.managedClients } });
  res.status(200).json({ success: true, count: clients.length, data: clients });
});
