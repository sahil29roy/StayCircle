import jwt, { SignOptions } from 'jsonwebtoken';
import env from '../config/env';
import { JWTPayload } from '../types/auth';

export const signToken = (payload: JWTPayload): string => {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as any,
  };
  return jwt.sign(payload, env.JWT_SECRET, options);
};

export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, env.JWT_SECRET) as JWTPayload;
};
