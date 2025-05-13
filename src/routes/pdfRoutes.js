const express = require('express');
const pdfController = require('../controllers/pdfController');

const router = express.Router();

/**
 * @route POST /api/pdf/generate
 * @desc Generate a PDF from HTML content
 */
router.post('/generate', pdfController.generatePdf);

module.exports = router;
