const pdfService = require('../services/pdfService');
const { logger } = require('../utils/logger');

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
      const { html, clientId } = req.body;

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

      if (!clientId) {
        return res.status(400).json({ 
          status: false, 
          error: "Client ID is required" 
        });
      }

      logger.info(`Received PDF generation request for client: ${clientId}`);
      
      // Generate PDF
      const pdfPath = await pdfService.createPdf(html, clientId);

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
  healthCheck(req, res) {
    res.status(200).json({ 
      status: "ok",
      service: "pdf-service",
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = new PdfController();
