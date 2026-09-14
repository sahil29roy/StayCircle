import { Pool, PoolClient } from 'pg';
import pool from '../config/db';
import {
  User,
  UserRole,
  StudentProfile,
  OwnerProfile,
  UserWithProfile,
  Gender,
} from '../types/user';

type DbExecutor = Pool | PoolClient;

export interface CreateUserInput {
  name: string;
  email: string;
  phone: string;
  password_hash: string;
  role: UserRole;
}

export interface CreateStudentInput {
  user_id: string;
  gender: Gender;
  college: string;
  course: string;
  year: number;
}

export interface CreateOwnerInput {
  user_id: string;
}

export class UserRepository {
  async findByEmail(email: string, executor: DbExecutor = pool): Promise<User | null> {
    const queryText = `
      SELECT id, name, email, phone, password_hash, role, created_at, updated_at
      FROM users
      WHERE email = $1
      LIMIT 1
    `;
    const result = await executor.query<User>(queryText, [email]);
    return result.rows[0] || null;
  }

  async findByPhone(phone: string, executor: DbExecutor = pool): Promise<User | null> {
    const queryText = `
      SELECT id, name, email, phone, password_hash, role, created_at, updated_at
      FROM users
      WHERE phone = $1
      LIMIT 1
    `;
    const result = await executor.query<User>(queryText, [phone]);
    return result.rows[0] || null;
  }

  async findById(id: string, executor: DbExecutor = pool): Promise<User | null> {
    const queryText = `
      SELECT id, name, email, phone, password_hash, role, created_at, updated_at
      FROM users
      WHERE id = $1
      LIMIT 1
    `;
    const result = await executor.query<User>(queryText, [id]);
    return result.rows[0] || null;
  }

  async createUser(input: CreateUserInput, executor: DbExecutor = pool): Promise<User> {
    const queryText = `
      INSERT INTO users (name, email, phone, password_hash, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, email, phone, password_hash, role, created_at, updated_at
    `;
    const values = [input.name, input.email, input.phone, input.password_hash, input.role];
    const result = await executor.query<User>(queryText, values);
    return result.rows[0];
  }

  async createStudent(
    input: CreateStudentInput,
    executor: DbExecutor = pool
  ): Promise<StudentProfile> {
    const queryText = `
      INSERT INTO students (user_id, gender, college, course, year)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, user_id, gender, college, course, year, created_at, updated_at
    `;
    const values = [input.user_id, input.gender, input.college, input.course, input.year];
    const result = await executor.query<StudentProfile>(queryText, values);
    return result.rows[0];
  }

  async createOwner(
    input: CreateOwnerInput,
    executor: DbExecutor = pool
  ): Promise<OwnerProfile> {
    const queryText = `
      INSERT INTO owners (user_id)
      VALUES ($1)
      RETURNING id, user_id, created_at, updated_at
    `;
    const values = [input.user_id];
    const result = await executor.query<OwnerProfile>(queryText, values);
    return result.rows[0];
  }

  async findUserWithProfileById(
    id: string,
    executor: DbExecutor = pool
  ): Promise<UserWithProfile | null> {
    const queryText = `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.phone,
        u.role,
        u.created_at,
        u.updated_at,
        CASE 
          WHEN u.role = 'STUDENT' THEN (
            SELECT row_to_json(s)
            FROM (
              SELECT id, user_id, gender, college, course, year, created_at, updated_at
              FROM students WHERE user_id = u.id
            ) s
          )
          WHEN u.role = 'OWNER' THEN (
            SELECT row_to_json(o)
            FROM (
              SELECT id, user_id, created_at, updated_at
              FROM owners WHERE user_id = u.id
            ) o
          )
          ELSE NULL
        END AS profile
      FROM users u
      WHERE u.id = $1
      LIMIT 1
    `;
    const result = await executor.query<UserWithProfile>(queryText, [id]);
    return result.rows[0] || null;
  }
}

export const userRepository = new UserRepository();
export default userRepository;
