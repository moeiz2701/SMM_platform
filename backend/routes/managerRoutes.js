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
  addClientToManager,
  getMyManager,
  addClientsToManager,
  getMyRequests,
  acceptClientRequest,
  declineClientRequest
  
} = require('../controllers/managerController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/MyManager', protect, getMyManager);

// Get requests for the current manager user
router.get('/me/requests', protect, authorize('manager'), getMyRequests);

// Accept client request and assign client to manager
router.put('/accept-request/:clientId', protect, authorize('manager'), acceptClientRequest);

// Decline client request
router.put('/decline-request/:clientId', protect, authorize('manager'), declineClientRequest);

// Get all managers, create manager
router
  .route('/')
  .get(protect, authorize('admin' , 'manager', 'client'), getManagers)
  .post(protect, authorize('admin', 'manager'), createManager);

  router.get('/clients', protect, authorize('admin', 'manager'), getClientsForManager);


router.get('/user/:userId', protect, authorize('admin', 'manager', 'client'), getManagerByUserId);
// Get, update, delete a manager
router
  .route('/:id')
  .get(protect, authorize('admin', 'manager', 'client'), getManager)
  .put(protect, authorize('admin', 'manager'), updateManager)
  .delete(protect, authorize('admin'), deleteManager);

// Get all clients for a manager

// Add a client to a manager
router.post('/:id/clients', protect, authorize('admin', 'user', 'client'), addClientToManager);

router.put('/:id/add-clients', protect, authorize('admin', 'manager', 'client'), addClientsToManager);
module.exports = router;