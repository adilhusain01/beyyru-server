const Discount = require('../models/discountModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');

const getAllDiscounts = async (req, res) => {
  try {
    const discounts = await Discount.find().populate(
      'selectedProducts selectedProducts getProducts userUsage.userId'
    );

    const currentDate = new Date();

    // Filter out expired discounts and delete them
    const validDiscounts = await Promise.all(
      discounts.map(async (discount) => {
        if (currentDate > discount.endDate) {
          await Discount.findByIdAndDelete(discount._id);
          return null;
        }
        return discount;
      })
    );

    // Filter out null values (expired discounts)
    const filteredDiscounts = validDiscounts.filter(
      (discount) => discount !== null
    );

    const discountsWithUsage = filteredDiscounts.map((discount) => {
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

const getAllOffers = async (req, res) => {
  try {
    const discounts = await Discount.find({ isPublic: true }).populate(
      'selectedProducts getProducts userUsage.userId'
    );

    const currentDate = new Date();

    // Filter out expired discounts and delete them
    const validDiscounts = await Promise.all(
      discounts.map(async (discount) => {
        if (currentDate > discount.endDate) {
          await Discount.findByIdAndDelete(discount._id);
          return null;
        }
        return discount;
      })
    );

    // Filter out null values (expired discounts)
    const filteredDiscounts = validDiscounts.filter(
      (discount) => discount !== null
    );

    const discountsWithUsage = filteredDiscounts.map((discount) => {
      const used = discount.userUsage.reduce(
        (sum, usage) => sum + usage.usageCount,
        0
      );

      let description = '';
      switch (discount.type) {
        case 'AmountOffOrderDiscount':
          description = `${discount.discountValue}${
            discount.discountType === 'Percentage' ? '%' : '₹'
          } off entire order`;
          break;
        case 'AmountOffProductDiscount':
          const productNames = discount.selectedProducts
            .map((product) => product.name)
            .join(', ');
          description = `${discount.discountValue}${
            discount.discountType === 'Percentage' ? '%' : '₹'
          } off on products: ${productNames}`;
          break;
        // case 'BuyXGetYDiscount':
        //   const spendProductNames = discount.selectedProducts
        //     .map((product) => product.name)
        //     .join(', ');
        //   const getProductNames = discount.getProducts
        //     .map((product) => product.name)
        //     .join(', ');
        //   description = `Buy ${discount.minPurchaseValue} of [${spendProductNames}] and get ${discount.getQuantity} of [${getProductNames}] for free`;
        //   break;
        case 'FreeShippingDiscount':
          description = 'Free shipping';
          break;
        default:
          description = 'Unknown discount type';
      }

      let minRequirement = '';
      switch (discount.minPurchaseType) {
        case 'Minimum Purchase Amount':
          minRequirement = `Minimum purchase of ₹${discount.minPurchaseValue}`;
          break;
        case 'Minimum Quantity of Items':
          minRequirement = `Minimum purchase of ${discount.minPurchaseValue} items`;
          break;
        case 'No minimum requirements':
          minRequirement = 'No minimum requirements';
          break;
        default:
          minRequirement = 'Unknown minimum requirement';
      }

      return {
        ...discount.toObject(),
        used,
        description,
        minRequirement,
      };
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

  try {
    const existingDiscount = await Discount.findOne({
      discountCode: discountData.discountCode.toUpperCase(),
    });

    if (existingDiscount) {
      const currentDate = new Date();
      if (currentDate <= existingDiscount.endDate) {
        return res.status(400).json({ message: 'Discount already exists' });
      } else {
        await Discount.deleteOne({ _id: existingDiscount._id });
      }
    }

    const newDiscount = new Discount(discountData);
    await newDiscount.save();
    res.status(201).json(newDiscount);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

const updateDiscount = async (req, res) => {
  const { code } = req.params;
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

const calculateDiscount = async (req, res) => {
  const { discountCode, cartItems, userId } = req.body;

  try {
    const discount = await Discount.findOne({
      discountCode: discountCode.toUpperCase(),
    });

    if (!discount) {
      return res.status(404).json({ message: 'Discount not found' });
    }

    const currentDate = new Date();
    if (currentDate > discount.endDate) {
      return res.status(400).json({ message: 'Discount has expired' });
    }

    const userUsage = discount?.userUsage.find(
      (usage) => usage?.userId.toString() === userId
    );

    // Ensure the user's usage doesn't exceed the maximum allowed
    if (userUsage && userUsage.usageCount >= discount.maxDiscountUseValue) {
      return res.status(400).json({
        message: 'Discount Already Used',
      });
    }

    let discountAmount = 0;
    let shipping = 50;

    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.productId.currentPrice * item.quantity,
      0
    );
    const totalQuantity = cartItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    switch (discount?.type) {
      case 'AmountOffOrderDiscount':
        if (
          discount.minPurchaseType === 'Minimum Purchase Amount' &&
          totalAmount >= discount.minPurchaseValue
        ) {
          if (discount.discountType === 'Percentage') {
            discountAmount = totalAmount * (discount.discountValue / 100);
          } else {
            discountAmount = discount.discountValue;
          }
        } else if (
          discount.minPurchaseType === 'Minimum Quantity of Items' &&
          totalQuantity >= discount.minPurchaseValue
        ) {
          if (discount.discountType === 'Percentage') {
            discountAmount = totalAmount * (discount.discountValue / 100);
          } else {
            discountAmount = discount.discountValue;
          }
        } else if (discount.minPurchaseType === 'No minimum requirements') {
          if (discount.discountType === 'Percentage') {
            discountAmount = totalAmount * (discount.discountValue / 100);
          } else {
            discountAmount = discount.discountValue;
          }
        } else {
          return res
            .status(400)
            .json({ message: 'Cart does not meet Minimum requirements' });
        }
        break;

      case 'AmountOffProductDiscount':
        const selectedProductItems = cartItems.filter((item) =>
          discount.selectedProducts.includes(item.productId._id.toString())
        );

        const selectedTotalAmount = selectedProductItems.reduce(
          (sum, item) => sum + item.productId.currentPrice * item.quantity,
          0
        );
        const selectedTotalQuantity = selectedProductItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        );

        if (
          discount.minPurchaseType === 'Minimum Purchase Amount' &&
          selectedTotalAmount >= discount.minPurchaseValue
        ) {
          selectedProductItems.forEach((item) => {
            if (discount.discountType === 'Percentage') {
              discountAmount +=
                item.productId.currentPrice *
                item.quantity *
                (discount.discountValue / 100);
            } else {
              discountAmount += discount.discountValue * item.quantity;
            }
          });
        } else if (
          discount.minPurchaseType === 'Minimum Quantity of Items' &&
          selectedTotalQuantity >= discount.minPurchaseValue
        ) {
          selectedProductItems.forEach((item) => {
            if (discount.discountType === 'Percentage') {
              discountAmount +=
                item.productId.currentPrice *
                item.quantity *
                (discount.discountValue / 100);
            } else {
              discountAmount += discount.discountValue * item.quantity;
            }
          });
        } else if (discount.minPurchaseType === 'No minimum requirements') {
          selectedProductItems.forEach((item) => {
            if (discount.discountType === 'Percentage') {
              discountAmount +=
                item.productId.currentPrice *
                item.quantity *
                (discount.discountValue / 100);
            } else {
              discountAmount += discount.discountValue * item.quantity;
            }
          });
        } else {
          return res
            .status(400)
            .json({ message: 'Cart does not meet Minimum requirements' });
        }
        break;

      case 'BuyXGetYDiscount':
        const spendProducts = cartItems.filter((item) =>
          discount.spendProducts.includes(item.productId._id.toString())
        );
        const getProducts = cartItems.filter((item) =>
          discount.getProducts.includes(item.productId._id.toString())
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
                item.productId.currentPrice *
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
              return (
                sum + item.productId.currentPrice * discountableItemQuantity
              );
            }, 0);
          }
        }
        break;

      case 'FreeShippingDiscount':
        if (
          discount.minPurchaseType === 'Minimum Purchase Amount' &&
          totalAmount >= discount.minPurchaseValue
        ) {
          discountAmount = 50; // Fixed shipping price
        } else if (
          discount.minPurchaseType === 'Minimum Quantity of Items' &&
          totalQuantity >= discount.minPurchaseValue
        ) {
          discountAmount = 50;
        } else if (discount.minPurchaseType === 'No Minimum Requirements') {
          discountAmount = 50;
        } else {
          return res
            .status(400)
            .json({ message: 'Cart does not meet Minimum requirements' });
        }
        break;

      default:
        return res.status(400).json({ message: 'Invalid discount type' });
    }

    const discountedPrice =
      cartItems.reduce(
        (sum, item) => sum + item.productId.currentPrice * item.quantity,
        0
      ) - discountAmount;

    // console.log({
    //   discountAmount: discountAmount,
    //   discountedPrice: discountedPrice,
    // });

    res.status(200).json({ discountAmount, discountedPrice, shipping });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllDiscounts,
  getAllOffers,
  getDiscountByCode,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  calculateDiscount,
};
