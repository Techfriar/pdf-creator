const cron = require('node-cron');
const cleanupService = require('../utils/cleanupService');
const { logger } = require('../utils/logger');

/**
 * Initialize cron jobs for the application
 */
class CleanupCron {
  /**
   * Start the PDF cleanup cron job
   * @param {string} schedule - Cron schedule expression (default: run once a day at midnight)
   * @param {number} maxAgeInDays - Maximum age of files to keep in days (default: 7 days)
   */
  startCleanupJob(schedule = '0 0 * * *', maxAgeInDays = 7) {
    logger.info(`Starting PDF cleanup cron job with schedule: ${schedule}`);
    
    // Schedule the cron job
    cron.schedule(schedule, async () => {
      logger.info('Running scheduled PDF cleanup job');
      try {
        const result = await cleanupService.cleanupOldPdfs(maxAgeInDays);
        if (result.success) {
          logger.info(`Cleanup job completed successfully: ${result.message}`);
          if (result.deletedFiles.length > 0) {
            logger.debug(`Deleted files: ${result.deletedFiles.join(', ')}`);
          }
        } else {
          logger.warn(`Cleanup job completed with warnings: ${result.message}`);
        }
      } catch (error) {
        logger.error('Error running cleanup cron job:', error);
      }
    });
    
    logger.info(`PDF cleanup cron job scheduled successfully. Will clean up PDFs older than ${maxAgeInDays} days`);
  }
  
  /**
   * Run a manual cleanup immediately
   * @param {number} maxAgeInDays - Maximum age of files to keep in days
   * @returns {Promise<Object>} - Result of the cleanup operation
   */
  async runManualCleanup(maxAgeInDays = 7) {
    logger.info(`Running manual PDF cleanup for files older than ${maxAgeInDays} days`);
    return await cleanupService.cleanupOldPdfs(maxAgeInDays);
  }
}

module.exports = new CleanupCron();
