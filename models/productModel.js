const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    images: {
      type: [String],
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    previousPrice: {
      type: Number,
      required: true,
    },
    currentPrice: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    ingredients: {
      type: [String],
      required: true,
    },
    conditions: {
      type: [String],
      required: true,
    },
    demographic: {
      type: [String],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    soldQuantity: {
      type: Number,
      default: 0,
    },
    sku: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
); // Automatically manage createdAt and updatedAt fields

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
