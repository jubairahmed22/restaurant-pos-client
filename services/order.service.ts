import api from '@/services/axios';

export interface CreateOrderPayload {
  items: {
    food: string;
    title: string;
    price: number;
    quantity: number;
  }[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  shippingAddress: string;
}

export const OrderService = {
  /** POST /orders — place a cash order */
  createOrder: async (orderData: CreateOrderPayload) => {
    const response = await api.post('/orders', orderData);
    return response.data; // { success: true, data: Order }
  },

  /** GET /orders — current user's order history */
  getMyOrders: async () => {
    const response = await api.get('/orders');
    return response.data;
  },
};