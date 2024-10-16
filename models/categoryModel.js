const mongoose = require('mongoose');

// Schema for Categories by Ingredients Section
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // Ensure the category name is unique
  },
  image: {
    type: String,
    required: true, // URL of the category image
  },
}, { timestamps: true }); // Automatically manage createdAt and updatedAt fields

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
