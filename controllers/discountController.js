const Discount = require('../models/discountModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');

const getAllDiscounts = async (req, res) => {
  try {
    const discounts = await Discount.find().populate(
      'selectedProducts selectedProducts getProducts userUsage.userId'
    );

    const discountsWithUsage = discounts.map((discount) => {
      const used = discount.userUsage.reduce(
        (sum, usage) => sum + usage.usageCount,
        0
      );
      return { ...discount.toObject(), used };
    });

    res.status(200).json(discountsWithUsage);
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error);
  }
};

const getDiscountByCode = async (req, res) => {
  const { code } = req.params;
  try {
    const discount = await Discount.findOne({
      discountCode: code.toUpperCase(),
    }).populate('selectedProducts spendProducts getProducts userUsage.userId');
    if (!discount) {
      return res.status(404).json({ message: 'Discount not found' });
    }

    const used = discount.userUsage.reduce(
      (sum, usage) => sum + usage.usageCount,
      0
    );
    const discountWithUsage = { ...discount.toObject(), used };

    res.status(200).json(discountWithUsage);
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error);
  }
};

const createDiscount = async (req, res) => {
  const discountData = req.body;

  console.log(discountData);

  try {
    const newDiscount = new Discount(discountData);
    await newDiscount.save();
    res.status(201).json(newDiscount);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

const updateDiscount = async (req, res) => {
  const { id } = req.params;
  const discountData = req.body;
  try {
    const updatedDiscount = await Discount.findByIdAndUpdate(id, discountData, {
      new: true,
    });
    if (!updatedDiscount) {
      return res.status(404).json({ message: 'Discount not found' });
    }
    res.status(200).json(updatedDiscount);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

const deleteDiscount = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedDiscount = await Discount.findByIdAndDelete(id);
    if (!deletedDiscount) {
      return res.status(404).json({ message: 'Discount not found' });
    }
    res.status(200).json({ message: 'Discount deleted successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const verifyUserEligibility = async (req, res) => {
  const { discountCode, userId } = req.body;
  try {
    const discount = await Discount.findOne({
      discountCode: discountCode.toUpperCase(),
    });
    if (!discount) {
      return res.status(404).json({ message: 'Discount not found' });
    }
    const userUsage = discount.userUsage.find(
      (usage) => usage.userId.toString() === userId
    );
    if (userUsage && userUsage.usageCount >= discount.maxDiscountUseType) {
      return res.status(400).json({
        message: 'User has exceeded the usage limit for this discount',
      });
    }
    res.status(200).json({ message: 'User is eligible for the discount' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const verifyProductEligibility = async (req, res) => {
  const { discountCode, productId } = req.body;
  try {
    const discount = await Discount.findOne({
      discountCode: discountCode.toUpperCase(),
    });
    if (!discount) {
      return res.status(404).json({ message: 'Discount not found' });
    }
    const isEligible =
      discount.selectedProducts.includes(productId) ||
      discount.spendProducts.includes(productId) ||
      discount.getProducts.includes(productId);
    if (!isEligible) {
      return res
        .status(400)
        .json({ message: 'Product is not eligible for the discount' });
    }
    res.status(200).json({ message: 'Product is eligible for the discount' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const calculateDiscount = async (req, res) => {
  const { discountCode, cartItems, userId } = req.body;

  try {
    const discount = await Discount.findOne({
      discountCode: discountCode.toUpperCase(),
    }).populate('selectedProducts spendProducts getProducts userUsage.userId');

    if (!discount) {
      return res.status(404).json({ message: 'Discount not found' });
    }

    let discountAmount = 0;
    let freeShipping = false;

    switch (discount.type) {
      case 'AmountOffOrderDiscount':
        discountAmount = discount.discountValue;
        break;

      case 'AmountOffProductDiscount':
        cartItems.forEach((item) => {
          if (discount.selectedProducts.includes(item.productId)) {
            discountAmount += discount.discountValue * item.quantity;
          }
        });
        break;

      case 'BuyXGetYDiscount':
        const spendProducts = cartItems.filter((item) =>
          discount.spendProducts.includes(item.productId)
        );
        const getProducts = cartItems.filter((item) =>
          discount.getProducts.includes(item.productId)
        );

        const totalSpendQuantity = spendProducts.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        const totalGetQuantity = getProducts.reduce(
          (sum, item) => sum + item.quantity,
          0
        );

        if (totalSpendQuantity >= discount.minPurchaseValue) {
          const eligibleGetQuantity =
            Math.floor(totalSpendQuantity / discount.minPurchaseValue) *
            discount.getQuantity;
          const discountableQuantity = Math.min(
            eligibleGetQuantity,
            totalGetQuantity
          );

          if (discount.discountType === 'Percentage') {
            discountAmount = getProducts.reduce((sum, item) => {
              const discountableItemQuantity = Math.min(
                discountableQuantity,
                item.quantity
              );
              discountableQuantity -= discountableItemQuantity;
              return (
                sum +
                item.price *
                  discountableItemQuantity *
                  (discount.discountValue / 100)
              );
            }, 0);
          } else if (discount.discountType === 'Fixed Amount') {
            discountAmount = discount.discountValue * discountableQuantity;
          } else if (discount.discountType === 'Free') {
            discountAmount = getProducts.reduce((sum, item) => {
              const discountableItemQuantity = Math.min(
                discountableQuantity,
                item.quantity
              );
              discountableQuantity -= discountableItemQuantity;
              return sum + item.price * discountableItemQuantity;
            }, 0);
          }
        }
        break;

      case 'FreeShippingDiscount':
        if (discount.minPurchaseType === 'Minimum Purchase Amount') {
          const totalAmount = cartItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );
          if (totalAmount >= discount.minPurchaseValue) {
            freeShipping = true;
          }
        } else if (discount.minPurchaseType === 'Minimum Quantity of Items') {
          const totalQuantity = cartItems.reduce(
            (sum, item) => sum + item.quantity,
            0
          );
          if (totalQuantity >= discount.minPurchaseValue) {
            freeShipping = true;
          }
        } else {
          freeShipping = true;
        }
        break;

      default:
        return res.status(400).json({ message: 'Invalid discount type' });
    }

    res.status(200).json({ discountAmount, freeShipping });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllDiscounts,
  getDiscountByCode,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  verifyUserEligibility,
  verifyProductEligibility,
  calculateDiscount,
};
