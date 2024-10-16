const express = require('express');
const { createOrder, verifyPayment, getOrdersByUserId } = require('../controllers/orderController');
const router = express.Router();

// Route to create a new order
router.post('/create', createOrder);

// Route to verify Razorpay payment signature
router.post('/verify', verifyPayment);

// Route to get all orders for a specific user
router.get('/user/:userId', getOrdersByUserId);

module.exports = router;


// const express = require('express');
// const router = express.Router();
// const { createOrder, getOrdersByUserId } = require('../controllers/orderController'); 

// // Route for creating an order
// router.post('/createOrder', createOrder);

// // Route for fetching orders by user ID
// router.get('/:userId', getOrdersByUserId);

// module.exports = router;
