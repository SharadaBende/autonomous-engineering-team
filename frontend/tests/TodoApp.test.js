const frontend = require('./frontend');

describe('Frontend Tests', () => {
  let app;

  beforeAll(() => {
    app = frontend.app;
  });

  afterAll(() => {
    app.close();
  });

  describe('Unit Tests', () => {
    it('should render index page', () => {
      const req = { url: '/' };
      const res = { send: jest.fn() };
      frontend.index(req, res);
      expect(res.send).toHaveBeenCalledTimes(1);
    });

    it('should handle 404 error', () => {
      const req = { url: '/non-existent-page' };
      const res = { send: jest.fn(), status: jest.fn().mockReturnThis() };
      frontend.notFound(req, res);
      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledTimes(1);
    });
  });

  describe('Integration Tests', () => {
    it('should get index page', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/',
      });
      expect(response.statusCode).toBe(200);
    });

    it('should get 404 error for non-existent page', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/non-existent-page',
      });
      expect(response.statusCode).toBe(404);
    });
  });

  describe('Edge Cases and Error Handling Tests', () => {
    it('should handle invalid request method', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/',
      });
      expect(response.statusCode).toBe(405);
    });

    it('should handle server error', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/error',
      });
      expect(response.statusCode).toBe(500);
    });
  });

  describe('Authentication Tests', () => {
    it('should authenticate user', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/login',
        payload: {
          username: 'test',
          password: 'test',
        },
      });
      expect(response.statusCode).toBe(200);
    });

    it('should fail to authenticate user with invalid credentials', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/login',
        payload: {
          username: 'test',
          password: 'wrong',
        },
      });
      expect(response.statusCode).toBe(401);
    });
  });
});