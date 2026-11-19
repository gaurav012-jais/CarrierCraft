import express from 'express';
import cors from 'cors';
import { registerRoutes } from './routes/index.js';
import { globalErrorHandler } from './middlewares/error.middleware.js';

export function createApp() {
  const app = express();

  // Standard Middlewares
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Health Check Endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'UP',
      service: 'CarrierCraft Backend API',
      timestamp: new Date().toISOString(),
    });
  });

  // Mount API Modules
  registerRoutes(app);

  // 404 Fallback for unknown routes
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: { message: `Route not found: ${req.method} ${req.url}` },
    });
  });

  // Global Central Error Handler
  app.use(globalErrorHandler);

  return app;
}
