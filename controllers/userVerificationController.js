const User = require('../models/userModel.js');
const Token = require('../models/tokenModel.js');

const verifyUserById = async (req, res) => {
  try {
    const { id, token } = req.params;
    const user = await User.findOne({ _id: id });
    if (!user) return res.status(400).json({ message: 'Invalid link' });

    const userToken = await Token.findOne({
      userId: user._id,
      token,
    });

    if (!userToken) return res.status(400).json({ message: 'Invalid link' });

    //verifying user and immediately invalidating and deleting token
    await User.updateOne({ _id: user._id }, { verified: true });
    await Token.deleteOne({ _id: userToken._id });

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { verifyUserById };
