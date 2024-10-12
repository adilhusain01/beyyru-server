const express = require('express');
const {
  getAllDiscounts,
  getDiscountByCode,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  verifyUserEligibility,
  verifyProductEligibility,
  calculateDiscount,
} = require('../controllers/discountController');

const router = express.Router();

router.get('/', getAllDiscounts);
router.get('/:code', getDiscountByCode);
router.post('/', createDiscount);
router.put('/:id', updateDiscount);
router.delete('/:id', deleteDiscount);

router.post('/verify-user', verifyUserEligibility);
router.post('/verify-product', verifyProductEligibility);
router.post('/calculate-discount', calculateDiscount);

module.exports = router;
