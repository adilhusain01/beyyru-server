const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: true,
    },
    heading: {
      type: String,
      required: true,
    },
    paragraph: {
      type: String,
      required: true,
    },
    published: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Blog = mongoose.model('Blog', blogSchema);
module.exports = Blog;
