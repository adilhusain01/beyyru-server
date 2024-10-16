const Category = require('../models/categoryModel');

// Get all categories
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error });
  }
};

// Create a new category
const createCategory = async (req, res) => {
  const { name, image } = req.body;

  if (!name || !image) {
    return res.status(400).json({ message: 'Name and image are required' });
  }

  try {
    const category = new Category({ name, image });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error creating category', error });
  }
};

// Update a category
const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, image } = req.body;

  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { name, image },
      { new: true } // Return the updated document
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: 'Error updating category', error });
  }
};

// Delete a category
const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedCategory = await Category.findByIdAndDelete(id);

    if (!deletedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category', error });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
