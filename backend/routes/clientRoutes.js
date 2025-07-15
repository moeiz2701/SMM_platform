const express = require('express');
const {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  getClientsByUser
} = require('../controllers/clientController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(protect, getClients)
  .post(protect, createClient);

router
  .route('/:id')
  .get(protect, getClient)
  .put(protect, updateClient)
  .delete(protect, deleteClient);

router
  .route('/user/:userId')
  .get(protect, authorize('admin'), getClientsByUser);

module.exports = router;