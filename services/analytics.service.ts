import api from './axios';

export const AnalyticsService = {
  getStats: async () => {
    const response = await api.get('/analytics');

    return response.data;
  },
};