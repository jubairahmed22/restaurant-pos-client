'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { OrderService } from '@/services/order.service';


// ─────────────────────────────────────────────────────────────
// TYPES (MATCH YOUR BACKEND)
// ─────────────────────────────────────────────────────────────

export interface OrderItem {
  _id: string;
  food: string;        // ObjectId
  title: string;
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;
  orderId: string;

  user: string; // ObjectId (NOT populated)

  fullName: string;
  email?: string;
  phone: string;

  items: OrderItem[];

  subtotal: number;
  deliveryCharge: number;
  total: number;

  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderStatus: 'placed' | 'preparing' | 'dispatched' | 'delivered' | 'cancelled';

  shippingAddress: string;

  createdAt: string;
  updatedAt: string;

  __v?: number;
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

// ─────────────────────────────────────────────────────────────

const LIMIT = 10;
const REFETCH_INTERVAL = 15000;

// ─────────────────────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────────────────────

export function useAdminOrders() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);

  const [searchInput, setSearchInput] = useState('');

  const [filters, setFilters] = useState<OrderFilters>({
    orderStatus: '',
    paymentStatus: '',
    search: '',
  });

  // ─────────────────────────────────────────────────────────────
  // BUILD QUERY PARAMS
  // ─────────────────────────────────────────────────────────────

  const params: Record<string, string | number> = {
    page,
    limit: LIMIT,
  };

  if (filters.orderStatus) params.orderStatus = filters.orderStatus;
  if (filters.paymentStatus) params.paymentStatus = filters.paymentStatus;
  if (filters.search) params.search = filters.search;

  // ─────────────────────────────────────────────────────────────
  // GET ORDERS (ADMIN)
  // ─────────────────────────────────────────────────────────────

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
      });
    },

    placeholderData: (prev) => prev,
    refetchInterval: REFETCH_INTERVAL,
    refetchIntervalInBackground: false,
  });

  // ─────────────────────────────────────────────────────────────
  // UPDATE ORDER STATUS
  // ─────────────────────────────────────────────────────────────

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

  // ─────────────────────────────────────────────────────────────
  // FILTER HELPERS
  // ─────────────────────────────────────────────────────────────

  const applySearch = () => {
    setFilters((prev) => ({
      ...prev,
      search: searchInput.trim(),
    }));
    setPage(1);
  };

  const applyFilter = (
    key: keyof OrderFilters,
    value: string
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      orderStatus: '',
      paymentStatus: '',
      search: '',
    });
    setSearchInput('');
    setPage(1);
  };

  const hasActiveFilters =
    !!filters.orderStatus ||
    !!filters.paymentStatus ||
    !!filters.search;

  // ─────────────────────────────────────────────────────────────
  // RETURN
  // ─────────────────────────────────────────────────────────────

  return {
    // data
    orders: res?.data ?? [],
    pagination: res?.pagination,

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
    clearFilters,

    // mutation
    updateStatus,
  };
}