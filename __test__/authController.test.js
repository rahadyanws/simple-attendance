// authController.test.js
const { login } = require('../src/controllers/authController');
const { pool } = require('../src/configs/mysql'); // Adjust the import path for your database connection
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

jest.mock('../src/configs/mysql', () => {
    const mockQuery = jest.fn(); // Create a mock for query
  
    return {
      pool: {
        promise: jest.fn(() => ({
          query: mockQuery, // Return the mockQuery
        })),
      },
      mockQuery, // Expose the mockQuery for assertions
    };
  });
jest.mock('jsonwebtoken');
jest.mock('bcrypt');

describe('login', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: { email: 'test@example.com', password: 'password123' },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jwt.sign.mockClear();
    pool.promise().query.mockClear();
    bcrypt.compare.mockClear();
  });

  it('should login user successfully', async () => {
    pool.promise().query.mockResolvedValue([[{ user_id: '123', name: 'Test User', email: 'test@example.com', password: 'hashedPassword' }]]);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('mockAccessToken');

    await login(req, res);

    expect(pool.promise().query).toHaveBeenCalledWith('SELECT * FROM users WHERE email = ?', ['test@example.com']);
    expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
    expect(jwt.sign).toHaveBeenCalledWith(
      { userId: '123', name: 'Test User', email: 'test@example.com' },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '1d' }
    );
    expect(res.json).toHaveBeenCalledWith({ accessToken: 'mockAccessToken' });
  });

  it('should return 404 if email is not found', async () => {
    pool.promise().query.mockResolvedValue([[]]);

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Email is not found!' });
  });

  it('should return 400 if password is wrong', async () => {
    pool.promise().query.mockResolvedValue([[{ userId: '123', name: 'Test User', email: 'test@example.com', password: 'hashedPassword' }]]);
    bcrypt.compare.mockResolvedValue(false);

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Wrong password!' });
  });

  it('should handle errors', async () => {
    pool.promise().query.mockRejectedValue(new Error('Database error'));

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Database error' });
  });
});