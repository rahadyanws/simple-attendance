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
  let req, res;

  beforeEach(() => {
    req = {
      params: { userId: '123' },
      body: { name: 'Test User', email: 'test@example.com' },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    pool.query.mockClear();
    bcrypt.genSalt.mockClear();
    bcrypt.hash.mockClear();
  });

  it('should update user successfully', async () => {
    req.body.password = 'password123';
    bcrypt.genSalt.mockResolvedValue('salt');
    bcrypt.hash.mockResolvedValue('hashedPassword');
    pool.query.mockImplementation((query, values, callback) => {
      callback(null, { affectedRows: 1 });
    });

    await editUser(req, res);

    expect(bcrypt.genSalt).toHaveBeenCalled();
    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'salt');
    expect(pool.query).toHaveBeenCalledWith(
      'UPDATE users SET name = ?, email = ?, password = ? WHERE user_id = ?',
      ['Test User', 'test@example.com', 'hashedPassword', '123'],
      expect.any(Function)
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith('User updated successfully');
  });

  it('should update user without password', async () => {
    pool.query.mockImplementation((query, values, callback) => {
      callback(null, { affectedRows: 1 });
    });

    await editUser(req, res);

    expect(bcrypt.genSalt).not.toHaveBeenCalled();
    expect(bcrypt.hash).not.toHaveBeenCalled();
    expect(pool.query).toHaveBeenCalledWith(
      'UPDATE users SET name = ?, email = ? WHERE user_id = ?',
      ['Test User', 'test@example.com', '123'],
      expect.any(Function)
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith('User updated successfully');
  });

  it('should handle database error', async () => {
    bcrypt.genSalt.mockResolvedValue('salt');
    bcrypt.hash.mockResolvedValue('hashedPassword');
    pool.query.mockImplementation((query, values, callback) => {
      callback(new Error('Database error'), null);
    });

    await editUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Internal Server Error');
  });

  it('should correctly pass the userId from params', async () => {
    req.body.password = 'password123';
    bcrypt.genSalt.mockResolvedValue('salt');
    bcrypt.hash.mockResolvedValue('hashedPassword');
    pool.query.mockImplementation((query, values, callback) => {
      callback(null, { affectedRows: 1 });
    });

    await editUser(req, res);

    expect(pool.query).toHaveBeenCalledWith(
      'UPDATE users SET name = ?, email = ?, password = ? WHERE user_id = ?',
      ['Test User', 'test@example.com', 'hashedPassword', '123'],
      expect.any(Function)
    );
    expect(req.params.userId).toBe('123');
  });

  it('should handle database error when password is provided', async () => {
    req.body.password = 'newPassword';
    bcrypt.genSalt.mockResolvedValue('salt');
    bcrypt.hash.mockResolvedValue('hashedPassword');
    pool.query.mockImplementation((query, values, callback) => {
      callback(new Error('Database error'), null);
    });

    await editUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Internal Server Error');

  });
});

describe('getUserById', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: { userId: '123' },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };
    pool.query.mockClear();
  });

  it('should return user data on successful query', () => {
    const mockResults = [{ user_id: '123', name: 'Test User', email: 'test@example.com' }];
    pool.query.mockImplementation((query, values, callback) => {
      callback(null, mockResults);
    });

    getUserById(req, res);

    expect(pool.query).toHaveBeenCalledWith(
      'SELECT * FROM users WHERE user_id = ?',
      ['123'],
      expect.any(Function)
    );
    expect(res.json).toHaveBeenCalledWith(mockResults);
  });

  it('should handle database error', () => {
    pool.query.mockImplementation((query, values, callback) => {
      callback(new Error('Database error'), null);
    });

    getUserById(req, res);

    expect(pool.query).toHaveBeenCalledWith(
      'SELECT * FROM users WHERE user_id = ?',
      ['123'],
      expect.any(Function)
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Internal Server Error');
  });
});