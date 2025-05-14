require('dotenv').config();
const express = require('express');
const cors = require('cors');
const config = require('./config/config');
const { httpLogger, logger } = require('./utils/logger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Import routes
const pdfRoutes = require('./routes/pdfRoutes');
const healthRoutes = require('./routes/healthRoutes');

// Initialize express app
const app = express();

// Apply middleware
app.use(httpLogger);
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Serve static files from public directory
app.use('/public', express.static('public'));

// API Routes
app.use('/api/pdf', pdfRoutes);
app.use('/api/health', healthRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const server = app.listen(config.server.port, () => {
  logger.info(`PDF Service is running on port ${config.server.port} in ${config.server.env} mode`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
  });
});

module.exports = app; // Export for testing
