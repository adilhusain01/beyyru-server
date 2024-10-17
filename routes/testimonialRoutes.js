const express = require('express');
const {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} = require('../controllers/testimonialController');

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }); // Using memory storage for Cloudinary

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Testimonial:
 *       type: object
 *       required:
 *         - image
 *         - name
 *         - description
 *         - rating
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the testimonial
 *         image:
 *           type: string
 *           description: Image URL for the testimonial
 *         name:
 *           type: string
 *           description: Name of the person giving the testimonial
 *         description:
 *           type: string
 *           description: The testimonial text
 *         rating:
 *           type: number
 *           description: Rating out of 5
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The time when the testimonial was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The time when the testimonial was last updated
 */

/**
 * @swagger
 * tags:
 *   name: Testimonials
 *   description: The testimonial managing API
 */

/**
 * @swagger
 * /api/testimonials:
 *   get:
 *     summary: Returns the list of all the testimonials
 *     tags: [Testimonials]
 *     responses:
 *       200:
 *         description: The list of the testimonials
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Testimonial'
 */
router.get('/', getTestimonials);

/**
 * @swagger
 * /api/testimonials:
 *   post:
 *     summary: Create a new testimonial
 *     tags: [Testimonials]
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               rating:
 *                 type: number
 *     responses:
 *       201:
 *         description: The testimonial was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Testimonial'
 *       500:
 *         description: Some server error
 */
router.post('/', upload.single('file'), createTestimonial);

/**
 * @swagger
 * /api/testimonials/{id}:
 *   put:
 *     summary: Update a testimonial by the id
 *     tags: [Testimonials]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The testimonial id
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               rating:
 *                 type: number
 *     responses:
 *       200:
 *         description: The testimonial was updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Testimonial'
 *       404:
 *         description: The testimonial was not found
 *       500:
 *         description: Some server error
 */
router.put('/:id', upload.single('file'), updateTestimonial);

/**
 * @swagger
 * /api/testimonials/{id}:
 *   delete:
 *     summary: Remove the testimonial by id
 *     tags: [Testimonials]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The testimonial id
 *     responses:
 *       200:
 *         description: The testimonial was deleted
 *       404:
 *         description: The testimonial was not found
 */
router.delete('/:id', deleteTestimonial);

module.exports = router;
