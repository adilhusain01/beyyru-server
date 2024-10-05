const Address = require('../models/addressModel');

const addAddress = async (req, res) => {
  const { userId, street, city, state, zipCode, country } = req.body;

  try {
    const address = new Address({ userId, street, city, state, zipCode, country });
    await address.save();
    res.status(201).json(address);
  } catch (error) {
    res.status(500).json({ message: 'Error adding address', error });
  }
};
const getAddresses = async (req, res) => {
    const { userId } = req.params;
  
    try {
      const addresses = await Address.find({ userId });
      res.status(200).json(addresses);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching addresses', error });
    }
  };
  const updateAddress = async (req, res) => {
    const { addressId, userId, street, city, state, zipCode, country } = req.body;
  
    try {
      const address = await Address.findOneAndUpdate(
        { _id: addressId, userId },
        { street, city, state, zipCode, country },
        { new: true }
      );
  
      if (!address) {
        return res.status(404).json({ message: 'Address not found' });
      }
  
      res.status(200).json(address);
    } catch (error) {
      res.status(500).json({ message: 'Error updating address', error });
    }
  };
  const deleteAddress = async (req, res) => {
    const { addressId, userId } = req.body;
  
    try {
      const address = await Address.findOneAndDelete({ _id: addressId, userId });
      
      if (!address) {
        return res.status(404).json({ message: 'Address not found' });
      }
  
      res.status(200).json({ message: 'Address deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting address', error });
    }
  };

  module.exports = { addAddress, getAddresses, updateAddress, deleteAddress };