'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/axios';
import {
  Users,
  ShoppingCart,
  DollarSign,
  Package,
} from 'lucide-react';
import { KpiCard } from '@/components/cards/KpiCard';

/* ---------------- KPI CARD COMPONENT ---------------- */


/* ---------------- PAGE ---------------- */
export default function AnalyticsOverview() {
  const { data: statsRes, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () =>
      (await api.get('/analytics/stats')).data,
  });

  const stats = statsRes || {
    totalSales: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalFoods: 0,
  };

  const cards = [
    {
      title: 'Total Revenue',
      value: `$${stats.totalSales}`,
      icon: DollarSign,
    },
    {
      title: 'Active Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
    },
    {
      title: 'Platform Users',
      value: stats.totalUsers,
      icon: Users,
    },
    {
      title: 'Menu Items',
      value: stats.totalFoods,
      icon: Package,
    },
  ];

  return (
    <div className="space-y-10 font-inter">
      <div>
        <h1 className="text-xl font-black text-slate-900">
          SYSTEM ANALYTICS
        </h1>

        <p className="text-slate-600 text-sm">
          Aggregated business performance metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {cards.map((card, i) => (
          <KpiCard
            key={i}
            title={card.title}
            value={isLoading ? '...' : card.value}
            icon={card.icon}
          />
        ))}
      </div>
    </div>
  );
}