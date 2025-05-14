const fs = require('fs');
const path = require('path');
const { logger } = require('./logger');
const config = require('../config/config');

/**
 * Service to handle cleanup of old PDF files
 */
class CleanupService {
  /**
   * Delete PDF files older than the specified age
   * @param {number} maxAgeInDays - Maximum age of files to keep in days
   * @returns {Promise<Object>} - Result of the cleanup operation
   */
  async cleanupOldPdfs(maxAgeInDays = 7) {
    try {
      logger.info(`Starting cleanup of PDF files older than ${maxAgeInDays} days`);
      
      // Get the PDF directory path
      const pdfDir = path.resolve(__dirname, '../../', config.pdf.assessmentDir);
      
      // Check if directory exists
      if (!fs.existsSync(pdfDir)) {
        logger.warn(`PDF directory not found: ${pdfDir}`);
        return {
          success: false,
          message: 'PDF directory not found',
          deletedFiles: []
        };
      }
      
      // Get all files in the directory
      const files = fs.readdirSync(pdfDir);
      logger.info(`Found ${files.length} files in PDF directory`);
      
      const now = new Date();
      const maxAgeMs = maxAgeInDays * 24 * 60 * 60 * 1000;
      const deletedFiles = [];
      
      // Check each file
      for (const file of files) {
        // Only process PDF files
        if (!file.toLowerCase().endsWith('.pdf')) {
          continue;
        }
        
        const filePath = path.join(pdfDir, file);
        
        // Get file stats
        const stats = fs.statSync(filePath);
        
        // Calculate file age
        const fileAge = now - stats.mtime;
        
        // If file is older than max age, delete it
        if (fileAge > maxAgeMs) {
          logger.info(`Deleting old PDF file: ${file} (${Math.round(fileAge / (24 * 60 * 60 * 1000))} days old)`);
          fs.unlinkSync(filePath);
          deletedFiles.push(file);
        }
      }
      
      logger.info(`Cleanup completed. Deleted ${deletedFiles.length} old PDF files`);
      
      return {
        success: true,
        message: `Deleted ${deletedFiles.length} old PDF files`,
        deletedFiles
      };
    } catch (error) {
      logger.error('Error during PDF cleanup:', error);
      return {
        success: false,
        message: error.message || 'PDF cleanup failed',
        deletedFiles: []
      };
    }
  }
}

module.exports = new CleanupService();
