import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env';
import { logger } from './config/logger';
import { requestId } from './shared/middlewares/request-id';
import { globalRateLimiter } from './shared/middlewares/rate-limit';
import { errorHandler } from './shared/middlewares/error-handler';
import { NotFoundError } from './shared/errors/http-errors';
import { appRouter } from './routes';

export function createApp(): Application {
  const app = express();

  // Trust proxy for reverse proxies (nginx, AWS ALB, etc.)
  app.set('trust proxy', 1);

  // Security middlewares
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(','),
      credentials: true,
    }),
  );

  // Body parsing middlewares
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Tracing and rate limiting
  app.use(requestId);
  app.use(globalRateLimiter);

  // HTTP Request logger
  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.info(
        {
          requestId: req.requestId,
          method: req.method,
          url: req.originalUrl,
          statusCode: res.statusCode,
          duration: `${duration}ms`,
        },
        'Incoming HTTP Request',
      );
    });
    next();
  });

  // Mount application routes
  app.use(appRouter);

  // 404 Catch-all handler
  app.use((req: Request, _res: Response, next: NextFunction) => {
    next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`));
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
}

export const app = createApp();
export default app;
