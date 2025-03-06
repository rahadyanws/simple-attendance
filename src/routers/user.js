const express = require("express");
const router = express.Router();
const userController = require('../controllers/userController');
const verifyTokenJWT = require('../middleware/verifyTokenJWT');

router.patch('/api/users/:userId', verifyTokenJWT.verifyToken, userController.editUser);
router.get('/api/users/:userId', userController.getUserById)

module.exports = router;