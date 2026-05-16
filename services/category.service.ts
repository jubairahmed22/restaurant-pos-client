import api from './axios';

export const CategoryService = {
  getAllCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  // Changed to accept FormData to support image uploads
  createCategory: async (formData: FormData) => {
    const response = await api.post('/categories', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateCategory: async (id: string, formData: FormData) => {
    const response = await api.put(`/categories/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteCategory: async (id: string) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  }
};