const express = require('express');
const {
  getAllDiscounts,
  getDiscountByCode,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  calculateDiscount,
} = require('../controllers/discountController');

const router = express.Router();

router.post('/calculate-discount', calculateDiscount);

router.get('/', getAllDiscounts);
router.post('/', createDiscount);
router.get('/:code', getDiscountByCode);
router.put('/:code', updateDiscount);
router.delete('/:id', deleteDiscount);

module.exports = router;
