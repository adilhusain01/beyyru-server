const Type = require('../models/typeModel');

// Create a new type
const createType = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const newType = new Type({ name });
    await newType.save();
    res.status(201).json(newType);
  } catch (error) {
    res.status(500).json({ message: 'Error creating type', error });
    console.log(error);
  }
};

// Get all types
const getAllTypes = async (req, res) => {
  try {
    const types = await Type.find({});
    res.status(200).json(types);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching types', error });
    console.log(error);
  }
};

// Get a single type by ID
const getTypeById = async (req, res) => {
  try {
    const type = await Type.findById(req.params.id);
    if (!type) {
      return res.status(404).json({ message: 'Type not found' });
    }
    res.status(200).json(type);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching type', error });
    console.log(error);
  }
};

// Update an type by ID
const updateType = async (req, res) => {
  try {
    const { name } = req.body;
    const type = await Type.findById(req.params.id);
    if (!type) {
      return res.status(404).json({ message: 'Type not found' });
    }

    type.name = name;
    await type.save();

    res.status(200).json(type);
  } catch (error) {
    res.status(500).json({ message: 'Error updating type', error });
    console.log(error);
  }
};

// Delete an type by ID
const deleteType = async (req, res) => {
  try {
    const type = await Type.findById(req.params.id);
    if (!type) {
      return res.status(404).json({ message: 'Type not found' });
    }

    await type.deleteOne();
    res.status(200).json({ message: 'Type deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting type', error });
    console.log(error);
  }
};

module.exports = {
  createType,
  getAllTypes,
  getTypeById,
  updateType,
  deleteType,
};
