const express = require('express');
const pdfController = require('../controllers/pdfController');

const router = express.Router();

/**
 * @route GET /api/health
 * @desc Health check endpoint
 */
router.get('/', pdfController.healthCheck);

module.exports = router;
