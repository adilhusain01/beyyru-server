const express = require('express');
const {
  createDemographic,
  getAllDemographics,
  getDemographicById,
  updateDemographic,
  deleteDemographic,
} = require('../controllers/demographicController');
const router = express.Router();

router.route('/').post(createDemographic).get(getAllDemographics);

router
  .route('/:id')
  .get(getDemographicById)
  .put(updateDemographic)
  .delete(deleteDemographic);

module.exports = router;
