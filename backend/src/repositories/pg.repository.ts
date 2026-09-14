import { Pool, PoolClient } from 'pg';
import pool from '../config/db';
import { PG, PGDetail, PGFilters, PGSummary, PGImage, PaginatedPGResponse } from '../types/pg';
import { CreatePGInput, UpdatePGInput } from '../validators/pg.validator';

type DbExecutor = Pool | PoolClient;

export class PGRepository {
  async findOwnerByUserId(
    userId: string,
    executor: DbExecutor = pool
  ): Promise<{ id: string; user_id: string } | null> {
    const result = await executor.query<{ id: string; user_id: string }>(
      'SELECT id, user_id FROM owners WHERE user_id = $1 LIMIT 1',
      [userId]
    );
    return result.rows[0] || null;
  }

  async createPG(
    ownerId: string,
    data: CreatePGInput,
    executor: DbExecutor = pool
  ): Promise<PG> {
    const query = `
      INSERT INTO pgs (
        owner_id, name, description, address, city, state, pincode,
        latitude, longitude, gender_allowed, food_available, contact_phone
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;
    const values = [
      ownerId,
      data.name,
      data.description || null,
      data.address,
      data.city,
      data.state,
      data.pincode,
      data.latitude || null,
      data.longitude || null,
      data.genderAllowed,
      data.foodAvailable ?? false,
      data.contactPhone,
    ];
    const result = await executor.query<PG>(query, values);
    return result.rows[0];
  }

  async updatePG(
    pgId: string,
    data: UpdatePGInput,
    executor: DbExecutor = pool
  ): Promise<PG | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${idx++}`);
      values.push(data.name);
    }
    if (data.description !== undefined) {
      fields.push(`description = $${idx++}`);
      values.push(data.description);
    }
    if (data.address !== undefined) {
      fields.push(`address = $${idx++}`);
      values.push(data.address);
    }
    if (data.city !== undefined) {
      fields.push(`city = $${idx++}`);
      values.push(data.city);
    }
    if (data.state !== undefined) {
      fields.push(`state = $${idx++}`);
      values.push(data.state);
    }
    if (data.pincode !== undefined) {
      fields.push(`pincode = $${idx++}`);
      values.push(data.pincode);
    }
    if (data.latitude !== undefined) {
      fields.push(`latitude = $${idx++}`);
      values.push(data.latitude);
    }
    if (data.longitude !== undefined) {
      fields.push(`longitude = $${idx++}`);
      values.push(data.longitude);
    }
    if (data.genderAllowed !== undefined) {
      fields.push(`gender_allowed = $${idx++}`);
      values.push(data.genderAllowed);
    }
    if (data.foodAvailable !== undefined) {
      fields.push(`food_available = $${idx++}`);
      values.push(data.foodAvailable);
    }
    if (data.contactPhone !== undefined) {
      fields.push(`contact_phone = $${idx++}`);
      values.push(data.contactPhone);
    }

    if (fields.length === 0) {
      const existing = await this.findRawPGById(pgId, executor);
      return existing;
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(pgId);

    const query = `
      UPDATE pgs
      SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING *
    `;

    const result = await executor.query<PG>(query, values);
    return result.rows[0] || null;
  }

  async deletePG(pgId: string, executor: DbExecutor = pool): Promise<boolean> {
    const result = await executor.query('DELETE FROM pgs WHERE id = $1', [pgId]);
    return (result.rowCount ?? 0) > 0;
  }

  async findRawPGById(id: string, executor: DbExecutor = pool): Promise<PG | null> {
    const result = await executor.query<PG>('SELECT * FROM pgs WHERE id = $1 LIMIT 1', [id]);
    return result.rows[0] || null;
  }

  async findPGById(id: string, executor: DbExecutor = pool): Promise<PGDetail | null> {
    const pgQuery = `
      SELECT 
        p.*,
        json_build_object(
          'id', o.id,
          'name', u.name,
          'contact_phone', p.contact_phone
        ) AS owner,
        COALESCE(
          (
            SELECT array_agg(a.name ORDER BY a.name)
            FROM pg_amenities pa
            JOIN amenities a ON a.id = pa.amenity_id
            WHERE pa.pg_id = p.id
          ),
          ARRAY[]::text[]
        ) AS amenities,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', img.id,
                'imageUrl', img.image_url,
                'publicId', img.public_id,
                'isPrimary', img.is_primary,
                'createdAt', img.created_at
              )
            )
            FROM pg_images img
            WHERE img.pg_id = p.id
          ),
          '[]'::json
        ) AS images
      FROM pgs p
      JOIN owners o ON o.id = p.owner_id
      JOIN users u ON u.id = o.user_id
      WHERE p.id = $1
      LIMIT 1
    `;

    const pgResult = await executor.query<any>(pgQuery, [id]);
    if (!pgResult.rows[0]) return null;

    const pg = pgResult.rows[0];

    // Fetch rooms with calculated occupied and vacant count
    const roomsQuery = `
      SELECT 
        r.id,
        r.pg_id AS "pgId",
        r.room_number AS "roomNumber",
        r.room_type AS "roomType",
        r.capacity,
        r.rent,
        r.description,
        COUNT(CASE WHEN rm.status = 'ACTIVE' THEN 1 END)::int AS occupied,
        GREATEST(0, r.capacity - COUNT(CASE WHEN rm.status = 'ACTIVE' THEN 1 END))::int AS vacant,
        r.created_at AS "createdAt",
        r.updated_at AS "updatedAt"
      FROM rooms r
      LEFT JOIN room_members rm ON rm.room_id = r.id AND rm.status = 'ACTIVE'
      WHERE r.pg_id = $1
      GROUP BY r.id
      ORDER BY r.room_number ASC
    `;

    const roomsResult = await executor.query(roomsQuery, [id]);

    return {
      ...pg,
      latitude: pg.latitude ? parseFloat(pg.latitude) : null,
      longitude: pg.longitude ? parseFloat(pg.longitude) : null,
      amenities: pg.amenities || [],
      images: pg.images || [],
      rooms: roomsResult.rows,
    };
  }

  async searchPGs(
    filters: PGFilters,
    executor: DbExecutor = pool
  ): Promise<PaginatedPGResponse> {
    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (filters.city) {
      conditions.push(`LOWER(p.city) = LOWER($${idx++})`);
      values.push(filters.city);
    }

    if (filters.gender) {
      conditions.push(`p.gender_allowed = $${idx++}`);
      values.push(filters.gender);
    }

    if (filters.food !== undefined) {
      conditions.push(`p.food_available = $${idx++}`);
      values.push(filters.food);
    }

    if (filters.search) {
      conditions.push(
        `(p.name ILIKE $${idx} OR p.city ILIKE $${idx} OR p.address ILIKE $${idx} OR p.description ILIKE $${idx})`
      );
      values.push(`%${filters.search}%`);
      idx++;
    }

    if (filters.amenity) {
      conditions.push(`
        EXISTS (
          SELECT 1 FROM pg_amenities pa
          JOIN amenities a ON a.id = pa.amenity_id
          WHERE pa.pg_id = p.id AND a.name ILIKE $${idx++}
        )
      `);
      values.push(`%${filters.amenity}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Having conditions for aggregated room filters
    const havingConditions: string[] = [];
    if (filters.minRent !== undefined) {
      havingConditions.push(`MIN(r.rent) >= $${idx++}`);
      values.push(filters.minRent);
    }
    if (filters.maxRent !== undefined) {
      havingConditions.push(`MIN(r.rent) <= $${idx++}`);
      values.push(filters.maxRent);
    }
    if (filters.minVacancy !== undefined) {
      havingConditions.push(`
        GREATEST(0, COALESCE(SUM(r.capacity), 0) - COUNT(CASE WHEN rm.status = 'ACTIVE' THEN 1 END)) >= $${idx++}
      `);
      values.push(filters.minVacancy);
    }

    const havingClause = havingConditions.length > 0 ? `HAVING ${havingConditions.join(' AND ')}` : '';

    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 10, 50);
    const offset = (page - 1) * limit;

    // Main query with aggregations
    const mainQuery = `
      SELECT 
        p.id,
        p.owner_id,
        p.name,
        p.description,
        p.address,
        p.city,
        p.state,
        p.pincode,
        p.latitude::float,
        p.longitude::float,
        p.gender_allowed,
        p.food_available,
        p.contact_phone,
        p.created_at,
        p.updated_at,
        MIN(r.rent)::float AS min_rent,
        MAX(r.rent)::float AS max_rent,
        COALESCE(SUM(r.capacity), 0)::int AS total_capacity,
        COUNT(CASE WHEN rm.status = 'ACTIVE' THEN 1 END)::int AS total_occupied,
        GREATEST(0, COALESCE(SUM(r.capacity), 0) - COUNT(CASE WHEN rm.status = 'ACTIVE' THEN 1 END))::int AS total_vacant,
        (
          SELECT array_agg(a.name ORDER BY a.name)
          FROM pg_amenities pa
          JOIN amenities a ON a.id = pa.amenity_id
          WHERE pa.pg_id = p.id
        ) AS amenities,
        (
          SELECT image_url
          FROM pg_images
          WHERE pg_id = p.id
          ORDER BY is_primary DESC, created_at ASC
          LIMIT 1
        ) AS primary_image
      FROM pgs p
      LEFT JOIN rooms r ON r.pg_id = p.id
      LEFT JOIN room_members rm ON rm.room_id = r.id AND rm.status = 'ACTIVE'
      ${whereClause}
      GROUP BY p.id
      ${havingClause}
      ORDER BY p.created_at DESC
      LIMIT $${idx++} OFFSET $${idx++}
    `;

    values.push(limit, offset);

    const result = await executor.query<any>(mainQuery, values);

    // Count query
    const countValues = values.slice(0, values.length - 2);
    const countQuery = `
      SELECT COUNT(*)::int AS total
      FROM (
        SELECT p.id
        FROM pgs p
        LEFT JOIN rooms r ON r.pg_id = p.id
        LEFT JOIN room_members rm ON rm.room_id = r.id AND rm.status = 'ACTIVE'
        ${whereClause}
        GROUP BY p.id
        ${havingClause}
      ) AS count_subquery
    `;

    const countResult = await executor.query<{ total: number }>(countQuery, countValues);
    const total = countResult.rows[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    const formattedData: PGSummary[] = result.rows.map((row) => ({
      ...row,
      amenities: row.amenities || [],
    }));

    return {
      data: formattedData,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async setAmenities(
    pgId: string,
    amenityIds: string[],
    executor: DbExecutor = pool
  ): Promise<void> {
    await executor.query('DELETE FROM pg_amenities WHERE pg_id = $1', [pgId]);
    if (amenityIds.length === 0) return;

    const valuesStr = amenityIds.map((_, i) => `($1, $${i + 2})`).join(', ');
    await executor.query(
      `INSERT INTO pg_amenities (pg_id, amenity_id) VALUES ${valuesStr} ON CONFLICT DO NOTHING`,
      [pgId, ...amenityIds]
    );
  }

  async addImages(
    pgId: string,
    images: { imageUrl: string; publicId?: string; isPrimary?: boolean }[],
    executor: DbExecutor = pool
  ): Promise<void> {
    for (const img of images) {
      await executor.query(
        `INSERT INTO pg_images (pg_id, image_url, public_id, is_primary) VALUES ($1, $2, $3, $4)`,
        [pgId, img.imageUrl, img.publicId || null, img.isPrimary || false]
      );
    }
  }

  async getAllAmenities(executor: DbExecutor = pool): Promise<{ id: string; name: string }[]> {
    const result = await executor.query<{ id: string; name: string }>(
      'SELECT id, name FROM amenities ORDER BY name ASC'
    );
    return result.rows;
  }
}

export const pgRepository = new PGRepository();
export default pgRepository;
