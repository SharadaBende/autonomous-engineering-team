const request = require('supertest');
const app = require('../app');
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');
const Task = require('../models/Task');

describe('Task Controller Unit Tests', () => {
  beforeEach(async () => {
    await Task.deleteMany({});
  });

  afterEach(async () => {
    await Task.deleteMany({});
  });

  it('should get all tasks', async () => {
    const userId = '12345';
    const tasks = [{ title: 'Task 1', description: 'Description 1' }, { title: 'Task 2', description: 'Description 2' }];
    jest.spyOn(taskController, 'getAllTasks').mockResolvedValue(tasks);
    const result = await taskController.getAllTasks(userId);
    expect(result).toEqual(tasks);
  });

  it('should get task by id', async () => {
    const taskId = '12345';
    const userId = '12345';
    const task = { title: 'Task 1', description: 'Description 1' };
    jest.spyOn(taskController, 'getTaskById').mockResolvedValue(task);
    const result = await taskController.getTaskById(taskId, userId);
    expect(result).toEqual(task);
  });

  it('should create new task', async () => {
    const taskData = { title: 'Task 1', description: 'Description 1' };
    const userId = '12345';
    const newTask = { title: 'Task 1', description: 'Description 1', id: '12345' };
    jest.spyOn(taskController, 'createTask').mockResolvedValue(newTask);
    const result = await taskController.createTask(taskData, userId);
    expect(result).toEqual(newTask);
  });

  it('should update task', async () => {
    const taskId = '12345';
    const userId = '12345';
    const taskData = { title: 'Task 1 updated', description: 'Description 1 updated' };
    const updatedTask = { title: 'Task 1 updated', description: 'Description 1 updated', id: '12345' };
    jest.spyOn(taskController, 'updateTask').mockResolvedValue(updatedTask);
    const result = await taskController.updateTask(taskId, taskData, userId);
    expect(result).toEqual(updatedTask);
  });

  it('should delete task', async () => {
    const taskId = '12345';
    const userId = '12345';
    jest.spyOn(taskController, 'deleteTask').mockResolvedValue();
    await taskController.deleteTask(taskId, userId);
    expect(taskController.deleteTask).toHaveBeenCalledTimes(1);
  });
});

describe('Task API Endpoints Integration Tests', () => {
  beforeEach(async () => {
    await Task.deleteMany({});
  });

  afterEach(async () => {
    await Task.deleteMany({});
  });

  it('should get all tasks', async () => {
    const userId = '12345';
    const tasks = [{ title: 'Task 1', description: 'Description 1' }, { title: 'Task 2', description: 'Description 2' }];
    const token = 'Bearer token';
    const response = await request(app)
      .get('/tasks')
      .set("Authorization", token)
      .expect(200);
    expect(response.body).toEqual(tasks);
  });

  it('should get task by id', async () => {
    const taskId = '12345';
    const userId = '12345';
    const task = { title: 'Task 1', description: 'Description 1' };
    const token = 'Bearer token';
    const response = await request(app)
      .get(`/tasks/${taskId}`)
      .set("Authorization", token)
      .expect(200);
    expect(response.body).toEqual(task);
  });

  it('should create new task', async () => {
    const taskData = { title: 'Task 1', description: 'Description 1' };
    const userId = '12345';
    const newTask = { title: 'Task 1', description: 'Description 1', id: '12345' };
    const token = 'Bearer token';
    const response = await request(app)
      .post('/tasks')
      .set("Authorization", token)
      .send(taskData)
      .expect(201);
    expect(response.body).toEqual(newTask);
  });

  it('should update task', async () => {
    const taskId = '12345';
    const userId = '12345';
    const taskData = { title: 'Task 1 updated', description: 'Description 1 updated' };
    const updatedTask = { title: 'Task 1 updated', description: 'Description 1 updated', id: '12345' };
    const token = 'Bearer token';
    const response = await request(app)
      .put(`/tasks/${taskId}`)
      .set("Authorization", token)
      .send(taskData)
      .expect(200);
    expect(response.body).toEqual(updatedTask);
  });

  it('should delete task', async () => {
    const taskId = '12345';
    const userId = '12345';
    const token = 'Bearer token';
    const response = await request(app)
      .delete(`/tasks/${taskId}`)
      .set("Authorization", token)
      .expect(204);
    expect(response.body).toEqual({});
  });
});

describe('Task API Endpoints Edge Cases and Error Handling Tests', () => {
  beforeEach(async () => {
    await Task.deleteMany({});
  });

  afterEach(async () => {
    await Task.deleteMany({});
  });

  it('should return 404 when task not found', async () => {
    const taskId = '12345';
    const userId = '12345';
    const token = 'Bearer token';
    const response = await request(app)
      .get(`/tasks/${taskId}`)
      .set("Authorization", token)
      .expect(404);
    expect(response.body.message).toBe('Task not found');
  });

  it('should return 500 when error occurs', async () => {
    const taskId = '12345';
    const userId = '12345';
    const token = 'Bearer token';
    jest.spyOn(taskController, 'getTaskById').mockRejectedValue(new Error('Error occurred'));
    const response = await request(app)
      .get(`/tasks/${taskId}`)
      .set("Authorization", token)
      .expect(500);
    expect(response.body.message).toBe('Failed to retrieve task');
  });

  it('should return 401 when authentication fails', async () => {
    const taskId = '12345';
    const response = await request(app)
      .get(`/tasks/${taskId}`)
      .expect(401);
    expect(response.body.message).toBe('Unauthorized');
  });
});

describe('Task API Endpoints Authentication Tests', () => {
  beforeEach(async () => {
    await Task.deleteMany({});
  });

  afterEach(async () => {
    await Task.deleteMany({});
  });

  it('should authenticate successfully', async () => {
    const token = 'Bearer token';
    const response = await request(app)
      .get('/tasks')
      .set("Authorization", token)
      .expect(200);
    expect(response.body).not.toBeNull();
  });

  it('should fail authentication when token is missing', async () => {
    const response = await request(app)
      .get('/tasks')
      .expect(401);
    expect(response.body.message).toBe('Unauthorized');
  });

  it('should fail authentication when token is invalid', async () => {
    const token = 'Invalid token';
    const response = await request(app)
      .get('/tasks')
      .set("Authorization", token)
      .expect(401);
    expect(response.body.message).toBe('Unauthorized');
  });
});