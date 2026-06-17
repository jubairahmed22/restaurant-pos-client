import api from './axios';

export interface Blog {
  _id: string;
  title: string;
  paragraph: string;
  images: string[];
  videoLink: string;
  createdAt: string;
}

export const BlogService = {
  getAll: async (): Promise<Blog[]> => {
    const { data } = await api.get('/blogs');
    return data.data;
  },
  create: async (form: FormData): Promise<Blog> => {
    const { data } = await api.post('/blogs', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },
  update: async (id: string, form: FormData): Promise<Blog> => {
    const { data } = await api.put(`/blogs/${id}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/blogs/${id}`);
  },
};
