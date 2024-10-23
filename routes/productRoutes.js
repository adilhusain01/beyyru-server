const express = require('express');
const {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
  bestSellingProduct, // Import the bestSellingProduct controller
} = require('../controllers/productController');
const multer = require('multer');
const router = express.Router();

// Configure Multer
const storage = multer.memoryStorage(); // Memory storage for Cloudinary uploads
const upload = multer({ storage }); // Can add limits for file size, etc.

// Create Product Route
// Use 'files' as the field name for multiple images
router.post('/', upload.array('files', 10), createProduct);
router.get('/best-sellers/:demographic', bestSellingProduct); // Add this line

// Other product routes
router.get('/best-sellers', bestSellingProduct); // Add this line
router.get('/', getProducts);
router.get('/:id', getProductById);
router.put('/:id', upload.array('files', 10), updateProduct); // If updating with multiple files
router.delete('/:id', deleteProduct);

// Best-selling products route

module.exports = router;
