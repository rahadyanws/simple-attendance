const mysql = require('mysql2');
const createPool = mysql.createPool;

const pool = createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'attendance',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = { pool: pool };