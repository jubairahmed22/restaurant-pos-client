import api from './axios';

// ── Types ─────────────────────────────────────────────────

export interface ISection {
  _id: string;
  name: string;
  label: string;
  tableCount: number;
}

export interface IFloorPlan {
  _id: string;
  name: string;
  location: string;
  sections: ISection[];
  tableCount?: number;
  isActive: boolean;
  createdAt: string;
  tables?: IFloorPlanTable[];
}

export interface IFloorPlanTable {
  _id: string;
  label: string;
  section: string;
  sectionId: string;
  floorPlan: string;
  capacity: number;
  x: number;
  y: number;
  width: number;
  height: number;
  shape: 'circle' | 'square' | 'rectangle';
  isPlaced: boolean;
  status: 'empty' | 'seated' | 'ordering' | 'waiting' | 'ready-to-pay' | 'needs-cleaning';
  currentSession?: {
    _id: string;
    checkId: string;
    seatedAt: string;
    partySize: number;
    serverName: string;
    status: string;
  } | null;
}

export interface AddSectionPayload {
  name: string;
  label?: string;
  tableCount: number;
  naming: 'auto' | 'custom';
  tableNames?: string[];
}

// ── Service ───────────────────────────────────────────────

export const FloorPlanService = {
  getAll: async (): Promise<IFloorPlan[]> => {
    const { data } = await api.get('/floor-plans');
    return data.data;
  },

  create: async (payload: { name: string; location: string }): Promise<IFloorPlan> => {
    const { data } = await api.post('/floor-plans', payload);
    return data.data;
  },

  getOne: async (id: string): Promise<IFloorPlan & { tables: IFloorPlanTable[] }> => {
    const { data } = await api.get(`/floor-plans/${id}`);
    return data.data;
  },

  update: async (id: string, payload: { name?: string; location?: string }): Promise<IFloorPlan> => {
    const { data } = await api.put(`/floor-plans/${id}`, payload);
    return data.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/floor-plans/${id}`);
  },

  addSection: async (
    id: string,
    payload: AddSectionPayload
  ): Promise<{ section: ISection; tables: IFloorPlanTable[] }> => {
    const { data } = await api.post(`/floor-plans/${id}/sections`, payload);
    return data.data;
  },

  removeSection: async (id: string, sectionId: string): Promise<IFloorPlan> => {
    const { data } = await api.delete(`/floor-plans/${id}/sections/${sectionId}`);
    return data.data;
  },

  saveLayout: async (
    id: string,
    tables: Array<{
      _id: string;
      x: number;
      y: number;
      shape: string;
      width: number;
      height: number;
      isPlaced: boolean;
    }>
  ): Promise<{ success: boolean }> => {
    const { data } = await api.put(`/floor-plans/${id}/layout`, { tables });
    return data;
  },
};
