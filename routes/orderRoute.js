const express = require('express');
const { createOrder, verifyPayment, getOrdersByUserId , getAllOrders} = require('../controllers/orderController');
const router = express.Router();

// Route to create a new order
router.post('/create', createOrder);

// Route to verify Razorpay payment signature
router.post('/verify', verifyPayment);

// Route to get all orders for a specific user
router.get('/user/:userId', getOrdersByUserId);

// Route to get all orders
router.get('/',  getAllOrders);

module.exports = router;



