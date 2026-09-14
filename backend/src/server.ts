import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { testDbConnection } from './config/db';

const PORT = parseInt(process.env.PORT || '5000', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';

const startServer = async (): Promise<void> => {
  // Test PostgreSQL connection
  await testDbConnection();

  app.listen(PORT, () => {
    console.log(`[Server] StayCircle backend running in ${NODE_ENV} mode on port ${PORT}`);
    console.log(`[Server] Health check endpoint: http://localhost:${PORT}/api/health`);
  });
};

startServer();
