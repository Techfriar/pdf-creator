const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const config = require("../config/config");
const { logger } = require("../utils/logger");

class PdfService {
  constructor() {
    this.outputDir = path.resolve(__dirname, "../../", config.pdf.outputDir);
    this.assessmentDir = path.resolve(
      __dirname,
      "../../",
      config.pdf.assessmentDir
    );

    // Ensure directories exist
    this._ensureDirectoryExists(this.outputDir);
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
   * @param {string} clientId - Client identifier for the PDF
   * @returns {Promise<string>} - Path to the generated PDF file
   */
  async createPdf(htmlContent, clientId) {
    try {
      logger.info(`Starting PDF generation for client: ${clientId}`);

      // Launch browser
      const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
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

      // Set PDF file path
      const pdfPath = path.join(publicDir, `Assessment_${clientId}.pdf`);
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

      // Return PDF path
      return pdfPath;
    } catch (error) {
      logger.error("PDF generation error:", error);
      throw new Error("PDF generation failed.");
    }
  }
}

module.exports = new PdfService();
