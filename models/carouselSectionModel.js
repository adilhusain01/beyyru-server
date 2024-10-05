const mongoose = require('mongoose');

// Schema for Carousel Below Hero Section
const carouselSectionSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    lists: {
      type: [String], // Array of strings
      required: true,
    },
  },
  { timestamps: true }
); // To add createdAt and updatedAt fields automatically

const CarouselSection = mongoose.model(
  'CarouselSection',
  carouselSectionSchema
);

module.exports = CarouselSection;
