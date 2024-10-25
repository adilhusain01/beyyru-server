const express = require('express');
const {
  addItemToCart,
  viewCart,
  removeItemFromCart,
  checkout,
  viewPurchaseHistory,
} = require('../controllers/cartController');

const router = express.Router();

// Cart routes
router.post('/add', addItemToCart);
router.get('/view/:userId', viewCart);
router.post('/remove', removeItemFromCart);

// Purchase routes
router.post('/checkout', checkout);
router.get('/purchase-history/:userId', viewPurchaseHistory);

module.exports = router;
