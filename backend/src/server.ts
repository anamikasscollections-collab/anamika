import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import apiRoutes from './routes';
import { globalRateLimiter } from './middlewares/rateLimiter.middleware';
import { errorHandler } from './middlewares/errorHandler.middleware';
import { logger } from './utils/logger';

const app = express();

// Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows flexible CDN assets for imagery
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests or any localhost/127.0.0.1 port (5173, 5174, 5175, etc.)
      if (!origin || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) || origin === env.CLIENT_URL) {
        return callback(null, true);
      }
      return callback(null, true); // Dev-friendly fallback
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-guest-session-id', 'x-razorpay-signature'],
  })
);

// Capture raw body for Razorpay Webhook HMAC verification
app.use(
  express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Global Rate Limiting
app.use(globalRateLimiter);

// Root informational endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({
    brand: 'ANAMIKA COLLECTIONS',
    tagline: 'Elegance in Every Thread',
    service: 'Luxury Sarees & Kurtis E-Commerce API',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

// Mount modular API
app.use('/api', apiRoutes);

// 404 Route Handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found on ANAMIKA COLLECTIONS server.`,
  });
});

// Central Error Handler
app.use(errorHandler);

const PORT = parseInt(env.PORT, 10) || 5000;

if (!process.env.VERCEL) {
  const server = app.listen(PORT, () => {
    logger.info(`✨ ANAMIKA COLLECTIONS backend server running on port ${PORT}`);
    logger.info(`✨ Environment: ${env.NODE_ENV}`);
    logger.info(`✨ API Base: http://localhost:${PORT}/api`);
  });

  // Process signal handlers
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Gracefully shutting down server...');
    server.close(() => {
      logger.info('Process terminated.');
    });
  });
}

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection at:', promise, 'reason:', reason);
});

export default app;

