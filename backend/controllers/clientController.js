const Client = require('../models/Client');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all clients
// @route   GET /api/v1/clients
// @access  Private
exports.getClients = asyncHandler(async (req, res, next) => {
  // Filter by user if not admin
  let query;
  if (req.user.role !== 'admin') {
    query = Client.find({ user: req.user.id });
  } else {
    query = Client.find().populate('user', 'name email');
  }

  // Filtering
  if (req.query.status) {
    query = query.where('status').equals(req.query.status);
  }

  if (req.query.industry) {
    query = query.where('industry').equals(req.query.industry);
  }

  if (req.query.tags) {
    query = query.where('tags').in([req.query.tags]);
  }

  // Sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  const clients = await query;

  res.status(200).json({
    success: true,
    count: clients.length,
    data: clients
  });
});

// @desc    Get single client
// @route   GET /api/v1/clients/:id
// @access  Private
exports.getClient = asyncHandler(async (req, res, next) => {
  const client = await Client.findById(req.params.id).populate('user', 'name email');

  if (!client) {
    return next(
      new ErrorResponse(`Client not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user owns the client or is admin
  if (client.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`Not authorized to access this client`, 401)
    );
  }

  res.status(200).json({
    success: true,
    data: client
  });
});

// @desc    Create new client
// @route   POST /api/v1/clients
// @access  Private
exports.createClient = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;

  // profilePhoto should be a Cloudinary URL if provided
  // (Assume frontend uploads to Cloudinary and sends the URL)

  const client = await Client.create(req.body);

  res.status(201).json({
    success: true,
    data: client
  });
});

// @desc    Update client
// @route   PUT /api/v1/clients/:id
// @access  Private
exports.updateClient = asyncHandler(async (req, res, next) => {
  let client = await Client.findById(req.params.id);

  if (!client) {
    return next(
      new ErrorResponse(`Client not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user owns the client or is admin
  if (client.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`Not authorized to update this client`, 401)
    );
  }

  // profilePhoto should be a Cloudinary URL if provided
  // (Assume frontend uploads to Cloudinary and sends the URL)

  client = await Client.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: client
  });
});

// @desc    Delete client
// @route   DELETE /api/v1/clients/:id
// @access  Private
exports.deleteClient = asyncHandler(async (req, res, next) => {
  const client = await Client.findById(req.params.id);

  if (!client) {
    return next(
      new ErrorResponse(`Client not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user owns the client or is admin
  if (client.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`Not authorized to delete this client`, 401)
    );
  }

  await client.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get clients by user
// @route   GET /api/v1/clients/user/:userId
// @access  Private/Admin
exports.getClientsByUser = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`Not authorized to access this route`, 401)
    );
  }

  const clients = await Client.find({ user: req.params.userId });

  res.status(200).json({
    success: true,
    count: clients.length,
    data: clients
  });
});