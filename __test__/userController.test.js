// userController.test.js
const { editUser, getUserById } = require('../src/controllers/userController'); // Adjust the import path
const { pool } = require('../src/configs/mysql'); // Adjust the import path for your database connection
const bcrypt = require('bcrypt');

jest.mock('../src/configs/mysql', () => ({
  pool: {
    query: jest.fn(),
  },
}));

jest.mock('bcrypt', () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
}));

describe('editUser', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = {
      params: { userId: '123' },
      body: { name: 'Test User', email: 'test@example.com' },
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    pool.query.mockClear();
    bcrypt.genSalt.mockClear();
    bcrypt.hash.mockClear();
  });

  it('should return 500 if database query fails', async () => {
    pool.query.mockImplementationOnce((query, params, callback) => {
      callback(new Error('Database error'), null);
    });

    await editUser(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: 'error',
      code: 500,
      message: 'Internal Server Error',
      error: 'Database error',
    });
  });

  it('should update user successfully without password', async () => {
    pool.query.mockImplementationOnce((query, params, callback) => {
      callback(null, { affectedRows: 1 });
    });

    await editUser(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: 'success',
      code: 200,
      message: 'User updated successfully',
    });

    expect(bcrypt.genSalt).not.toHaveBeenCalled();
    expect(bcrypt.hash).not.toHaveBeenCalled();
  });

  it('should update user successfully with password', async () => {
    mockReq.body.password = 'newPassword';
    bcrypt.genSalt.mockResolvedValue('salt');
    bcrypt.hash.mockResolvedValue('hashedPassword');
    pool.query.mockImplementationOnce((query, params, callback) => {
      callback(null, { affectedRows: 1 });
    });

    await editUser(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: 'success',
      code: 200,
      message: 'User updated successfully',
    });

    expect(bcrypt.genSalt).toHaveBeenCalled();
    expect(bcrypt.hash).toHaveBeenCalled();
  });
});

describe('getUserById', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = { params: { userId: '123' } };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    pool.query.mockClear();
  });

  it('should return 500 if database query fails', async () => {
    pool.query.mockImplementationOnce((query, params, callback) => {
      callback(new Error('Database error'), null);
    });

    getUserById(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: 'error',
      code: 500,
      message: 'Internal Server Error',
      error: 'Database error',
    });
  });

  it('should return 200 with user data if user is found', async () => {
    const mockResults = [
      {
        user_id: '123',
        username: 'testuser',
        email: 'test@example.com',
      },
    ];

    pool.query.mockImplementationOnce((query, params, callback) => {
      callback(null, mockResults);
    });

    getUserById(mockReq, mockRes);
    
    expect(mockRes.json).toHaveBeenCalledWith({
      status: 'success',
      code: 200,
      message: 'User retrieved successfully',
      data: mockResults[0],
    });
  });

  it('should handle no results', async () => {
    pool.query.mockImplementationOnce((query, params, callback) => {
      callback(null, []);
    });

    getUserById(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({
      status: 'success',
      code: 200,
      message: 'User retrieved successfully',
      data: undefined,
    });
  });
});