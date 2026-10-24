function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  const statusCode = Number.isInteger(error.statusCode)
    && error.statusCode >= 400
    && error.statusCode < 600
    ? error.statusCode
    : 500;
  const message = statusCode >= 500
    ? 'Internal server error'
    : error.message || 'Request failed';

  res.status(statusCode).json({
    error: {
      message,
    },
  });
}

module.exports = errorHandler;
