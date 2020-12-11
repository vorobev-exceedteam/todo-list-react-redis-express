const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const commons = require('./commons');
const app = require('../app');
const request = require('supertest');
const statusCodes = require('../utills/statusCodes');
const Task = require('../models/task.model');

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
jest.setTimeout(60000);

let mongoServer;
opts = {
  poolSize: 10000,
  bufferMaxEntries: 0,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // useMongoClient: true,
};

beforeAll(async () => {
  mongoServer = new MongoMemoryServer();
  const mongoUri = await mongoServer.getUri();
  await mongoose.connect(mongoUri, opts, (err) => {
    if (err) console.error(err);
  });
});

describe('Task module: operations with authorized user', () => {
  test('Add task', async () => {
    const user = await commons.getUser(commons.defaultUser);
    const tokens = await commons.getTokensForUser(user);
    const response = await request(app)
      .post('/tasks/add')
      .send({ data: { name: 'test', checked: false }, authJWT: tokens[0] });
    expect(Task.exists({ userid: user.id, checked: false, name: 'test' })).toBeTruthy();
    expect(response.body.status).not.toBe('error');
    expect(response.statusCode).toBe(statusCodes.CREATED);
  });
  test('Change task state', async () => {
    await commons.clearTasks();
    const user = await commons.getUser(commons.defaultUser);
    const tokens = await commons.getTokensForUser(user);
    const taskId = (await commons.createRandomMockTasks(1, user, 'false'))[0]._id;
    const response = await request(app)
      .patch('/tasks/change')
      .send({ data: { id: taskId }, authJWT: tokens[0] });
    const task = await Task.find({ _id: taskId });
    expect(response.statusCode).toBe(statusCodes.OK);
    expect(response.body.status).not.toBe('error');
    expect(task[0].checked).toBeTruthy();
  });
  test('Get tasks', async () => {
    const user = await commons.getUser(commons.defaultUser);
    const tokens = await commons.getTokensForUser(user);
    await commons.clearTasks();
    await commons.createRandomMockTasks(10, user);
    const response = await request(app)
      .post('/tasks/')
      .send({ data: { name: 'test' }, authJWT: tokens[0] });
    expect(response.statusCode).toBe(statusCodes.OK);
    expect(response.body.status).not.toBe('error');
    await expect(commons.isAllTasksReceived(response.body.content)).toBeTruthy();
  });
  test('Delete task', async () => {
    await commons.clearTasks();
    const user = await commons.getUser(commons.defaultUser);
    const tokens = await commons.getTokensForUser(user);
    const task = (await commons.createRandomMockTasks(1, user))[0];
    const response = await request(app)
      .delete('/tasks/')
      .send({ data: { id: task._id }, authJWT: tokens[0] });
    expect(response.statusCode).toBe(statusCodes.OK);
    expect(response.body.status).not.toBe('error');
    expect(await Task.exists(task)).toBeFalsy();
  });
  test('Check all tasks', async () => {
    await commons.clearTasks();
    const user = await commons.getUser(commons.defaultUser);
    const tokens = await commons.getTokensForUser(user);
    await commons.createRandomMockTasks(10, user, 'false');
    const response = await request(app).patch('/tasks/checkAll').send({ authJWT: tokens[0] });
    expect(response.statusCode).toBe(statusCodes.OK);
    expect(response.body.status).not.toBe('error');
    expect(await commons.isAllTasksChecked(user)).toBeTruthy();
  });
  test('Delete checked tasks', async () => {
    await commons.clearTasks();
    const user = await commons.getUser(commons.defaultUser);
    const tokens = await commons.getTokensForUser(user);
    await commons.createRandomMockTasks(10, user, 'true');
    await commons.createRandomMockTasks(10, user, 'false');
    const response = await request(app).delete('/tasks/clearCompleted').send({ authJWT: tokens[0] });
    expect(response.statusCode).toBe(statusCodes.OK);
    expect(response.body.status).not.toBe('error');
    expect(await commons.isAllTasksChecked(user)).toBeFalsy();
  });
});

