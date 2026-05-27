// app/dashboard/page.tsx
'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  DollarSign, ShoppingCart, Package,
  Users, Clock3, CheckCircle2,
  TrendingUp, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line,
  CartesianGrid, Tooltip, XAxis, YAxis,
  PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts';
import { AnalyticsService } from '@/services/analytics.service';
import { KpiCard } from '@/components/cards/KpiCard';

// ─────────────────────────────────────────────
// CUSTOM CHART COMPONENTS
// ─────────────────────────────────────────────

const CustomLineTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1e2661] text-white px-4 py-3 rounded-2xl shadow-2xl border border-white/10">
      <p className="text-[11px] text-white/50 mb-1 font-medium uppercase tracking-wider">{label}</p>
      <p className="text-lg font-bold text-white">${payload[0]?.value?.toLocaleString()}</p>
    </div>
  );
};

const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1e2661] text-white px-4 py-3 rounded-2xl shadow-2xl border border-white/10">
      <p className="text-[11px] text-white/50 mb-1 font-medium uppercase tracking-wider">{label}</p>
      <p className="text-lg font-bold text-white">{payload[0]?.value} sold</p>
    </div>
  );
};

const CustomPieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1e2661] text-white px-4 py-3 rounded-2xl shadow-2xl border border-white/10">
      <p className="text-[11px] text-white/50 mb-1 font-medium uppercase tracking-wider capitalize">{payload[0]?.name}</p>
      <p className="text-lg font-bold text-white">{payload[0]?.value} orders</p>
    </div>
  );
};

// Custom dot for line chart
const CustomDot = (props: any) => {
  const { cx, cy } = props;
  return (
    <circle cx={cx} cy={cy} r={4} fill="#6366f1" stroke="#fff" strokeWidth={2} />
  );
};

// ─────────────────────────────────────────────
// ORDER STATUS COLOR MAP
// ─────────────────────────────────────────────

const ORDER_STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  placed:     { bg: 'bg-blue-50',   text: 'text-blue-600',   dot: 'bg-blue-400' },
  preparing:  { bg: 'bg-amber-50',  text: 'text-amber-600',  dot: 'bg-amber-400' },
  dispatched: { bg: 'bg-purple-50', text: 'text-purple-600', dot: 'bg-purple-400' },
  delivered:  { bg: 'bg-green-50',  text: 'text-green-600',  dot: 'bg-green-400' },
  cancelled:  { bg: 'bg-red-50',    text: 'text-red-500',    dot: 'bg-red-400' },
};

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

