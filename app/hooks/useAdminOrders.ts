import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/axios';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OrderItem {
  _id: string;
  title: string;
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;
  orderId: string;
  user?: { name: string; email: string };
  items: OrderItem[];
  total: number;
  subtotal: number;
  deliveryCharge: number;
  orderStatus: 'placed' | 'preparing' | 'dispatched' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod: string;
  shippingAddress: string;
  createdAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface OrderFilters {
  orderStatus: string;
  paymentStatus: string;
  search: string;
}

const LIMIT = 10;
// Poll every 15 seconds so new POS orders appear automatically
const REFETCH_INTERVAL = 15_000;

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAdminOrders() {
  const queryClient = useQueryClient();

  const [page, setPage]         = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters]   = useState<OrderFilters>({
    orderStatus: '',
    paymentStatus: '',
    search: '',
  });

  // Build params object sent to the backend
  const params: Record<string, string | number> = { page, limit: LIMIT };
  if (filters.orderStatus)   params.orderStatus   = filters.orderStatus;
  if (filters.paymentStatus) params.paymentStatus = filters.paymentStatus;
  if (filters.search)        params.search        = filters.search;

  // ── Query ──────────────────────────────────────────────────────────────────
  const {
    data: res,
    isLoading,
    isFetching,
    dataUpdatedAt,
    refetch,
  } = useQuery({
    queryKey: ['admin-orders', page, filters],
    queryFn: async () => {
      const response = await api.get('/orders/admin', { params });
      return response.data as { success: boolean; pagination: Pagination; data: Order[] };
    },
    placeholderData: (prev) => prev,       // keep stale data while fetching
    refetchInterval: REFETCH_INTERVAL,     // auto-poll every 15 s
    refetchIntervalInBackground: false,    // pause polling when tab is hidden
  });

  // ── Status update mutation ─────────────────────────────────────────────────
  const updateStatus = useMutation({
    mutationFn: ({ id, orderStatus }: { id: string; orderStatus: string }) =>
      api.put(`/orders/${id}/status`, { orderStatus }),
    onSuccess: () => {
      // Invalidate so the table refreshes immediately after a status change
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Order status updated');
    },
    onError: () => toast.error('Failed to update status'),
  });

  // ── Filter helpers ─────────────────────────────────────────────────────────
  const applySearch = () => {
    setFilters(f => ({ ...f, search: searchInput.trim() }));
    setPage(1);
  };

  const applyFilter = (key: keyof OrderFilters, value: string) => {
    setFilters(f => ({ ...f, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ orderStatus: '', paymentStatus: '', search: '' });
    setSearchInput('');
    setPage(1);
  };

  const hasActiveFilters =
    filters.orderStatus || filters.paymentStatus || filters.search;

  return {
    // data
    orders:     res?.data ?? [],
    pagination: res?.pagination,
    // states
    isLoading,
    isFetching,
    dataUpdatedAt,
    // filter state
    filters,
    searchInput,
    setSearchInput,
    hasActiveFilters,
    // actions
    setPage,
    applySearch,
    applyFilter,
    clearFilters,
    refetch,
    updateStatus,
  };
}