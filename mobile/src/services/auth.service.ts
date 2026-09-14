import api from './api';
import {
  LoginCredentials,
  RegisterPayload,
  AuthSuccessResponse,
  ApiResponse,
} from '../types/auth';
import { User } from '../types/user';

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthSuccessResponse> {
    const response = await api.post<ApiResponse<AuthSuccessResponse>>(
      '/auth/register',
      payload
    );
    if (!response.data.data) {
      throw new Error(response.data.message || 'Registration failed');
    }
    return response.data.data;
  },

  async login(credentials: LoginCredentials): Promise<AuthSuccessResponse> {
    const response = await api.post<ApiResponse<AuthSuccessResponse>>(
      '/auth/login',
      credentials
    );
    if (!response.data.data) {
      throw new Error(response.data.message || 'Login failed');
    }
    return response.data.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<ApiResponse<{ user: User }>>('/auth/me');
    if (!response.data.data?.user) {
      throw new Error(response.data.message || 'Failed to fetch current user');
    }
    return response.data.data.user;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Stateless logout on server; local cleanup will proceed regardless
      console.warn('Server logout notice failed (proceeding with local cleanup):', err);
    }
  },
};

export default authService;
