import api from './axios';

export const MeService = {
  getMe: async () => {
    const response = await api.get('/me');
    return response.data;
  },
};