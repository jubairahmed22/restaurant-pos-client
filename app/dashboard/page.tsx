'use client';

import React from 'react';

import { useQuery } from '@tanstack/react-query';

import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  Clock3,
  CheckCircle2,
} from 'lucide-react';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

import { AnalyticsService } from '@/services/analytics.service';

import { KpiCard } from '@/components/cards/KpiCard';

export default function AnalyticsOverview() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-analytics'],

    queryFn: AnalyticsService.getStats,
  });

  const stats = data?.data;

  const summary = stats?.summary || {};

  const salesChart =
    stats?.salesChart || [];

  const orderStatusStats =
    stats?.orderStatusStats || [];

  const topFoods =
    stats?.topFoods || [];

  const recentOrders =
    stats?.recentOrders || [];

  const cards = [
    {
      title: 'Total Revenue',
      value: `$${summary.totalRevenue || 0}`,
      icon: DollarSign,
    },

    {
      title: 'Monthly Revenue',
      value: `$${summary.monthlyRevenue || 0}`,
      icon: DollarSign,
    },

    {
      title: 'Today Sales',
      value: `$${summary.todaySales || 0}`,
      icon: ShoppingCart,
    },

    {
      title: 'Total Orders',
      value: summary.totalOrders || 0,
      icon: ShoppingCart,
    },

    {
      title: 'Pending Orders',
      value: summary.pendingOrders || 0,
      icon: Clock3,
    },

    {
      title: 'Completed Orders',
      value:
        summary.completedOrders || 0,
      icon: CheckCircle2,
    },

    {
      title: 'Food Items',
      value: summary.totalFoods || 0,
      icon: Package,
    },

    {
      title: 'Users',
      value: summary.totalUsers || 0,
      icon: Users,
    },
  ];

  const pieColors = [
    '#6366F1',
    '#22C55E',
    '#F59E0B',
    '#EF4444',
    '#0EA5E9',
  ];

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          Analytics Dashboard
        </h1>

        <p className="text-slate-500 mt-1">
          Restaurant business insights &
          reports
        </p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

        {cards.map((card, index) => (
          <KpiCard
            key={index}
            title={card.title}
            value={
              isLoading ? '...' : card.value
            }
            icon={card.icon}
          />
        ))}
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* SALES CHART */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">

          <h2 className="text-lg font-bold text-slate-800 mb-6">
            Revenue Overview
          </h2>

          <div className="h-[350px]">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart data={salesChart}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="_id" />

                <YAxis />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#6366F1"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ORDER STATUS */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">

          <h2 className="text-lg font-bold text-slate-800 mb-6">
            Order Status
          </h2>

          <div className="h-[350px]">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>

                <Pie
                  data={orderStatusStats}
                  dataKey="total"
                  nameKey="_id"
                  outerRadius={120}
                  label
                >
                  {orderStatusStats.map(
                    (
                      entry: any,
                      index: number
                    ) => (
                      <Cell
                        key={index}
                        fill={
                          pieColors[
                            index %
                              pieColors.length
                          ]
                        }
                      />
                    )
                  )}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* TOP FOOD + RECENT ORDERS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* TOP FOODS */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">

          <h2 className="text-lg font-bold text-slate-800 mb-6">
            Top Selling Foods
          </h2>

          <div className="h-[350px]">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart data={topFoods}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="_id" />

                <YAxis />

                <Tooltip />

                <Bar
                  dataKey="totalSold"
                  fill="#22C55E"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RECENT ORDERS */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">

          <div className="flex items-center justify-between mb-6">

            <h2 className="text-lg font-bold text-slate-800">
              Recent Orders
            </h2>
          </div>

          <div className="space-y-4">

            {recentOrders.map((order: any) => (
              <div
                key={order._id}
                className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition"
              >
                <div>
                  <h3 className="font-semibold text-slate-800">
                    {order.fullName}
                  </h3>

                  <p className="text-sm text-slate-500">
                    #{order.orderId}
                  </p>
                </div>

                <div className="text-right">

                  <p className="font-bold text-slate-800">
                    ${order.total}
                  </p>

                  <span className="text-xs px-2 py-1 rounded-lg bg-indigo-50 text-indigo-600 capitalize">
                    {order.orderStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}