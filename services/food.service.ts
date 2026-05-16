import api from './axios';

export const FoodService = {
  getAllFoods: async (params: string = '') => {
    const response = await api.get(`/foods?${params}`);
    return response.data;
  },
  
  getFoodBySlug: async (slug: string) => {
    const response = await api.get(`/foods/slug/${slug}`);
    return response.data;
  },

  createFood: async (formData: FormData) => {
    const response = await api.post('/foods', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteFood: async (id: string) => {
    const response = await api.delete(`/foods/${id}`);
    return response.data;
  }
};