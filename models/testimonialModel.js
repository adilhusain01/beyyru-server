const mongoose = require('mongoose');

// Schema for Testimonials
const testimonialSchema = new mongoose.Schema({
  image: {
    type: String,
    required: true, // URL for the testimonial image
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1, // Rating must be at least 1
    max: 5, // Rating cannot be more than 5
  },
}, { timestamps: true }); // Automatically manage createdAt and updatedAt fields

const Testimonial = mongoose.model('Testimonial', testimonialSchema);

module.exports = Testimonial;
