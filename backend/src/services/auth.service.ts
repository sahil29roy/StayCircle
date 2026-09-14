import pool from '../config/db';
import { userRepository, UserRepository } from '../repositories/user.repository';
import { RegisterInput, LoginInput } from '../validators/auth.validator';
import { hashPassword, comparePassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import { AppError } from '../utils/appError';
import { AuthSuccessData } from '../types/auth';
import { SafeUser, UserWithProfile } from '../types/user';

export class AuthService {
  constructor(private userRepo: UserRepository = userRepository) {}

  async register(input: RegisterInput): Promise<AuthSuccessData> {
    // 1. Check for duplicate email
    const existingEmail = await this.userRepo.findByEmail(input.email);
    if (existingEmail) {
      throw new AppError('Email is already registered', 409);
    }

    // 2. Check for duplicate phone
    const existingPhone = await this.userRepo.findByPhone(input.phone);
    if (existingPhone) {
      throw new AppError('Phone number is already registered', 409);
    }

    // 3. Hash password
    const password_hash = await hashPassword(input.password);

    // 4. Atomic PostgreSQL transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const user = await this.userRepo.createUser(
        {
          name: input.name,
          email: input.email,
          phone: input.phone,
          password_hash,
          role: input.role,
        },
        client
      );

      let profile: any = null;

      if (input.role === 'STUDENT') {
        profile = await this.userRepo.createStudent(
          {
            user_id: user.id,
            gender: input.gender,
            college: input.college,
            course: input.course,
            year: input.year,
          },
          client
        );
      } else if (input.role === 'OWNER') {
        profile = await this.userRepo.createOwner(
          {
            user_id: user.id,
          },
          client
        );
      }

      await client.query('COMMIT');

      // 5. Generate JWT
      const token = signToken({
        userId: user.id,
        role: user.role,
      });

      const safeUser: SafeUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at,
      };

      return {
        token,
        user: {
          ...safeUser,
          profile,
        },
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async login(input: LoginInput): Promise<AuthSuccessData> {
    // 1. Find user by email
    const user = await this.userRepo.findByEmail(input.email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // 2. Compare password
    const isPasswordValid = await comparePassword(input.password, user.password_hash);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // 3. Generate token
    const token = signToken({
      userId: user.id,
      role: user.role,
    });

    // 4. Fetch complete user profile
    const userWithProfile = await this.userRepo.findUserWithProfileById(user.id);
    if (!userWithProfile) {
      throw new AppError('User account not found', 404);
    }

    return {
      token,
      user: userWithProfile,
    };
  }

  async getCurrentUser(userId: string): Promise<UserWithProfile> {
    const userWithProfile = await this.userRepo.findUserWithProfileById(userId);
    if (!userWithProfile) {
      throw new AppError('User not found', 404);
    }
    return userWithProfile;
  }
}

export const authService = new AuthService();
export default authService;
