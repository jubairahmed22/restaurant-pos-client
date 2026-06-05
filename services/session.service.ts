import api from './axios';

export type ItemStatus = 'ordered' | 'sent' | 'preparing' | 'ready' | 'served';
export type SessionStatus = 'seated' | 'ordering' | 'waiting' | 'ready-to-pay';
export type ItemCourse = 'drink' | 'starter' | 'main' | 'dessert';

export interface ISessionItem {
  _id: string;
  productId: string;
  name: string;
  price: number;
  qty: number;
  notes: string;
  course: ItemCourse;
  status: ItemStatus;
  guestIndex: number | null;
  sentAt: string | null;
  servedAt: string | null;
}

export interface ITableSession {
  _id: string;
  checkId: string;
  table: string;
  tableLabel: string;
  tableSection: string;
  seatedAt: string;         // ISO string — use for timer init
  partySize: number;
  serverName: string;
  reservationRef: string | null;
  status: SessionStatus;
  orderItems: ISessionItem[];
  subtotal: number;
  discountValue: number;
  discountType: 'pct' | 'fixed';
  discountReason: string;
  serviceCharge: number;
  tax: number;
  total: number;
  paymentMethod: string;
  paymentStatus: 'unpaid' | 'paid';
  isCompleted: boolean;
  splitMode: boolean;
  guestCount: number;
}

export interface CreateSessionPayload {
  tableId: string;
  partySize: number;
  serverName?: string;
  reservationRef?: string;
  guestCount?: number;
}

export const SessionService = {
  // Create a new session (seat a table)
  create: async (payload: CreateSessionPayload): Promise<ITableSession> => {
    const res = await api.post('/sessions', payload);
    return res.data.data;
  },

  // Get active session for a table
  getActiveForTable: async (tableId: string): Promise<ITableSession> => {
    const res = await api.get(`/sessions/table/${tableId}`);
    return res.data.data;
  },

  // Get session by ID
  getById: async (sessionId: string): Promise<ITableSession> => {
    const res = await api.get(`/sessions/${sessionId}`);
    return res.data.data;
  },

  // Add / update / remove item
  updateItems: async (
    sessionId: string,
    action: 'add' | 'update' | 'remove',
    item: Partial<ISessionItem> & { id?: string; updates?: Partial<ISessionItem> }
  ): Promise<ITableSession> => {
    const res = await api.patch(`/sessions/${sessionId}/items`, { action, item });
    return res.data.data;
  },

  // Send unsent items to kitchen
  sendToKitchen: async (sessionId: string, itemIds: string[]): Promise<ITableSession> => {
    const res = await api.patch(`/sessions/${sessionId}/send-kitchen`, { itemIds });
    return res.data.data;
  },

  // Update item status (kitchen use)
  updateItemStatus: async (
    sessionId: string,
    itemId: string,
    status: ItemStatus
  ): Promise<ITableSession> => {
    const res = await api.patch(`/sessions/${sessionId}/item-status`, { itemId, status });
    return res.data.data;
  },

  // Apply discount
  applyDiscount: async (
    sessionId: string,
    discountValue: number,
    discountType: 'pct' | 'fixed',
    discountReason: string
  ): Promise<ITableSession> => {
    const res = await api.patch(`/sessions/${sessionId}/discount`, {
      discountValue, discountType, discountReason,
    });
    return res.data.data;
  },

  // Complete session (process payment)
  complete: async (sessionId: string, paymentMethod: string): Promise<ITableSession> => {
    const res = await api.post(`/sessions/${sessionId}/complete`, { paymentMethod });
    return res.data.data;
  },

  // Update session status
  updateStatus: async (sessionId: string, status: SessionStatus): Promise<ITableSession> => {
    const res = await api.patch(`/sessions/${sessionId}/status`, { status });
    return res.data.data;
  },

  // All active (non-completed) sessions
  getActiveSessions: async (): Promise<ITableSession[]> => {
    const res = await api.get('/sessions/active');
    return res.data.data;
  },

  // Completed sessions for reporting
  getCompleted: async (params?: { page?: number; limit?: number; startDate?: string; endDate?: string }) => {
    const res = await api.get('/sessions', { params });
    return res.data;
  },
};
