import api from '@/services/axios';

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export interface OrderItemPayload {
  food: string;
  title: string;
  price: number;
  quantity: number;
}

export interface CreateOrderPayload {
  items: OrderItemPayload[];

  subtotal: number;
  deliveryCharge: number;
  total: number;

  fullName: string;
  email?: string;
  phone: string;

  shippingAddress: string;
}

export interface UpdateOrderStatusPayload {
  orderStatus?:
    | 'placed'
    | 'preparing'
    | 'dispatched'
    | 'delivered'
    | 'cancelled';

  paymentStatus?:
    | 'pending'
    | 'paid'
    | 'failed';

  fullName?: string;
  email?: string;
  phone?: string;
  shippingAddress?: string;
}

// ─────────────────────────────────────────────
// ADMIN QUERY TYPES
// ─────────────────────────────────────────────

export interface GetAllOrdersAdminParams {
  page?: number;
  limit?: number;

  search?: string;

  orderStatus?: string;
  paymentStatus?: string;

  startDate?: string;
  endDate?: string;

  quickFilter?:
    | 'today'
    | 'yesterday'
    | 'last7days'
    | 'last30days';
}

// ─────────────────────────────────────────────
// RESPONSE TYPES
// ─────────────────────────────────────────────

export interface AdminOrdersResponse<T = any> {
  success: boolean;

  data: T[];

  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };

  summary?: {
    totalOrders: number;
    totalRevenue: number;
    totalSubtotal: number;
    totalDeliveryCharge: number;
  };
}

// ─────────────────────────────────────────────
// ORDER SERVICE
// ─────────────────────────────────────────────

export const OrderService = {
  // ─────────────────────────────────────────
  // CREATE ORDER
  // ─────────────────────────────────────────
  createOrder: async (orderData: CreateOrderPayload) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },
ASDFASD
  // ─────────────────────────────────────────
  // GET MY ORDERS (USER)
  // ─────────────────────────────────────────
  getMyOrders: async () => {
    const response = await api.get('/orders');
    return response.data;
  },

  // ─────────────────────────────────────────
  // GET ALL ORDERS (ADMIN)
  // ─────────────────────────────────────────
  getAllOrdersAdmin: async (
    params: GetAllOrdersAdminParams = {}
  ): Promise<AdminOrdersResponse> => {
    const {
      page = 1,
      limit = 10,
      search = '',
      orderStatus = '',
      paymentStatus = '',
      startDate = '',
      endDate = '',
      quickFilter,
    } = params;

    const query: Record<string, any> = {
      page,
      limit,
    };

    // SEARCH
    if (search?.trim()) query.search = search.trim();

    // STATUS FILTERS
    if (orderStatus) query.orderStatus = orderStatus;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    // DATE FILTER
    if (startDate) query.startDate = startDate;
    if (endDate) query.endDate = endDate;

    // QUICK FILTER
    if (quickFilter) query.quickFilter = quickFilter;

    const response = await api.get('/orders/admin', {
      params: query,
    });

    return response.data;
  },

  // ─────────────────────────────────────────
  // UPDATE ORDER STATUS
  // ─────────────────────────────────────────
  updateOrderStatus: async (
    id: string,
    data: UpdateOrderStatusPayload
  ) => {
    const response = await api.put(
      `/orders/${id}/status`,
      data
    );

    return response.data;
  },

  // ─────────────────────────────────────────
  // DELETE SINGLE ORDER
  // ─────────────────────────────────────────
  deleteOrder: async (id: string) => {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  },

  // ─────────────────────────────────────────
  // DELETE ALL ORDERS (OPTIONAL ADMIN FEATURE)
  // ─────────────────────────────────────────
  deleteAllOrders: async () => {
    const response = await api.delete('/orders');
    return response.data;
  },
};