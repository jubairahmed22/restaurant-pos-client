import api from '@/services/axios';

// =========================================
// TYPES
// =========================================

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
  orderStatus?: 'placed' | 'preparing' | 'dispatched' | 'delivered' | 'cancelled';

  paymentStatus?: 'pending' | 'paid' | 'failed';

  fullName?: string;
  email?: string;
  phone?: string;
  shippingAddress?: string;
}

// =========================================
// ORDER SERVICE
// =========================================

export const OrderService = {

  // =========================================
  // CREATE ORDER
  // POST /orders
  // =========================================
  createOrder: async (orderData: CreateOrderPayload) => {

    const response = await api.post(
      '/orders',
      orderData
    );

    return response.data;
  },


  // =========================================
  // GET MY ORDERS
  // GET /orders
  // =========================================
  getMyOrders: async () => {

    const response = await api.get('/orders');

    return response.data;
  },


  // =========================================
  // GET ALL ORDERS (ADMIN)
  // GET /orders/admin
  // =========================================
  getAllOrdersAdmin: async ({
    page = 1,
    limit = 10,
    search = '',
    orderStatus = '',
    paymentStatus = '',
  }: {
    page?: number;
    limit?: number;
    search?: string;
    orderStatus?: string;
    paymentStatus?: string;
  }) => {

    const response = await api.get('/orders/admin', {
      params: {
        page,
        limit,
        search,
        orderStatus,
        paymentStatus,
      },
    });

    return response.data;
  },


  // =========================================
  // UPDATE ORDER STATUS
  // PUT /orders/:id/status
  // =========================================
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
};