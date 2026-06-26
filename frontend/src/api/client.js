import axios from 'axios';
import { useMemo } from 'react';
import { useAuth } from '../store/auth.jsx';

export function createApi(token) {
  const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL + '/api',
  });

  instance.interceptors.request.use((config) => {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return instance;
}

// Hook sugar for components
export function useApi() {
  const { token } = useAuth();
  return useMemo(() => createApi(token), [token]);
}