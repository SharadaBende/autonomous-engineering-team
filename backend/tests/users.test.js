const request = require('supertest');
const app = require('../app');
const db = require('../routes/users').db;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql');
const redis = require('redis');

describe('User Routes', () => {
  beforeEach((done) => {
    db.connect((err) => {
      if (err) {
        console.error('error connecting:', err);
        return;
      }
      console.log('connected as id ' + db.threadId);
      done();
    });
  });

  afterEach((done) => {
    db.query('DELETE FROM users', (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log('Users deleted');
      done();
    });
  });

  describe('POST /register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/users/register')
        .send({ name: 'John Doe', email: 'john@example.com', password: 'password123' });
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('User registered successfully');
    });

    it('should return 400 if user already exists', async () => {
      await request(app)
        .post('/users/register')
        .send({ name: 'John Doe', email: 'john@example.com', password: 'password123' });
      const response = await request(app)
        .post('/users/register')
        .send({ name: 'John Doe', email: 'john@example.com', password: 'password123' });
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('User already exists');
    });

    it('should return 500 if database error occurs', async () => {
      jest.spyOn(db, 'query').mockImplementation((query, params, callback) => {
        callback(new Error('Database error'));
      });
      const response = await request(app)
        .post('/users/register')
        .send({ name: 'John Doe', email: 'john@example.com', password: 'password123' });
      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Error registering user');
    });
  });

  describe('POST /login', () => {
    it('should login a user', async () => {
      await request(app)
        .post('/users/register')
        .send({ name: 'John Doe', email: 'john@example.com', password: 'password123' });
      const response = await request(app)
        .post('/users/login')
        .send({ email: 'john@example.com', password: 'password123' });
      expect(response.status).toBe(200);
    });

    it('should return 401 if user does not exist', async () => {
      const response = await request(app)
        .post('/users/login')
        .send({ email: 'john@example.com', password: 'password123' });
      expect(response.status).toBe(401);
    });

    it('should return 500 if database error occurs', async () => {
      jest.spyOn(db, 'query').mockImplementation((query, params, callback) => {
        callback(new Error('Database error'));
      });
      const response = await request(app)
        .post('/users/login')
        .send({ email: 'john@example.com', password: 'password123' });
      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Error logging in user');
    });
  });
});