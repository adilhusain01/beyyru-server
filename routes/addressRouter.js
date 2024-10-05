const express = require('express');
const {
  addAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
} = require('../controllers/addressController');

const router = express.Router();

// Address routes
router.post('/add', addAddress);
router.get('/:userId', getAddresses);
router.put('/update', updateAddress);
router.delete('/delete', deleteAddress);

module.exports = router;
