const express = require('express');
const multer = require('multer'); // For handling file uploads
const { createHeroBanner, getHeroBanners } = require('../controllers/heroBannerController');

const router = express.Router();

// Configure Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });


router.route('/hero')
  .post(upload.single('file'), createHeroBanner)  // POST: Create a new hero banner
  .get(getHeroBanners)                            // GET: Fetch all hero banners
  // .delete(deleteHeroBanner);                      // DELETE: Remove hero banner and its image

module.exports = router;
