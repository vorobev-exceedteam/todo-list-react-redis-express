const Joi = require('joi');

const addTaskSchema = Joi.object({
  name: Joi.string().max(35, 'utf8').required().label('Task name'),
  checked: Joi.boolean().required(),
}).options({ abortEarly: false });

module.exports = addTaskSchema;
