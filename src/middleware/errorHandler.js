const { logger } = require('../utils/logger');

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  
  // Log the error
  logger.error(`${statusCode} - ${err.message}`, err.stack);
  
  // Send error response
  res.status(statusCode).json({
    status: false,
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Not found middleware
const notFoundHandler = (req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`);
  
  res.status(404).json({
    status: false,
    error: 'Resource not found'
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};
