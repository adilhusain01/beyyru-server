const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const deleteFileFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log(`Deleted file from Cloudinary: ${publicId}`);
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error);
    throw error; // Throw an error if something goes wrong
  }
};

module.exports = { deleteFileFromCloudinary };
