const mysql = require('../configs/mysql');
const pool = mysql.pool;
const { v4: uuidv4 } = require('uuid');
const moment = require('moment-timezone');

const createAttendance = async (_req, res) => {
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
const filterAttendances = async (_req, res) => {
  try {
    const { userId, fromDate, toDate, timezone } = _req.query;
    let query = 'SELECT u.name, a.latitude, a.longitude, a.ip, a.created_at FROM attendances AS a LEFT JOIN users AS u ON a.user_id = u.user_id WHERE 1=1';
    const queryParams = [];

    if (userId) {
      query += ' AND a.user_id = ?';
      queryParams.push(userId);
    }

    if (fromDate) {
      query += ' AND a.created_at >= ?';
      queryParams.push(fromDate);
    }

    if (toDate) {
      query += ' AND a.created_at <= ?';
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
        const created_at = new Date(convertedCreatedAt);
        return {
          ...attendance,
          created_at: created_at,
        };
      });

      res.json(attendances);
    });

  } catch (error) {
  console.error('Error in filterAttendances:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getAttendances = async (_req, res) => {
  try {
    pool.query('SELECT u.name, a.latitude, a.longitude, a.ip, a.created_at FROM attendances AS a LEFT JOIN users AS u ON a.user_id = u.user_id', (err, results) => {
      if (err) {
        console.error('Error fetching attendances:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      res.json(results);
    });

  } catch (error) {
    console.error('Error in getAttendances:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  createAttendance: createAttendance,
  getAttendances: getAttendances,
  filterAttendances: filterAttendances,
};