const CarouselSection = require('../models/carouselSectionModel');
const { uploadFileToCloudinary } = require('../util/uploadToCloud');

const getCarouselSections = async (req, res) => {
  try {
    const sections = await CarouselSection.find();
    res.status(200).json(sections);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sections', error });
  }
};

// Create a new carousel section
const createCarouselSection = async (req, res) => {
  const { title, description, lists } = req.body;

  // console.log(req.body, req.file);

  if (!req.file || !title || !description || !lists || !lists.length) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Upload new image to Cloudinary
    const imageUrl = await uploadFileToCloudinary(
      req.file.buffer,
      req.file.originalname
    );

    const newSection = new CarouselSection({
      image: imageUrl,
      title,
      description,
      lists,
    });
    await newSection.save();
    res.status(201).json(newSection);
  } catch (error) {
    res.status(500).json({ message: 'Error creating section', error });
  }
};

// Update an existing carousel section
const updateCarouselSection = async (req, res) => {
  const { id } = req.params;
  const { title, description, lists } = req.body;

  try {
    let imageUrl;
    if (req.file) {
      // Upload new image to Cloudinary
      imageUrl = await uploadFileToCloudinary(
        req.file.buffer,
        req.file.originalname
      );
    }

    const updatedSection = await CarouselSection.findByIdAndUpdate(
      id,
      {
        image: imageUrl || undefined, // Only update image if a new one is provided
        title,
        description,
        lists,
      },
      { new: true } // Return the updated document
    );

    if (!updatedSection) {
      return res.status(404).json({ message: 'Section not found' });
    }

    res.status(200).json(updatedSection);
  } catch (error) {
    console.error('Error updating section:', error);
    res.status(500).json({ message: 'Error updating section', error });
  }
};

// Delete a carousel section
const deleteCarouselSection = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedSection = await CarouselSection.findByIdAndDelete(id);

    if (!deletedSection) {
      return res.status(404).json({ message: 'Section not found' });
    }

    res.status(200).json({ message: 'Section deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting section', error });
  }
};

module.exports = {
  getCarouselSections,
  createCarouselSection,
  updateCarouselSection,
  deleteCarouselSection,
};
