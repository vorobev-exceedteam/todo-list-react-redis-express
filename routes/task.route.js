const express = require('express');

const router = express.Router();

const taskController = require('../controllers/task.controller');
const verifyJWT = require('../middleware/security/verifyJWT');
const validationHandler = require('../middleware/validation/validationHandler');
const addTaskValidationSchema = require('../middleware/validation/schemas/addTaskSchema');
const accessTaskValidationSchema = require('../middleware/validation/schemas/accessTaskSchema');

router.use(verifyJWT);

router.post('/', taskController.fetchTasks);

router.route('/add').post(validationHandler(addTaskValidationSchema, 'task', 'data'), taskController.addTask);

router
  .route('/change')
  .patch(validationHandler(accessTaskValidationSchema, 'task', 'data'), taskController.changeTaskState);

router.patch('/checkAll', taskController.checkAllTasks);

router.delete('/clearCompleted', taskController.clearClearCompleted);

router.route('/').delete(validationHandler(accessTaskValidationSchema, 'task', 'data'), taskController.deleteTask);

module.exports = router;
