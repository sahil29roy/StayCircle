import { UserRole, SafeUser, StudentProfile, OwnerProfile } from './user';

export interface JWTPayload {
  userId: string;
  role: UserRole;
}

export interface AuthSuccessData {
  token: string;
  user: SafeUser & {
    profile?: StudentProfile | OwnerProfile | null;
  };
}

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}
