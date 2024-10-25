const express = require('express');
const {
  createType,
  getAllTypes,
  getTypeById,
  updateType,
  deleteType,
} = require('../controllers/typeController');
const router = express.Router();

router.route('/').post(createType).get(getAllTypes);

router.route('/:id').get(getTypeById).put(updateType).delete(deleteType);

module.exports = router;
