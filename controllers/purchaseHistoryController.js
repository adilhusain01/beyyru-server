const Purchase = require('../models/purchaseHistoryModel');

const addPurchase = async (req, res) => {
  const { userId, items, totalAmount } = req.body;

  try {
    const purchase = new Purchase({ userId, items, totalAmount });
    await purchase.save();
    res.status(201).json(purchase);
  } catch (error) {
    res.status(500).json({ message: 'Error adding purchase', error });
  }
};

const getPurchaseHistory = async (req, res) => {
  const { userId } = req.params;

  try {
    const purchases = await Purchase.find({ userId });
    res.status(200).json(purchases);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching purchase history', error });
  }
};

module.exports = { addPurchase, getPurchaseHistory };
