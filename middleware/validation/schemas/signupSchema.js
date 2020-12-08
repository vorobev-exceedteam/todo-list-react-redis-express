const Joi = require('joi');

const signupSchema = Joi.object({
  name: Joi.string().required().max(35).label('Username'),
  email: Joi.string().email().required().max(35).email().label('Email'),
  password: Joi.string().min(3).max(35, 'utf8').required().label('Password'),
}).options({ abortEarly: false });

module.exports = signupSchema;
