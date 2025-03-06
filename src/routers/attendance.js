const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const verifyTokenJWT = require('../middleware/verifyTokenJWT');

router.post('/api/attendance', verifyTokenJWT.verifyToken, attendanceController.createAttendance);
router.post('/api/attendance/report', verifyTokenJWT.verifyToken, attendanceController.getAttendances);

module.exports = router;