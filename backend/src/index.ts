import express, { Request, Response } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { prisma } from './utils/prisma';

// Import logger and middleware
import logger, { morganStream } from './config/logger';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

// Import routes
import authRoutes from './routes/auth.routes';
import brandsRoutes from './routes/brands.routes';
import turntablesRoutes from './routes/turntables.routes';
import tonearmsRoutes from './routes/tonearms.routes';
import cartridgesRoutes from './routes/cartridges.routes';
import sutsRoutes from './routes/suts.routes';
import phonoPreampsRoutes from './routes/phonopreamps.routes';
import uploadRoutes from './routes/upload.routes';
import matcherRoutes from './routes/matcher.routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP request logger
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, { stream: morganStream }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Static files (uploads)
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'Vintage Audio API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/brands', brandsRoutes);
app.use('/api/turntables', turntablesRoutes);
app.use('/api/tonearms', tonearmsRoutes);
app.use('/api/cartridges', cartridgesRoutes);
app.use('/api/suts', sutsRoutes);
app.use('/api/phono-preamps', phonoPreampsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/matcher', matcherRoutes);

// API root
app.get('/api', (req: Request, res: Response) => {
  res.json({
    message: 'Vintage Audio Search & Match API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      brands: '/api/brands',
      turntables: '/api/turntables',
      tonearms: '/api/tonearms',
      cartridges: '/api/cartridges',
      suts: '/api/suts',
      phonoPreamps: '/api/phono-preamps',
      upload: '/api/upload',
      matcher: '/api/matcher',
    }
  });
});

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Global error handler - must be last
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`💾 Database: Connected to PostgreSQL`);
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
