const AppError = require("../utils/appError");

const devError = (err, res, next) => {
  res.status(err.statusCode).send({
    success: false,
    status: err.status,
    message: err.message,
    statusCode: err.statusCode,
    error: err,
  });
};

const prodError = (err, res) => {
  res.status(err.statusCode).send({
    success: false,
    status: err.status,
    message: err.message,
  });
};

const handlerValidationError = (err, res) => {
  res.status(400).json({
    success: false,
    message: err.message,
  });
};
const handleJWTError = (res) => {
  res.status(401).send({
    success: false,
    message: "Invalid token. Please login again",
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  if (err.isOperational) {
    if (process.env.MODE_ENV === "development") {
      devError(err, res, next);
    } else if (process.env.MODE_ENV === "production") {
      if (err.name === "ValidationError")
        return handlerValidationError(err, res);
      if (err.message === "JsonWebTokenError: invalid signature")
        return handleJWTError(res);
      prodError(err, res);
    }
  } else {
    res.status(500).json({
      success: false,
      message: "Something went really worng!",
    });
  }
};
