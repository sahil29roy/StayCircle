import { Pool, PoolClient } from 'pg';
import pool from '../config/db';
import { JoinRequest, JoinRequestWithDetails } from '../types/joinRequest';

type DbExecutor = Pool | PoolClient;

export class JoinRequestRepository {
  async createRequest(
    roomId: string,
    studentId: string,
    message: string,
    executor: DbExecutor = pool
  ): Promise<JoinRequest> {
    const query = `
      INSERT INTO join_requests (room_id, student_id, message, status)
      VALUES ($1, $2, $3, 'PENDING')
      RETURNING *
    `;
    const result = await executor.query<JoinRequest>(query, [roomId, studentId, message]);
    return result.rows[0];
  }

  async findRequestById(id: string, executor: DbExecutor = pool): Promise<JoinRequest | null> {
    const result = await executor.query<JoinRequest>(
      'SELECT * FROM join_requests WHERE id = $1 LIMIT 1',
      [id]
    );
    return result.rows[0] || null;
  }

  async findPendingRequest(
    roomId: string,
    studentId: string,
    executor: DbExecutor = pool
  ): Promise<JoinRequest | null> {
    const result = await executor.query<JoinRequest>(
      `SELECT * FROM join_requests WHERE room_id = $1 AND student_id = $2 AND status = 'PENDING' LIMIT 1`,
      [roomId, studentId]
    );
    return result.rows[0] || null;
  }

  async findOwnerIdByRoomId(roomId: string, executor: DbExecutor = pool): Promise<string | null> {
    const query = `
      SELECT p.owner_id
      FROM rooms r
      JOIN pgs p ON p.id = r.pg_id
      WHERE r.id = $1
      LIMIT 1
    `;
    const result = await executor.query<{ owner_id: string }>(query, [roomId]);
    return result.rows[0]?.owner_id || null;
  }

  async findRequestWithDetailsById(
    id: string,
    executor: DbExecutor = pool
  ): Promise<JoinRequestWithDetails | null> {
    const query = `
      SELECT 
        jr.id,
        jr.room_id,
        jr.student_id,
        jr.message,
        jr.status,
        jr.created_at,
        jr.updated_at,
        json_build_object(
          'id', s.id,
          'name', u.name,
          'email', u.email,
          'phone', u.phone,
          'college', s.college,
          'course', s.course,
          'year', s.year
        ) AS student,
        json_build_object(
          'id', r.id,
          'room_number', r.room_number,
          'room_type', r.room_type,
          'rent', r.rent::float,
          'capacity', r.capacity,
          'pg_id', p.id,
          'pg_name', p.name
        ) AS room
      FROM join_requests jr
      JOIN students s ON s.id = jr.student_id
      JOIN users u ON u.id = s.user_id
      JOIN rooms r ON r.id = jr.room_id
      JOIN pgs p ON p.id = r.pg_id
      WHERE jr.id = $1
      LIMIT 1
    `;
    const result = await executor.query<JoinRequestWithDetails>(query, [id]);
    return result.rows[0] || null;
  }

  async findRequestsByStudentId(
    studentId: string,
    status?: string,
    executor: DbExecutor = pool
  ): Promise<JoinRequestWithDetails[]> {
    const conditions = ['jr.student_id = $1'];
    const values: any[] = [studentId];

    if (status) {
      conditions.push('jr.status = $2');
      values.push(status);
    }

    const query = `
      SELECT 
        jr.id,
        jr.room_id,
        jr.student_id,
        jr.message,
        jr.status,
        jr.created_at,
        jr.updated_at,
        json_build_object(
          'id', s.id,
          'name', u.name,
          'email', u.email,
          'phone', u.phone,
          'college', s.college,
          'course', s.course,
          'year', s.year
        ) AS student,
        json_build_object(
          'id', r.id,
          'room_number', r.room_number,
          'room_type', r.room_type,
          'rent', r.rent::float,
          'capacity', r.capacity,
          'pg_id', p.id,
          'pg_name', p.name
        ) AS room
      FROM join_requests jr
      JOIN students s ON s.id = jr.student_id
      JOIN users u ON u.id = s.user_id
      JOIN rooms r ON r.id = jr.room_id
      JOIN pgs p ON p.id = r.pg_id
      WHERE ${conditions.join(' AND ')}
      ORDER BY jr.created_at DESC
    `;

    const result = await executor.query<JoinRequestWithDetails>(query, values);
    return result.rows;
  }

  async findRequestsByOwnerId(
    ownerId: string,
    status?: string,
    executor: DbExecutor = pool
  ): Promise<JoinRequestWithDetails[]> {
    const conditions = ['p.owner_id = $1'];
    const values: any[] = [ownerId];

    if (status) {
      conditions.push('jr.status = $2');
      values.push(status);
    }

    const query = `
      SELECT 
        jr.id,
        jr.room_id,
        jr.student_id,
        jr.message,
        jr.status,
        jr.created_at,
        jr.updated_at,
        json_build_object(
          'id', s.id,
          'name', u.name,
          'email', u.email,
          'phone', u.phone,
          'college', s.college,
          'course', s.course,
          'year', s.year
        ) AS student,
        json_build_object(
          'id', r.id,
          'room_number', r.room_number,
          'room_type', r.room_type,
          'rent', r.rent::float,
          'capacity', r.capacity,
          'pg_id', p.id,
          'pg_name', p.name
        ) AS room
      FROM join_requests jr
      JOIN students s ON s.id = jr.student_id
      JOIN users u ON u.id = s.user_id
      JOIN rooms r ON r.id = jr.room_id
      JOIN pgs p ON p.id = r.pg_id
      WHERE ${conditions.join(' AND ')}
      ORDER BY jr.created_at DESC
    `;

    const result = await executor.query<JoinRequestWithDetails>(query, values);
    return result.rows;
  }

  async updateRequestStatus(
    id: string,
    status: string,
    executor: DbExecutor = pool
  ): Promise<JoinRequest | null> {
    const query = `
      UPDATE join_requests
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const result = await executor.query<JoinRequest>(query, [status, id]);
    return result.rows[0] || null;
  }
}

export const joinRequestRepository = new JoinRequestRepository();
export default joinRequestRepository;
