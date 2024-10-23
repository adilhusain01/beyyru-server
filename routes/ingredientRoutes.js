const express = require('express');
const multer = require('multer');
const {
  createIngredient,
  getAllIngredients,
  getIngredientById,
  updateIngredient,
  deleteIngredient,
} = require('../controllers/ingredientController');
const router = express.Router();

const storage = multer.memoryStorage(); // Memory storage for Cloudinary uploads
const upload = multer({ storage });

router
  .route('/')
  .post(upload.single('file'), createIngredient)
  .get(getAllIngredients);

router
  .route('/:id')
  .get(getIngredientById)
  .put(upload.single('file'), updateIngredient)
  .delete(deleteIngredient);

module.exports = router;
