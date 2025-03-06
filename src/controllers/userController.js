const mysql = require('../configs/mysql');
const pool = mysql.pool;
const bcrypt = require("bcrypt");

const getUserById = (_req, res) => {
  const userId = _req.params.userId;
  pool.query('SELECT * FROM users WHERE user_id = ?', [userId], (err, results) => {
    if (err) {
      console.error('Error querying MySQL:', err);
      res.status(500).json({
        status: 'error',
        code: 500,
        message: 'Internal Server Error',
        error: err.message || 'Database error',
      });
      return;
    }
    res.json({
      status: 'success',
      code: 200,
      message: 'User retrieved successfully',
      data: results[0], // Assuming user_id is unique, results[0] contains the user
    });
  });
};

const editUser = async (_req, res) => {
  const userId = _req.params.userId;
  const { name, email, password } = _req.body;

  try {
    let query;
    let queryParams;

    if (password) {
      const salt = await bcrypt.genSalt();
      const hashPassword = await bcrypt.hash(password, salt);
      query = 'UPDATE users SET name = ?, email = ?, password = ? WHERE user_id = ?';
      queryParams = [name, email, hashPassword, userId];
    } else {
      query = 'UPDATE users SET name = ?, email = ? WHERE user_id = ?';
      queryParams = [name, email, userId];
    }

    pool.query(query, queryParams, (err, results) => {
      if (err) {
        console.error('Error updating user:', err);
        return res.status(500).json({
          status: 'error',
          code: 500,
          message: 'Internal Server Error',
          error: err.message || 'Database error',
        });
      }

      res.status(200).json({
        status: 'success',
        code: 200,
        message: 'User updated successfully',
      });
    });
  } catch (error) {
    console.error('Error in editUser:', error);
    res.status(500).json({
      status: 'error',
      code: 500,
      message: 'Internal Server Error',
      error: error.message || 'Unexpected error',
    });
  }
};

module.exports = {
  getUserById: getUserById,
  editUser: editUser,
};
