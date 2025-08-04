// @desc    Send a request to a client (by manager)
// @route   POST /api/v1/clients/:id/request
// @access  Private/Manager
const User = require('../models/User');

const Client = require('../models/Client');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Manager = require('../models/Manager'); // Add at the top if not already
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


const mongoose = require('mongoose');
// @desc    Get all clients
// @route   GET /api/v1/clients
// @access  Private
exports.getClients = asyncHandler(async (req, res, next) => {
  // Admins and managers can see all clients, others only their own
  let query;
  if (req.user.role === 'admin' || req.user.role === 'manager') {
    query = Client.find().populate('user', 'name email');
  } else {
    query = Client.find({ user: req.user.id });
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
const user = await User.findById(req.user.id);
user.role = 'client';
await user.save();
  // profilePhoto should be a Cloudinary URL if provided
  // (Assume frontend uploads to Cloudinary and sends the URL)

  // If payment info is provided, mask sensitive data for logging
  if (req.body.paymentInfo) {
    console.log("Payment info provided for client creation");
    // NOTE: In production, handle payment data securely
  }

  // Create the client document
  const client = await Client.create(req.body);

  // Update user's role to 'client'
  await User.findByIdAndUpdate(userId, { role: 'client' });

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


  client = await Client.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Payment info is already secure with Stripe - no need to mask
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
// @access  Private/Admin/Manager
exports.getClientsByUser = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'manager' && req.user.role !== 'client' && client.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(`Not authorized to access this route`, 401)
    );
  }

  // Managers can only access their own clients
  if (req.user.role === 'manager' && req.user.id !== req.params.userId) {
    return next(
      new ErrorResponse(`Not authorized to access other users' clients`, 401)
    );
  }

  const clients = await Client.find({ user: req.params.userId });

  res.status(200).json({
    success: true,
    count: clients.length,
    data: clients
  });
});
exports.sendRequest = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'manager') {
    return next(new ErrorResponse('Only managers can send requests', 403));
  }
  const clientId = req.params.id;
  // Find the Manager document for the current user
  const managerDoc = await Manager.findOne({ user: req.user.id });
  if (!managerDoc) {
    return next(new ErrorResponse('Manager profile not found for this user', 404));
  }
  const managerId = managerDoc._id;
  try {
    const client = await Client.sendRequest(clientId, managerId);
    res.status(200).json({ success: true, requests: client.requests });
  } catch (err) {
    return next(new ErrorResponse(err.message, 404));
  }
});

// @desc    Get all requests for a client
// @route   GET /api/v1/clients/:id/requests
// @access  Private/Admin/Manager
exports.getRequests = asyncHandler(async (req, res, next) => {
  // Only admin or manager can view requests
  if (req.user.role !== 'admin' && req.user.role !== 'client' && req.user.role !== 'client') {
    return next(new ErrorResponse('Not authorized to view requests', 403));
  }
  const clientId = req.params.id;
  try {
    const requests = await Client.getRequests(clientId);
    res.status(200).json({ success: true, requests });
  } catch (err) {
    return next(new ErrorResponse(err.message, 404));
  }
});

// @desc    Assign a manager to a client
// @route   PUT /api/v1/clients/assign-manager/:managerId
// @access  Private/Client
exports.assignManagerToClient = asyncHandler(async (req, res, next) => {
  // Only client can assign a manager to themselves
  if (req.user.role !== 'client' ) {
    return next(new ErrorResponse('Not authorized to assign manager', 403));
  }

  const userId = req.user.id;
  const managerId = req.params.managerId;

  if (!managerId) {
    return next(new ErrorResponse('Manager ID is required', 400));
  }

  // Check if manager exists
  const Manager = require('../models/Manager');
  const manager = await Manager.findById(managerId);
  if (!manager) {
    return next(new ErrorResponse('Manager not found', 404));
  }

  // Find the client by user id and update manager
  const client = await Client.findOneAndUpdate(
    { user: userId },
    { manager: managerId },
    { new: true, runValidators: true }
  );
  if (!client) {
    return next(new ErrorResponse('Client not found for this user', 404));
  }
  // Add client to manager's managedClients array if not already pres
  if (!manager.managedClients.includes(client._id)) {
    manager.managedClients.push(client._id);
    await manager.save();
  }
  res.status(200).json({
    success: true,
    data: client
  });
});

// @desc    Create new manager
// @route   POST /api/v1/managers
// @access  Private/Admin

