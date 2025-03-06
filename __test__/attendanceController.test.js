// attendanceController.test.js (Jest test)
const { createAttendance, filterAttendances, getAttendances } = require('../src/controllers/attendanceController');
const { pool } = require('../src/configs/mysql');
const { v4: uuidv4 } = require('uuid');
// const jwt = require('jsonwebtoken');
const moment = require('moment-timezone');

jest.mock('../src/configs/mysql', () => ({
  pool: {
    query: jest.fn(),
  },
}));
jest.mock('uuid');
jest.mock('moment-timezone');

describe('createAttendance', () => {
  let req, res;

  beforeEach(() => {
    req = {
      headers: {
        authorization: 'Bearer mock-token',
      },
      body: {
        userId: '1',
        latitude: '12.345',
        longitude: '67.890',
        ip: '192.168.1.1',
        photo: 'photo.jpg',
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    pool.query.mockClear();
    uuidv4.mockReturnValue('mock-uuid');

    mockDate = new Date('2024-01-01T12:00:00.000Z');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should create attendance successfully', (done) => {
    pool.query.mockImplementation((sql, values, callback) => {
      callback(null, { insertId: 1 });
    });

    createAttendance(req, res);

    // expect(jwt.verify).toHaveBeenCalled();
    expect(uuidv4).toHaveBeenCalled();

    expect(pool.query).toHaveBeenCalledWith(
      'INSERT INTO attendances (attendance_id, user_id, latitude, longitude, ip, photo, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['mock-uuid', '1', '12.345', '67.890', '192.168.1.1', 'photo.jpg', mockDate],
      expect.any(Function)
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith('Attendance created successfully');
    done();
  });

  it('should create attendance successfully', async () => {
    pool.query.mockImplementation((sql, values, callback) => {
      callback(null, { insertId: 1 });
    });

    await createAttendance(req, res);

    // expect(jwt.verify).toHaveBeenCalled();
    expect(uuidv4).toHaveBeenCalled();
    expect(pool.query).toHaveBeenCalledWith(
      'INSERT INTO attendances (attendance_id, user_id, latitude, longitude, ip, photo, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['mock-uuid', '1', '12.345', '67.890', '192.168.1.1', 'photo.jpg', mockDate],
      expect.any(Function)
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith('Attendance created successfully');
  });
});

describe('filterAttendances', () => {
  let req, res;

  beforeEach(() => {
    req = { query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    pool.query.mockClear();
    moment.mockClear();
  });

  it('should return 500 if database query fails', async () => {
    pool.query.mockImplementationOnce((query, params, callback) => {
      callback(new Error('Database error'), null);
    });

    filterAttendances(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
  });

  it('should return attendances with timezone conversion', async () => {
    const results = [
      {
        name: 'John Doe',
        latitude: 1.23,
        longitude: 4.56,
        ip: '192.168.1.1',
        created_at: '2023-11-01T10:00:00Z',
      },
      {
        name: 'Jane Smith',
        latitude: 7.89,
        longitude: 10.11,
        ip: '192.168.1.2',
        created_at: '2023-11-02T12:00:00Z',
      },
    ];

    pool.query.mockImplementationOnce((query, params, callback) => {
      callback(null, results);
    });

    const mockMomentTz = jest.fn().mockReturnThis();
    const mockMomentFormat = jest.fn().mockReturnValue('2023-11-01T17:00:00+07:00'); // Mocked timezone conversion

    moment.mockReturnValue({ tz: mockMomentTz, format: mockMomentFormat });

    req.query.timezone = 'Asia/Jakarta'; // Set timezone in request query

    filterAttendances(req, res);

    expect(res.json).toHaveBeenCalled();
    const responseData = res.json.mock.calls[0][0];
    expect(responseData).toHaveLength(2);
    expect(responseData[0].created_at).toBeInstanceOf(Date);
    expect(responseData[0].created_at.toISOString()).toBe('2023-11-01T10:00:00.000Z'); //Ensure that the date object returns the UTC value.
  });

  it('should handle userId, fromDate, and toDate filters', async () => {
    req.query = {
      userId: 'user123',
      fromDate: '2023-10-26T00:00:00Z',
      toDate: '2023-10-27T23:59:59Z',
    };

    filterAttendances(req, res);

    expect(pool.query).toHaveBeenCalled();
    const query = pool.query.mock.calls[0][0];
    const params = pool.query.mock.calls[0][1];

    expect(query).toContain('AND a.user_id = ?');
    expect(query).toContain('AND a.created_at >= ?');
    expect(query).toContain('AND a.created_at <= ?');
    expect(params).toEqual(['user123', '2023-10-26T00:00:00Z', '2023-10-27T23:59:59Z']);
  });

  it('should default to UTC timezone if none is provided', async () => {
    const results = [{ name: 'Test', latitude: 0, longitude: 0, ip: '1.1.1.1', created_at: '2023-11-01T10:00:00Z' }];

    pool.query.mockImplementationOnce((query, params, callback) => {
      callback(null, results);
    });

    const mockMomentTz = jest.fn().mockReturnThis();
    const mockMomentFormat = jest.fn().mockReturnValue('2023-11-01T10:00:00Z');

    moment.mockReturnValue({ tz: mockMomentTz, format: mockMomentFormat });

    filterAttendances(req, res);

    expect(moment).toHaveBeenCalled();
    expect(moment.mock.calls[0][0]).toBe('2023-11-01T10:00:00Z');
  });

});

describe('getAttendances', () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    pool.query.mockClear();
  });

  it('should return 500 if database query fails', async () => {
    pool.query.mockImplementationOnce((query, callback) => {
      callback(new Error('Database error'), null);
    });

    getAttendances(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
  });

  it('should return attendances successfully', async () => {
    const results = [
      {
        name: 'John Doe',
        latitude: 1.23,
        longitude: 4.56,
        ip: '192.168.1.1',
        created_at: '2023-11-01T10:00:00Z',
      },
      {
        name: 'Jane Smith',
        latitude: 7.89,
        longitude: 10.11,
        ip: '192.168.1.2',
        created_at: '2023-11-02T12:00:00Z',
      },
    ];

    pool.query.mockImplementationOnce((query, callback) => {
      callback(null, results);
    });

    getAttendances(req, res);

    expect(res.json).toHaveBeenCalledWith(results);
  });

  it('should handle errors in the try-catch block', async () => {
    // Simulate an error in the try-catch block
    pool.query = jest.fn(() => {
      throw new Error('Simulated error');
    });

    getAttendances(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
  });
});