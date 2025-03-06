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
  let mockReq, mockRes, mockPoolQuery;

  beforeEach(() => {
    mockReq = {
      body: {
        email: 'test@example.com',
        password: 'password123',
      },
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    pool.promise().query.mockClear();
    bcrypt.compare.mockClear();
    jwt.sign.mockClear();
  });

  it('should return 404 if email is not found', async () => {
    pool.promise().query.mockResolvedValue([[]]); // No user found

    await login(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: 'error',
      code: 404,
      message: 'Email is not found!',
    });
  });

  it('should return 400 if password is wrong', async () => {
    pool.promise().query.mockResolvedValue([[{ user_id: '123', name: 'Test User', email: 'test@example.com', password: 'hashedPassword' }]]);
    bcrypt.compare.mockResolvedValue(false);

    await login(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: 'error',
      code: 400,
      message: 'Wrong password!',
    });
  });

  it('should return 200 with accessToken and user data on successful login', async () => {
    pool.promise().query.mockResolvedValue([[{ user_id: '123', name: 'Test User', email: 'test@example.com', password: 'hashedPassword' }]]);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('mockAccessToken');

    await login(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({
      status: 'success',
      code: 200,
      message: 'Login successful',
      data: {
        accessToken: 'mockAccessToken',
        user: {
          userId: '123',
          name: 'Test User',
          email: 'test@example.com',
        },
      },
    });

    expect(jwt.sign).toHaveBeenCalled();
  });

  it('should return 500 if an error occurs', async () => {
    pool.promise().query.mockRejectedValue(new Error('Database error'));

    await login(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: 'error',
      code: 500,
      message: 'Internal Server Error',
      error: 'Database error',
    });
  });

  it('should handle bcrypt error', async () => {
    pool.promise().query.mockResolvedValue([[{ user_id: '123', name: 'Test User', email: 'test@example.com', password: 'hashedPassword' }]]);
    bcrypt.compare.mockRejectedValue(new Error("bcrypt error"));

    await login(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: 'error',
      code: 500,
      message: 'Internal Server Error',
      error: 'bcrypt error',
    });
  });

  it('should handle JWT error', async () => {
    pool.promise().query.mockResolvedValue([[{ user_id: '123', name: 'Test User', email: 'test@example.com', password: 'hashedPassword' }]]);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockImplementation(() => { throw new Error('JWT Error'); });

    await login(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: 'error',
      code: 500,
      message: 'Internal Server Error',
      error: 'JWT Error',
    });
  });
});