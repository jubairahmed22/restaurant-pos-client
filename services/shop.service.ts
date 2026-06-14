import api from './axios';

// ─── Categories ────────────────────────────────────────────────────────────────
export const getShopCategories = async (query = '') => {
  const { data } = await api.get(`/shop/categories${query ? `?${query}` : ''}`);
  return data;
};
export const createShopCategory = async (body: Record<string, unknown>) => {
  const { data } = await api.post('/shop/categories', body);
  return data;
};
export const updateShopCategory = async (id: string, body: Record<string, unknown>) => {
  const { data } = await api.put(`/shop/categories/${id}`, body);
  return data;
};
export const deleteShopCategory = async (id: string) => {
  const { data } = await api.delete(`/shop/categories/${id}`);
  return data;
};

// ─── Products ──────────────────────────────────────────────────────────────────
export const getShopProductsAdmin = async (query = '') => {
  const { data } = await api.get(`/shop/products/admin${query ? `?${query}` : ''}`);
  return data;
};
export const getShopProducts = async (query = '') => {
  const { data } = await api.get(`/shop/products${query ? `?${query}` : ''}`);
  return data;
};
export const getShopProduct = async (id: string) => {
  const { data } = await api.get(`/shop/products/${id}`);
  return data;
};
export const createShopProduct = async (body: Record<string, unknown>) => {
  const { data } = await api.post('/shop/products', body);
  return data;
};
export const updateShopProduct = async (id: string, body: Record<string, unknown>) => {
  const { data } = await api.put(`/shop/products/${id}`, body);
  return data;
};
export const deleteShopProduct = async (id: string) => {
  const { data } = await api.delete(`/shop/products/${id}`);
  return data;
};
export const toggleFeatured = async (id: string) => {
  const { data } = await api.patch(`/shop/products/${id}/featured`);
  return data;
};
export const toggleAvailable = async (id: string) => {
  const { data } = await api.patch(`/shop/products/${id}/available`);
  return data;
};
export const bulkDiscount = async (body: { productIds: string[]; discountType: string; discountValue: number; discountEndDate?: string }) => {
  const { data } = await api.post('/shop/products/bulk-discount', body);
  return data;
};

// ─── Offers ────────────────────────────────────────────────────────────────────
export const getShopOffers = async (query = '') => {
  const { data } = await api.get(`/shop/offers${query ? `?${query}` : ''}`);
  return data;
};
export const createShopOffer = async (body: Record<string, unknown>) => {
  const { data } = await api.post('/shop/offers', body);
  return data;
};
export const updateShopOffer = async (id: string, body: Record<string, unknown>) => {
  const { data } = await api.put(`/shop/offers/${id}`, body);
  return data;
};
export const deleteShopOffer = async (id: string) => {
  const { data } = await api.delete(`/shop/offers/${id}`);
  return data;
};

// ─── Stats ─────────────────────────────────────────────────────────────────────
export const getShopStats = async () => {
  const { data } = await api.get('/shop/stats');
  return data;
};

// ─── Orders ────────────────────────────────────────────────────────────────────
export const getShopOrders = async (query = '') => {
  const { data } = await api.get(`/shop/orders${query ? `?${query}` : ''}`);
  return data;
};
export const placeShopOrder = async (body: Record<string, unknown>) => {
  const { data } = await api.post('/shop/orders', body);
  return data;
};
export const updateShopOrderStatus = async (id: string, body: { orderStatus?: string; paymentStatus?: string }) => {
  const { data } = await api.patch(`/shop/orders/${id}/status`, body);
  return data;
};
