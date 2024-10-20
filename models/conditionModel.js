const mongoose = require('mongoose');

const conditionSchema = new mongoose.Schema(
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

const Condition = mongoose.model('Condition', conditionSchema);

module.exports = Condition;