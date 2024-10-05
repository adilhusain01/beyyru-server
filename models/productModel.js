const mongoose = require('mongoose');

// Schema for Product Card
const productSchema = new mongoose.Schema(
  {
    images: {
      type: [String],
      required: true, // URL for the product image
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
      type: Number, // Store the previous price
      required: true,
    },
    currentPrice: {
      type: Number, // Store the current price
      required: true,
    },
    type: {
      type: [String], // Array of types
      required: true,
    },
    ingredients: {
      type: [String], // Array of ingredients
      required: true,
    },
    conditions: {
      type: [String], // Array of conditions the product addresses
      required: true,
    },
    demographic: {
      type: [String], // Array of demographic targets (e.g., adults, kids)
      required: true,
    },
  },
  { timestamps: true }
); // Automatically manage createdAt and updatedAt fields

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
