const Condition = require('../models/conditionModel');

// Create a new condition
const createCondition = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const newCondition = new Condition({ name });
    await newCondition.save();
    res.status(201).json(newCondition);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error creating condition', error });
  }
};

// Get all conditions
const getAllConditions = async (req, res) => {
  try {
    const conditions = await Condition.find({});

    res.status(200).json(conditions);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error fetching conditions', error });
  }
};

// Get a single condition by ID
const getConditionById = async (req, res) => {
  try {
    const condition = await Condition.findById(req.params.id);
    if (!condition) {
      return res.status(404).json({ message: 'Condition not found' });
    }
    res.status(200).json(condition);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error fetching condition', error });
  }
};

// Update an condition by ID
const updateCondition = async (req, res) => {
  try {
    const { name } = req.body;
    const condition = await Condition.findById(req.params.id);
    if (!condition) {
      return res.status(404).json({ message: 'Condition not found' });
    }

    condition.name = name;
    await condition.save();

    res.status(200).json(condition);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error updating condition', error });
  }
};

// Delete an condition by ID
const deleteCondition = async (req, res) => {
  try {
    const condition = await Condition.findById(req.params.id);
    if (!condition) {
      return res.status(404).json({ message: 'Condition not found' });
    }

    await condition.deleteOne();
    res.status(200).json({ message: 'Condition deleted successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error deleting condition', error });
  }
};

module.exports = {
  createCondition,
  getAllConditions,
  getConditionById,
  updateCondition,
  deleteCondition,
};
