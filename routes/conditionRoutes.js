const express = require('express');
const {
  createCondition,
  getAllConditions,
  getConditionById,
  updateCondition,
  deleteCondition,
} = require('../controllers/conditionController');
const router = express.Router();

router.route('/').post(createCondition).get(getAllConditions);

router
  .route('/:id')
  .get(getConditionById)
  .put(updateCondition)
  .delete(deleteCondition);

module.exports = router;
