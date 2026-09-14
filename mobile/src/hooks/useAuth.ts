import { useAuthStore } from '../store/auth.store';

export const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const logout = useAuthStore((state) => state.logout);
  const restoreSession = useAuthStore((state) => state.restoreSession);

  const isStudent = user?.role === 'STUDENT';
  const isOwner = user?.role === 'OWNER';

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    isInitialized,
    isStudent,
    isOwner,
    login,
    register,
    logout,
    restoreSession,
  };
};

export default useAuth;
