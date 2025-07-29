/**
 * Error handling middleware for Express
 * Prevents sensitive information leakage and provides consistent error responses
 */

const errorHandler = (err, req, res, next) => {
  // Log the full error for debugging (server-side only)
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Don't send sensitive error details to the client
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (isDevelopment) {
    // In development
    return res.status(err.status || 500).json({
      error: {
        message: err.message,
        stack: err.stack
      }
    });
  }

  // In production (for future use)
  const statusCode = err.status || 500;
  let message = 'Internal Server Error';

  // Provide specific messages for common errors
  if (err.name === 'ValidationError') {
    message = 'Validation failed';
  } else if (err.name === 'CastError') {
    message = 'Invalid data format';
  } else if (err.code === 11000) {
    message = 'Duplicate entry found';
  } else if (err.status === 404) {
    message = 'Resource not found';
  } else if (err.status === 401) {
    message = 'Unauthorized';
  } else if (err.status === 403) {
    message = 'Forbidden';
  }

  res.status(statusCode).json({
    error: {
      message: message
    }
  });
};

module.exports = errorHandler; 