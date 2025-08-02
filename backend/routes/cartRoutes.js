const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authenticateUser } = require('../middleware');

router.route('/')
  .get(authenticateUser, cartController.getCart)
  .post(authenticateUser, cartController.addToCart)
  .delete(authenticateUser, cartController.clearCart);

router.route('/:bookId')
  .delete(authenticateUser, cartController.removeFromCart)
  .put(authenticateUser, cartController.updateQuantity);

router.get('/count', authenticateUser, cartController.getCartCount);

module.exports = router;
