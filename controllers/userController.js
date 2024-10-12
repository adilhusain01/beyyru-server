const User = require('../models/userModel');
const Token = require('../models/tokenModel.js');
const Address = require('../models/addressModel');
const Purchase = require('../models/purchaseHistoryModel');
const { sendEmail } = require('../util/sendEmailVerification');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
require('dotenv').config();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
};

// @desc Register a new user
// @route POST /api/users/register
const registerUser = async (req, res) => {
  const { name, email, password, email_subscription, role, verified } =
    req.body;
  console.log(req.body);

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: `Name, Email & Password is required` });
  }

  try {
    const userExists = await User.findOne({ email }).exec();

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const roles = { User: 2001 };
    if (role === 'Admin') {
      roles.Admin = 5150;
    } else if (role === 'Editor') {
      roles.Editor = 1984;
    }

    const user = await User.create({
      name,
      email,
      password,
      roles,
      verified: verified || false,
    });

    console.log(user);

    if (user && !verified) {
      const token = await Token.create({
        userId: user._id,
        token: crypto.randomBytes(32).toString('hex'),
      });

      const url = `${process.env.FRONTEND_BASE_URL}user/${user._id}/verify/${token.token}`;

      await sendEmail(email, 'Verify Email', url);

      res.status(200).json({
        message: `Verification sent at email, Please Verify.`,
      });
    } else if (user && verified) {
      res.status(201).json({ message: 'User created successfully' });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Authenticate user & get token
// @route POST /api/users/login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: 'User does not exist' });

    if (user.verified === false) {
      let token = await Token.findOne({ userId: user._id });
      if (!token) {
        token = await new Token({
          userId: user._id,
          token: crypto.randomBytes(32).toString('hex'),
        }).save();

        const url = `${process.env.FRONTEND_BASE_URL}/user/${user._id}/verify/${token.token}`;
        await sendEmail(user.email, 'Verify Email', url);
      }

      return res.status(400).json({
        message: `Please verify your email. A verification link has been sent. (In case check spam folder)`,
      });
    }

    if (user && (await bcrypt.compare(password, user.password))) {
      const roles = Object.values(user.roles).filter(Boolean);

      res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        roles: roles,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Get all users
// @route GET /api/users
const getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    const usersWithDetails = await Promise.all(
      users.map(async (user) => {
        const address = await Address.find({ userId: user._id });
        const purchases = await Purchase.find({ userId: user._id });
        return { ...user._doc, address, purchases };
      })
    );
    res.status(200).json(usersWithDetails);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Get user by ID
// @route GET /api/users/:id
const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const address = await Address.find({ userId: user._id });
    const purchases = await Purchase.find({ userId: user._id });
    res.status(200).json({ ...user._doc, address, purchases });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Update user by ID
// @route PUT /api/users/:id
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, password, email_subscription, role, mobile } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    if (password) {
      user.password = password;
    }
    user.email_subscription =
      email_subscription !== undefined
        ? email_subscription
        : user.email_subscription;
    user.mobile = mobile || user.mobile;

    if (role) {
      user.roles = { User: 2001 };
      if (role === 'Admin') {
        user.roles.Admin = 5150;
      } else if (role === 'Editor') {
        user.roles.Editor = 1984;
      }
    }

    await user.save();
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Delete user by ID
// @route DELETE /api/users/:id
const deleteUser = async (req, res) => {
  const { id } = req.params;
  console.log(id);

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndDelete(id);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};
