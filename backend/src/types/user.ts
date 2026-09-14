export type UserRole = 'STUDENT' | 'OWNER';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password_hash: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

export interface StudentProfile {
  id: string;
  user_id: string;
  gender: Gender;
  college: string;
  course: string;
  year: number;
  created_at: Date;
  updated_at: Date;
}

export interface OwnerProfile {
  id: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}

export type SafeUser = Omit<User, 'password_hash'>;

export interface UserWithProfile extends SafeUser {
  profile: StudentProfile | OwnerProfile | null;
}
