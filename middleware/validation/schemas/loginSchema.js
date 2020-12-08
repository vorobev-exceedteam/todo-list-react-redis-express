const Joi = require('joi');

const loginSchema = Joi.object({
  name: Joi.string().max(35).label('Username'),
  password: Joi.string().min(3).max(35).required().label('Password'),
}).options({ abortEarly: false });

module.exports = loginSchema;
