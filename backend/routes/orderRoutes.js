const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateUser, authorizeRole } = require('../middleware');

router.route('/')
  .post(authenticateUser, orderController.createOrder)
  .get(authenticateUser, authorizeRole('admin'), orderController.getAllOrders);

router.route('/myorders').get(authenticateUser, orderController.getMyOrders);

router.route('/:id')
  .get(authenticateUser, orderController.getOrderById);

router.route('/:id/status')
  .put(authenticateUser, authorizeRole('admin'), orderController.updateOrderStatus);

module.exports = router;
