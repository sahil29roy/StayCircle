import { Request, Response } from 'express';
import { joinRequestService, JoinRequestService } from '../services/joinRequest.service';
import {
  createJoinRequestSchema,
  updateJoinRequestStatusSchema,
} from '../validators/joinRequest.validator';
import { asyncHandler } from '../utils/asyncHandler';

export class JoinRequestController {
  constructor(private service: JoinRequestService = joinRequestService) {}

  createRequest = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const validated = createJoinRequestSchema.parse(req.body);
    const request = await this.service.createRequest(
      req.user!.userId,
      req.params.roomId,
      validated
    );

    res.status(201).json({
      success: true,
      message: 'Join request submitted successfully',
      data: request,
    });
  });

  getStudentRequests = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const status = req.query.status as string | undefined;
    const requests = await this.service.getStudentRequests(req.user!.userId, status);

    res.status(200).json({
      success: true,
      data: requests,
    });
  });

  getOwnerRequests = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const status = req.query.status as string | undefined;
    const requests = await this.service.getOwnerRequests(req.user!.userId, status);

    res.status(200).json({
      success: true,
      data: requests,
    });
  });

  updateRequestStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { status } = updateJoinRequestStatusSchema.parse(req.body);
    const updated = await this.service.handleRequestStatus(
      req.user!.userId,
      req.params.requestId,
      status
    );

    res.status(200).json({
      success: true,
      message: `Join request ${status.toLowerCase()} successfully`,
      data: updated,
    });
  });
}

export const joinRequestController = new JoinRequestController();
export default joinRequestController;
