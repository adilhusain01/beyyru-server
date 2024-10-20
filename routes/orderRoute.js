const express = require('express');
const {
  createOrder,
  verifyPayment,
  deleteOrder,
  getOrdersByUserId,
  getAllOrders,
  testShiprocketIntegration,
  trackShipment,
} = require('../controllers/orderController');
const router = express.Router();

// Route to create a new order
router.post('/create', createOrder);

// Route to verify Razorpay payment signature
router.post('/verify', verifyPayment);

// Route to delete an order
router.delete('/:orderId', deleteOrder);

// Route to get all orders for a specific user
router.get('/user/:userId', getOrdersByUserId);

// Route to get all orders
router.get('/', getAllOrders);

// Add this new route
router.post('/test-shiprocket', testShiprocketIntegration);

router.post('/track-shipment/:orderId', trackShipment);

module.exports = router;
