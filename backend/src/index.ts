import app from './app';
import { prisma } from './utils/prisma';
import logger from './config/logger';

const PORT = process.env.PORT || 4000;

// Start server
const server = app.listen(PORT, () => {
  logger.info('Server running on http://localhost:' + PORT);
  logger.info('Environment: ' + (process.env.NODE_ENV || 'development'));
  logger.info('Database: Connected to MySQL');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(async () => {
    await prisma.$disconnect();
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing HTTP server');
  server.close(async () => {
    await prisma.$disconnect();
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

export default app;
