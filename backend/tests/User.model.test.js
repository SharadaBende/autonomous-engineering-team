const User = require('./User');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/db');

describe('User model', () => {
  let user;
  let email;
  let password;

  beforeEach(async () => {
    await pool.execute('DELETE FROM users');
    email = 'test@example.com';
    password = 'password123';
    user = new User();
  });

  afterEach(async () => {
    await pool.execute('DELETE FROM users');
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const result = await user.create('John Doe', email, password);
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name', 'John Doe');
      expect(result).toHaveProperty('email', email);
    });

    it('should throw an error if email is already taken', async () => {
      await user.create('John Doe', email, password);
      await expect(user.create('Jane Doe', email, password)).rejects.toThrowError('Failed to create user');
    });

    it('should throw an error if password is empty', async () => {
      await expect(user.create('John Doe', email, '')).rejects.toThrowError('Failed to create user');
    });

    it('should throw an error if name is empty', async () => {
      await expect(user.create('', email, password)).rejects.toThrowError('Failed to create user');
    });

    it('should throw an error if email is empty', async () => {
      await expect(user.create('John Doe', '', password)).rejects.toThrowError('Failed to create user');
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      await user.create('John Doe', email, password);
      const result = await user.findByEmail(email);
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name', 'John Doe');
      expect(result).toHaveProperty('email', email);
    });

    it('should return null if user is not found', async () => {
      const result = await user.findByEmail('non-existent@example.com');
      expect(result).toBeUndefined();
    });

    it('should throw an error if email is empty', async () => {
      await expect(user.findByEmail('')).rejects.toThrowError('Failed to find user');
    });
  });

  describe('verifyPassword', () => {
    it('should verify a user\'s password', async () => {
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await user.verifyPassword(password, hashedPassword);
      expect(result).toBe(true);
    });

    it('should return false if password is incorrect', async () => {
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await user.verifyPassword('wrongpassword', hashedPassword);
      expect(result).toBe(false);
    });

    it('should throw an error if password is empty', async () => {
      const hashedPassword = await bcrypt.hash(password, 10);
      await expect(user.verifyPassword('', hashedPassword)).rejects.toThrowError('Failed to verify password');
    });

    it('should throw an error if hashed password is empty', async () => {
      await expect(user.verifyPassword(password, '')).rejects.toThrowError('Failed to verify password');
    });
  });
});