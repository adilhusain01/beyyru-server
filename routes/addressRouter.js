const express = require('express');
const {
  addAddress,
  getAddress,
  updateAddress,
  deleteAddress,
} = require('../controllers/addressController');

const router = express.Router();

// Address routes
router.post('/:userId', addAddress);
router.get('/:userId', getAddress);
router.put('/:userId', updateAddress);
router.delete('/:userId', deleteAddress);

module.exports = router;
