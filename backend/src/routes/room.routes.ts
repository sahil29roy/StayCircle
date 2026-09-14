import { Router } from 'express';
import { roomController } from '../controllers/room.controller';
import { joinRequestController } from '../controllers/joinRequest.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

// Room lookup and details
router.get('/:id', roomController.getRoomById);

// Owner room modification
router.patch('/:id', authenticate, authorize('OWNER'), roomController.updateRoom);
router.delete('/:id', authenticate, authorize('OWNER'), roomController.deleteRoom);

// Member management
router.post(
  '/:roomId/members',
  authenticate,
  authorize('OWNER'),
  roomController.assignMember
);
router.delete(
  '/:roomId/members/:studentId',
  authenticate,
  authorize('OWNER'),
  roomController.removeMember
);

// Roommate matching for students
router.get(
  '/:roomId/matches',
  authenticate,
  authorize('STUDENT'),
  roomController.getRoomMatches
);

// Send join request for a room
router.post(
  '/:roomId/requests',
  authenticate,
  authorize('STUDENT'),
  joinRequestController.createRequest
);

export default router;
