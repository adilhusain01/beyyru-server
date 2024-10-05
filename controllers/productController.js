const Product = require('../models/productModel');
const { uploadFileToCloudinary } = require('../util/uploadToCloud');

// Get all products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error });
  }
};

// Get product by ID
const getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error });
  }
};

// Create a new product
const createProduct = async (req, res) => {
  const {
    name,
    description,
    previousPrice,
    currentPrice,
    type,
    ingredients,
    conditions,
    demographic,
  } = req.body;

  // Check if files are present and if all other fields are provided
  if (
    !req.files ||
    !name ||
    !description ||
    !previousPrice ||
    !currentPrice ||
    !type ||
    !ingredients ||
    !conditions ||
    !demographic
  ) {
    return res
      .status(400)
      .json({ message: 'All fields are required, including images' });
  }

  try {
    // Upload each image to Cloudinary and store the URLs
    const imageUrls = await Promise.all(
      req.files.map((file) =>
        uploadFileToCloudinary(file.buffer, file.originalname)
      )
    );

    // Create the new product with the image URLs
    const newProduct = new Product({
      images: imageUrls, // Save the array of image URLs
      name,
      description,
      previousPrice,
      currentPrice,
      type,
      ingredients,
      conditions,
      demographic,
    });

    // Save the product to the database
    await newProduct.save();

    res.status(201).json({ message: 'Product created successfully' });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Error creating product', error });
  }
};

// Update an existing product
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const {
    images,
    name,
    description,
    previousPrice,
    currentPrice,
    type,
    ingredients,
    conditions,
    demographic,
  } = req.body;

  try {
    // If new images are provided, upload them to Cloudinary and add to the images array
    let updatedImages = images || []; // If no new images are provided, use the existing ones

    if (req.files && req.files.length > 0) {
      const newImageUrls = await Promise.all(
        req.files.map((file) =>
          uploadFileToCloudinary(file.buffer, file.originalname)
        )
      );
      updatedImages = [...updatedImages, ...newImageUrls]; // Append new images
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        images: updatedImages,
        name,
        description,
        previousPrice,
        currentPrice,
        type,
        ingredients,
        conditions,
        demographic,
      },
      { new: true } // Return the updated document
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error });
  }
};

// Delete a product
const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error });
  }
};

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
};
