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
  getManagerForClient,
  removeClientFromManager,
  getmyManager,
  
} = require('../controllers/managerController');
const { protect, authorize } = require('../middleware/auth');
const reviewRouter = require('../routes/reviewRoutes');

const router = express.Router();
router.use('/:managerId/reviews', reviewRouter);
router.get('/MyManager', protect, getMyManager);
// Get all managers, create manager
router
  .route('/')
  .get(protect, authorize('admin' , 'manager', 'client'), getManagers)
  .post(protect, authorize('admin', 'manager'), createManager);

// routes/managerRoutes.js
router.get(
  '/my-manager',
  protect,
  authorize('client'), // Only clients can access this
  getmyManager
);
router.get('/user/:userId', protect, authorize('admin', 'manager','client'), getManagerByUserId);
// Get, update, delete a manager
router
  .route('/:id')
  .get(protect, authorize('admin', 'manager','client'), getManager)
  .put(protect, authorize('admin', 'manager','client'), updateManager)
  .delete(protect, authorize('admin'), deleteManager);

router.get(
  '/for-client/:clientId',
  protect,
  authorize('admin', 'manager', 'client'),
  getManagerForClient
);

router.delete(
  '/:managerId/clients/:clientId',
  protect,
  authorize('admin', 'manager', 'client'),
  removeClientFromManager
);
// Get all clients for a manager
router.get('/:id/clients', protect, authorize('admin', 'manager','client'), getClientsForManager);
// Add a client to a manager
router.post('/:id/clients', protect, authorize('admin', 'user','client'), addClientToManager);

router.put('/:id/add-clients', protect, authorize('admin', 'manager'), addClientsToManager);
module.exports = router;