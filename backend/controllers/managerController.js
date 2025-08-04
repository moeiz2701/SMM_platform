// @desc    Get manager by user id
// @route   GET /api/v1/managers/user/:userId
// @access  Private/Admin/Manager

const Manager = require('../models/Manager');
const Client = require('../models/Client');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const mongoose = require('mongoose');

// @desc    Get all managers
// @route   GET /api/v1/managers
// @access  Private/Admin


exports.getManagerByUserId = asyncHandler(async (req, res, next) => {
  const manager = await Manager.findOne({ user: req.params.userId }).populate('user', 'name email');
  if (!manager) {
    return next(new ErrorResponse(`Manager not found for user id ${req.params.userId}`, 404));
  }
  // Only admin or the manager themself can access
  if (req.user.role !== 'admin' && req.user.role !== 'client') {
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
  if (req.user.role !== 'admin' && req.user.role !== 'client') {
    const selfManager = await Manager.findOne({ user: req.user._id });
    if (!selfManager || String(selfManager._id) !== String(req.params.id)) {
      return next(new ErrorResponse('Not authorized to access this manager', 401));
    }
  }
  res.status(200).json({ success: true, data: manager });
});
// @desc    Get manager profile by authenticated user ID
// @route   GET /api/v1/managers/me
// @access  Private
exports.getMyManager = asyncHandler(async (req, res, next) => {
  console.log("getMyManager called for user:", req.user.id);

  // Find the manager document where user field matches the current user's id
  const manager = await Manager.findOne({ user: req.user.id }).populate('user', 'name email');

  console.log("Manager found:", manager ? "YES" : "NO");

  if (!manager) {
    console.log("No manager found, returning null");
    return res.status(200).json({ success: true, data: null });
  }

  console.log("Manager data:", {
    id: manager._id,
    name: manager.user?.name || 'N/A',
    email: manager.user?.email || 'N/A',
  });

  res.status(200).json({
    success: true,
    data: manager
  });
});

// @desc    Create new manager
// @route   POST /api/v1/managers
// @access  Private/Admin/Manager
exports.createManager = asyncHandler(async (req, res, next) => {
  // Only admin or manager can create managers
  if (req.user.role !== 'admin' && req.user.role !== 'manager') {
    return next(new ErrorResponse('Only admin or manager can create managers', 403));
  }

  // Attach the current user's ID to the manager data
  req.body.user = req.user._id;

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

// @desc    Add a client to a manager
// @route   POST /api/v1/managers/:id/clients
// @access  Private/Admin/Manager
exports.addClientToManager = asyncHandler(async (req, res, next) => {
  const managerId = req.params.id;
  const { clientId } = req.body;

  // Only admin or the manager themself can add clients
  if (req.user.role !== 'admin') {
    const selfManager = await Manager.findOne({ user: req.user._id });
    if (!selfManager || String(selfManager._id) !== String(managerId)) {
      return next(new ErrorResponse('Not authorized to add clients to this manager', 401));
    }
  }

  const manager = await Manager.findById(managerId);
  if (!manager) {
    return next(new ErrorResponse(`Manager not found with id of ${managerId}`, 404));
  }

  const client = await Client.findById(clientId);
  if (!client) {
    return next(new ErrorResponse(`Client not found with id of ${clientId}`, 404));
  }

  // Add client to manager's managedClients if not already present
  if (!manager.managedClients.includes(client._id)) {
    manager.managedClients.push(client._id);
    await manager.save();
  }

  // Set the manager field on the client
  if (!client.manager || String(client.manager) !== String(manager._id)) {
    client.manager = manager._id;
    await client.save();
  }

  res.status(200).json({ success: true, data: { manager, client } });
});


// @desc    Add clients to a manager
// @route   PUT /api/v1/managers/:id/add-clients
// @access  Private/Admin/Manager
exports.addClientsToManager = asyncHandler(async (req, res, next) => {
  const manager = await Manager.findById(req.params.id);
  if (!manager) {
    return next(new ErrorResponse(`Manager not found with id of ${req.params.id}`, 404));
  }
  // Only admin or the manager themself can update
  if (req.user.role !== 'admin') {
    const selfManager = await Manager.findOne({ user: req.user._id });
    if (!selfManager || String(selfManager._id) !== String(req.params.id)) {
      return next(new ErrorResponse('Not authorized to update this manager', 401));
    }
  }
  // Expect req.body.clients to be an array of client IDs
  const { clients } = req.body;
  if (!Array.isArray(clients) || clients.length === 0) {
    return next(new ErrorResponse('Please provide an array of client IDs', 400));
  }
  // Add unique client IDs
  manager.managedClients = Array.from(new Set([...(manager.managedClients || []), ...clients]));
  await manager.save();
  res.status(200).json({ success: true, data: manager });
});


// @desc    Get manager for a specific client (using client ID)
// @route   GET /api/v1/managers/for-client/:clientId
// @access  Private (client, manager, admin)
exports.getManagerForClient = asyncHandler(async (req, res, next) => {
  // 1. Find the client document
  const client = await Client.findById(req.params.clientId);
  
  if (!client) {
    return next(new ErrorResponse(`Client not found`, 404));
  }

  // 2. Authorization check
  // Allow if: admin, manager, or the client themselves
  if (req.user.role !== 'admin') {
    if (req.user.role === 'manager') {
      // Check if this manager is assigned to the client
      const manager = await Manager.findOne({ user: req.user._id });
      if (!manager || !manager.managedClients.includes(client._id)) {
        return next(new ErrorResponse('Not authorized', 401));
      }
    } else if (req.user.role === 'client') {
      // Check if this is the client's own data
      if (String(client.user) !== String(req.user._id)) {
        return next(new ErrorResponse('Not authorized', 401));
      }
    } else {
      return next(new ErrorResponse('Not authorized', 401));
    }
  }

  // 3. If client has no manager, return null
  if (!client.manager) {
    return res.status(200).json({ success: true, data: null });
  }

  // 4. Get and return the manager
  const manager = await Manager.findById(client.manager)
    .populate('user', 'name email')
    .populate('managedClients', 'name');

  if (!manager) {
    return next(new ErrorResponse('Manager not found', 404));
  }

  res.status(200).json({ success: true, data: manager });
});


// controllers/managerController.js

// @desc    Get manager for current client (using client's own data)
// @route   GET /api/v1/managers/my-manager
// @access  Private (client)
exports.getmyManager = asyncHandler(async (req, res, next) => {
  console.log("getMyManager called for user:", req.user.id);

  // 1. Find the client document for the current user
  const client = await Client.findOne({ user: req.user.id });
  
  if (!client) {
    console.log("No client found for user");
    return next(new ErrorResponse('Client profile not found', 404));
  }

  console.log("Client found with ID:", client._id);

  // 2. If client has no manager assigned
  if (!client.manager) {
    console.log("Client has no manager assigned");
    return res.status(200).json({ success: true, data: null });
  }

  // 3. Find and return the manager
  const manager = await Manager.findById(client.manager)
    .populate('user', 'name email')
    .populate('managedClients', 'name');

  if (!manager) {
    console.log("Manager not found for client");
    return next(new ErrorResponse('Manager not found', 404));
  }

  console.log("Returning manager data for client");
  res.status(200).json({ success: true, data: manager });
});

exports.removeClientFromManager = asyncHandler(async (req, res, next) => {
  const { managerId, clientId } = req.params;

  // Validate IDs
  if (!mongoose.Types.ObjectId.isValid(managerId) || 
      !mongoose.Types.ObjectId.isValid(clientId)) {
    return next(new ErrorResponse('Invalid ID format', 400));
  }

  const [manager, client] = await Promise.all([
    Manager.findById(managerId),
    Client.findById(clientId)
  ]);

  if (!manager) {
    return next(new ErrorResponse(`Manager not found`, 404));
  }
  if (!client) {
    return next(new ErrorResponse(`Client not found`, 404));
  }

  // Authorization check
  if (req.user.role !== 'admin') {
    if (req.user.role === 'manager') {
      if (String(manager.user) !== String(req.user._id)) {
        return next(new ErrorResponse('Not authorized', 401));
      }
    } else if (req.user.role === 'client') {
      if (String(client.user) !== String(req.user._id)) {
        return next(new ErrorResponse('Not authorized', 401));
      }
    } else {
      return next(new ErrorResponse('Not authorized', 401));
    }
  }

   // Remove client from manager
  manager.managedClients = manager.managedClients.filter(
    id => String(id) !== clientId
  );

  // Remove manager from client if it matches
  if (client.manager && String(client.manager) === managerId) {
    client.manager = undefined;
  }

  // Save both without transaction
  await manager.save();
  await client.save();

  res.status(200).json({ 
    success: true,
    message: 'Manager assignment removed successfully',
    data: {
      managerId: manager._id,
      clientId: client._id
    }
  });
});