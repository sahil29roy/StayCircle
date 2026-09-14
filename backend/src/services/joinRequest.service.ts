import pool from '../config/db';
import { joinRequestRepository, JoinRequestRepository } from '../repositories/joinRequest.repository';
import { roomRepository, RoomRepository } from '../repositories/room.repository';
import { studentRepository, StudentRepository } from '../repositories/student.repository';
import { pgRepository, PGRepository } from '../repositories/pg.repository';
import { CreateJoinRequestInput } from '../validators/joinRequest.validator';
import { AppError } from '../utils/appError';
import { JoinRequest, JoinRequestWithDetails } from '../types/joinRequest';

export class JoinRequestService {
  constructor(
    private joinRequestRepo: JoinRequestRepository = joinRequestRepository,
    private roomRepo: RoomRepository = roomRepository,
    private studentRepo: StudentRepository = studentRepository,
    private pgRepo: PGRepository = pgRepository
  ) {}

  async createRequest(
    userId: string,
    roomId: string,
    input: CreateJoinRequestInput
  ): Promise<JoinRequest> {
    const student = await this.studentRepo.findStudentByUserId(userId);
    if (!student) {
      throw new AppError('Student profile not found for authenticated user', 404);
    }

    const room = await this.roomRepo.findRoomWithVacancyById(roomId);
    if (!room) {
      throw new AppError('Room not found', 404);
    }

    if (room.vacant <= 0) {
      throw new AppError('Cannot send request: Room is already full', 409);
    }

    // Check if student is already active in a room
    const activeMembership = await this.roomRepo.findActiveMembershipByStudentId(student.id);
    if (activeMembership) {
      throw new AppError('You are already an active resident in a room', 409);
    }

    // Check for existing pending request for this room
    const existingPending = await this.joinRequestRepo.findPendingRequest(roomId, student.id);
    if (existingPending) {
      throw new AppError('You already have a pending join request for this room', 409);
    }

    return this.joinRequestRepo.createRequest(roomId, student.id, input.message);
  }

  async getStudentRequests(
    userId: string,
    status?: string
  ): Promise<JoinRequestWithDetails[]> {
    const student = await this.studentRepo.findStudentByUserId(userId);
    if (!student) {
      throw new AppError('Student profile not found for authenticated user', 404);
    }

    return this.joinRequestRepo.findRequestsByStudentId(student.id, status);
  }

  async getOwnerRequests(
    userId: string,
    status?: string
  ): Promise<JoinRequestWithDetails[]> {
    const owner = await this.pgRepo.findOwnerByUserId(userId);
    if (!owner) {
      throw new AppError('Owner profile not found for authenticated user', 404);
    }

    return this.joinRequestRepo.findRequestsByOwnerId(owner.id, status);
  }

  async handleRequestStatus(
    userId: string,
    requestId: string,
    newStatus: 'ACCEPTED' | 'REJECTED'
  ): Promise<JoinRequestWithDetails> {
    const request = await this.joinRequestRepo.findRequestById(requestId);
    if (!request) {
      throw new AppError('Join request not found', 404);
    }

    if (request.status !== 'PENDING') {
      throw new AppError(`Cannot update join request that is already ${request.status}`, 400);
    }

    // Verify authenticated user is the owner of the PG
    const owner = await this.pgRepo.findOwnerByUserId(userId);
    const pgOwnerId = await this.joinRequestRepo.findOwnerIdByRoomId(request.room_id);

    if (!owner || !pgOwnerId || owner.id !== pgOwnerId) {
      throw new AppError('Forbidden: You do not own the PG for this room', 403);
    }

    if (newStatus === 'REJECTED') {
      await this.joinRequestRepo.updateRequestStatus(requestId, 'REJECTED');
      const updated = await this.joinRequestRepo.findRequestWithDetailsById(requestId);
      return updated!;
    }

    // Atomic transaction for ACCEPTED state with row lock on rooms
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Lock room and verify vacancy in serialized transaction
      const roomLock = await this.roomRepo.lockRoomForUpdate(request.room_id, client);
      if (!roomLock) {
        throw new AppError('Room not found', 404);
      }

      if (roomLock.occupied >= roomLock.capacity) {
        throw new AppError('Room is already full', 409);
      }

      // 2. Check student active membership status
      const activeMembership = await this.roomRepo.findActiveMembershipByStudentId(
        request.student_id,
        client
      );
      if (activeMembership) {
        throw new AppError('Student is already an active member of another room', 409);
      }

      // 3. Add student to room_members
      await this.roomRepo.addRoomMember(request.room_id, request.student_id, client);

      // 4. Update request status to ACCEPTED
      await this.joinRequestRepo.updateRequestStatus(requestId, 'ACCEPTED', client);

      await client.query('COMMIT');

      const updated = await this.joinRequestRepo.findRequestWithDetailsById(requestId);
      return updated!;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

export const joinRequestService = new JoinRequestService();
export default joinRequestService;
