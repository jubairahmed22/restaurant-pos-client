// services/reservationService.ts
import api from '@/services/axios';

export interface CreateReservationPayload {
  fullName: string;
  email?: string;
  phone: string;
  people: number;
  date: string;   // "YYYY-MM-DD"
  time: string;   // "HH:MM"
  notes?: string;
}

export interface UpdateReservationPayload {
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  fullName?: string;
  email?: string;
  phone?: string;
  people?: number;
  date?: string;
  time?: string;
  notes?: string;
}

export interface GetReservationsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  date?: string;
}

export const ReservationService = {
  createReservation: async (data: CreateReservationPayload) => {
    const response = await api.post('/reservations', data);
    return response.data;
  },

  getAllReservationsAdmin: async (params: GetReservationsParams = {}) => {
    const response = await api.get('/reservations/admin', { params });
    return response.data;
  },

  updateReservation: async (id: string, data: UpdateReservationPayload) => {
    const response = await api.put(`/reservations/${id}`, data);
    return response.data;
  },

  deleteReservation: async (id: string) => {
    const response = await api.delete(`/reservations/${id}`);
    return response.data;
  },
};