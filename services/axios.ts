import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:51000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Outbound interceptor to inject Authorization header tokens dynamically
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const storage = localStorage.getItem('restaurant-auth-storage');
      if (storage) {
        try {
          const parsed = JSON.parse(storage);
          const token = parsed?.state?.token;
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (e) {
          console.error('Error reading auth state from local storage token block:', e);
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;