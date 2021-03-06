const User = require('../models/user.model');
const statusCodes = require('../utills/statusCodes');
const createResponse = require('../utills/createResponse');
const { ValidationError, RefreshedTokenInvalid } = require('../utills/Errors');
const createTokens = require('../utills/createTokens');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

exports.signup = async (req, res, next) => {
  const path = 'signup';
  try {
    if (await User.exists({ name: req.body.name })) {
      return next(
        new ValidationError(path, [
          {
            message: `User with name ${req.body.name} already exists`,
            key: 'username',
          },
        ]),
      );
    }
    if (await User.exists({ email: req.body.email })) {
      return next(
        new ValidationError(path, [
          {
            message: `User with email ${req.body.email} already exist`,
            key: 'email',
          },
        ]),
      );
    }
    await User.create({
      name: req.body.name,
      email: req.body.email,
      passwordHash: await bcrypt.hash(req.body.password, 8),
    });
    return res.status(statusCodes.CREATED).json(createResponse('created', 'User created'));
  } catch (e) {
    next(e);
  }
};

exports.login = async (req, res, next) => {
  const path = 'login';
  try {
    const user = await User.findOne({ name: req.body.name });
    if (!user) {
      return next(
        new ValidationError(path, [
          {
            message: `User with name ${req.body.name} is not exist`,
            key: 'name',
          },
        ]),
      );
    }
    if (!(await bcrypt.compare(req.body.password, user.passwordHash))) {
      return next(new ValidationError(path, [{ message: `Password is not valid`, key: 'password' }]));
    }
    const [authToken, refreshToken] = createTokens({
      id: user._id,
      name: user.name,
      email: user.email,
      password: user.passwordHash,
    });
    return res.status(statusCodes.OK).json(
      createResponse('ok', 'Login is successful', {
        authJWT: authToken,
        refreshJWT: refreshToken,
      }),
    );
  } catch (e) {
    next(e);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const receivedToken = req.body.refreshJWT;
    if (!receivedToken) {
      return next(new RefreshedTokenInvalid());
    }
    const decoded = await jwt.verify(receivedToken, process.env.REFRESH_SECRET);
    const isTokenValid = await User.exists({
      _id: decoded.id,
      name: decoded.name,
      email: decoded.email,
      passwordHash: decoded.password,
    });
    if (!isTokenValid) {
      return next(new RefreshedTokenInvalid());
    }
    const [authToken, refreshToken] = createTokens({
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
      password: decoded.password,
    });
    return res.status(statusCodes.OK).json(
      createResponse('ok', 'Token is refreshed', {
        authJWT: authToken,
        refreshJWT: refreshToken,
      }),
    );
  } catch (e) {
    e.tokenType = 'refresh';
    next(e);
  }
};