// @desc    Delete a request from a client
// @route   DELETE /api/v1/clients/:clientId/requests/:requestId
// @access  Private/Admin/Manager/User (client owner)
exports.deleteRequest = asyncHandler(async (req, res, next) => {
  const { clientId, requestId } = req.params;
  const client = await Client.findById(clientId);
  if (!client) {
    return next(new ErrorResponse('Client not found', 404));
  }
  // Only admin or the client owner can delete a request
  if (
    req.user.role !== 'admin' ||
    client.user.toString() !== req.user.id || req.user.role !== 'client'
  ) {
    console.log('Current role:', req.user.role);
    return next(new ErrorResponse('Not authorized to delete this request your role', req.user.role, 403));
  }
  try {
    const updatedClient = await Client.deleteRequest(clientId, requestId);
    res.status(200).json({ success: true, requests: updatedClient.requests });
  } catch (err) {
    return next(new ErrorResponse(err.message, 404));
  }
});

// @desc    Add or update billing info for a client
// @route   POST /api/v1/clients/:id/billing
// @access  Private
exports.addOrUpdateBillingInfo = asyncHandler(async (req, res, next) => {
  const clientId = req.params.id;
  const { paymentMethodId, billingInfo } = req.body; // paymentMethodId from Stripe.js, billingInfo is address etc.

  let client = await Client.findById(clientId);
  if (!client) {
    return next(new ErrorResponse('Client not found', 404));
  }

  // Only client owner or admin can update billing info
  if (client.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to update billing info', 403));
  }

  // Create Stripe customer if not exists
  let stripeCustomerId = client.stripeCustomerId;
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      name: client.name,
      email: client.contactPerson?.email,
      address: billingInfo ? {
        line1: billingInfo.address,
        city: billingInfo.city,
        state: billingInfo.state,
        postal_code: billingInfo.zipCode,
        country: billingInfo.country
      } : undefined
    });
    stripeCustomerId = customer.id;
    client.stripeCustomerId = stripeCustomerId;
  } else if (billingInfo) {
    // Update customer address if provided
    await stripe.customers.update(stripeCustomerId, {
      address: {
        line1: billingInfo.address,
        city: billingInfo.city,
        state: billingInfo.state,
        postal_code: billingInfo.zipCode,
        country: billingInfo.country
      }
    });
  }

  // Attach payment method and set as default
  if (paymentMethodId) {
    // Detach previous payment method if exists
    const customer = await stripe.customers.retrieve(stripeCustomerId);
    if (customer.invoice_settings.default_payment_method) {
      await stripe.paymentMethods.detach(customer.invoice_settings.default_payment_method);
    }
    await stripe.paymentMethods.attach(paymentMethodId, { customer: stripeCustomerId });
    await stripe.customers.update(stripeCustomerId, {
      invoice_settings: { default_payment_method: paymentMethodId }
    });
  }

  // Update billingInfo in client doc
  if (billingInfo) {
    client.billingInfo = billingInfo;
  }
  await client.save();

  res.status(200).json({ success: true, message: 'Billing info updated', stripeCustomerId });
});

// @desc    Get billing info for a client
// @route   GET /api/v1/clients/:id/billing
// @access  Private
exports.getBillingInfo = asyncHandler(async (req, res, next) => {
  const clientId = req.params.id;
  const client = await Client.findById(clientId);
  if (!client) {
    return next(new ErrorResponse('Client not found', 404));
  }
  // Only client owner or admin can get billing info
  if (client.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to view billing info', 403));
  }
  if (!client.stripeCustomerId) {
    return res.status(200).json({ success: true, billingInfo: null });
  }
  const customer = await stripe.customers.retrieve(client.stripeCustomerId);
  let paymentMethod = null;
  if (customer.invoice_settings.default_payment_method) {
    paymentMethod = await stripe.paymentMethods.retrieve(customer.invoice_settings.default_payment_method);
  }
  res.status(200).json({
    success: true,
    billingInfo: client.billingInfo,
    stripeCustomerId: client.stripeCustomerId,
    paymentMethod
  });
});

// @desc    Delete billing info for a client
// @route   DELETE /api/v1/clients/:id/billing
// @access  Private
exports.deleteBillingInfo = asyncHandler(async (req, res, next) => {
  const clientId = req.params.id;
  const client = await Client.findById(clientId);
  if (!client) {
    return next(new ErrorResponse('Client not found', 404));
  }
  // Only client owner or admin can delete billing info
  if (client.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to delete billing info', 403));
  }
  if (client.stripeCustomerId) {
    const customer = await stripe.customers.retrieve(client.stripeCustomerId);
    if (customer.invoice_settings.default_payment_method) {
      await stripe.paymentMethods.detach(customer.invoice_settings.default_payment_method);
    }
    // Optionally, delete the Stripe customer (uncomment if desired)
    // await stripe.customers.del(client.stripeCustomerId);
    client.stripeCustomerId = '';
  }
  client.billingInfo = {
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  };
  await client.save();
  res.status(200).json({ success: true, message: 'Billing info deleted' });
});

