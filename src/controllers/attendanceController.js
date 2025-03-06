const mysql = require('../configs/mysql');
const pool = mysql.pool;
const { v4: uuidv4 } = require('uuid');
const moment = require('moment-timezone');
// const jwt = require("jsonwebtoken");

const createAttendance = async (_req, res) => {
    // const authHeader = _req.headers['authorization'];
    // const token = authHeader && authHeader.split(' ')[1];
    // const userId = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    //     return decoded.userId;
    // })
    const attendanceId = uuidv4();
    const createdAt = new Date();
    const { userId, latitude, longitude, ip, photo } = _req.body;

    pool.query('INSERT INTO attendances (attendance_id, user_id, latitude, longitude, ip, photo, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)', [attendanceId, userId, latitude, longitude, ip, photo, createdAt], (err, results) => {
        if (err) {
            console.error('Error inserting into MySQL', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.status(201).send('Attendance created successfully');
    });
};

// Get Attendance List with Filtering and Timezone Conversion
const getAttendances = async (_req, res) => {
    try {
        const { userId, fromDate, toDate, timezone } = _req.body;
        let query = 'SELECT * FROM attendances WHERE 1=1';
        const queryParams = [];

        if (userId) {
            query += ' AND user_id = ?';
            queryParams.push(userId);
        }

        if (fromDate) {
            query += ' AND created_at >= ?';
            queryParams.push(fromDate);
        }

        if (toDate) {
            query += ' AND created_at <= ?';
            queryParams.push(toDate);
        }

        pool.query(query, queryParams, (err, results) => {
            if (err) {
                console.error('Error fetching attendances:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            // Timezone conversion
            const attendances = results.map(attendance => {
                const convertedCreatedAt = moment(attendance.created_at).tz(timezone || 'UTC').format(); // Default to UTC
                return {
                    ...attendance,
                    created_at: convertedCreatedAt,
                };
            });

            res.json(attendances);
        });

    } catch (error) {
        console.error('Error in getAttendances:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    createAttendance: createAttendance,
    getAttendances: getAttendances,
};