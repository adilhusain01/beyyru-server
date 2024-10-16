const Razorpay = require('razorpay');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const Discount = require('../models/discountModel');
const Cart = require('../models/cartModel');
const crypto = require('crypto');
const dotenv = require('dotenv');
dotenv.config();

// Initialize Razorpay with keys
const razorpay = new Razorpay({
  key_id: process.env.RAZOR_KEY_ID,
  key_secret: process.env.RAZOR_KEY_SECRET,
});

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const {
      userId,
      products,
      shippingAddress,
      paymentMethod,
      shipping,
      discountAmount,
      finalAmount,
    } = req.body;

    let productDetails = [];

    for (let item of products) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      productDetails.push({
        productId: product?._id,
        name: product?.name,
        images: product?.images,
        currentPrice: product?.currentPrice,
        quantity: item?.quantity,
        totalPrice: product?.currentPrice * item?.quantity,
      });

      product.quantity -= item.quantity;
      product.soldQuantity += item.quantity;
      await product.save();
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: finalAmount * 100, // Amount in paise (1 INR = 100 paise)
      currency: 'INR',
      receipt: crypto.randomBytes(10).toString('hex'), // Unique receipt ID
    });

    const newOrder = new Order({
      orderId: razorpayOrder.id,
      userId,
      products: productDetails,
      shippingAddress,
      paymentMethod,
      paymentAmount: finalAmount + discountAmount,
      discountAmount,
      finalAmount,
      orderStatus: 'Pending',
      shippingCost: shipping,
    });

    await newOrder.save();

    // Remove items from the user's cart
    await Cart.findOneAndUpdate({ userId }, { $set: { items: [] } });

    res.status(201).json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      orderId: newOrder._id,
      finalAmount,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error creating order' });
  }
};

// Handle Razorpay payment verification (webhook or callback)
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      discountCode,
      userId,
    } = req.body;
    console.log('i am being executed....');

    console.log(req.body);

    // Validate signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZOR_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Update order status to 'Confirmed'
    const order = await Order.findOneAndUpdate(
      { orderId: razorpay_order_id },
      {
        paymentStatus: 'Completed',
        orderStatus: 'Confirmed',
        transactionId: razorpay_payment_id,
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    console.log(discountCode, userId);

    // Update discount usage
    const discount = await Discount.findOne({ discountCode });

    // console.log(discount);

    if (discount) {
      const userUsageIndex = discount.userUsage.findIndex(
        (usage) => usage.userId.toString() === userId
      );

      if (userUsageIndex !== -1) {
        discount.userUsage[userUsageIndex].usageCount += 1;
      } else {
        discount.userUsage.push({ userId, usageCount: 1 });
      }

      await discount.save();
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error verifying payment' });
  }
};

// Get orders by user ID
exports.getOrdersByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    if (!orders) {
      return res.status(404).json({ message: 'No orders found for this user' });
    }

    res.status(200).json({ orders });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
};

// const Razorpay = require('razorpay');
// const Order = require('../models/orderModel'); // Your database model for orders
// const dotenv = require('dotenv');
// dotenv.config();

// // Initialize Razorpay with keys
// const razorpay = new Razorpay({
//   key_id: process.env.RAZOR_KEY_ID,
//   key_secret: process.env.RAZOR_KEY_SECRET
// });

// // Controller to create an order
// const createOrder = async (req, res) => {
//   //const { amount} = req.body; // Receive user details from the request
//   const {user, amount} = req.body.amount
//   // console.log(amount, user, "Order Details");
//   console.log(user, 'user')
//   try {
//     const options = {
//       amount: amount, // Amount in paisa
//       currency: 'INR',
//       receipt: 'receipt#1',
//     };
//     const razorpayOrder = await razorpay.orders.create(options);

//     console.log(razorpayOrder, "jekekke")
//     // Save order details in DB with user information
//     const newOrder = new Order({
//       orderId: razorpayOrder.id,
//       amount,
//       status: 'pending',
//       orderTime: new Date(),
//       userId: user.userId, // Assuming userId is included in user
//       user: { // Save user details
//         name: user.name,
//         contact: user.contact,
//         address: {
//           addressLine1: user.address.addressLine1,
//           addressLine2: user.address.addressLine2,
//           city: user.address.city,
//           state: user.address.state,
//           postalCode: user.address.postalCode,
//           country: user.address.country,
//         }
//       }
//     });
//     await newOrder.save();

//     // Return the Razorpay order details
//     res.json({
//       orderId: razorpayOrder.id,
//       amount: razorpayOrder.amount,
//       currency: razorpayOrder.currency,
//     });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to create order' });
//   }
// };

// const getOrdersByUserId = async (req, res) => {
//   const { userId } = req.params; // Get userId from route parameters
//   try {
//     // Find all orders belonging to the specified user ID
//     const orders = await Order.find({ userId }); // Query by userId

//     // Check if any orders were found
//     if (!orders.length) {
//       return res.status(404).json({ message: 'No orders found for this user.' });
//     }

//     // Return the orders
//     res.json(orders);
//   } catch (error) {
//     console.error(error); // Log the error for debugging
//     res.status(500).json({ error: 'Failed to fetch orders' });
//   }
// };

// module.exports = { createOrder, getOrdersByUserId };
