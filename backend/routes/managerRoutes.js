const { getManagerByUserId } = require('../controllers/managerController');
// Get manager by user id
const express = require('express');
const {
  getManagers,
  getManager,
  createManager,
  updateManager,
  deleteManager,
  getClientsForManager,
  addClientsToManager
  
} = require('../controllers/managerController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all managers, create manager
router
  .route('/')
  .get(protect, authorize('admin' , 'manager'), getManagers)
  .post(protect, authorize('admin', 'manager'), createManager);


router.get('/user/:userId', protect, authorize('admin', 'manager'), getManagerByUserId);
// Get, update, delete a manager
router
  .route('/:id')
  .get(protect, authorize('admin', 'manager'), getManager)
  .put(protect, authorize('admin', 'manager'), updateManager)
  .delete(protect, authorize('admin'), deleteManager);

// Get all clients for a manager
router.get('/:id/clients', protect, authorize('admin', 'manager'), getClientsForManager);
router.put('/:id/add-clients', protect, authorize('admin', 'manager'), addClientsToManager);
module.exports = router;