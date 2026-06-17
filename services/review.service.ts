import api from './axios';

export interface Review {
  _id: string;
  url: string;
  title: string;
  description: string;
  image: string;
  favicon: string;
  domain: string;
  siteName: string;
  createdAt: string;
}

export const ReviewService = {
  getAll: async (): Promise<Review[]> => {
    const { data } = await api.get('/reviews');
    return data.data;
  },
  create: async (payload: Omit<Review, '_id' | 'createdAt'>): Promise<Review> => {
    const { data } = await api.post('/reviews', payload);
    return data.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/reviews/${id}`);
  },
};
