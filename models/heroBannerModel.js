const mongoose = require('mongoose');

const heroBannerSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('HeroBanner', heroBannerSchema);
