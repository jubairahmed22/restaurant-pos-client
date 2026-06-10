import axios from 'axios';

// Use a relative baseURL so all API calls go through Next.js rewrites proxy.
// On localhost: Next.js forwards /api/v1/* → https://ortazz.com.au/api/v1/*
// On Vercel:    same — no CORS involved at all, browser stays on same origin.
const api = axios.create({
  baseURL: '/api/v1',

  timeout: 15000,

  withCredentials: false, // not needed — same-origin via proxy

  headers: {
    'Content-Type': 'application/json',
  },
});

// ─────────────────────────────────────────────
// REQUEST INTERCEPTOR
// ─────────────────────────────────────────────

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      try {
        // Zustand persist storage
        const storage = localStorage.getItem(
          'restaurant-auth-storage'
        );

        if (storage) {
          const parsedStorage = JSON.parse(storage);

          // token location
          const token = parsedStorage?.state?.token;

          // attach token
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
      } catch (error) {
        console.error(
          'Failed to parse auth storage:',
          error
        );
      }
    }

    return config;
  },

  (error) => Promise.reject(error)
);

// ─────────────────────────────────────────────
// RESPONSE INTERCEPTOR
// ─────────────────────────────────────────────

api.interceptors.response.use(
  (response) => response,

  (error) => {
    // Handle unauthorized globally
    if (error?.response?.status === 401) {
      console.error('Unauthorized request');

      // Optional:
      localStorage.removeItem('restaurant-auth-storage');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;