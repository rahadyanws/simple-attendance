const mysql = require('../configs/mysql');
const pool = mysql.pool;
const bcrypt = require("bcrypt");

const getUserById = (_req, res) => {
  const userId = _req.params.userId;
  pool.query('SELECT * FROM users WHERE user_id = ?', [userId], (err, results) => {
    if (err) {
      console.error('Error querying MySQL:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.json(results);
  });
};

const editUser = async (_req, res) => {
  const userId = _req.params.userId
  const { name, email, password } = _req.body;
  if (password) {
    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);
    pool.query('UPDATE users SET name = ?, email = ?, password = ? WHERE user_id = ?', [name, email, hashPassword, userId], (err, results) => {
      if (err) {
        res.status(500).send('Internal Server Error');
        return;
      }
      res.status(201).send('User updated successfully');
    });
  } else {
    pool.query('UPDATE users SET name = ?, email = ? WHERE user_id = ?', [name, email, userId], (err, results) => {
      if (err) {
        res.status(500).send('Internal Server Error');
        return;
      }
      res.status(201).send('User updated successfully');
    });
  }

};

module.exports = {
  getUserById: getUserById,
  editUser: editUser,
};
