const Blog = require('../models/blogModel');
const User = require('../models/userModel');
const NewsLetter = require('../models/newsLetterModel');
const { uploadFileToCloudinary } = require('../util/uploadToCloud');
const { deleteFileFromCloudinary } = require('../util/deleteFromCloud');
const { sendEmail } = require('../util/notificationMails');

// Get all blog posts
const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({});
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching blogs', error });
  }
};

// Get a blog post by ID
const getBlogById = async (req, res) => {
  const { id } = req.params;
  try {
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching blog post', error });
  }
};

// Create a new blog post
const createBlog = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload image to Cloudinary
    const fileUrl = await uploadFileToCloudinary(
      req.file.buffer,
      req.file.originalname
    );

    // Save the blog post with the uploaded image URL
    const blog = new Blog({
      imageUrl: fileUrl,
      heading: req.body.heading,
      paragraph: req.body.paragraph,
      published: req.body.published !== undefined ? req.body.published : true, // Handle published field
    });

    await blog.save();
    res.status(201).json(blog);

    // Fetch all users with email_subscription set to true
    const users = await User.find({ email_subscription: true });

    // Fetch all subscribers from the NewsLetter collection
    const subscribers = await NewsLetter.find({ subscribed: true });

    // Combine all emails and remove duplicates
    const emails = [
      ...new Set([
        ...users.map((user) => user.email),
        ...subscribers.map((subscriber) => subscriber.email),
      ]),
    ];

    // Send email to all users and subscribers
    const emailPromises = emails.map((email) =>
      sendEmail('Subscriber', email, blog.heading, 'blog')
    );

    await Promise.all(emailPromises);
  } catch (error) {
    console.error('Error creating blog post:', error);
    res.status(500).json({ message: 'Error creating blog post', error });
  }
};

// Update a blog post by ID
const updateBlog = async (req, res) => {
  const { id } = req.params;
  const { heading, paragraph, published } = req.body;

  try {
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    let imageUrl = blog.imageUrl;
    if (req.file) {
      // Delete the old image from Cloudinary
      const publicId = getCloudinaryPublicId(blog.imageUrl);
      await deleteFileFromCloudinary(publicId);

      // Upload new image to Cloudinary
      imageUrl = await uploadFileToCloudinary(
        req.file.buffer,
        req.file.originalname
      );
    }

    // Update the blog post
    blog.heading = heading;
    blog.paragraph = paragraph;
    blog.imageUrl = imageUrl;
    blog.published = published !== undefined ? published : blog.published; // Handle published field

    await blog.save();
    res.status(200).json(blog);
  } catch (error) {
    console.error('Error updating blog post:', error);
    res.status(500).json({ message: 'Error updating blog post', error });
  }
};

// Delete a blog post by ID and its associated image
const deleteBlog = async (req, res) => {
  try {
    const blogId = req.params.id;

    // Find the blog post by ID
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    // Extract public ID from Cloudinary URL and delete the image
    // const publicId = getCloudinaryPublicId(blog.imageUrl);
    // await deleteFileFromCloudinary(publicId);

    // Delete the blog post from the database
    await Blog.findByIdAndDelete(blogId);

    res.status(200).json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting blog post', error });
  }
};

// Helper function to get Cloudinary public ID
const getCloudinaryPublicId = (imageUrl) => {
  const parts = imageUrl.split('/');
  const lastPart = parts[parts.length - 1];
  const publicId = lastPart.split('.')[0];
  return publicId;
};

module.exports = { getBlogs, getBlogById, createBlog, updateBlog, deleteBlog };
