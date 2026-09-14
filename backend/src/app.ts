import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import env from './config/env';
import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import pgRoutes from './routes/pg.routes';
import roomRoutes from './routes/room.routes';
import studentRoutes from './routes/student.routes';
import joinRequestRoutes from './routes/joinRequest.routes';
import notFound from './middleware/notFound';
import errorHandler from './middleware/errorHandler';

const app: Application = express();

// 1. Security Headers
app.use(helmet());

// 2. Cross-Origin Resource Sharing
app.use(
  cors({
    origin: env.CORS_ORIGIN === '*' ? '*' : env.CORS_ORIGIN.split(','),
    credentials: true,
  })
);

// 3. Body Parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 4. Rate Limiting
const apiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later',
  },
});

app.use('/api', apiLimiter);

// 5. Mount API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/pgs', pgRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/students', studentRoutes);
app.use('/api', joinRequestRoutes);

// 6. Handle 404 Unmatched Routes
app.use(notFound);

// 7. Centralized Error Handling
app.use(errorHandler);

export default app;
export { app };
