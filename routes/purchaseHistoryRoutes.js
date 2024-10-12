const express = require('express');
const {
  addPurchase,
  getPurchaseHistory,
} = require('../controllers/purchaseHistoryController');

const router = express.Router();

// Purchase history routes
router.post('/purchase/add', addPurchase);
router.get('/purchases/:userId', getPurchaseHistory);

module.exports = router;
