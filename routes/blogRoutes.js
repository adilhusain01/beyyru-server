const express = require('express');
const {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
} = require('../controllers/blogController');

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }); // Using memory storage for Cloudinary

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Blog:
 *       type: object
 *       required:
 *         - imageUrl
 *         - heading
 *         - paragraph
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the blog post
 *         imageUrl:
 *           type: string
 *           description: URL of the blog image
 *         heading:
 *           type: string
 *           description: The heading of the blog post
 *         paragraph:
 *           type: string
 *           description: The content of the blog post
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The time when the blog post was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The time when the blog post was last updated
 */

/**
 * @swagger
 * tags:
 *   name: Blogs
 *   description: The blog managing API
 */

/**
 * @swagger
 * /api/blogs:
 *   get:
 *     summary: Returns the list of all the blogs
 *     tags: [Blogs]
 *     responses:
 *       200:
 *         description: The list of the blogs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Blog'
 */
router.get('/', getBlogs);

/**
 * @swagger
 * /api/blogs/{id}:
 *   get:
 *     summary: Get a blog by the id
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The blog id
 *     responses:
 *       200:
 *         description: The blog was found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Blog'
 *       404:
 *         description: The blog was not found
 */
router.get('/:id', getBlogById);

/**
 * @swagger
 * /api/blogs:
 *   post:
 *     summary: Create a new blog
 *     tags: [Blogs]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               heading:
 *                 type: string
 *               paragraph:
 *                 type: string
 *     responses:
 *       201:
 *         description: The blog was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Blog'
 *       500:
 *         description: Some server error
 */
router.post('/', upload.single('file'), createBlog);

/**
 * @swagger
 * /api/blogs/{id}:
 *   put:
 *     summary: Update a blog by the id
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The blog id
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               heading:
 *                 type: string
 *               paragraph:
 *                 type: string
 *     responses:
 *       200:
 *         description: The blog was updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Blog'
 *       404:
 *         description: The blog was not found
 *       500:
 *         description: Some server error
 */
router.put('/:id', upload.single('file'), updateBlog);

/**
 * @swagger
 * /api/blogs/{id}:
 *   delete:
 *     summary: Remove the blog by id
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The blog id
 *     responses:
 *       200:
 *         description: The blog was deleted
 *       404:
 *         description: The blog was not found
 */
router.delete('/:id', deleteBlog);

module.exports = router;
