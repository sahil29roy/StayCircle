import { Router } from 'express';
import { pgController } from '../controllers/pg.controller';
import { roomController } from '../controllers/room.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

// Public routes
router.get('/', pgController.searchPGs);
router.get('/amenities', pgController.getAmenities);
router.get('/:id', pgController.getPGById);

// Owner-only PG routes
router.post('/', authenticate, authorize('OWNER'), pgController.createPG);
router.patch('/:id', authenticate, authorize('OWNER'), pgController.updatePG);
router.delete('/:id', authenticate, authorize('OWNER'), pgController.deletePG);

// PG-nested Room routes
router.get('/:pgId/rooms', roomController.getRoomsByPG);
router.post('/:pgId/rooms', authenticate, authorize('OWNER'), roomController.createRoom);

export default router;
