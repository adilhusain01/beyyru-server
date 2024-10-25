const Ingredient = require('../models/ingredientModel');
const { uploadFileToCloudinary } = require('../util/uploadToCloud');

// Create a new ingredient
const createIngredient = async (req, res) => {
  try {
    const { name } = req.body;

    if (!req.file || !name) {
      return res.status(400).json({ message: 'Name and image are required' });
    }

    const image = await uploadFileToCloudinary(
      req.file.buffer,
      req.file.originalname
    );

    const newIngredient = new Ingredient({ name, image });
    await newIngredient.save();
    res.status(201).json(newIngredient);
  } catch (error) {
    res.status(500).json({ message: 'Error creating ingredient', error });
    console.log(error);
  }
};

// Get all ingredients
const getAllIngredients = async (req, res) => {
  try {
    const ingredients = await Ingredient.find({});
    res.status(200).json(ingredients);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching ingredients', error });
    console.log(error);
  }
};

// Get a single ingredient by ID
const getIngredientById = async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id);
    if (!ingredient) {
      return res.status(404).json({ message: 'Ingredient not found' });
    }
    res.status(200).json(ingredient);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching ingredient', error });
    console.log(error);
  }
};

// Update an ingredient by ID
const updateIngredient = async (req, res) => {
  try {
    const { name } = req.body;
    const ingredient = await Ingredient.findById(req.params.id);
    if (!ingredient) {
      return res.status(404).json({ message: 'Ingredient not found' });
    }

    if (req.file) {
      const image = await uploadFileToCloudinary(
        req.file.buffer,
        req.file.originalname
      );
      ingredient.image = image;
    }

    ingredient.name = name;
    await ingredient.save();

    res.status(200).json(ingredient);
  } catch (error) {
    res.status(500).json({ message: 'Error updating ingredient', error });
    console.log(error);
  }
};

// Delete an ingredient by ID
const deleteIngredient = async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id);
    if (!ingredient) {
      return res.status(404).json({ message: 'Ingredient not found' });
    }

    await ingredient.deleteOne();
    res.status(200).json({ message: 'Ingredient deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting ingredient', error });
    console.log(error);
  }
};

module.exports = {
  createIngredient,
  getAllIngredients,
  getIngredientById,
  updateIngredient,
  deleteIngredient,
};
