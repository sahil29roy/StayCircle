import { User, UserRole, Gender } from './user';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface StudentRegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'STUDENT';
  gender: Gender;
  college: string;
  course: string;
  year: number;
}

export interface OwnerRegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'OWNER';
}

export type RegisterPayload = StudentRegisterPayload | OwnerRegisterPayload;

export interface AuthSuccessResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: { field?: string; message: string }[];
}
