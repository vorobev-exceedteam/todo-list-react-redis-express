const statusCodes = require('./statusCodes');

class GeneralError extends Error {
  constructor(message, errorType, statusCode) {
    super();
    this.message = message;
    this.statusCode = statusCode;
    this.errorType = errorType;
  }

  prepareForSend() {
    return {
      status: 'error',
      error: {
        type: this.errorType,
        message: this.message,
      },
    };
  }
}

class BadRequest extends GeneralError {
  constructor(message) {
    super(message, 'BadRequest', statusCodes.BAD_REQUEST);
  }
}

class NotFound extends GeneralError {
  constructor(message) {
    super(message, 'NotFound', statusCodes.NOT_FOUND);
  }
}

class ValidationError extends GeneralError {
  constructor(mainPath, details) {
    super('Request is invalid', 'ValidationError', statusCodes.BAD_REQUEST);
    this.mainPath = mainPath;
    this.details = details.map((detail) => ({
      message: detail.message,
      path: this.mainPath + '/' + detail.key,
    }));
  }

  static fromJoi(mainPath, error) {
    const details = error.details.map((err) => ({
      message: err.message,
      key: err.path[0],
    }));
    return new ValidationError(mainPath, details);
  }

  prepareForSend() {
    return {
      status: 'error',
      error: {
        type: this.errorType,
        message: this.message,
        details: this.details,
      },
    };
  }
}

class InternalServerError extends GeneralError {
  constructor(message) {
    super(message, 'InternalServerError', statusCodes.INTERNAL_SERVER_ERROR);
  }
}

class UnauthorizedError extends GeneralError {
  constructor(message) {
    super(message, 'UnauthorizedError', statusCodes.UNAUTHORIZED);
  }
}

class RefreshedTokenExpired extends GeneralError {
  constructor() {
    super('Refreshed token is expired', 'RefreshedTokenExpired', statusCodes.UNAUTHORIZED);
  }
}

class AuthTokenExpired extends GeneralError {
  constructor() {
    super('Authorization token is expired', 'AuthTokenExpired', statusCodes.UNAUTHORIZED);
  }
}

class RefreshedTokenInvalid extends GeneralError {
  constructor() {
    super('Refreshed token is invalid', 'TokenInvalid', statusCodes.UNAUTHORIZED);
  }
}

class AuthTokenInvalid extends GeneralError {
  constructor() {
    super('Authorization token is invalid', 'TokenInvalid', statusCodes.UNAUTHORIZED);
  }
}

module.exports = {
  GeneralError,
  BadRequest,
  NotFound,
  ValidationError,
  InternalServerError,
  UnauthorizedError,
  RefreshedTokenInvalid,
  AuthTokenInvalid,
  RefreshedTokenExpired,
  AuthTokenExpired,
};
