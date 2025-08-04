const express = require('express');
const router = express.Router();
const {
  getAllInvoices,
  getInvoicesByManager,
  getInvoicesByClient,
  getInvoiceById
} = require('../controllers/invoiceController');

const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin'), getAllInvoices);
router.get('/invoiceDetails/:id', protect, authorize('client', 'manager'), getInvoiceById);
router.get('/manager', protect, authorize('manager'), getInvoicesByManager);
router.get('/client', protect, authorize('client'), getInvoicesByClient);


module.exports = router;
