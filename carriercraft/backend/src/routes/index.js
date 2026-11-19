import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import usersRoutes from '../modules/users/users.routes.js';
import marketsRoutes from '../modules/markets/markets.routes.js';
import campaignsRoutes from '../modules/campaigns/campaigns.routes.js';
import templatesRoutes from '../modules/templates/templates.routes.js';
import partnersRoutes from '../modules/partners/partners.routes.js';
import flowRoutes from '../modules/flow/flow.routes.js';
import otpRoutes from '../modules/otp/otp.routes.js';
import analyticsRoutes from '../modules/analytics/analytics.routes.js';
import postbacksRoutes from '../modules/postbacks/postbacks.routes.js';

export function registerRoutes(app) {
  // Public Funnel & Subscription Runtime Endpoints
  app.use('/api/flow', flowRoutes);
  app.use('/api/otp', otpRoutes);

  // Admin Management Endpoints
  app.use('/api/auth', authRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/markets', marketsRoutes);
  app.use('/api/campaigns', campaignsRoutes);
  app.use('/api/templates', templatesRoutes);
  app.use('/api/partners', partnersRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/postbacks', postbacksRoutes);
}
