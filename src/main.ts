import { Server } from 'http';
import { app } from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { prisma } from './database/prisma';
import { initJobs } from './jobs';

let server: Server;

async function bootstrap(): Promise<void> {
  try {
    // Verify database connection
    await prisma.$connect();
    logger.info('Database connection established successfully');

    // Initialize background jobs
    initJobs();

    // Start HTTP server
    server = app.listen(env.PORT, env.HOST, () => {
      logger.info(`Server running in ${env.NODE_ENV} mode on http://${env.HOST}:${env.PORT}`);
      logger.info(`Health check available at http://${env.HOST}:${env.PORT}/health`);
      logger.info(`API endpoints mounted at http://${env.HOST}:${env.PORT}/api/v1`);
    });
  } catch (error) {
    logger.fatal({ error }, 'Failed to start application server');
    process.exit(1);
  }
}

async function gracefulShutdown(signal: string): Promise<void> {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed');

      try {
        await prisma.$disconnect();
        logger.info('Database connection closed cleanly');
        process.exit(0);
      } catch (err) {
        logger.error({ err }, 'Error during database disconnection');
        process.exit(1);
      }
    });

    // Force shutdown after timeout
    setTimeout(() => {
      logger.error('Forced shutdown due to timeout');
      process.exit(1);
    }, 10000).unref();
  } else {
    process.exit(0);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason: unknown) => {
  logger.error({ reason }, 'Unhandled Promise Rejection');
});

process.on('uncaughtException', (error: Error) => {
  logger.fatal({ error }, 'Uncaught Exception thrown. Shutting down...');
  process.exit(1);
});

bootstrap();
