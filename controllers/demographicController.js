const Demographic = require('../models/demographicModel');

// Create a new demographic
const createDemographic = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const newDemographic = new Demographic({ name });
    await newDemographic.save();
    res.status(201).json(newDemographic);
  } catch (error) {
    res.status(500).json({ message: 'Error creating demographic', error });
    console.log(error);
  }
};

// Get all demographics
const getAllDemographics = async (req, res) => {
  try {
    const demographics = await Demographic.find({});
    res.status(200).json(demographics);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching demographics', error });
    console.log(error);
  }
};

// Get a single demographic by ID
const getDemographicById = async (req, res) => {
  try {
    const demographic = await Demographic.findById(req.params.id);
    if (!demographic) {
      return res.status(404).json({ message: 'Demographic not found' });
    }
    res.status(200).json(demographic);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching demographic', error });
    console.log(error);
  }
};

// Update an demographic by ID
const updateDemographic = async (req, res) => {
  try {
    const { name } = req.body;
    const demographic = await Demographic.findById(req.params.id);
    if (!demographic) {
      return res.status(404).json({ message: 'Demographic not found' });
    }

    demographic.name = name;
    await demographic.save();

    res.status(200).json(demographic);
  } catch (error) {
    res.status(500).json({ message: 'Error updating demographic', error });
    console.log(error);
  }
};

// Delete an demographic by ID
const deleteDemographic = async (req, res) => {
  try {
    const demographic = await Demographic.findById(req.params.id);
    if (!demographic) {
      return res.status(404).json({ message: 'Demographic not found' });
    }

    await demographic.deleteOne();
    res.status(200).json({ message: 'Demographic deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting demographic', error });
    console.log(error);
  }
};

module.exports = {
  createDemographic,
  getAllDemographics,
  getDemographicById,
  updateDemographic,
  deleteDemographic,
};
