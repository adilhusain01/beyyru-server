const Razorpay = require('razorpay');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const Discount = require('../models/discountModel');
const Cart = require('../models/cartModel');
const crypto = require('crypto');
const dotenv = require('dotenv');
const shiprocketService = require('../services/shiprocketService');
dotenv.config();

// Initialize Razorpay with keys
const razorpay = new Razorpay({
  key_id: process.env.RAZOR_KEY_ID,
  key_secret: process.env.RAZOR_KEY_SECRET,
});

// Create a new order
// exports.createOrder = async (req, res) => {
//   try {
//     const {
//       userId,
//       products,
//       shippingAddress,
//       paymentMethod,
//       shipping,
//       discountAmount,
//       finalAmount,
//     } = req.body;

//     console.log(products);

//     let productDetails = [];

//     for (let item of products) {
//       const product = await Product.findById(item.productId);
//       if (!product) {
//         return res.status(404).json({ message: 'Product not found' });
//       }

//       productDetails.push({
//         productId: product?._id,
//         name: product?.name,
//         images: product?.images,
//         currentPrice: product?.currentPrice,
//         quantity: item?.quantity,
//         totalPrice: product?.currentPrice * item?.quantity,
//       });

//       product.quantity -= item.quantity;
//       product.soldQuantity += item.quantity;
//       await product.save();
//     }

//     const razorpayOrder = await razorpay.orders.create({
//       amount: finalAmount * 100, // Amount in paise (1 INR = 100 paise)
//       currency: 'INR',
//       receipt: crypto.randomBytes(10).toString('hex'), // Unique receipt ID
//     });

//     const newOrder = new Order({
//       orderId: razorpayOrder.id,
//       userId,
//       products: productDetails,
//       shippingAddress,
//       paymentMethod,
//       paymentAmount: finalAmount + discountAmount,
//       discountAmount,
//       finalAmount,
//       orderStatus: 'Pending',
//       shippingCost: shipping,
//     });

//     await newOrder.save();

//     res.status(201).json({
//       success: true,
//       razorpayOrderId: razorpayOrder.id,
//       orderId: newOrder._id,
//       finalAmount,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: 'Error creating order' });
//   }
// };

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

    // Validate shippingAddress fields
    if (
      !shippingAddress ||
      !shippingAddress.zipCode ||
      shippingAddress.zipCode.length !== 6
    ) {
      return res
        .status(400)
        .json({ message: 'Invalid shipping address or zip code' });
    }

    let productDetails = [];

    for (let item of products) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      productDetails.push({
        productId: product._id,
        name: product.name,
        images: product.images,
        currentPrice: product.currentPrice,
        quantity: item.quantity,
        totalPrice: product.currentPrice * item.quantity,
      });
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
      street: shippingAddress.street,
    });

    // Create Shiprocket order
    const shiprocketOrder = await createShiprocketOrder(newOrder);

    // Update order with Shiprocket details
    newOrder.shiprocketOrderId = shiprocketOrder.order_id;
    newOrder.shiprocketShipmentId = shiprocketOrder.shipment_id;
    await newOrder.save();

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

// Add a new function to create Shiprocket order

// Handle Razorpay payment verification (webhook or callback)
// exports.verifyPayment = async (req, res) => {
//   try {
//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//       discountCode,
//       userId,
//       products,
//     } = req.body;
//     // console.log('i am being executed....');

//     // console.log(req.body);

//     // Validate signature
//     const generatedSignature = crypto
//       .createHmac('sha256', process.env.RAZOR_KEY_SECRET)
//       .update(razorpay_order_id + '|' + razorpay_payment_id)
//       .digest('hex');

//     if (generatedSignature !== razorpay_signature) {
//       return res.status(400).json({ message: 'Invalid payment signature' });
//     }

//     // Update order status to 'Confirmed'
//     const order = await Order.findOneAndUpdate(
//       { orderId: razorpay_order_id },
//       {
//         paymentStatus: 'Completed',
//         orderStatus: 'Confirmed',
//         transactionId: razorpay_payment_id,
//       },
//       { new: true }
//     );

//     if (!order) {
//       return res.status(404).json({ message: 'Order not found' });
//     }

//     console.log(discountCode, userId);

//     // Update discount usage
//     const discount = await Discount.findOne({ discountCode });

//     if (discount) {
//       const userUsageIndex = discount.userUsage.findIndex(
//         (usage) => usage.userId.toString() === userId
//       );

//       if (userUsageIndex !== -1) {
//         discount.userUsage[userUsageIndex].usageCount += 1;
//       } else {
//         discount.userUsage.push({ userId, usageCount: 1 });
//       }

//       await discount.save();
//     }

//     // Remove items from the user's cart
//     await Cart.findOneAndUpdate({ userId }, { $set: { items: [] } });

