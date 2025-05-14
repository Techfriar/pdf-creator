const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const config = require("../config/config");
const { logger } = require("../utils/logger");

class PdfService {
  constructor() {
    this.assessmentDir = path.resolve(
      __dirname,
      "../../",
      config.pdf.assessmentDir
    );

    // Ensure directory exists
    this._ensureDirectoryExists(this.assessmentDir);
  }

  /**
   * Ensure a directory exists, create it if it doesn't
   * @param {string} dirPath - Directory path to check/create
   * @private
   */
  _ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
      logger.debug(`Creating directory: ${dirPath}`);
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  /**
   * Create a PDF document from HTML content
   * @param {string|Object} htmlContent - HTML content to convert to PDF. Can be a string or an object with header, body, and footer properties
   * @returns {Promise<string>} - Path to the generated PDF file
   */
  async createPdf(htmlContent) {
    try {
      logger.info('Starting PDF generation');

      // Launch browser with additional arguments for Docker environment
      const browser = await puppeteer.launch({
        headless: true,
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--disable-software-rasterizer"
        ],
      });

      const page = await browser.newPage();
      logger.debug("Browser page created");

      // Determine if htmlContent is a string or an object
      let content;
      let headerTemplate = " "; // Default empty header
      let footerTemplate = ""; // Default footer
      let margins = {
        top: "0px", // Default: no header space
        bottom: "60px", // Default: leave space for footer
      };

      if (typeof htmlContent === "object") {
        // If htmlContent is an object, construct the full HTML
        content = htmlContent.body; // Body is required (validated in controller)

        // If header is provided, use it as headerTemplate
        if (htmlContent.header) {
          headerTemplate = htmlContent.header;
          // Add top margin for header
          margins.top = "50px";
        }

        // If footer is provided, use it as footerTemplate
        if (htmlContent.footer) {
          footerTemplate = htmlContent.footer;
        }
      } else {
        // If htmlContent is a string, use it directly
        content = htmlContent;
      }

      await page.setContent(content);
      logger.debug("HTML content set");

      // Ensure output directory exists
      const publicDir = path.resolve(__dirname, "../../", this.assessmentDir);
      this._ensureDirectoryExists(publicDir);

      // Generate timestamp for the file name
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      
      // Generate filename
      const filename = `Assessment_${timestamp}.pdf`;
      
      // Set PDF file path with timestamp instead of clientId
      const pdfPath = path.join(publicDir, filename);
      logger.debug(`PDF will be saved to: ${pdfPath}`);

      // Generate PDF
      await page.pdf({
        path: pdfPath,
        format: "A4",
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: headerTemplate,
        footerTemplate: footerTemplate,
        margin: margins,
      });

      await browser.close();
      logger.info(`PDF generated successfully: ${pdfPath}`);

      // Return URL path instead of file system path
      // Extract the path after 'public/' if it exists in the assessmentDir
      const pathWithoutPublic = config.pdf.assessmentDir.replace(/^public\//, '');
      const relativePath = `/public/${pathWithoutPublic}/${filename}`;
      
      // Construct full URL with base URL from config
      const fullUrl = new URL(relativePath, config.server.baseUrl).toString();
      logger.info(`PDF URL path: ${fullUrl}`);
      return fullUrl;
    } catch (error) {
      logger.error("PDF generation error:", error);
      throw new Error("PDF generation failed.");
    }
  }

  /**
   * Delete a PDF file by filename
   * @param {string} filename - Name of the PDF file to delete
   * @returns {Promise<Object>} - Result of the deletion operation
   */
  async deletePdf(filename) {
    try {
      logger.info(`Attempting to delete PDF: ${filename}`);
      
      // Validate filename to prevent directory traversal attacks
      if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        logger.warn(`Invalid filename provided for deletion: ${filename}`);
        return {
          success: false,
          message: "Invalid filename provided"
        };
      }

      // Get the full path to the PDF file
      const publicDir = path.resolve(__dirname, "../../", this.assessmentDir);
      const pdfPath = path.join(publicDir, filename);
      
      // Check if the file exists
      if (!fs.existsSync(pdfPath)) {
        logger.warn(`PDF file not found: ${pdfPath}`);
        return {
          success: false,
          message: "PDF file not found"
        };
      }

      // Delete the file
      fs.unlinkSync(pdfPath);
      logger.info(`PDF deleted successfully: ${pdfPath}`);
      
      return {
        success: true,
        message: "PDF deleted successfully"
      };
    } catch (error) {
      logger.error("PDF deletion error:", error);
      return {
        success: false,
        message: error.message || "PDF deletion failed"
      };
    }
  }
}

module.exports = new PdfService();
