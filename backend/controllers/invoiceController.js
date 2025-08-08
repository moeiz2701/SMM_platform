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

// @desc    Pay an invoice using client's Stripe payment method
// @route   POST /api/v1/invoices/:id/pay
// @access  Private/Client
exports.payInvoice = asyncHandler(async (req, res, next) => {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  
  // Find the invoice and populate necessary fields
  const invoice = await Invoice.findById(req.params.id)
    .populate({
      path: 'client',
      populate: {
        path: 'user',
        select: 'name email'
      }
    })
    .populate({
      path: 'manager',
      populate: {
        path: 'user',
        select: 'name email'
      }
    })
    .populate('campaign', 'name')
    .populate('budget');

  if (!invoice) {
    return next(new ErrorResponse(`Invoice not found with id: ${req.params.id}`, 404));
  }

  // Verify that the requesting user is the client for this invoice
  const client = await Client.findOne({ user: req.user.id });
  if (!client || invoice.client._id.toString() !== client._id.toString()) {
    return next(new ErrorResponse('Not authorized to pay this invoice', 403));
  }

  // Check if invoice is already paid
  if (invoice.status === 'paid') {
    return next(new ErrorResponse('Invoice has already been paid', 400));
  }

  // Check if client has stripe customer ID and payment method
  if (!client.stripeCustomerId || !client.paymentInfo.stripePaymentMethodId) {
    return next(new ErrorResponse('No payment method found. Please add a payment method first.', 400));
  }

  try {
    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(invoice.amount * 100), // Convert to cents
      currency: 'usd',
      customer: client.stripeCustomerId,
      payment_method: client.paymentInfo.stripePaymentMethodId,
      confirmation_method: 'manual',
      confirm: true,
      return_url: `${process.env.FRONTEND_URL}/client/invoices/${invoice._id}`,
      metadata: {
        invoiceId: invoice._id.toString(),
        clientId: client._id.toString(),
        managerId: invoice.manager._id.toString(),
        campaignId: invoice.campaign._id.toString()
      },
      description: `Payment for invoice ${invoice._id} - ${invoice.campaign.name}`
    });

    // Handle the payment intent status
    if (paymentIntent.status === 'succeeded') {
      // Update invoice status to paid
      invoice.status = 'paid';
      invoice.paymentDate = new Date();
      await invoice.save();

      res.status(200).json({
        success: true,
        message: 'Payment processed successfully',
        data: {
          invoice,
          paymentIntentId: paymentIntent.id,
          paymentStatus: paymentIntent.status
        }
      });
    } else if (paymentIntent.status === 'requires_action' && paymentIntent.next_action.type === 'use_stripe_sdk') {
      // 3D Secure authentication required
      res.status(200).json({
        success: true,
        requiresAction: true,
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        message: 'Additional authentication required'
      });
    } else {
      // Payment failed
      return next(new ErrorResponse('Payment failed', 400));
    }

  } catch (stripeError) {
    console.error('Stripe payment error:', stripeError);
    
    // Handle specific Stripe errors
    if (stripeError.type === 'StripeCardError') {
      return next(new ErrorResponse(`Payment failed: ${stripeError.message}`, 400));
    } else if (stripeError.type === 'StripeInvalidRequestError') {
      return next(new ErrorResponse('Invalid payment request', 400));
    } else {
      return next(new ErrorResponse('Payment processing failed', 500));
    }
  }
});

// @desc    Confirm payment for invoices that require additional authentication
// @route   POST /api/v1/invoices/:id/confirm-payment
// @access  Private/Client
exports.confirmPayment = asyncHandler(async (req, res, next) => {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const { paymentIntentId } = req.body;

  if (!paymentIntentId) {
    return next(new ErrorResponse('Payment Intent ID is required', 400));
  }

  // Find the invoice
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) {
    return next(new ErrorResponse(`Invoice not found with id: ${req.params.id}`, 404));
  }

  // Verify that the requesting user is the client for this invoice
  const client = await Client.findOne({ user: req.user.id });
  if (!client || invoice.client.toString() !== client._id.toString()) {
    return next(new ErrorResponse('Not authorized to confirm payment for this invoice', 403));
  }

  try {
    // Retrieve the payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Update invoice status to paid
      invoice.status = 'paid';
      invoice.paymentDate = new Date();
      await invoice.save();

      // Populate invoice with necessary data for response
      const updatedInvoice = await Invoice.findById(invoice._id)
        .populate('campaign', 'name')
        .populate('budget')
        .populate('manager', 'name email')
        .populate('client', 'name email');

      res.status(200).json({
        success: true,
        message: 'Payment confirmed successfully',
        data: {
          invoice: updatedInvoice,
          paymentIntentId: paymentIntent.id,
          paymentStatus: paymentIntent.status
        }
      });
    } else {
      return next(new ErrorResponse(`Payment confirmation failed. Status: ${paymentIntent.status}`, 400));
    }

  } catch (stripeError) {
    console.error('Stripe confirmation error:', stripeError);
    return next(new ErrorResponse('Payment confirmation failed', 500));
  }
});
