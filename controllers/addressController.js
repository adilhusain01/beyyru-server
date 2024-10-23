const Address = require('../models/addressModel');

const addAddress = async (req, res) => {
  const { userId } = req.params;
  const { street, city, state, zipCode, country } = req.body;

  try {
    const address = new Address({
      userId,
      street,
      city,
      state,
      zipCode,
      country,
    });
    await address.save();
    res.status(201).json(address);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error adding address', error });
  }
};
const getAddress = async (req, res) => {
  const { userId } = req.params;

  try {
    const address = await Address.find({ userId });
    res.status(200).json(address);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error fetching addresses', error });
  }
};

const updateAddress = async (req, res) => {
  const { userId } = req.params;
  const { addressId, street, city, state, zipCode, country } = req.body;

  try {
    let address = await Address.findOne({ _id: addressId, userId });

    if (address) {
      // Update existing address
      address = await Address.findOneAndUpdate(
        { _id: addressId, userId },
        { street, city, state, zipCode, country },
        { new: true }
      );
    } else {
      // Create new address
      address = new Address({
        userId,
        street,
        city,
        state,
        zipCode,
        country,
      });
      await address.save();
    }

    res.status(200).json(address);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: 'Error updating or creating address', error });
  }
};

const deleteAddress = async (req, res) => {
  const { userId } = req.params;
  const { addressId } = req.body;

  try {
    const address = await Address.findOneAndDelete({ _id: addressId, userId });

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    res.status(200).json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error deleting address', error });
  }
};

module.exports = { addAddress, getAddress, updateAddress, deleteAddress };
