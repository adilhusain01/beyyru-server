const express = require('express');
const {
  createOrder,
  verifyPayment,
  deleteOrder,
  getOrdersByUserId,
  getAllOrders,
  testShiprocketIntegration,
  trackShipment,
  getOrderTotals,
} = require('../controllers/orderController');
const router = express.Router();

// Route to create a new order
router.get('/', getAllOrders);
router.post('/create', createOrder);

// Route to verify Razorpay payment signature
router.post('/verify', verifyPayment);
router.get('/user/:userId', getOrdersByUserId);
router.post('/test-shiprocket', testShiprocketIntegration);
router.post('/track-shipment/:orderId', trackShipment);
router.get('/totals', getOrderTotals);

// Route to delete an order
router.delete('/:orderId', deleteOrder);

module.exports = router;
