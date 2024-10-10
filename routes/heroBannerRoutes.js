const express = require('express');
const multer = require('multer');
const {
  createHeroBanner,
  getHeroBanners,
} = require('../controllers/heroBannerController');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router
  .route('/hero')
  .post(upload.array('files', 10), createHeroBanner) // Handle multiple files
  .get(getHeroBanners);

module.exports = router;