export default function AnalyticsOverview() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: AnalyticsService.getStats,
  });

  const stats         = data?.data;
  const summary       = stats?.summary        || {};
  const salesChart    = stats?.salesChart     || [];
  const orderStatusStats = stats?.orderStatusStats || [];
  const topFoods      = stats?.topFoods       || [];
  const recentOrders  = stats?.recentOrders   || [];

  const cards = [
    {
      title: 'Total Revenue',
      value: `$${(summary.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      accent: 'from-indigo-500 to-indigo-600',
      light: 'bg-indigo-50 text-indigo-600',
      trend: '+12.5%',
      up: true,
    },
    {
      title: 'Monthly Revenue',
      value: `$${(summary.monthlyRevenue || 0).toLocaleString()}`,
      icon: TrendingUp,
      accent: 'from-violet-500 to-violet-600',
      light: 'bg-violet-50 text-violet-600',
      trend: '+8.2%',
      up: true,
    },
    {
      title: 'Today Sales',
      value: `$${(summary.todaySales || 0).toLocaleString()}`,
      icon: ShoppingCart,
      accent: 'from-sky-500 to-sky-600',
      light: 'bg-sky-50 text-sky-600',
      trend: '+3.1%',
      up: true,
    },
    {
      title: 'Total Orders',
      value: (summary.totalOrders || 0).toLocaleString(),
      icon: ShoppingCart,
      accent: 'from-emerald-500 to-emerald-600',
      light: 'bg-emerald-50 text-emerald-600',
      trend: '+5.4%',
      up: true,
    },
    {
      title: 'Pending Orders',
      value: summary.pendingOrders || 0,
      icon: Clock3,
      accent: 'from-amber-400 to-amber-500',
      light: 'bg-amber-50 text-amber-600',
      trend: '-2.0%',
      up: false,
    },
    {
      title: 'Completed Orders',
      value: summary.completedOrders || 0,
      icon: CheckCircle2,
      accent: 'from-green-500 to-green-600',
      light: 'bg-green-50 text-green-600',
      trend: '+9.8%',
      up: true,
    },
    {
      title: 'Food Items',
      value: summary.totalFoods || 0,
      icon: Package,
      accent: 'from-rose-400 to-rose-500',
      light: 'bg-rose-50 text-rose-500',
      trend: '+1',
      up: true,
    },
    {
      title: 'Users',
      value: summary.totalUsers || 0,
      icon: Users,
      accent: 'from-teal-500 to-teal-600',
      light: 'bg-teal-50 text-teal-600',
      trend: '+14',
      up: true,
    },
  ];

  const pieColors = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#0ea5e9'];

  // Total for pie percentage
  const pieTotal = orderStatusStats.reduce((s: number, d: any) => s + (d.total || 0), 0);

  return (
    <div className="space-y-7">

      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-indigo-400 mb-1">Overview</p>
          <h1 className="text-2xl font-extrabold text-[#1e2661] leading-none">
            Analytics Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1.5 font-medium">Restaurant business insights & reports</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-slate-500">Live data</span>
        </div>
      </div>

      {/* ── KPI GRID ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-4 gap-4">
        {cards.map((card, i) => {
          const Icon = card.icon;
          const TrendIcon = card.up ? ArrowUpRight : ArrowDownRight;
          return (
            <div
              key={i}
              className="animate-fade-in-up bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group relative overflow-hidden"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {/* subtle gradient blob */}
              <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full bg-gradient-to-br ${card.accent} opacity-[0.07] group-hover:opacity-[0.12] transition-opacity duration-300`} />

              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-2xl ${card.light} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={18} />
                </div>
                <span className={`flex items-center gap-0.5 text-[11px] font-bold px-2 py-1 rounded-xl ${
                  card.up
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-red-50 text-red-500'
                }`}>
                  <TrendIcon size={10} />
                  {card.trend}
                </span>
              </div>

              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">{card.title}</p>
              <p className="text-2xl font-extrabold text-[#1e2661] leading-none">
                {isLoading ? (
                  <span className="inline-block w-16 h-7 bg-slate-100 rounded-lg animate-pulse" />
                ) : card.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* ── CHARTS ROW 1: Revenue + Order Status ───────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-5">

        {/* REVENUE LINE CHART */}
        <div className="animate-fade-in-up bg-white rounded-3xl p-6 border border-slate-100 shadow-sm" style={{ animationDelay: '120ms' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[11px] font-bold tracking-widest uppercase text-indigo-400 mb-1">Performance</p>
              <h2 className="text-lg font-extrabold text-[#1e2661]">Revenue Overview</h2>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block" />
              Sales
            </div>
          </div>

          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesChart} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="_id"
                  tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => `$${v}`}
                />
                <Tooltip content={<CustomLineTooltip />} cursor={{ stroke: '#6366f120', strokeWidth: 2 }} />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={<CustomDot />}
                  activeDot={{ r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ORDER STATUS PIE */}
        <div className="animate-fade-in-up bg-white rounded-3xl p-6 border border-slate-100 shadow-sm" style={{ animationDelay: '160ms' }}>
          <div className="mb-6">
            <p className="text-[11px] font-bold tracking-widest uppercase text-indigo-400 mb-1">Breakdown</p>
            <h2 className="text-lg font-extrabold text-[#1e2661]">Order Status</h2>
          </div>

          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStatusStats}
                  dataKey="total"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {orderStatusStats.map((_: any, index: number) => (
                    <Cell key={index} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="space-y-2 mt-4">
            {orderStatusStats.slice(0, 5).map((d: any, i: number) => {
              const pct = pieTotal > 0 ? Math.round((d.total / pieTotal) * 100) : 0;
              return (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: pieColors[i % pieColors.length] }} />
                    <span className="text-xs font-semibold text-slate-500 capitalize">{d._id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pieColors[i % pieColors.length] }} />
                    </div>
                    <span className="text-xs font-bold text-[#1e2661] w-7 text-right">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── CHARTS ROW 2: Top Foods + Recent Orders ─────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-5">

        {/* TOP FOODS BAR CHART */}
        <div className="animate-fade-in-up bg-white rounded-3xl p-6 border border-slate-100 shadow-sm" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[11px] font-bold tracking-widest uppercase text-emerald-400 mb-1">Bestsellers</p>
              <h2 className="text-lg font-extrabold text-[#1e2661]">Top Selling Foods</h2>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
              Units sold
            </div>
          </div>

          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topFoods} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" />
                    <stop offset="100%" stopColor="#16a34a" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="_id"
                  tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: '#f8f9fd' }} />
                <Bar dataKey="totalSold" fill="url(#barGrad)" radius={[8, 8, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RECENT ORDERS */}
        <div className="animate-fade-in-up bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col" style={{ animationDelay: '240ms' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[11px] font-bold tracking-widest uppercase text-orange-400 mb-1">Latest</p>
              <h2 className="text-lg font-extrabold text-[#1e2661]">Recent Orders</h2>
            </div>
            <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100">
              {recentOrders.length} orders
            </span>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto pr-1 custom-scrollbar">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 bg-slate-50 rounded-2xl animate-pulse" />
                ))
              : recentOrders.length === 0
              ? (
                <div className="flex items-center justify-center h-40 text-slate-300 text-sm font-medium">
                  No recent orders
                </div>
              )
              : recentOrders.map((order: any, i: number) => {
                  const sc = ORDER_STATUS_COLORS[order.orderStatus] || ORDER_STATUS_COLORS['placed'];
                  return (
                    <div
                      key={order._id}
                      className="flex items-center justify-between px-4 py-3 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all duration-200 group"
                      style={{ animationDelay: `${i * 40}ms` }}
                    >
                      {/* left */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center flex-shrink-0">
                          <span className="text-indigo-600 font-extrabold text-[11px]">
                            {order.fullName?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-[#1e2661] text-sm truncate leading-none mb-0.5">{order.fullName}</p>
                          <p className="text-[10px] font-mono text-slate-400 truncate">#{order.orderId}</p>
                        </div>
                      </div>

                      {/* right */}
                      <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-2">
                        <p className="font-extrabold text-[#1e2661] text-sm">${order.total}</p>
                        <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg ${sc.bg} ${sc.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {order.orderStatus}
                        </span>
                      </div>
                    </div>
                  );
                })
            }
          </div>
        </div>
      </div>

    </div>
  );
}