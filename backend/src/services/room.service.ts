import pool from '../config/db';
import { roomRepository, RoomRepository } from '../repositories/room.repository';
import { pgRepository, PGRepository } from '../repositories/pg.repository';
import { studentRepository, StudentRepository } from '../repositories/student.repository';
import { CreateRoomInput, UpdateRoomInput } from '../validators/room.validator';
import { AppError } from '../utils/appError';
import { RoomWithVacancy, RoomOccupantInfo } from '../types/room';

export class RoomService {
  constructor(
    private roomRepo: RoomRepository = roomRepository,
    private pgRepo: PGRepository = pgRepository,
    private studentRepo: StudentRepository = studentRepository
  ) {}

  private async verifyPGOwnership(userId: string, pgId: string): Promise<void> {
    const pg = await this.pgRepo.findRawPGById(pgId);
    if (!pg) {
      throw new AppError('PG not found', 404);
    }

    const owner = await this.pgRepo.findOwnerByUserId(userId);
    if (!owner || pg.owner_id !== owner.id) {
      throw new AppError('Forbidden: You do not own this PG', 403);
    }
  }

  private async verifyRoomOwnership(userId: string, roomId: string): Promise<string> {
    const room = await this.roomRepo.findRawRoomById(roomId);
    if (!room) {
      throw new AppError('Room not found', 404);
    }

    await this.verifyPGOwnership(userId, room.pg_id);
    return room.pg_id;
  }

  async createRoom(
    userId: string,
    pgId: string,
    input: CreateRoomInput
  ): Promise<RoomWithVacancy> {
    await this.verifyPGOwnership(userId, pgId);

    const room = await this.roomRepo.createRoom(pgId, input);
    const roomWithVacancy = await this.roomRepo.findRoomWithVacancyById(room.id);
    return roomWithVacancy!;
  }

  async updateRoom(
    userId: string,
    roomId: string,
    input: UpdateRoomInput
  ): Promise<RoomWithVacancy> {
    await this.verifyRoomOwnership(userId, roomId);

    const updated = await this.roomRepo.updateRoom(roomId, input);
    if (!updated) {
      throw new AppError('Failed to update room', 500);
    }

    const roomWithVacancy = await this.roomRepo.findRoomWithVacancyById(roomId);
    return roomWithVacancy!;
  }

  async deleteRoom(userId: string, roomId: string): Promise<void> {
    await this.verifyRoomOwnership(userId, roomId);
    await this.roomRepo.deleteRoom(roomId);
  }

  async getRoomsByPGId(pgId: string): Promise<RoomWithVacancy[]> {
    const pg = await this.pgRepo.findRawPGById(pgId);
    if (!pg) {
      throw new AppError('PG not found', 404);
    }
    return this.roomRepo.findRoomsByPGId(pgId);
  }

  async getRoomById(roomId: string): Promise<{
    room: RoomWithVacancy;
    occupants: RoomOccupantInfo[];
  }> {
    const room = await this.roomRepo.findRoomWithVacancyById(roomId);
    if (!room) {
      throw new AppError('Room not found', 404);
    }

    const occupants = await this.roomRepo.getRoomOccupantsInfo(roomId);
    return {
      room,
      occupants,
    };
  }

  async assignMember(
    userId: string,
    roomId: string,
    studentId: string
  ): Promise<{ room: RoomWithVacancy; memberId: string }> {
    await this.verifyRoomOwnership(userId, roomId);

    // Verify student exists
    const student = await this.studentRepo.findStudentById(studentId);
    if (!student) {
      throw new AppError('Student profile not found', 404);
    }

    // Ensure student is not already active in ANY room
    const existingMembership = await this.roomRepo.findActiveMembershipByStudentId(studentId);
    if (existingMembership) {
      throw new AppError(
        'Student is already an active member of a room. A student cannot have multiple active rooms.',
        409
      );
    }

    // Atomic transaction with row-level lock
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const roomLock = await this.roomRepo.lockRoomForUpdate(roomId, client);
      if (!roomLock) {
        throw new AppError('Room not found', 404);
      }

      if (roomLock.occupied >= roomLock.capacity) {
        throw new AppError('Room is already full', 409);
      }

      const member = await this.roomRepo.addRoomMember(roomId, studentId, client);

      await client.query('COMMIT');

      const updatedRoom = await this.roomRepo.findRoomWithVacancyById(roomId);
      return {
        room: updatedRoom!,
        memberId: member.id,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async removeMember(
    userId: string,
    roomId: string,
    studentId: string
  ): Promise<void> {
    await this.verifyRoomOwnership(userId, roomId);

    const activeMember = await this.roomRepo.findActiveMemberInRoom(roomId, studentId);
    if (!activeMember) {
      throw new AppError('Active room member not found for this student in this room', 404);
    }

    await this.roomRepo.removeRoomMember(roomId, studentId);
  }
}

export const roomService = new RoomService();
export default roomService;
