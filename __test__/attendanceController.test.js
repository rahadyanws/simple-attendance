// attendanceController.test.js (Jest test)
const { createAttendance, getAttendances } = require('../src/controllers/attendanceController');
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
// jest.mock('jsonwebtoken');
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

        // jwt.verify.mockImplementation((token, secret, callback) => {
        //     callback(null, { userId: 1 }); // Corrected line
        // });
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

    // it('should handle database error', async () => {
    //     pool.query.mockImplementation((sql, values, callback) => {
    //         callback(new Error('Database error'), null);
    //     });

    //     await createAttendance(req, res);

    //     expect(res.status).toHaveBeenCalledWith(500);
    //     expect(res.send).toHaveBeenCalledWith('Internal Server Error');
    // });

    // it('should handle jwt verify error', (done) => {
    //     jwt.verify.mockImplementation((token, secret, callback) => {
    //         callback(new Error('JWT verification failed'), null);
    //     });
    //     createAttendance(req, res);
    //     expect(res.status).toHaveBeenCalledWith(500);
    //     expect(res.send).toHaveBeenCalledWith('Internal Server Error');
    //     done();
    // })
});

describe('getAttendances', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {
                userId: 1,
                fromDate: '2024-01-01',
                toDate: '2024-01-31',
                timezone: 'Asia/Jakarta',
            },
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        pool.query.mockClear();
    });

    it('should get attendances successfully with filters and timezone conversion', (done) => {
        const results = [
            { attendance_id: 1, user_id: 1, created_at: '2024-01-15T10:00:00.000Z' },
            { attendance_id: 2, user_id: 1, created_at: '2024-01-20T14:30:00.000Z' },
        ];
        const convertedResults = [
            { attendance_id: 1, user_id: 1, created_at: '2024-01-15T17:00:00+07:00' },
            { attendance_id: 2, user_id: 1, created_at: '2024-01-15T17:00:00+07:00' },
        ];

        pool.query.mockImplementation((sql, values, callback) => {
            callback(null, results);
        });

        moment.mockImplementation(() => ({
          tz: jest.fn().mockReturnValue({
            format: jest.fn().mockReturnValue(convertedResults[0].created_at).mockReturnValueOnce(convertedResults[0].created_at).mockReturnValue(convertedResults[1].created_at)
          })
        }));

        getAttendances(req, res);

        expect(pool.query).toHaveBeenCalledWith(
            'SELECT * FROM attendances WHERE 1=1 AND user_id = ? AND created_at >= ? AND created_at <= ?',
            [1, '2024-01-01', '2024-01-31'],
            expect.any(Function)
        );
        expect(res.json).toHaveBeenCalledWith(convertedResults);
        done();
    });

    it('should get attendances successfully with default UTC timezone', (done) => {
      req.body.timezone = undefined;
      const results = [
        { attendance_id: 1, user_id: 1, created_at: '2024-01-15T10:00:00.000Z' }
      ];
      moment.mockImplementation(() => ({
        tz: jest.fn().mockReturnValue({
          format: jest.fn().mockReturnValue("2024-01-15T10:00:00Z")
        })
      }));
      pool.query.mockImplementation((sql, values, callback) => {
        callback(null, results);
      });
      getAttendances(req, res);
      expect(res.json).toHaveBeenCalledWith([{ attendance_id: 1, user_id: 1, created_at: '2024-01-15T10:00:00Z' }]);
      done();
    })

    it('should handle database error', (done) => {
        pool.query.mockImplementation((sql, values, callback) => {
            callback(new Error('Database error'), null);
        });

        getAttendances(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
        done();
    });

    it('should handle general error', (done) => {
      pool.query.mockImplementation(() => {
        throw new Error("general error");
      });
      getAttendances(req,res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({error: 'Internal Server Error'});
      done();
    })
});