const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController.js');

router.post('/api/auth/login', authController.login);

module.exports = router;