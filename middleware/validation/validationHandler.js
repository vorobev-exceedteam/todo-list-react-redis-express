const { ValidationError } = require('../../utills/Errors');


const validationHandler = (schema, path, key) => async (req, res, next) => {
  try {
    let data
    if (key) {
      data = req.body[key];
    }
    else {
      data = req.body;
    }
    const { error } = await schema.validate(data);
    if (error) {
      return next(ValidationError.fromJoi(path, error));
    }
    next();
  }
  catch (e) {
    next(e);
  }
}

module.exports = validationHandler;
