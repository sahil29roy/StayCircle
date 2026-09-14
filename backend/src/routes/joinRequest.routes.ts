import { Router } from 'express';
import { joinRequestController } from '../controllers/joinRequest.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

// Student viewing their requests
router.get(
  '/student/requests',
  authenticate,
  authorize('STUDENT'),
  joinRequestController.getStudentRequests
);

// Owner viewing requests for their PGs
router.get(
  '/owner/requests',
  authenticate,
  authorize('OWNER'),
  joinRequestController.getOwnerRequests
);

// Owner accepting or rejecting request
router.patch(
  '/requests/:requestId',
  authenticate,
  authorize('OWNER'),
  joinRequestController.updateRequestStatus
);

export default router;
