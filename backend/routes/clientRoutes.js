const express = require('express');
const {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  getClientsByUser,
  sendRequest,
  getRequests,
  assignManagerToClient,
  deleteRequest,
  getClientsByIds
} = require('../controllers/clientController');
// Send a request to a client (manager only)


const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(protect, getClients)
  .post(protect, createClient);


router.post('/:id/request', protect, authorize('manager'), sendRequest);

// Get all requests for a client (admin/manager)
router.get('/:id/requests', protect, authorize('admin', 'user'), getRequests);

router
  .route('/user/:userId')
  .get(protect, authorize('admin', 'manager'), getClientsByUser);

router
  .route('/:id')
  .get(protect, getClient)
  .put(protect, updateClient)
  .delete(protect, deleteClient);

// Assign manager to client (client only)
router.put('/assign-manager/:managerId', protect, authorize('user'), assignManagerToClient);

// Delete a request from a client (admin or client owner only)
router.delete('/:clientId/requests/:requestId', protect, authorize('admin', 'user'), deleteRequest);
router.post('/by-ids', getClientsByIds);
module.exports = router;