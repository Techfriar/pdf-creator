const pdfService = require('../services/pdfService');
const { logger } = require('../utils/logger');
const fs = require('fs');

/**
 * Controller for PDF generation operations
 */
class PdfController {
  /**
   * Generate a PDF from HTML content
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async generatePdf(req, res, next) {
    try {
      const { html } = req.body;

      // Validate required fields
      if (!html) {
        return res.status(400).json({ 
          status: false, 
          error: "HTML content is required" 
        });
      }

      // Check if html is a string or an object
      if (typeof html === 'object') {
        // If html is an object, validate it has at least a body property
        if (!html.body) {
          return res.status(400).json({
            status: false,
            error: "HTML body content is required when using object format"
          });
        }
      }

      logger.info('Received PDF generation request');
      
      // Generate PDF with timestamp instead of clientId
      const pdfPath = await pdfService.createPdf(html);

      // Return success response
      res.status(200).json({
        status: true,
        pdfPath: pdfPath,
        message: "PDF generated successfully",
      });
    } catch (error) {
      logger.error("Error in PDF generation controller:", error);
      next(error);
    }
  }

  /**
   * Health check endpoint handler
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async healthCheck(req, res) {
    try {
      // Simple HTML content for testing PDF generation
      const testHtml = '<html><body><h1>Health Check PDF Test</h1><p>This is a test PDF generated during health check.</p></body></html>';
      
      // Generate a test PDF
      const pdfPath = await pdfService.createPdf(testHtml);
      
      // Check if the generated file exists
      const fileExists = fs.existsSync(pdfPath);
      
      res.status(200).json({ 
        status: "ok",
        service: "pdf-service",
        timestamp: new Date().toISOString(),
        pdfTest: {
          generated: true,
          path: pdfPath,
          exists: fileExists
        }
      });
    } catch (error) {
      logger.error('Error in health check:', error);
      res.status(500).json({
        status: "error",
        service: "pdf-service",
        timestamp: new Date().toISOString(),
        error: error.message,
        pdfTest: {
          generated: false
        }
      });
    }
  }
}

module.exports = new PdfController();
