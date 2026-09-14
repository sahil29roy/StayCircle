import { create } from 'zustand';
import { User } from '../types/user';
import { LoginCredentials, RegisterPayload } from '../types/auth';
import authService from '../services/auth.service';
import { getToken, saveToken, removeToken } from '../utils/secureStore';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,

  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
  },

  restoreSession: async () => {
    try {
      set({ isLoading: true });
      const storedToken = await getToken();

      if (!storedToken) {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isInitialized: true,
          isLoading: false,
        });
        return;
      }

      // Validate token with backend /api/auth/me
      const currentUser = await authService.getCurrentUser();
      set({
        user: currentUser,
        token: storedToken,
        isAuthenticated: true,
        isInitialized: true,
        isLoading: false,
      });
    } catch (error) {
      console.warn('Session restoration failed, invalidating token:', error);
      await removeToken();
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isInitialized: true,
        isLoading: false,
      });
    }
  },

  login: async (credentials) => {
    try {
      set({ isLoading: true });
      const { token, user } = await authService.login(credentials);
      await saveToken(token);

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });

      return user;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (payload) => {
    try {
      set({ isLoading: true });
      const { token, user } = await authService.register(payload);
      await saveToken(token);

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });

      return user;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true });
      await authService.logout();
    } catch (error) {
      console.warn('Logout API call error:', error);
    } finally {
      await removeToken();
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
}));

export default useAuthStore;