describe('Task module: operations with unauthorized user', () => {
  test('Add task without token', async () => {
    await commons.clearTasks();
    const response = await request(app)
      .post('/tasks/add')
      .send({ data: { name: 'test', checked: false } });
    expect(await Task.exists({ name: 'test' })).toBeFalsy();
    expect(response.body.status).toBe('error');
    expect(response.body.error.type).toBe('TokenInvalid');
    expect(response.statusCode).toBe(statusCodes.UNAUTHORIZED);
  });
  test('Get tasks without token', async () => {
    await commons.clearTasks();
    await commons.createRandomMockTasks(10);
    const response = await request(app).post('/tasks/').send({});
    expect(response.body.content).toBeUndefined();
    expect(response.body.status).toBe('error');
    expect(response.body.error.type).toBe('TokenInvalid');
    expect(response.statusCode).toBe(statusCodes.UNAUTHORIZED);
  });
  test('Delete task without token', async () => {
    await commons.clearTasks();
    const task = (await commons.createRandomMockTasks(1))[0];
    const response = await request(app)
      .delete('/tasks/')
      .send({ data: { id: task._id } });
    expect(response.statusCode).toBe(statusCodes.UNAUTHORIZED);
    expect(response.body.status).toBe('error');
    expect(response.body.error.type).toBe('TokenInvalid');
    expect(await Task.exists(task)).toBeTruthy();
  });
  test('Check all tasks without token', async () => {
    await commons.clearTasks();
    const user = await commons.getUser(commons.defaultUser);
    await commons.createRandomMockTasks(10, user, 'false');
    const response = await request(app).patch('/tasks/checkAll').send({});
    expect(response.statusCode).toBe(statusCodes.UNAUTHORIZED);
    expect(response.body.status).toBe('error');
    expect(response.body.error.type).toBe('TokenInvalid');
    expect(await commons.isAllTasksChecked(user)).toBeFalsy();
  });
  test('Delete checked tasks without token', async () => {
    await commons.clearTasks();
    const user = await commons.getUser(commons.defaultUser);
    await commons.createRandomMockTasks(10, user, 'true');
    const response = await request(app).delete('/tasks/clearCompleted').send({});
    expect(response.statusCode).toBe(statusCodes.UNAUTHORIZED);
    expect(response.body.status).toBe('error');
    expect(response.body.error.type).toBe('TokenInvalid');
    expect(await commons.isAllTasksChecked(user)).toBeTruthy();
  });
  test('Change task state without token', async () => {
    await commons.clearTasks();
    const user = await commons.getUser(commons.defaultUser);
    const taskId = (await commons.createRandomMockTasks(1, user, 'false'))[0]._id;
    const response = await request(app)
      .patch('/tasks/change')
      .send({ data: { id: taskId }, });
    const task = await Task.find({ _id: taskId });
    expect(response.statusCode).toBe(statusCodes.UNAUTHORIZED);
    expect(response.body.status).toBe('error');
    expect(response.body.error.type).toBe('TokenInvalid');
    expect(task[0].checked).toBeFalsy();
  })
  test('Add task with invalid token', async () => {
    await commons.clearTasks();
    const tokens = await commons.getTokensForUser(commons.getRandomUser());
    await commons.cleanExceptDefaultUser();
    const response = await request(app)
      .post('/tasks/add')
      .send({ data: { name: 'test', checked: false }, authJWT: tokens[0] });
    expect(await Task.exists({ name: 'test' })).toBeFalsy();
    expect(response.body.status).toBe('error');
    expect(response.body.error.type).toBe('TokenInvalid');
    expect(response.statusCode).toBe(statusCodes.UNAUTHORIZED);
  });
  test('Get tasks with invalid token', async () => {
    await commons.clearTasks();
    const user = commons.getRandomUser();
    const tokens = await commons.getTokensForUser(user);
    await commons.cleanExceptDefaultUser();
    await commons.createRandomMockTasks(10, user);
    const response = await request(app).post('/tasks/').send({ authJWT: tokens[0] });
    expect(response.body.content).toBeUndefined();
    expect(response.body.status).toBe('error');
    expect(response.body.error.type).toBe('TokenInvalid');
    expect(response.statusCode).toBe(statusCodes.UNAUTHORIZED);
  });
  test('Delete task with invalid token', async () => {
    await commons.clearTasks();
    const user = commons.getRandomUser();
    const tokens = await commons.getTokensForUser(user);
    await commons.cleanExceptDefaultUser();
    const task = (await commons.createRandomMockTasks(1, user))[0];
    const response = await request(app)
      .delete('/tasks/')
      .send({ data: { id: task._id }, authJWT: tokens[0] });
    expect(response.statusCode).toBe(statusCodes.UNAUTHORIZED);
    expect(response.body.status).toBe('error');
    expect(response.body.error.type).toBe('TokenInvalid');
    expect(await Task.exists(task)).toBeTruthy();
  });
  test('Check all tasks with invalid token', async () => {
    await commons.clearTasks();
    const user = await commons.getUser(commons.defaultUser);
    const tokens = await commons.getTokensForUser(commons.getRandomUser());
    await commons.cleanExceptDefaultUser();
    await commons.createRandomMockTasks(10, user, 'false');
    const response = await request(app).patch('/tasks/checkAll').send({ authJWT: tokens[0] });
    expect(response.statusCode).toBe(statusCodes.UNAUTHORIZED);
    expect(response.body.status).toBe('error');
    expect(response.body.error.type).toBe('TokenInvalid');
    expect(await commons.isAllTasksChecked(user)).toBeFalsy();
  });
  test('Delete checked tasks with invalid token', async () => {
    await commons.clearTasks();
    const user = await commons.getUser(commons.defaultUser);
    const tokens = await commons.getTokensForUser(commons.getRandomUser());
    await commons.cleanExceptDefaultUser();
    await commons.createRandomMockTasks(10, user, 'true');
    const response = await request(app).delete('/tasks/clearCompleted').send({ authJWT: tokens[0] });
    expect(response.statusCode).toBe(statusCodes.UNAUTHORIZED);
    expect(response.body.status).toBe('error');
    expect(response.body.error.type).toBe('TokenInvalid');
    expect(await commons.isAllTasksChecked(user)).toBeTruthy();
  });
  test('Change task state with invalid token', async () => {
    await commons.clearTasks();
    const user = await commons.getUser(commons.defaultUser);
    const tokens = await commons.getTokensForUser(commons.getRandomUser());
    await commons.cleanExceptDefaultUser();
    const taskId = (await commons.createRandomMockTasks(1, user, 'false'))[0]._id;
    const response = await request(app)
      .patch('/tasks/change')
      .send({ data: { id: taskId }, authJWT: tokens[0] });
    const task = await Task.find({ _id: taskId });
    expect(response.statusCode).toBe(statusCodes.UNAUTHORIZED);
    expect(response.body.status).toBe('error');
    expect(response.body.error.type).toBe('TokenInvalid');
    expect(task[0].checked).toBeFalsy();
  })
});

