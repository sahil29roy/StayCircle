import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { getToken, removeToken } from '../utils/secureStore';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://172.25.1.175:5000/api';

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor: attach Bearer token if available
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await getToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.warn('Error reading token in request interceptor:', err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 and parse clean error messages
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    if (error.response?.status === 401) {
      // Clear token upon 401 Unauthorized
      await removeToken();
    }

    let userFriendlyMessage = 'Something went wrong. Please try again.';

    if (!error.response) {
      userFriendlyMessage =
        'Unable to connect to StayCircle server. Please check your network connection and ensure the backend is running.';
    } else if (error.response.data?.message) {
      userFriendlyMessage = error.response.data.message;
    } else if (error.response.data?.errors && Array.isArray(error.response.data.errors)) {
      userFriendlyMessage = error.response.data.errors
        .map((e: any) => e.message || `${e.field} is invalid`)
        .join(', ');
    } else if (error.response.status === 404) {
      userFriendlyMessage = 'The requested resource was not found.';
    } else if (error.response.status === 403) {
      userFriendlyMessage = 'You do not have permission to perform this action.';
    } else if (error.response.status === 409) {
      userFriendlyMessage = 'A conflict occurred. This record may already exist.';
    } else if (error.response.status >= 500) {
      userFriendlyMessage = 'Server error. Our team has been notified.';
    }

    const enhancedError = new Error(userFriendlyMessage);
    (enhancedError as any).status = error.response?.status;
    (enhancedError as any).originalError = error;

    return Promise.reject(enhancedError);
  }
);

export default api;
