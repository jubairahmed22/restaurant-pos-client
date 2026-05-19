'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { OrderService } from '@/services/order.service';

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export interface OrderItem {
  _id: string;
  food: string;
  title: string;
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;
  orderId: string;

  user: string;

  fullName: string;
  email?: string;
  phone: string;

  items: OrderItem[];

  subtotal: number;
  deliveryCharge: number;
  total: number;

  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed';

  orderStatus:
    | 'placed'
    | 'preparing'
    | 'dispatched'
    | 'delivered'
    | 'cancelled';

  shippingAddress: string;

  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// ─────────────────────────────────────────────

export interface OrderFilters {
  orderStatus: string;
  paymentStatus: string;
  search: string;

  startDate: string;
  endDate: string;

  quickFilter: '' | 'today' | 'yesterday' | 'last7days' | 'last30days';
}

// ─────────────────────────────────────────────

const LIMIT = 10;
const REFETCH_INTERVAL = 15000;

// ─────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────

export function useAdminOrders() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');

  const [filters, setFilters] = useState<OrderFilters>({
    orderStatus: '',
    paymentStatus: '',
    search: '',
    startDate: '',
    endDate: '',
    quickFilter: '',
  });

  // ─────────────────────────────────────────────
  // QUERY
  // ─────────────────────────────────────────────

  const {
    data: res,
    isLoading,
    isFetching,
    refetch,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ['admin-orders', page, filters],

    queryFn: async () => {
      return await OrderService.getAllOrdersAdmin({
        page,
        limit: LIMIT,

        search: filters.search,
        orderStatus: filters.orderStatus,
        paymentStatus: filters.paymentStatus,

        startDate: filters.startDate,
        endDate: filters.endDate,

        quickFilter: filters.quickFilter || undefined,
      });
    },

    placeholderData: (prev) => prev,
    refetchInterval: REFETCH_INTERVAL,
    refetchIntervalInBackground: false,
  });

  // ─────────────────────────────────────────────
  // UPDATE STATUS
  // ─────────────────────────────────────────────

  const updateStatus = useMutation({
    mutationFn: ({
      id,
      orderStatus,
      paymentStatus,
    }: {
      id: string;
      orderStatus?: Order['orderStatus'];
      paymentStatus?: Order['paymentStatus'];
    }) =>
      OrderService.updateOrderStatus(id, {
        orderStatus,
        paymentStatus,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Order updated successfully');
    },

    onError: () => {
      toast.error('Failed to update order');
    },
  });

  // ─────────────────────────────────────────────
  // FILTER HELPERS
  // ─────────────────────────────────────────────

  const applySearch = () => {
    setFilters((prev) => ({
      ...prev,
      search: searchInput.trim(),
    }));
    setPage(1);
  };

  const applyFilter = (key: keyof OrderFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPage(1);
  };

  // ─────────────────────────────────────────────
  // QUICK FILTER LOGIC (FIXED)
  // ─────────────────────────────────────────────

  const applyQuickFilter = (value: OrderFilters['quickFilter']) => {
    const now = new Date();

    let startDate = '';
    let endDate = '';

    if (value === 'today') {
      startDate = new Date(now.setHours(0, 0, 0, 0)).toISOString();
      endDate = new Date().toISOString();
    }

    if (value === 'yesterday') {
      const start = new Date();
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);

      const end = new Date();
      end.setDate(end.getDate() - 1);
      end.setHours(23, 59, 59, 999);

      startDate = start.toISOString();
      endDate = end.toISOString();
    }

    if (value === 'last7days') {
      const start = new Date();
      start.setDate(start.getDate() - 7);
      startDate = start.toISOString();
      endDate = new Date().toISOString();
    }

    if (value === 'last30days') {
      const start = new Date();
      start.setDate(start.getDate() - 30);
      startDate = start.toISOString();
      endDate = new Date().toISOString();
    }

    setFilters((prev) => ({
      ...prev,
      quickFilter: value,
      startDate,
      endDate,
    }));

    setPage(1);
  };

  // ─────────────────────────────────────────────
  // DATE RANGE
  // ─────────────────────────────────────────────

  const applyDateRange = (start: string, end: string) => {
    setFilters((prev) => ({
      ...prev,
      startDate: start,
      endDate: end,
      quickFilter: '',
    }));

    setPage(1);
  };

  // ─────────────────────────────────────────────
  // CLEAR FILTERS
  // ─────────────────────────────────────────────

  const clearFilters = () => {
    setFilters({
      orderStatus: '',
      paymentStatus: '',
      search: '',
      startDate: '',
      endDate: '',
      quickFilter: '',
    });

    setSearchInput('');
    setPage(1);
  };

  const hasActiveFilters =
    !!filters.orderStatus ||
    !!filters.paymentStatus ||
    !!filters.search ||
    !!filters.startDate ||
    !!filters.endDate ||
    !!filters.quickFilter;

  // ─────────────────────────────────────────────
  // RETURN
  // ─────────────────────────────────────────────

  return {
    // data
    orders: res?.data ?? [],
    pagination: res?.pagination,

    // 🔥 NEW BACKEND TOTALS
    totals: res?.summary ?? null,

    // states
    isLoading,
    isFetching,
    refetch,
    dataUpdatedAt,

    // filters
    filters,
    searchInput,
    setSearchInput,
    hasActiveFilters,

    // actions
    setPage,
    applySearch,
    applyFilter,
    applyQuickFilter,
    applyDateRange,
    clearFilters,

    // mutation
    updateStatus,
  };
}