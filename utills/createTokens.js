const jwt = require('jsonwebtoken');

const createTokens = (payload) => {
  const authToken = jwt.sign(payload, process.env.AUTH_SECRET, {
    expiresIn: process.env.AUTH_TOKEN_EXPIRATION_TIME,
  });
  const refreshToken = jwt.sign(payload, process.env.REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRATION_TIME,
  });
  return [authToken, refreshToken];
};

module.exports = createTokens;
