const express = require('express');
const validationHandler = require('../middleware/validation/validationHandler');
const loginValidationSchema = require('../middleware/validation/schemas/loginSchema');
const signupValidationSchema = require('../middleware/validation/schemas/signupSchema');

const router = express.Router();

const userController = require('../controllers/user.controller');

router.route('/login').post(validationHandler(loginValidationSchema, 'login'), userController.login);

router.route('/signup').post(validationHandler(signupValidationSchema, 'signup'), userController.signup);

router.post('/refresh', userController.refresh);

module.exports = router;
