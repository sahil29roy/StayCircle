import pool from '../config/db';
import { pgRepository, PGRepository } from '../repositories/pg.repository';
import { CreatePGInput, UpdatePGInput, PGQueryFilter } from '../validators/pg.validator';
import { AppError } from '../utils/appError';
import { PGDetail, PaginatedPGResponse } from '../types/pg';

export class PGService {
  constructor(private pgRepo: PGRepository = pgRepository) {}

  async createPG(userId: string, input: CreatePGInput): Promise<PGDetail> {
    const owner = await this.pgRepo.findOwnerByUserId(userId);
    if (!owner) {
      throw new AppError('Owner profile not found for the authenticated user', 404);
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const pg = await this.pgRepo.createPG(owner.id, input, client);

      if (input.amenityIds && input.amenityIds.length > 0) {
        await this.pgRepo.setAmenities(pg.id, input.amenityIds, client);
      }

      if (input.images && input.images.length > 0) {
        await this.pgRepo.addImages(pg.id, input.images, client);
      }

      await client.query('COMMIT');

      const pgDetail = await this.pgRepo.findPGById(pg.id);
      return pgDetail!;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async updatePG(userId: string, pgId: string, input: UpdatePGInput): Promise<PGDetail> {
    const pg = await this.pgRepo.findRawPGById(pgId);
    if (!pg) {
      throw new AppError('PG not found', 404);
    }

    const owner = await this.pgRepo.findOwnerByUserId(userId);
    if (!owner || pg.owner_id !== owner.id) {
      throw new AppError('Forbidden: You do not own this PG', 403);
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await this.pgRepo.updatePG(pgId, input, client);

      if (input.amenityIds !== undefined) {
        await this.pgRepo.setAmenities(pgId, input.amenityIds, client);
      }

      await client.query('COMMIT');

      const pgDetail = await this.pgRepo.findPGById(pgId);
      return pgDetail!;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async deletePG(userId: string, pgId: string): Promise<void> {
    const pg = await this.pgRepo.findRawPGById(pgId);
    if (!pg) {
      throw new AppError('PG not found', 404);
    }

    const owner = await this.pgRepo.findOwnerByUserId(userId);
    if (!owner || pg.owner_id !== owner.id) {
      throw new AppError('Forbidden: You do not own this PG', 403);
    }

    await this.pgRepo.deletePG(pgId);
  }

  async getPGById(pgId: string): Promise<PGDetail> {
    const pg = await this.pgRepo.findPGById(pgId);
    if (!pg) {
      throw new AppError('PG not found', 404);
    }
    return pg;
  }

  async searchPGs(filters: PGQueryFilter): Promise<PaginatedPGResponse> {
    return this.pgRepo.searchPGs(filters);
  }

  async getAllAmenities(): Promise<{ id: string; name: string }[]> {
    return this.pgRepo.getAllAmenities();
  }
}

export const pgService = new PGService();
export default pgService;
