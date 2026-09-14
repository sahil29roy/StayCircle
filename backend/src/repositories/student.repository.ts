import { Pool, PoolClient } from 'pg';
import pool from '../config/db';
import { UpdateStudentPreferencesInput } from '../validators/student.validator';

type DbExecutor = Pool | PoolClient;

export interface StudentWithUser {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  college: string;
  course: string;
  year: number;
  budget_min: number | null;
  budget_max: number | null;
  food_preference: string | null;
  smoking_preference: string | null;
  sleep_schedule: string | null;
  cleanliness_preference: string | null;
  ac_preference: string | null;
  room_preference: string | null;
  created_at: Date;
  updated_at: Date;
}

export class StudentRepository {
  async findStudentByUserId(
    userId: string,
    executor: DbExecutor = pool
  ): Promise<StudentWithUser | null> {
    const query = `
      SELECT 
        s.id,
        s.user_id,
        u.name,
        u.email,
        u.phone,
        s.gender,
        s.college,
        s.course,
        s.year,
        s.budget_min::float,
        s.budget_max::float,
        s.food_preference,
        s.smoking_preference,
        s.sleep_schedule,
        s.cleanliness_preference,
        s.ac_preference,
        s.room_preference,
        s.created_at,
        s.updated_at
      FROM students s
      JOIN users u ON u.id = s.user_id
      WHERE s.user_id = $1
      LIMIT 1
    `;
    const result = await executor.query<StudentWithUser>(query, [userId]);
    return result.rows[0] || null;
  }

  async findStudentById(
    id: string,
    executor: DbExecutor = pool
  ): Promise<StudentWithUser | null> {
    const query = `
      SELECT 
        s.id,
        s.user_id,
        u.name,
        u.email,
        u.phone,
        s.gender,
        s.college,
        s.course,
        s.year,
        s.budget_min::float,
        s.budget_max::float,
        s.food_preference,
        s.smoking_preference,
        s.sleep_schedule,
        s.cleanliness_preference,
        s.ac_preference,
        s.room_preference,
        s.created_at,
        s.updated_at
      FROM students s
      JOIN users u ON u.id = s.user_id
      WHERE s.id = $1
      LIMIT 1
    `;
    const result = await executor.query<StudentWithUser>(query, [id]);
    return result.rows[0] || null;
  }

  async updateStudentPreferences(
    studentId: string,
    data: UpdateStudentPreferencesInput,
    executor: DbExecutor = pool
  ): Promise<StudentWithUser | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.budgetMin !== undefined) {
      fields.push(`budget_min = $${idx++}`);
      values.push(data.budgetMin);
    }
    if (data.budgetMax !== undefined) {
      fields.push(`budget_max = $${idx++}`);
      values.push(data.budgetMax);
    }
    if (data.foodPreference !== undefined) {
      fields.push(`food_preference = $${idx++}`);
      values.push(data.foodPreference);
    }
    if (data.smokingPreference !== undefined) {
      fields.push(`smoking_preference = $${idx++}`);
      values.push(data.smokingPreference);
    }
    if (data.sleepSchedule !== undefined) {
      fields.push(`sleep_schedule = $${idx++}`);
      values.push(data.sleepSchedule);
    }
    if (data.cleanlinessPreference !== undefined) {
      fields.push(`cleanliness_preference = $${idx++}`);
      values.push(data.cleanlinessPreference);
    }
    if (data.acPreference !== undefined) {
      fields.push(`ac_preference = $${idx++}`);
      values.push(data.acPreference);
    }
    if (data.roomPreference !== undefined) {
      fields.push(`room_preference = $${idx++}`);
      values.push(data.roomPreference);
    }

    if (fields.length === 0) {
      return this.findStudentById(studentId, executor);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(studentId);

    const query = `
      UPDATE students
      SET ${fields.join(', ')}
      WHERE id = $${idx}
    `;

    await executor.query(query, values);
    return this.findStudentById(studentId, executor);
  }
}

export const studentRepository = new StudentRepository();
export default studentRepository;
