const Product = require('../models/productModel');
const Cart = require('../models/cartModel');
const { uploadFileToCloudinary } = require('../util/uploadToCloud');
const { v4: uuidv4 } = require('uuid'); // Import UUID library for SKU generation

const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error });
    console.log(error);
  }
};

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
    console.log(error);
  }
};

const createProduct = async (req, res) => {
  let {
    name,
    description,
    previousPrice,
    currentPrice,
    type,
    ingredients, // Make sure this is an array
    conditions, // Make sure this is an array
    demographic, // Make sure this is an array
    quantity,
  } = req.body;

  if (
    !req.files ||
    !name ||
    !description ||
    !previousPrice ||
    !currentPrice ||
    !type ||
    !ingredients || // This should be an array
    !conditions || // This should be an array
    !demographic || // This should be an array
    !quantity
  ) {
    return res
      .status(400)
      .json({ message: 'All fields are required, including images' });
  }

  // Upload each image to Cloudinary and store the URLs
  const imageUrls = await Promise.all(
    req.files.map((file) =>
      uploadFileToCloudinary(file.buffer, file.originalname)
    )
  );

  // Generate a unique SKU
  const namePart = name.substring(0, 3).toUpperCase();
  const namePartTwo = name.substring(3, 6).toUpperCase();
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  const sku = `${namePart}-${namePartTwo}-${randomPart}`;

  ingredients = ingredients.split(',').map((ingredient) => ingredient.trim());
  1;
  conditions = conditions.split(',').map((condition) => condition.trim());
  demographic = demographic.split(',').map((demo) => demo.trim());

  const newProduct = new Product({
    images: imageUrls,
    name,
    description,
    previousPrice,
    currentPrice,
    type,
    ingredients,
    conditions,
    demographic,
    quantity,
    sku,
  });

  await newProduct.save();
  res.status(201).json({ message: 'Product created successfully' });
};

const updateProduct = async (req, res) => {
  const { id } = req.params;
  let {
    name,
    description,
    previousPrice,
    currentPrice,
    type,
    ingredients,
    conditions,
    demographic,
    quantity,
  } = req.body;

  try {
    // Retrieve the existing product to get the current images
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // If new images are provided, upload them to Cloudinary and add to the images array
    let updatedImages = existingProduct.images; // Use existing images by default

    if (req.files && req.files.length > 0) {
      const newImageUrls = await Promise.all(
        req.files.map((file) =>
          uploadFileToCloudinary(file.buffer, file.originalname)
        )
      );
      updatedImages = [...updatedImages, ...newImageUrls]; // Append new images
    }

    ingredients = ingredients
      ?.split(',')
      .map((ingredient) => ingredient.trim());
    conditions = conditions?.split(',').map((condition) => condition.trim());
    demographic = demographic?.split(',').map((demo) => demo.trim());

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
        quantity,
      },
      { new: true }
    );

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error });
    console.log(error);
  }
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Remove the product from all carts
    await Cart.updateMany({}, { $pull: { items: { productId: id } } });

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error });
    console.log(error);
  }
};

const bestSellingProduct = async (req, res) => {
  const { demographic } = req.params;

  try {
    const filter = demographic ? { demographic: { $in: [demographic] } } : {};

    const bestSellingProducts = await Product.find(filter)
      .sort({ soldQuantity: -1 })
      .limit(4);

    res.status(200).json(bestSellingProducts);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Error fetching best selling products',
      error,
    });
  }
};

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
  bestSellingProduct,
};
