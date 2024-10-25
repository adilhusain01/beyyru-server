const crypto = require('crypto');
const Order = require('../models/orderModel'); // Your order model
const dotenv = require('dotenv');
dotenv.config();

const key_secret = process.env.RAZOR_KEY_SECRET;

// Controller to verify payment
const verifyPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId,
    user,
  } = req.body;

  // console.log(user, orderId, "Payment Verification");

  // Create a hash using your Razorpay secret
  const generatedSignature = crypto
    .createHmac('sha256', key_secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (generatedSignature === razorpay_signature) {
    // Payment successful, update the order status and save payment details
    const updatedOrder = await Order.findOneAndUpdate(
      { orderId: razorpay_order_id },
      {
        status: 'success',
        paymentTime: new Date(),
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
      },
      { new: true } // Return the updated document
    );

    // console.log(updatedOrder, "Updated Order Details");

    res.json({
      status: 'success',
      orderId: razorpay_order_id,
      order: updatedOrder,
    });
  } else {
    // Payment failed
    await Order.findOneAndUpdate(
      { orderId: razorpay_order_id },
      { status: 'failed', paymentTime: new Date() }
    );

    res.json({ status: 'failed', orderId: razorpay_order_id });
  }
};

module.exports = { verifyPayment };
