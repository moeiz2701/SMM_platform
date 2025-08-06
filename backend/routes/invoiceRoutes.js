const express = require('express');
const router = express.Router();
const {
  getAllInvoices,
  getInvoicesByManager,
  getInvoicesByClient,
  getInvoiceById,
  payInvoice,
  confirmPayment
} = require('../controllers/invoiceController');

const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin'), getAllInvoices);
router.get('/invoiceDetails/:id', protect, authorize('client', 'manager'), getInvoiceById);
router.get('/manager', protect, authorize('manager'), getInvoicesByManager);
router.get('/client', protect, authorize('client'), getInvoicesByClient);
router.post('/:id/pay', protect, authorize('client'), payInvoice);
router.post('/:id/confirm-payment', protect, authorize('client'), confirmPayment);


module.exports = router;
