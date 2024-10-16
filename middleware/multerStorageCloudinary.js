const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinaryConfig'); 

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads',
    allowed_formats: ['jpeg', 'png', 'jpg'], 
    public_id: (req, file) => {
      return `file-${Date.now()}`; 
    }
  }
});

// Initialize multer with Cloudinary storage
const upload = multer({ storage });

module.exports = upload;
