require('dotenv').config();

module.exports = {
  server: {
    port: process.env.PORT || 3001,
    env: process.env.NODE_ENV || 'development',
  },
  pdf: {
    assessmentDir: process.env.PDF_ASSESSMENT_DIR || 'public/assessments',
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  }
};
