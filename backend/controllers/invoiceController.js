const Invoice = require('../models/Invoice');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const Client = require('../models/Client')
const Manager = require('../models/Manager')

// @desc    Get all invoices (admin only)
// @route   GET /api/v1/invoices
// @access  Private/Admin
exports.getAllInvoices = asyncHandler(async (req, res, next) => {
  const invoices = await Invoice.find()
    .populate('campaign')
    .populate('budget')
    .populate('manager', 'name email')
    .populate('client', 'name email');

  res.status(200).json({
    success: true,
    count: invoices.length,
    data: invoices,
  });
});

// @desc    Get invoices for a specific manager
// @route   GET /api/v1/invoices/manager
// @access  Private/Manager
exports.getInvoicesByManager = asyncHandler(async (req, res, next) => {
  const manager = await Manager.findOne({ user: req.user.id });
    if (!manager) {
    return res.status(404).json({ success: false, message: 'Manager not found' });
    }
    const managerId = manager._id;

  const invoices = await Invoice.find({ manager: managerId })
    .populate('campaign')
    .populate('budget')
    .populate('client', 'name email');

  res.status(200).json({
    success: true,
    count: invoices.length,
    data: invoices,
  });
});


exports.getInvoiceById = asyncHandler(async (req, res, next) => {
  const invoice = await Invoice.findById(req.params.id)
    .populate('campaign')
    .populate('budget')
    .populate({
      path: 'manager',
      populate: {
        path: 'user',
        select: 'name email'
      }
    })
    .populate({
      path: 'client',
      populate: {
        path: 'user',
        select: 'name email'
      }
    });

  if (!invoice) {
    return next(
      new ErrorResponse(`Invoice not found with id: ${req.params.id}`, 404)
    );
  }

  const userId = req.user.id;
  const isManager = invoice.manager?.user?._id?.toString() === userId;
  const isClient = invoice.client?.user?._id?.toString() === userId;

  if (!isManager && !isClient) {
    return next(
      new ErrorResponse('Not authorized to view this invoice', 403)
    );
  }

  res.status(200).json({
    success: true,
    data: invoice,
  });
});



// @desc    Get invoices for a specific client
// @route   GET /api/v1/invoices/client
// @access  Private/Client
exports.getInvoicesByClient = asyncHandler(async (req, res, next) => {
    const client = await Client.findOne({ user: req.user.id });
    if (!client) {
    return res.status(404).json({ success: false, message: 'Client not found' });
    }
    const clientId = client._id;

  const invoices = await Invoice.find({ client: clientId })
    .populate('campaign')
    .populate('budget')
    .populate('manager', 'name email');

  res.status(200).json({
    success: true,
    count: invoices.length,
    data: invoices,
  });
});