//     res.status(200).json({
//       success: true,
//       order,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: 'Error verifying payment' });
//   }
// };

exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      discountCode,
      userId,
      products,
    } = req.body;

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

    // Update discount usage
    const discount = await Discount.findOne({ discountCode });

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

    // Update product quantities
    for (let item of products) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.quantity -= item.quantity;
        product.soldQuantity += item.quantity;
        await product.save();
      }
    }

    // Remove items from the user's cart
    await Cart.findOneAndUpdate({ userId }, { $set: { items: [] } });

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error verifying payment' });
  }
};

// Delete an order
exports.deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findByIdAndDelete(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error deleting order' });
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
    console.error(error);
    res.status(500).json({ message: 'Error fetching user orders' });
  }
};

// Get all orders with pagination
exports.getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalOrders = await Order.countDocuments();
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'No orders found' });
    }

    res.status(200).json({
      orders,
      currentPage: page,
      totalPages: Math.ceil(totalOrders / limit),
      totalOrders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
};

// Add a new function to track Shiprocket shipment
exports.trackShipment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const trackingData = await shiprocketService.trackShipment(
      order.shiprocketShipmentId
    );

    res.status(200).json({ trackingData });
  } catch (error) {
    console.error('Error tracking shipment:', error);
    res.status(500).json({ message: 'Error tracking shipment' });
  }
};

exports.testShiprocketIntegration = async (req, res) => {
  try {
    // Test login
    console.log('Attempting Shiprocket login...');
    const loginResponse = await shiprocketService.login();
    console.log('Shiprocket login successful. Token:', loginResponse.token);

    // Test create order
    const testOrderData = {
      order_id: 'test-order-' + Date.now(),
      order_date: new Date().toISOString().split('T')[0],
      pickup_location: 'Primary',
      channel_id: '',
      comment: 'Test Order',
      billing_customer_name: 'Test Customer',
      billing_last_name: '',
      billing_address: '123 Test St',
      billing_address_2: '',
      billing_city: 'Test City',
      billing_pincode: '123456',
      billing_state: 'Test State',
      billing_country: 'India',
      billing_email: 'test@example.com',
      billing_phone: '1234567890',
      shipping_is_billing: true,
      order_items: [
        {
          name: 'Test Product',
          sku: 'TEST-SKU-001',
          units: 1,
          selling_price: '100',
        },
      ],
      payment_method: 'Prepaid',
      sub_total: 100,
      length: 10,
      breadth: 10,
      height: 10,
      weight: 1,
    };

    console.log('Attempting to create Shiprocket order...');
    const createdOrder = await shiprocketService.createOrder(testOrderData);
    console.log('Shiprocket order created:', createdOrder);

    // Test track shipment
    if (createdOrder.shipment_id) {
      console.log('Attempting to track shipment...');
      const trackingData = await shiprocketService.trackShipment(
        createdOrder.shipment_id
      );
      console.log('Shipment tracking data:', trackingData);
    }

    res.status(200).json({
      message: 'Shiprocket integration test successful',
      createdOrder,
    });
  } catch (error) {
    console.error('Shiprocket integration test failed:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
      console.error('Error headers:', error.response.headers);
    } else if (error.request) {
      console.error('Error request:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    res.status(500).json({
      message: 'Shiprocket integration test failed',
      error: error.message,
      details: error.response ? error.response.data : null,
    });
  }
};

// Ensure createShiprocketOrder function is defined correctly
async function createShiprocketOrder(order) {
  console.log(order, 'order');
  try {
    const shiprocketOrderData = {
      order_id: order._id.toString(),
      order_date: order.createdAt.toISOString().split('T')[0],
      pickup_location: 'Primary',
      channel_id: '',
      comment: 'Order created via API',
      billing_customer_name: order.shippingAddress.name,
      billing_last_name: '',
      billing_address: order.shippingAddress.street, // Ensure 'street' is used for 'billing_address'
      billing_address_2: '', // Optional, can be left empty
      billing_city: order.shippingAddress.city,
      billing_pincode: order.shippingAddress.zipCode,
      billing_state: order.shippingAddress.state,
      billing_country: order.shippingAddress.country,
      billing_email: order.shippingAddress.email,
      billing_phone: order.shippingAddress.phoneNumber,
      shipping_is_billing: true,
      order_items: order.products.map((product) => ({
        name: product.name,
        sku: product.productId.toString(),
        units: product.quantity,
        selling_price: product.currentPrice,
      })),
      payment_method: order.paymentMethod,
      sub_total: order.finalAmount,
      length: 10,
      breadth: 10,
      height: 10,
      weight: 1,
    };

    return await shiprocketService.createOrder(shiprocketOrderData);
  } catch (error) {
    console.error('Error creating Shiprocket order:', error);
    throw error;
  }
}
