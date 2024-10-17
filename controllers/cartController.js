const Purchase = require('../models/purchaseHistoryModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');

const checkout = async (req, res) => {
  const { userId } = req.body;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Calculate total amount
    const totalAmount = cart.items.reduce(async (total, item) => {
      // Assuming you have a function to get the product price
      const product = await Product.findById(item.productId);
      return total + product.currentPrice * item.quantity;
    }, 0);

    // Create a new purchase record
    const purchase = new Purchase({ userId, items: cart.items, totalAmount });
    await purchase.save();

    // Clear the cart after successful purchase
    await Cart.deleteOne({ userId });

    res.status(201).json(purchase);
  } catch (error) {
    res.status(500).json({ message: 'Error during checkout', error });
  }
};

const viewPurchaseHistory = async (req, res) => {
  const { userId } = req.params;

  try {
    const purchases = await Purchase.find({ userId }).populate(
      'items.productId'
    );
    res.status(200).json(purchases);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching purchase history', error });
  }
};

const addItemToCart = async (req, res) => {
  const { userId, productId, quantity } = req.body;

  try {
    let cart = await Cart.findOne({ userId });

    if (cart) {
      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );

      if (itemIndex > -1) {
        // Item exists, update quantity
        cart.items[itemIndex].quantity += quantity;
      } else {
        // Item does not exist, add it
        cart.items.push({ productId, quantity });
      }
    } else {
      // Create new cart
      cart = new Cart({ userId, items: [{ productId, quantity }] });
    }

    await cart.save();
    // res.status(200).json(cart);
    res
      .status(200)
      .json({ message: 'Item added/updated to cart successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding item to cart', error });
  }
};

const viewCart = async (req, res) => {
  const { userId } = req.params;

  try {
    const cart = await Cart.findOne({ userId }).populate('items.productId');
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const updatedItems = await Promise.all(
      cart.items.map(async (item) => {
        const product = await Product.findById(item.productId._id);
        if (product) {
          item.productId.quantity = product.quantity;
        }
        return item;
      })
    );

    console.log(updatedItems);

    cart.items = updatedItems;

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cart', error });
  }
};

const removeItemFromCart = async (req, res) => {
  const { userId, productId } = req.body;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );
    await cart.save();
    res.status(200).json({ message: 'Item removed from cart successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing item from cart', error });
  }
};

module.exports = {
  addItemToCart,
  viewCart,
  removeItemFromCart,
  checkout,
  viewPurchaseHistory,
};
