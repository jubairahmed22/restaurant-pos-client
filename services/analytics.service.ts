import api from './axios';

export const AnalyticsService = {
  // Existing dashboard stats
  getStats: async () => {
    const response = await api.get('/analytics');
    return response.data;
  },

  // Financial Intelligence — revenue by session/method/period
  getFinancial: async (days = 30) => {
    const response = await api.get('/analytics/financial', { params: { days } });
    return response.data;
  },

  // Marketing Intelligence — peak hours, category performance, item velocity
  getMarketing: async (days = 30) => {
    const response = await api.get('/analytics/marketing', { params: { days } });
    return response.data;
  },

  // Conversion Funnel — order→paid rate, failure rate
  getConversion: async (days = 30) => {
    const response = await api.get('/analytics/conversion', { params: { days } });
    return response.data;
  },

  // Attribution — revenue by UTM source/medium/campaign
  getAttribution: async (days = 30) => {
    const response = await api.get('/analytics/attribution', { params: { days } });
    return response.data;
  },

  // Business Report — combined menu + shop revenue + reservations
  getBusiness: async (days = 30) => {
    const response = await api.get('/analytics/business', { params: { days } });
    return response.data;
  },
};
