const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: false,
      unique: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    email_subscription: {
      type: Boolean,
      default: false,
    },
    roles: {
      User: {
        type: Number,
        default: 2001,
      },
      Editor: Number,
      Admin: Number,
    },
  },
  { timestamps: true }
);

// Hash the password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

module.exports = User;
