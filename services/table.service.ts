import api from './axios';

export interface ITable {
  _id: string;
  label: string;
  section: string;
  capacity: number;
  x: number;
  y: number;
  shape: 'circle' | 'square' | 'rectangle';
  status: 'empty' | 'seated' | 'ordering' | 'waiting' | 'ready-to-pay' | 'needs-cleaning';
  currentSession?: {
    _id: string;
    checkId: string;
    seatedAt: string;
    partySize: number;
    serverName: string;
    status: string;
  } | null;
  isActive: boolean;
}

export const TableService = {
  getAll: async (): Promise<ITable[]> => {
    const res = await api.get('/tables');
    return res.data.data;
  },

  getOne: async (id: string): Promise<ITable> => {
    const res = await api.get(`/tables/${id}`);
    return res.data.data;
  },

  create: async (data: Partial<ITable>): Promise<ITable> => {
    const res = await api.post('/tables', data);
    return res.data.data;
  },

  update: async (id: string, data: Partial<ITable>): Promise<ITable> => {
    const res = await api.put(`/tables/${id}`, data);
    return res.data.data;
  },

  updateStatus: async (id: string, status: ITable['status']): Promise<ITable> => {
    const res = await api.patch(`/tables/${id}/status`, { status });
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/tables/${id}`);
  },

  seed: async () => {
    const res = await api.post('/tables/seed');
    return res.data;
  },
};
