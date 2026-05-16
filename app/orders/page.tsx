'use client';

import React, { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { OrderService } from '@/services/order.service';
import { useAuthStore } from '@/store/authStore';
import { useSocket } from '@/hooks/useSocket';
import Navbar from '@/components/shared/Navbar';
import { Clock, CheckCircle, Flame, Truck, ShoppingBag } from 'lucide-react';
import Link from 'next/navigation';

export default function MyOrdersPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  
  // Establish an automatic full-duplex socket room mapped directly to user ID
  const socket = useSocket(user?._id);

  const { data: orderResponse, isLoading } = useQuery({
    queryKey: ['my-personal-orders-history'],
    queryFn: OrderService.getMyOrders,
    enabled: !!user,
  });

  useEffect(() => {
    if (!socket) return;

    // Listen for direct event transmissions pushed out by the server cluster
    socket.on('order-status-changed', (payload: { orderId: string; nextStatus: string }) => {
      queryClient.invalidateQueries({ queryKey: ['my-personal-orders-history'] });
    });

    return () => {
      socket.off('order-status-changed');
    };
  }, [socket, queryClient]);

  const getStatusVisualBadge = (status: string) => {
    const maps: Record<string, { label: string; style: string; icon: any }> = {
      pending: { label: 'Received', style: 'bg-slate-100 text-slate-700', icon: Clock },
      preparing: { label: 'In Kitchen', style: 'bg-amber-50 text-amber-600 border border-amber-100', icon: Flame },
      delivered: { label: 'Dispatched', style: 'bg-blue-50 text-blue-600 border border-blue-100', icon: Truck },
      completed: { label: 'Completed', style: 'bg-emerald-50 text-emerald-600 border border-emerald-100', icon: CheckCircle },
    };
    
    const config = maps[status.toLowerCase()] || maps.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold capitalize ${config.style}`}>
        <Icon size={12} />
        <span>{config.label}</span>
      </span>
    );
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-12 space-y-6">
          <div className="h-8 w-48 bg-slate-200 animate-pulse rounded-lg" />
          <div className="h-44 w-full bg-slate-100 animate-pulse rounded-2xl" />
        </div>
      </>
    );
  }

  const orders = orderResponse?.data || [];

  return (
    <>
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Your Orders</h1>
            <p className="text-sm text-slate-500 mt-1">Review processing track pipelines or locate legacy history bills.</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16 bg-white border rounded-3xl border-slate-100 p-8 space-y-4">
            <ShoppingBag className="mx-auto text-slate-300" size={40} />
            <p className="text-slate-500 text-sm font-medium">You haven't placed any culinary orders yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order: any) => (
              <div key={order._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md/40 transition duration-300">
                {/* Order Top Summary Bar */}
                <div className="bg-slate-50/70 border-b border-slate-100 px-6 py-4 flex flex-wrap gap-4 items-center justify-between">
                  <div className="flex items-center gap-6 text-xs text-slate-500">
                    <div>
                      <p className="font-bold text-slate-400 uppercase tracking-wider">Order Reference ID</p>
                      <p className="font-mono font-semibold text-slate-700 mt-0.5">#{order._id.substring(order._id.length - 8)}</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-400 uppercase tracking-wider">Date Placed</p>
                      <p className="font-semibold text-slate-700 mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {getStatusVisualBadge(order.status)}
                </div>

                {/* Items & Manifest Layout List */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  <div className="md:col-span-2 space-y-3">
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between border-b border-slate-50 last:border-0 pb-2 last:pb-0 text-sm">
                        <div className="flex items-center gap-2 truncate">
                          <span className="font-extrabold text-orange-600 text-xs bg-orange-50 px-2 py-0.5 rounded-md shrink-0">
                            {item.quantity}x
                          </span>
                          <span className="font-bold text-slate-800 truncate">{item.title}</span>
                        </div>
                        <span className="text-slate-500 font-medium shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="md:border-l md:border-slate-100 md:pl-6 space-y-1.5 text-right flex flex-col justify-center items-end">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Gross Total Aggregate</p>
                    <p className="text-2xl font-black text-slate-900">${order.total.toFixed(2)}</p>
                    <span className="inline-block px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase bg-slate-900 text-slate-200 rounded">
                      {order.paymentStatus === 'paid' ? '💳 SETTLED via Stripe' : '⚠️ Settlement Pending'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}