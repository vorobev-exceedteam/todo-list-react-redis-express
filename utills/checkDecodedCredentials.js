const User = require('../models/user.model');

const checkDecodedCredentials = (decoded) => {
  return User.exists({
    _id: decoded.id,
    name: decoded.name,
    email: decoded.email,
    passwordHash: decoded.password,
  });
};

module.exports = checkDecodedCredentials;
