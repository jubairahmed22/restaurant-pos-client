import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:51000/api/v1',

  timeout: 10000,

  withCredentials: true,

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