const express = require('express');
const {
  getCarouselSections,
  createCarouselSection,
  updateCarouselSection,
  deleteCarouselSection,
} = require('../controllers/carouselSectionController');

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }); // Using memory storage for Cloudinary

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     CarouselSection:
 *       type: object
 *       required:
 *         - image
 *         - title
 *         - description
 *         - lists
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the carousel section
 *         image:
 *           type: string
 *           description: URL of the carousel image
 *         title:
 *           type: string
 *           description: The title of the carousel section
 *         description:
 *           type: string
 *           description: The description of the carousel section
 *         lists:
 *           type: array
 *           items:
 *             type: string
 *           description: A list of items associated with the carousel (array)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The time when the carousel section was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The time when the carousel section was last updated
 */

/**
 * @swagger
 * tags:
 *   name: CarouselSection
 *   description: The Carousel Below Hero Section API
 */

/**
 * @swagger
 * /api/carousel:
 *   get:
 *     summary: Returns the list of all carousel sections
 *     tags: [CarouselSection]
 *     responses:
 *       200:
 *         description: The list of the carousel sections
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CarouselSection'
 */
router.get('/', getCarouselSections);

/**
 * @swagger
 * /api/carousel:
 *   post:
 *     summary: Create a new carousel section
 *     tags: [CarouselSection]
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               lists:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: The carousel section was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CarouselSection'
 *       500:
 *         description: Some server error
 */
router.post('/', upload.single('file'), createCarouselSection);

/**
 * @swagger
 * /api/carousel/{id}:
 *   put:
 *     summary: Update a carousel section by the id
 *     tags: [CarouselSection]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The carousel section id
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               lists:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: The carousel section was updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CarouselSection'
 *       404:
 *         description: The carousel section was not found
 *       500:
 *         description: Some server error
 */
router.put('/:id', upload.single('file'), updateCarouselSection);

/**
 * @swagger
 * /api/carousel/{id}:
 *   delete:
 *     summary: Remove a carousel section by id
 *     tags: [CarouselSection]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The carousel section id
 *     responses:
 *       200:
 *         description: The carousel section was deleted
 *       404:
 *         description: The carousel section was not found
 */
router.delete('/:id', deleteCarouselSection);

module.exports = router;