// @desc    Get the current user's client profile
// @route   GET /api/v1/clients/me
// @access  Private/User
exports.getMyClient = asyncHandler(async (req, res, next) => {
  console.log("getMyClient called for user:", req.user.id);
  
  // Find the client document where user field matches the current user's id
  const client = await Client.findOne({ user: req.user.id }).populate('user', 'name email');
  
  console.log("Client found:", client ? "YES" : "NO");
  if (client) {
    console.log("Client data:", {
      id: client._id,
      name: client.name,
      user: client.user
    });
    
    // @desc    Add payment method using Stripe
    // @route   POST /api/v1/clients/:id/payment-method
    // @access  Private
  }
  
  if (!client) {
    console.log("No client found, returning null");
    // Return success with null if not found (or you can return 404 if preferred)
    return res.status(200).json({ success: true, data: null });
  }
  
  // Payment info is already secure with Stripe - no need to mask
  console.log("Returning client data");
  res.status(200).json({
    success: true,
    data: client
  });
});


exports.addPaymentMethod = asyncHandler(async (req, res, next) => {
  const clientId = req.params.id;
  const { paymentMethodId, cardHolderName } = req.body;

  if (!paymentMethodId) {
    return next(new ErrorResponse('Payment method ID is required', 400));
  }

  // 1. Find the client in the database
  const client = await Client.findById(clientId);
  if (!client) {
    return next(new ErrorResponse('Client not found', 404));
  }

  // 2. Authorization check (owner or admin)
  if (client.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to add payment method', 403));
  }

  try {
    // 3. Retrieve payment method details from Stripe
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    if (!paymentMethod || paymentMethod.type !== 'card' || !paymentMethod.card) {
      return next(new ErrorResponse('Invalid or unsupported payment method', 400));
    }

    // 4. Create Stripe customer if not already assigned
    if (!client.stripeCustomerId) {
      const customer = await stripe.customers.create({
        name: client.name,
        email: client.contactPerson?.email || undefined,
        description: `Customer for client ID ${client._id}`,
      });
      client.stripeCustomerId = customer.id;
    }

    // 5. Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: client.stripeCustomerId,
    });

    // 6. Set as default payment method
    await stripe.customers.update(client.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // 7. Save payment method info to the client document
    client.paymentInfo = {
      stripePaymentMethodId: paymentMethod.id,
      cardLast4: paymentMethod.card.last4,
      cardBrand: paymentMethod.card.brand,
      cardExpMonth: paymentMethod.card.exp_month,
      cardExpYear: paymentMethod.card.exp_year,
      cardHolderName: cardHolderName || '',
      isDefault: true,
    };

    await client.save();

    // 8. Send success response
    res.status(200).json({
      success: true,
      message: 'Payment method added successfully',
      data: client.paymentInfo,
    });

  } catch (error) {
    console.error('Stripe error:', error);
    return next(new ErrorResponse('Failed to add payment method. Please try again.', 500));
  }
});

// @desc    Get clients by IDs
// @route   POST /api/v1/clients/by-ids
// @access  Private

exports.getClientsByIds = asyncHandler(async (req, res, next) => {
  try {
    // Validate input
    if (!req.body.ids || !Array.isArray(req.body.ids)) {
      return res.status(400).json({ 
        success: false,
        error: 'Please provide an array of client IDs' 
      });
    }

    // Filter valid MongoDB IDs
    const validIds = req.body.ids.filter(id => mongoose.Types.ObjectId.isValid(id));
    
    // Find clients and only return _id and name
    const clients = await Client.find(
      { _id: { $in: validIds } },
      '_id name'  // Projection - only return these fields
    );

    res.status(200).json({
      success: true,
      count: clients.length,
      data: clients
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

exports.getClientsByManager = asyncHandler(async (req, res, next) => {
  console.log('Fetching clients for manager ID:', req.user.id); // Log the manager's user ID
  
  const manager = await Manager.findOne({ user: req.user.id })
    .populate('managedClients')
    .lean();

  console.log('Manager document found:', !!manager); // Log if manager exists
  console.log('Number of managed clients:', manager?.managedClients?.length || 0); // Log client count

  if (!manager) {
    return res.status(200).json({ success: true, data: [] });
  }

  res.status(200).json({
    success: true,
    data: manager.managedClients || [] // Ensure we always return an array
  });
});