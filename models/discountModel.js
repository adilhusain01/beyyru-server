const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema(
  {
    discountCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    discountType: {
      type: String,
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
    },
    minPurchaseType: {
      type: String,
      required: true,
    },
    minPurchaseValue: {
      type: Number,
      default: 0,
    },
    maxDiscountUseValue: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    selectedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    getProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    getQuantity: {
      type: Number,
      default: 0,
    },
    getProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    type: {
      type: String,
      required: true,
    },
    userUsage: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        usageCount: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Discount = mongoose.model('Discount', discountSchema);

module.exports = Discount;
