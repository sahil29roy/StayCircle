import { Request, Response } from 'express';
import { roomService, RoomService } from '../services/room.service';
import { matchingService, MatchingService } from '../services/matching.service';
import {
  createRoomSchema,
  updateRoomSchema,
  assignMemberSchema,
} from '../validators/room.validator';
import { asyncHandler } from '../utils/asyncHandler';

export class RoomController {
  constructor(
    private service: RoomService = roomService,
    private matching: MatchingService = matchingService
  ) {}

  createRoom = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const validated = createRoomSchema.parse(req.body);
    const room = await this.service.createRoom(
      req.user!.userId,
      req.params.pgId,
      validated
    );

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: room,
    });
  });

  updateRoom = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const validated = updateRoomSchema.parse(req.body);
    const room = await this.service.updateRoom(
      req.user!.userId,
      req.params.id,
      validated
    );

    res.status(200).json({
      success: true,
      message: 'Room updated successfully',
      data: room,
    });
  });

  deleteRoom = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    await this.service.deleteRoom(req.user!.userId, req.params.id);

    res.status(200).json({
      success: true,
      message: 'Room deleted successfully',
    });
  });

  getRoomsByPG = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const rooms = await this.service.getRoomsByPGId(req.params.pgId);

    res.status(200).json({
      success: true,
      data: rooms,
    });
  });

  getRoomById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await this.service.getRoomById(req.params.id);

    res.status(200).json({
      success: true,
      data: {
        ...result.room,
        occupants: result.occupants,
      },
    });
  });

  assignMember = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { studentId } = assignMemberSchema.parse(req.body);
    const result = await this.service.assignMember(
      req.user!.userId,
      req.params.roomId,
      studentId
    );

    res.status(201).json({
      success: true,
      message: 'Student assigned to room successfully',
      data: result,
    });
  });

  removeMember = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    await this.service.removeMember(
      req.user!.userId,
      req.params.roomId,
      req.params.studentId
    );

    res.status(200).json({
      success: true,
      message: 'Student removed from room successfully',
    });
  });

  getRoomMatches = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await this.matching.calculateRoomCompatibility(
      req.user!.userId,
      req.params.roomId
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  });
}

export const roomController = new RoomController();
export default roomController;
