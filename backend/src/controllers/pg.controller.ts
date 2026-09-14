import { Request, Response } from 'express';
import { pgService, PGService } from '../services/pg.service';
import { createPGSchema, updatePGSchema, pgQueryFilterSchema } from '../validators/pg.validator';
import { asyncHandler } from '../utils/asyncHandler';

export class PGController {
  constructor(private service: PGService = pgService) {}

  createPG = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const validated = createPGSchema.parse(req.body);
    const pg = await this.service.createPG(req.user!.userId, validated);

    res.status(201).json({
      success: true,
      message: 'PG created successfully',
      data: pg,
    });
  });

  updatePG = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const validated = updatePGSchema.parse(req.body);
    const pg = await this.service.updatePG(req.user!.userId, req.params.id, validated);

    res.status(200).json({
      success: true,
      message: 'PG updated successfully',
      data: pg,
    });
  });

  deletePG = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    await this.service.deletePG(req.user!.userId, req.params.id);

    res.status(200).json({
      success: true,
      message: 'PG deleted successfully',
    });
  });

  getPGById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const pg = await this.service.getPGById(req.params.id);

    res.status(200).json({
      success: true,
      data: pg,
    });
  });

  searchPGs = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const filters = pgQueryFilterSchema.parse(req.query);
    const result = await this.service.searchPGs(filters);

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  });

  getAmenities = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const amenities = await this.service.getAllAmenities();

    res.status(200).json({
      success: true,
      data: amenities,
    });
  });
}

export const pgController = new PGController();
export default pgController;
