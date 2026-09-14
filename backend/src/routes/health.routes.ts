import { Router, Request, Response } from 'express';
import pool from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'StayCircle API is running',
  });
});

router.get(
  '/db',
  asyncHandler(async (_req: Request, res: Response) => {
    try {
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();

      res.status(200).json({
        success: true,
        message: 'PostgreSQL database is reachable and operational',
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        message: 'Database service is currently unreachable',
      });
    }
  })
);

export default router;
