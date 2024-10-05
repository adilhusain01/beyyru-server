const HeroBanner = require('../models/heroBannerModel'); 
const { uploadFileToCloudinary } = require('../util/uploadToCloud')
const {deleteFileFromCloudinary} = require("../util/deleteFromCloud")
// const createHeroBanner = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ message: 'No file uploaded' });
//     }

//     const fileUrl = await uploadFileToCloudinary(req.file.buffer, req.file.originalname);
    
//     // Now you can save the fileUrl in your database
//     const heroBanner = new HeroBanner({ imageUrl: fileUrl });
//     await heroBanner.save();

//     res.status(201).json(heroBanner);
//   } catch (error) { 
//     res.status(500).json({ message: 'Error creating Hero Banner', error });
//   }
// };

const createHeroBanner = async (req, res) => {
  
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Find the existing hero banner
    const existingBanner = await HeroBanner.findOne();

    if (existingBanner) {
      // Delete the old image from Cloudinary
      const publicId = getCloudinaryPublicId(existingBanner.imageUrl); // Function to extract public ID from the URL
      await deleteFileFromCloudinary(publicId);

      // Delete the old record from the database
      await HeroBanner.deleteOne({ _id: existingBanner._id });
    }

    // Upload new file to Cloudinary
    const fileUrl = await uploadFileToCloudinary(req.file.buffer, req.file.originalname);

    // Save the new banner image to the database
    const heroBanner = new HeroBanner({ imageUrl: fileUrl });
    await heroBanner.save();  

    res.status(201).json(heroBanner);
  } catch (error) {
    console.error('Error creating Hero Banner:', error);
    res.status(500).json({ message: 'Error creating Hero Banner', error });
  }
};

const getHeroBanners = async (req, res) => {
    try {
      // Fetch all Hero Banners from the database
      const heroBanners = await HeroBanner.find({});
      
      // Return the list of Hero Banners
      res.status(200).json(heroBanners);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching Hero Banners', error });
    }
  };

  // Delete Hero Banner and its associated image


module.exports = { createHeroBanner, getHeroBanners };

const getCloudinaryPublicId = (imageUrl) => {
  const parts = imageUrl.split('/');
  const lastPart = parts[parts.length - 1];
  const publicId = lastPart.split('.')[0];
  return publicId;
};