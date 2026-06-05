'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ITableSession, ISessionItem, SessionService } from '@/services/session.service';

// ── Types ─────────────────────────────────────────────────

export interface OptimisticMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  queryKey?: unknown[];
  optimisticUpdate?: (prev: TData | undefined, variables: TVariables) => TData;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
  onSettled?: () => void;
}

// ── useOptimisticMutation ─────────────────────────────────
// Instantly applies optimisticUpdate to the React Query cache,
// calls API, rolls back on error, re-syncs on settle.

export function useOptimisticMutation<TData = unknown, TVariables = void>({
  mutationFn,
  queryKey,
  optimisticUpdate,
  onSuccess,
  onError,
  onSettled,
}: OptimisticMutationOptions<TData, TVariables>) {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TVariables, { snapshot: TData | undefined }>({
    mutationFn,

    onMutate: async (variables) => {
      let snapshot: TData | undefined;

      if (queryKey && optimisticUpdate) {
        await queryClient.cancelQueries({ queryKey });
        snapshot = queryClient.getQueryData<TData>(queryKey);
        queryClient.setQueryData<TData>(queryKey, (prev) =>
          optimisticUpdate(prev, variables)
        );
      }

      return { snapshot };
    },

    onError: (error, variables, context) => {
      if (queryKey && context?.snapshot !== undefined) {
        queryClient.setQueryData(queryKey, context.snapshot);
      }
      if (onError) onError(error, variables);
    },

    onSuccess: (data, variables) => {
      // Write server truth directly into the cache — no extra round-trip refetch
      if (queryKey && data !== undefined) {
        queryClient.setQueryData(queryKey, data);
      }
      if (onSuccess) onSuccess(data, variables);
    },

    onSettled: () => {
      // Mark stale so the next focus/reconnect refetches, but don't fire
      // an immediate network request after every single tap.
      if (queryKey) {
        queryClient.invalidateQueries({ queryKey, refetchType: 'none' });
      }
      if (onSettled) onSettled();
    },
  });
}

// ── Item payload type (add/update/remove) ─────────────────

export interface SessionItemPayload {
  _id?: string;
  id?: string;          // used for update/remove targeting
  updates?: Partial<ISessionItem>;
  productId?: string;
  name?: string;
  price?: number;
  qty?: number;
  notes?: string;
  course?: ISessionItem['course'];
  status?: ISessionItem['status'];
  guestIndex?: number | null;
  sentAt?: string | null;
  servedAt?: string | null;
}

// ── Specialised: item add/update/remove ───────────────────

export function useSessionItemMutation(sessionId: string | undefined) {
  return useOptimisticMutation<
    ITableSession,
    { action: 'add' | 'update' | 'remove'; item: SessionItemPayload }
  >({
    mutationFn: ({ action, item }) =>
      SessionService.updateItems(sessionId!, action, item as Partial<ISessionItem> & { id?: string }),

    queryKey: sessionId ? ['session', 'table', sessionId] : undefined,

    optimisticUpdate: (prev, { action, item }) => {
      if (!prev) return prev as unknown as ITableSession;
      let items = [...prev.orderItems];

      if (action === 'add') {
        items.push({
          ...item,
          _id: item._id ?? `tmp-${Date.now()}`,
        } as ISessionItem);
      } else if (action === 'update') {
        const updates = item.updates ?? item;
        items = items.map(i => i._id === item.id ? { ...i, ...updates } : i);
      } else if (action === 'remove') {
        items = items.filter(i => i._id !== item.id);
      }

      return { ...prev, orderItems: items };
    },
  });
}

// ── Specialised: send to kitchen ─────────────────────────

export function useSendToKitchen(sessionId: string | undefined) {
  return useOptimisticMutation<ITableSession, string[]>({
    mutationFn: (itemIds) => SessionService.sendToKitchen(sessionId!, itemIds),

    queryKey: sessionId ? ['session', 'table', sessionId] : undefined,

    optimisticUpdate: (prev, itemIds) => {
      if (!prev) return prev as unknown as ITableSession;
      return {
        ...prev,
        status: 'waiting' as const,
        orderItems: prev.orderItems.map(i =>
          itemIds.includes(i._id) && i.status === 'ordered'
            ? { ...i, status: 'sent' as const }
            : i
        ),
      };
    },
  });
}
