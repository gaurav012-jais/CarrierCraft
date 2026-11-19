import { createApp } from './app.js';
import { config } from './config/env.js';
import { testConnection } from './database/connection.js';

async function bootstrap() {
  console.log('⚡ Starting CarrierCraft Server...');

  // Test Database Connectivity
  try {
    const dbTime = await testConnection();
    console.log(`✓ PostgreSQL Connected Successfully. DB Time: ${dbTime}`);
  } catch (err) {
    console.error('❌ Database Connection Failed:', err.message);
    process.exit(1);
  }

  const app = createApp();

  const server = app.listen(config.port, () => {
    console.log(`🚀 CarrierCraft Backend API is running on http://localhost:${config.port}`);
    console.log(`📡 Health Check: http://localhost:${config.port}/health`);
    console.log(`🔒 Environment: ${config.nodeEnv}`);
  });

  // Graceful Shutdown
  const shutdown = () => {
    console.log('\nShutting down gracefully...');
    server.close(() => {
      console.log('Server stopped.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

bootstrap();
