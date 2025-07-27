import cron from 'node-cron';
import { logger } from '../utils/logger';

export const startBackgroundJobs = (): void => {
  logger.info('Starting background jobs...');

  // Daily sync job - runs every day at 6 AM
  cron.schedule('0 6 * * *', async () => {
    logger.info('Running daily sync job');
    // Implementation will be added later
  });

  // Cleanup job - runs every Sunday at 2 AM
  cron.schedule('0 2 * * 0', async () => {
    logger.info('Running weekly cleanup job');
    // Implementation will be added later
  });

  logger.info('Background jobs started successfully');
};
