export type UserRole = 'STUDENT' | 'OWNER';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface StudentProfile {
  id: string;
  user_id: string;
  gender: Gender;
  college: string;
  course: string;
  year: number;
  budget_min?: number | null;
  budget_max?: number | null;
  food_preference?: string | null;
  smoking_preference?: string | null;
  sleep_schedule?: string | null;
  cleanliness_preference?: string | null;
  ac_preference?: string | null;
  room_preference?: string | null;
  created_at: string;
  updated_at: string;
}

export interface OwnerProfile {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
  profile?: StudentProfile | OwnerProfile | null;
}
