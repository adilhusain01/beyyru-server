const express = require('express');
const { verifyUserById } = require('../controllers/userVerificationController');

const router = express.Router();

router.post('/:id/verify/:token', verifyUserById);

module.exports = router;
