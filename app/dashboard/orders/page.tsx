'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/axios';
import toast from 'react-hot-toast';
import { ShoppingBag, Truck, CheckCircle, Clock, MoreVertical, Eye } from 'lucide-react';

export default function AdminOrderManagement() {
  const queryClient = useQueryClient();

  // 1. Fetch All Global Orders
  const { data: orderRes, isLoading } = useQuery({
    queryKey: ['admin-all-orders'],
    queryFn: async () => (await api.get('/orders/admin/all')).data
  });

  // 2. Status Update Mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      return await api.patch(`/orders/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-orders'] });
      toast.success("Order pipeline updated");
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-500/10 text-amber-500';
      case 'preparing': return 'bg-blue-500/10 text-blue-500';
      case 'delivered': return 'bg-purple-500/10 text-purple-500';
      case 'completed': return 'bg-emerald-500/10 text-emerald-500';
      default: return 'bg-slate-500/10 text-slate-500';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black flex items-center gap-2">
          <ShoppingBag className="text-orange-500" />
          <span>LIVE ORDER FLOW</span>
        </h1>
        <p className="text-slate-400 text-sm">Monitor and dispatch active culinary requests.</p>
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-800/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4">Customer & ID</th>
              <th className="px-6 py-4">Items</th>
              <th className="px-6 py-4">Total Price</th>
              <th className="px-6 py-4">Current Status</th>
              <th className="px-6 py-4 text-right">Dispatch Control</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {isLoading ? (
              <tr><td colSpan={5} className="p-20 text-center animate-pulse text-slate-500 text-sm">Synchronizing with kitchen database...</td></tr>
            ) : orderRes?.data?.map((order: any) => (
              <tr key={order._id} className="hover:bg-slate-800/20 transition">
                <td className="px-6 py-4">
                  <p className="font-bold text-slate-200">{order.user?.name || 'Guest'}</p>
                  <p className="text-[10px] font-mono text-slate-500">#{order._id.slice(-8)}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-xs text-slate-400">
                    {order.items.map((i: any) => i.title).join(', ')}
                  </p>
                </td>
                <td className="px-6 py-4 font-black text-orange-500">${order.total.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <select 
                    value={order.status}
                    onChange={(e) => updateStatusMutation.mutate({ id: order._id, status: e.target.value })}
                    className="bg-slate-800 border border-slate-700 text-xs text-slate-300 rounded-lg px-2 py-1.5 focus:outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="preparing">Preparing</option>
                    <option value="delivered">Delivered</option>
                    <option value="completed">Completed</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}