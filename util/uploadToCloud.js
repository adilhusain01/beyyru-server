const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
// Function to upload a file to Cloudinary
const uploadFileToCloudinary = async (fileBuffer, fileName) => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: 'auto', public_id: fileName }, // Automatically determine resource type
        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve(result.secure_url); // Return the public URL
        }
      );
  
      // Convert the buffer to a readable stream and pipe it to Cloudinary
      streamifier.createReadStream(fileBuffer).pipe(stream);
    });
  };
  
  module.exports = { uploadFileToCloudinary };

  