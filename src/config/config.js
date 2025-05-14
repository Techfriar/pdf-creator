require('dotenv').config();

module.exports = {
  server: {
    port: process.env.PORT || 3001,
    env: process.env.NODE_ENV || 'development',
    baseUrl: process.env.BASE_URL || `http://localhost:${process.env.PORT || 3001}`,
  },
  pdf: {
    assessmentDir: process.env.PDF_ASSESSMENT_DIR || 'public/assessments',
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  }
};
