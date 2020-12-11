const statusCodes = require('../utills/statusCodes');
const { BadRequest } = require('../utills/Errors');
const Task = require('../models/task.model');
const createResponse = require('../utills/createResponse');
exports.fetchTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ userid: req.userid });
    return res.status(statusCodes.OK).json(createResponse('ok', 'Delivering tasks',
      tasks.map(task => ({
      _id: task._id,
      name: task.name,
      checked: task.checked,
    }))
    ));
  } catch (e) {
    next(e);
  }
};

exports.addTask = async (req, res, next) => {
  try {
    await Task.create({
      name: req.body.data.name,
      checked: req.body.data.checked,
      userid: req.userid,
    });
    return res.status(statusCodes.CREATED).json(createResponse('created', 'Task created'));
  } catch (e) {
    next(e);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.body.data.id);
    if (!task) {
      return next(new BadRequest(`Task by id ${req.body.data.id} is not exist`));
    }
    await Task.deleteOne(task);
    return res.status(statusCodes.OK).json(createResponse('ok', 'Task deleted'));
  } catch (e) {
    next(e);
  }
};

exports.changeTaskState = async (req, res, next) => {
  try {
    const task = await Task.findById(req.body.data.id);
    if (!task) {
      return next(new BadRequest(`Task by id ${req.body.data.id} is not exist`));
    }
    await Task.updateOne(task, { $set: { checked: !task.checked } });
    return res.status(statusCodes.OK).json(createResponse('ok', 'Task updated'));
  } catch (e) {
    next(e);
  }
};

exports.checkAllTasks = async (req, res, next) => {
  try {
    await Task.updateMany({ userid: req.userid }, { $set: { checked: true } });
    return res.status(statusCodes.OK).json(createResponse('ok', 'All task are now completed'));
  } catch (e) {
    next(e);
  }
};

exports.clearClearCompleted = async (req, res, next) => {
  try {
    await Task.deleteMany({ userid: req.userid, checked: true });
    return res.status(statusCodes.OK).json(createResponse('ok', 'All completed task are now cleared'));
  } catch (e) {
    next(e);
  }
};
