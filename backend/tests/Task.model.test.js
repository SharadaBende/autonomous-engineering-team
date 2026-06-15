const mysql = require('mysql2/promise');
const dbConfig = require('../config/dbConfig');
const logger = require('../utils/logger');
const Task = require('../models/Task');

describe('Task Model', () => {
  let taskModel;

  beforeEach(async () => {
    taskModel = new Task();
  });

  afterEach(async () => {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute('DELETE FROM tasks');
    await connection.end();
  });

  describe('createTask', () => {
    it('should create a new task', async () => {
      const task = { title: 'Test Task', description: 'Test Description', completed: false };
      const createdTask = await taskModel.createTask(task);
      expect(createdTask).toHaveProperty('id');
      expect(createdTask.title).toBe(task.title);
      expect(createdTask.description).toBe(task.description);
      expect(createdTask.completed).toBe(task.completed);
    });

    it('should throw an error if task is missing required properties', async () => {
      const task = { description: 'Test Description', completed: false };
      await expect(taskModel.createTask(task)).rejects.toThrow();
    });

    it('should throw an error if database connection fails', async () => {
      jest.spyOn(mysql, 'createConnection').mockRejectedValue(new Error('Database connection failed'));
      const task = { title: 'Test Task', description: 'Test Description', completed: false };
      await expect(taskModel.createTask(task)).rejects.toThrow();
    });
  });

  describe('getAllTasks', () => {
    it('should return an array of tasks', async () => {
      const task1 = { title: 'Test Task 1', description: 'Test Description 1', completed: false };
      const task2 = { title: 'Test Task 2', description: 'Test Description 2', completed: false };
      await taskModel.createTask(task1);
      await taskModel.createTask(task2);
      const tasks = await taskModel.getAllTasks();
      expect(tasks).toBeInstanceOf(Array);
      expect(tasks.length).toBe(2);
    });

    it('should return an empty array if no tasks exist', async () => {
      const tasks = await taskModel.getAllTasks();
      expect(tasks).toBeInstanceOf(Array);
      expect(tasks.length).toBe(0);
    });

    it('should throw an error if database connection fails', async () => {
      jest.spyOn(mysql, 'createConnection').mockRejectedValue(new Error('Database connection failed'));
      await expect(taskModel.getAllTasks()).rejects.toThrow();
    });
  });

  describe('getTaskById', () => {
    it('should return a task by id', async () => {
      const task = { title: 'Test Task', description: 'Test Description', completed: false };
      const createdTask = await taskModel.createTask(task);
      const retrievedTask = await taskModel.getTaskById(createdTask.id);
      expect(retrievedTask).toHaveProperty('id');
      expect(retrievedTask.title).toBe(task.title);
      expect(retrievedTask.description).toBe(task.description);
      expect(retrievedTask.completed).toBe(task.completed);
    });

    it('should return null if task does not exist', async () => {
      const task = await taskModel.getTaskById(1);
      expect(task).toBeUndefined();
    });

    it('should throw an error if database connection fails', async () => {
      jest.spyOn(mysql, 'createConnection').mockRejectedValue(new Error('Database connection failed'));
      await expect(taskModel.getTaskById(1)).rejects.toThrow();
    });
  });

  describe('updateTask', () => {
    it('should update a task', async () => {
      const task = { title: 'Test Task', description: 'Test Description', completed: false };
      const createdTask = await taskModel.createTask(task);
      const updatedTask = { title: 'Updated Task', description: 'Updated Description', completed: true };
      await taskModel.updateTask(createdTask.id, updatedTask);
      const retrievedTask = await taskModel.getTaskById(createdTask.id);
      expect(retrievedTask.title).toBe(updatedTask.title);
      expect(retrievedTask.description).toBe(updatedTask.description);
      expect(retrievedTask.completed).toBe(updatedTask.completed);
    });

    it('should throw an error if task does not exist', async () => {
      const updatedTask = { title: 'Updated Task', description: 'Updated Description', completed: true };
      await expect(taskModel.updateTask(1, updatedTask)).rejects.toThrow();
    });

    it('should throw an error if database connection fails', async () => {
      jest.spyOn(mysql, 'createConnection').mockRejectedValue(new Error('Database connection failed'));
      const task = { title: 'Test Task', description: 'Test Description', completed: false };
      const createdTask = await taskModel.createTask(task);
      const updatedTask = { title: 'Updated Task', description: 'Updated Description', completed: true };
      await expect(taskModel.updateTask(createdTask.id, updatedTask)).rejects.toThrow();
    });
  });
});