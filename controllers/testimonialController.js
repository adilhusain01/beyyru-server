const Testimonial = require('../models/testimonialModel');
const { uploadFileToCloudinary } = require('../util/uploadToCloud');

// Get all testimonials
const getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find();
    res.status(200).json(testimonials);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching testimonials', error });
  }
};

// Create a new testimonial
const createTestimonial = async (req, res) => {
  const { name, description, rating } = req.body;
  // console.log('hello', req.body, 'and', req.file);
  // Validate that all required fields are present
  if (!req.file || !name || !description || !rating) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  }

  try {
    // Upload new image to Cloudinary
    const imageUrl = await uploadFileToCloudinary(
      req.file.buffer,
      req.file.originalname
    );

    // Create a new testimonial
    const newTestimonial = new Testimonial({
      image: imageUrl,
      name,
      description,
      rating,
    });

    // Save the new testimonial
    await newTestimonial.save();

    res.status(201).json(newTestimonial);
  } catch (error) {
    res.status(500).json({ message: 'Error creating testimonial', error });
  }
};

const updateTestimonial = async (req, res) => {
  const { id } = req.params;
  const { name, description, rating } = req.body;

  // console.log('Request Params:', req.params);
  // console.log('Request Body:', req.body);

  if (rating && (rating < 1 || rating > 5)) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  }

  try {
    let imageUrl;
    if (req.file) {
      // Upload new image to Cloudinary
      imageUrl = await uploadFileToCloudinary(
        req.file.buffer,
        req.file.originalname
      );
    }

    const updatedTestimonial = await Testimonial.findByIdAndUpdate(
      id,
      {
        image: imageUrl || undefined, // Only update image if a new one is provided
        name,
        description,
        rating,
      },
      { new: true } // Return the updated document
    );

    if (!updatedTestimonial) {
      // console.log('Testimonial not found');
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    // console.log('Updated Testimonial:', updatedTestimonial);

    res.status(200).json(updatedTestimonial);
  } catch (error) {
    console.error('Error updating testimonial:', error);
    res.status(500).json({ message: 'Error updating testimonial', error });
  }
};

// Delete a testimonial
const deleteTestimonial = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedTestimonial = await Testimonial.findByIdAndDelete(id);

    if (!deletedTestimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    res.status(200).json({ message: 'Testimonial deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting testimonial', error });
  }
};

module.exports = {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
};
