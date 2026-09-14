import env from './config/env';
import app from './app';
import { testDbConnection, pool } from './config/db';

const startServer = async (): Promise<void> => {
  try {
    console.log(`[Startup] Initializing StayCircle backend in ${env.NODE_ENV} mode...`);

    // 1. Test PostgreSQL connection
    const dbConnected = await testDbConnection();
    if (!dbConnected) {
      console.error('❌ [Startup Error] Could not establish connection to PostgreSQL. Server shutting down.');
      process.exit(1);
    }

    // 2. Start listening
    const server = app.listen(env.PORT, () => {
      console.log(`🚀 [Server] StayCircle backend is running on port ${env.PORT}`);
      console.log(`🩺 [Server] Health check: http://localhost:${env.PORT}/api/health`);
      console.log(`🔐 [Server] Auth endpoints mounted at: http://localhost:${env.PORT}/api/auth`);
    });

    // 3. Graceful shutdown
    const handleShutdown = async (signal: string) => {
      console.log(`\n[Server] Received ${signal}. Initiating graceful shutdown...`);
      server.close(async () => {
        console.log('[Server] HTTP listener closed.');
        try {
          await pool.end();
          console.log('[Database] Connection pool closed.');
          process.exit(0);
        } catch (err) {
          console.error('[Database] Error closing connection pool:', err);
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));
  } catch (error) {
    console.error('❌ [Startup Error] Unhandled exception during server boot:', error);
    process.exit(1);
  }
};

startServer();
