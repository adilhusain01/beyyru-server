const mongoose = require('mongoose');

const demographicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const Demographic = mongoose.model('Demographic', demographicSchema);

module.exports = Demographic;
