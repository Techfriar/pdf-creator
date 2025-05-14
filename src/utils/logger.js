const morgan = require('morgan');
const config = require('../config/config');

// Custom logging format
const logFormat = config.server.env === 'production' 
  ? 'combined' 
  : 'dev';

// Create morgan middleware
const httpLogger = morgan(logFormat);

// Logger function for application logging
const logger = {
  info: (message) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
  },
  error: (message, error) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error || '');
  },
  debug: (message) => {
    if (config.logging.level === 'debug') {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`);
    }
  },
  warn: (message) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`);
  }
};

module.exports = {
  httpLogger,
  logger
};
