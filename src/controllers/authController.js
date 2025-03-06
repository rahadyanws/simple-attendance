const jwt = require('jsonwebtoken');
const mysql = require('../configs/mysql');
const pool = mysql.pool;
const bcrypt = require('bcrypt');

const login = async (req, res) => {
  try {
    const [user] = await pool.promise().query('SELECT * FROM users WHERE email = ?', [req.body.email]);
    if (user.length === 0) {
      return res.status(404).json({ message: 'Email is not found!' });
    }
    const match = await bcrypt.compare(req.body.password, user[0].password);
    if (!match) {
      return res.status(400).json({ message: 'Wrong password!' });
    }
    const userId = user[0].user_id;
    const name = user[0].name;
    const email = user[0].email;
    
    const accessToken = jwt.sign(
      { userId, name, email },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: '1d',
      }
    );
    res.json({ accessToken });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  login: login,
};