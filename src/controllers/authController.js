const jwt = require('jsonwebtoken');
const mysql = require('../configs/mysql');
const pool = mysql.pool;
const bcrypt = require('bcrypt');

const login = async (req, res) => {
  try {
    const [user] = await pool.promise().query('SELECT * FROM users WHERE email = ?', [req.body.email]);

    if (user.length === 0) {
      return res.status(404).json({
        status: 'error',
        code: 404,
        message: 'Email is not found!',
      });
    }

    const match = await bcrypt.compare(req.body.password, user[0].password);

    if (!match) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'Wrong password!',
      });
    }

    const userData = {
      userId: user[0].user_id,
      name: user[0].name,
      email: user[0].email,
    };

    const accessToken = jwt.sign(
      userData,
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      status: 'success',
      code: 200,
      message: 'Login successful',
      data: {
        accessToken: accessToken,
        user: userData,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      code: 500,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

module.exports = {
  login: login,
};