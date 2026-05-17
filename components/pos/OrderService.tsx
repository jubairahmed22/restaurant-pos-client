import api from "@/services/axios";

export const OrderService = {
  /**
   * Place a cash order.
   * Returns the created order object on success.
   */
  createOrder: async (orderData: {
    items: { food: string; title: string; price: number; quantity: number }[];
    subtotal: number;
    deliveryCharge: number;
    total: number;
    shippingAddress: string;
  }) => {
    const response = await api.post('/orders', orderData);
    return response.data; // { success: true, data: Order }
  },

  /**
   * Fetch the current user's order history.
   */
  getMyOrders: async () => {
    const response = await api.get('/orders');
    return response.data;
  },
};