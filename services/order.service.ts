import api from './axios';

export const OrderService = {
  createOrder: async (orderData: any) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  createPaymentIntent: async (orderId: string) => {
    const response = await api.post('/orders/payment-intent', { orderId });
    return response.data;
  },

  confirmPayment: async (orderId: string, paymentIntentId: string) => {
    const response = await api.post('/orders/confirm-payment', { orderId, paymentIntentId });
    return response.data;
  },

  getMyOrders: async () => {
    const response = await api.get('/orders');
    return response.data;
  }
};