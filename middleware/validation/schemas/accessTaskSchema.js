const Joi = require('joi');

const accessTaskSchema = Joi.object({
  id: Joi.string().required(),
}).options({ abortEarly: false });

module.exports = accessTaskSchema;
