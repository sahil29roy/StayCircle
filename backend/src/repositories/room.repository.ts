import { Pool, PoolClient } from 'pg';
import pool from '../config/db';
import { Room, RoomWithVacancy, RoomMember, RoomOccupantInfo } from '../types/room';
import { CreateRoomInput, UpdateRoomInput } from '../validators/room.validator';

type DbExecutor = Pool | PoolClient;

export class RoomRepository {
  async createRoom(
    pgId: string,
    data: CreateRoomInput,
    executor: DbExecutor = pool
  ): Promise<Room> {
    const query = `
      INSERT INTO rooms (pg_id, room_number, room_type, capacity, rent, description)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [
      pgId,
      data.roomNumber,
      data.roomType,
      data.capacity,
      data.rent,
      data.description || null,
    ];
    const result = await executor.query<Room>(query, values);
    return result.rows[0];
  }

  async findRawRoomById(id: string, executor: DbExecutor = pool): Promise<Room | null> {
    const result = await executor.query<Room>(
      'SELECT * FROM rooms WHERE id = $1 LIMIT 1',
      [id]
    );
    return result.rows[0] || null;
  }

  async findRoomWithVacancyById(
    id: string,
    executor: DbExecutor = pool
  ): Promise<RoomWithVacancy | null> {
    const query = `
      SELECT 
        r.*,
        COUNT(CASE WHEN rm.status = 'ACTIVE' THEN 1 END)::int AS occupied,
        GREATEST(0, r.capacity - COUNT(CASE WHEN rm.status = 'ACTIVE' THEN 1 END))::int AS vacant
      FROM rooms r
      LEFT JOIN room_members rm ON rm.room_id = r.id AND rm.status = 'ACTIVE'
      WHERE r.id = $1
      GROUP BY r.id
      LIMIT 1
    `;
    const result = await executor.query<any>(query, [id]);
    if (!result.rows[0]) return null;

    return {
      ...result.rows[0],
      rent: parseFloat(result.rows[0].rent),
    };
  }

  async findRoomsByPGId(
    pgId: string,
    executor: DbExecutor = pool
  ): Promise<RoomWithVacancy[]> {
    const query = `
      SELECT 
        r.*,
        COUNT(CASE WHEN rm.status = 'ACTIVE' THEN 1 END)::int AS occupied,
        GREATEST(0, r.capacity - COUNT(CASE WHEN rm.status = 'ACTIVE' THEN 1 END))::int AS vacant
      FROM rooms r
      LEFT JOIN room_members rm ON rm.room_id = r.id AND rm.status = 'ACTIVE'
      WHERE r.pg_id = $1
      GROUP BY r.id
      ORDER BY r.room_number ASC
    `;
    const result = await executor.query<any>(query, [pgId]);
    return result.rows.map((row) => ({
      ...row,
      rent: parseFloat(row.rent),
    }));
  }

  async updateRoom(
    roomId: string,
    data: UpdateRoomInput,
    executor: DbExecutor = pool
  ): Promise<Room | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.roomNumber !== undefined) {
      fields.push(`room_number = $${idx++}`);
      values.push(data.roomNumber);
    }
    if (data.roomType !== undefined) {
      fields.push(`room_type = $${idx++}`);
      values.push(data.roomType);
    }
    if (data.capacity !== undefined) {
      fields.push(`capacity = $${idx++}`);
      values.push(data.capacity);
    }
    if (data.rent !== undefined) {
      fields.push(`rent = $${idx++}`);
      values.push(data.rent);
    }
    if (data.description !== undefined) {
      fields.push(`description = $${idx++}`);
      values.push(data.description);
    }

    if (fields.length === 0) {
      return this.findRawRoomById(roomId, executor);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(roomId);

    const query = `
      UPDATE rooms
      SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING *
    `;
    const result = await executor.query<Room>(query, values);
    return result.rows[0] || null;
  }

  async deleteRoom(roomId: string, executor: DbExecutor = pool): Promise<boolean> {
    const result = await executor.query('DELETE FROM rooms WHERE id = $1', [roomId]);
    return (result.rowCount ?? 0) > 0;
  }

  async lockRoomForUpdate(
    roomId: string,
    client: PoolClient
  ): Promise<{ id: string; capacity: number; occupied: number } | null> {
    const roomRes = await client.query<{ id: string; capacity: number }>(
      'SELECT id, capacity FROM rooms WHERE id = $1 FOR UPDATE',
      [roomId]
    );
    if (!roomRes.rows[0]) return null;

    const countRes = await client.query<{ occupied: number }>(
      "SELECT COUNT(*)::int AS occupied FROM room_members WHERE room_id = $1 AND status = 'ACTIVE'",
      [roomId]
    );

    return {
      id: roomRes.rows[0].id,
      capacity: roomRes.rows[0].capacity,
      occupied: countRes.rows[0]?.occupied || 0,
    };
  }

  async findActiveMembershipByStudentId(
    studentId: string,
    executor: DbExecutor = pool
  ): Promise<RoomMember | null> {
    const result = await executor.query<RoomMember>(
      `SELECT * FROM room_members WHERE student_id = $1 AND status = 'ACTIVE' LIMIT 1`,
      [studentId]
    );
    return result.rows[0] || null;
  }

  async findActiveMemberInRoom(
    roomId: string,
    studentId: string,
    executor: DbExecutor = pool
  ): Promise<RoomMember | null> {
    const result = await executor.query<RoomMember>(
      `SELECT * FROM room_members WHERE room_id = $1 AND student_id = $2 AND status = 'ACTIVE' LIMIT 1`,
      [roomId, studentId]
    );
    return result.rows[0] || null;
  }

  async addRoomMember(
    roomId: string,
    studentId: string,
    executor: DbExecutor = pool
  ): Promise<RoomMember> {
    const query = `
      INSERT INTO room_members (room_id, student_id, status)
      VALUES ($1, $2, 'ACTIVE')
      RETURNING *
    `;
    const result = await executor.query<RoomMember>(query, [roomId, studentId]);
    return result.rows[0];
  }

  async removeRoomMember(
    roomId: string,
    studentId: string,
    executor: DbExecutor = pool
  ): Promise<boolean> {
    const query = `
      UPDATE room_members
      SET status = 'LEFT', left_at = CURRENT_TIMESTAMP
      WHERE room_id = $1 AND student_id = $2 AND status = 'ACTIVE'
      RETURNING id
    `;
    const result = await executor.query(query, [roomId, studentId]);
    return (result.rowCount ?? 0) > 0;
  }

  async getRoomOccupantsInfo(
    roomId: string,
    executor: DbExecutor = pool
  ): Promise<RoomOccupantInfo[]> {
    const query = `
      SELECT 
        rm.id,
        s.id AS "student_id",
        u.name,
        s.college,
        s.course,
        s.year,
        s.gender,
        s.food_preference,
        s.smoking_preference,
        s.sleep_schedule,
        s.cleanliness_preference,
        s.ac_preference,
        s.room_preference,
        rm.joined_at
      FROM room_members rm
      JOIN students s ON s.id = rm.student_id
      JOIN users u ON u.id = s.user_id
      WHERE rm.room_id = $1 AND rm.status = 'ACTIVE'
      ORDER BY rm.joined_at ASC
    `;
    const result = await executor.query<RoomOccupantInfo>(query, [roomId]);
    return result.rows;
  }
}

export const roomRepository = new RoomRepository();
export default roomRepository;
