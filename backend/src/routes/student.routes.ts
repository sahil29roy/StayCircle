import { Router } from 'express';
import { studentController } from '../controllers/student.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

router.get('/me', authenticate, authorize('STUDENT'), studentController.getMyProfile);
router.patch('/me', authenticate, authorize('STUDENT'), studentController.updateMyPreferences);

export default router;
