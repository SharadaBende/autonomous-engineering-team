const request = require('supertest');
const app = require('./server');
const mysql = require('mysql');
const redis = require('redis');
const dotenv = require('dotenv');

dotenv.config();

describe('Server Setup', () => {
  it('should load environment variables', () => {
    expect(process.env.DB_HOST).toBeDefined();
    expect(process.env.DB_USER).toBeDefined();
    expect(process.env.DB_PASSWORD).toBeDefined();
    expect(process.env.DB_NAME).toBeDefined();
    expect(process.env.REDIS_HOST).toBeDefined();
    expect(process.env.REDIS_PORT).toBeDefined();
  });

  it('should create a new Express app', () => {
    expect(app).toBeInstanceOf(Object);
  });
});

describe('MySQL Connection', () => {
  let db;

  beforeEach(() => {
    db = mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
  });

  afterEach(() => {
    db.end();
  });

  it('should connect to MySQL database', (done) => {
    db.connect((err) => {
      if (err) {
        done(err);
      } else {
        expect(db.state).toBe('authenticated');
        done();
      }
    });
  });

  it('should handle MySQL connection error', (done) => {
    const wrongDb = mysql.createConnection({
      host: 'wrong-host',
      user: 'wrong-user',
      password: 'wrong-password',
      database: 'wrong-database'
    });

    wrongDb.connect((err) => {
      expect(err).toBeDefined();
      done();
    });
  });
});

describe('Redis Connection', () => {
  let redisClient;

  beforeEach(() => {
    redisClient = redis.createClient({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT
    });
  });

  afterEach(() => {
    redisClient.quit();
  });

  it('should connect to Redis', (done) => {
    redisClient.on('connect', () => {
      expect(redisClient.connected).toBe(true);
      done();
    });
  });

  it('should handle Redis connection error', (done) => {
    const wrongRedisClient = redis.createClient({
      host: 'wrong-host',
      port: 6379
    });

    wrongRedisClient.on('error', (err) => {
      expect(err).toBeDefined();
      done();
    });
  });
});

describe('API Endpoints', () => {
  it('should handle GET /api/todos', async () => {
    const response = await request(app).get('/api/todos');
    expect(response.status).toBe(200);
  });

  it('should handle POST /api/todos', async () => {
    const response = await request(app).post('/api/todos').send({ title: 'New Todo' });
    expect(response.status).toBe(200);
  });

  it('should handle PUT /api/todos/:id', async () => {
    const response = await request(app).put('/api/todos/1').send({ title: 'Updated Todo' });
    expect(response.status).toBe(200);
  });

  it('should handle DELETE /api/todos/:id', async () => {
    const response = await request(app).delete('/api/todos/1');
    expect(response.status).toBe(200);
  });
});

describe('Error Handling', () => {
  it('should handle internal server error', async () => {
    const response = await request(app).get('/api/non-existent-route');
    expect(response.status).toBe(500);
  });

  it('should handle MySQL connection error', async () => {
    const wrongDb = mysql.createConnection({
      host: 'wrong-host',
      user: 'wrong-user',
      password: 'wrong-password',
      database: 'wrong-database'
    });

    wrongDb.connect((err) => {
      expect(err).toBeDefined();
    });
  });

  it('should handle Redis connection error', async () => {
    const wrongRedisClient = redis.createClient({
      host: 'wrong-host',
      port: 6379
    });

    wrongRedisClient.on('error', (err) => {
      expect(err).toBeDefined();
    });
  });
});

describe('Edge Cases', () => {
  it('should handle empty request body', async () => {
    const response = await request(app).post('/api/todos').send({});
    expect(response.status).toBe(200);
  });

  it('should handle invalid request body', async () => {
    const response = await request(app).post('/api/todos').send('invalid-body');
    expect(response.status).toBe(400);
  });
});