describe('Task module: operations with invalid data', () => {
  test('Add task without name', async () => {
    await commons.clearTasks();
    const user = await commons.getUser(commons.defaultUser);
    const tokens = await commons.getTokensForUser(user);
    const response = await request(app)
      .post('/tasks/add')
      .send({ data: { checked: false }, authJWT: tokens[0] });
    expect(await Task.exists({ userid: user.id, checked: false, name: 'test' })).toBeFalsy();
    expect(response.statusCode).toBe(statusCodes.BAD_REQUEST);
    expect(response.body.status).toBe('error');
    expect(response.body.error.type).toBe('ValidationError');
  });
  test('Add task without checked', async () => {
    await commons.clearTasks();
    const user = await commons.getUser(commons.defaultUser);
    const tokens = await commons.getTokensForUser(user);
    const response = await request(app)
      .post('/tasks/add')
      .send({ data: { name: 'test' }, authJWT: tokens[0] });
    expect(await Task.exists({ userid: user.id, checked: false, name: 'test' })).toBeFalsy();
    expect(response.statusCode).toBe(statusCodes.BAD_REQUEST);
    expect(response.body.status).toBe('error');
    expect(response.body.error.type).toBe('ValidationError');
  });
  test('Change state of task without id', async () => {
    await commons.clearTasks();
    const user = await commons.getUser(commons.defaultUser);
    const tokens = await commons.getTokensForUser(user);
    const taskId = (await commons.createRandomMockTasks(1, user, 'false'))[0]._id;
    const response = await request(app).patch('/tasks/change').send({ data: {}, authJWT: tokens[0] });
    const task = await Task.find({ _id: taskId });
    expect(response.statusCode).toBe(statusCodes.BAD_REQUEST);
    expect(response.body.status).toBe('error');
    expect(response.body.error.type).toBe('ValidationError');
    expect(task[0].checked).toBeFalsy();
  });
  test('Delete task without id', async () => {
    await commons.clearTasks();
    const user = await commons.getUser(commons.defaultUser);
    const tokens = await commons.getTokensForUser(user);
    const task = (await commons.createRandomMockTasks(1, user))[0];
    const response = await request(app)
      .delete('/tasks/')
      .send({ data: { }, authJWT: tokens[0] });
    expect(response.statusCode).toBe(statusCodes.BAD_REQUEST);
    expect(response.body.status).toBe('error');
    expect(response.body.error.type).toBe('ValidationError');
    expect(await Task.exists(task)).toBeTruthy();
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
