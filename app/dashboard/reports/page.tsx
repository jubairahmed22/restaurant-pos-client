'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { Download, FileText, TrendingUp, ShoppingBag, Calendar, Users } from 'lucide-react';
import { AnalyticsService } from '@/services/analytics.service';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt$ = (n: number) => `$${n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const PERIODS = [
  { label: '7 days',  days: 7 },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
];

function StatCard({ label, value, sub, icon: Icon }: {
  label: string; value: string; sub?: string; icon: React.ElementType;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</span>
        <div className="w-9 h-9 rounded-xl bg-[#1B3A6B]/8 flex items-center justify-center">
          <Icon size={17} className="text-[#1B3A6B]" />
        </div>
      </div>
      <p className="text-2xl font-black text-slate-800">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

// ─── CSV export ───────────────────────────────────────────────────────────────

function exportCsv(rows: Record<string, unknown>[], filename: string) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(',')),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [days, setDays] = useState(30);

  const { data, isLoading } = useQuery({
    queryKey: ['business-report', days],
    queryFn:  () => AnalyticsService.getBusiness(days),
  });

  const report = data?.data;

  const chartData = (report?.dailyCombined || []).map((d: any) => ({
    date:        d.date.slice(5),
    'Menu':      d.menuRevenue,
    'Shop':      d.shopRevenue,
    'Total':     (d.menuRevenue || 0) + (d.shopRevenue || 0),
  }));

  const handleExport = () => {
    if (!report?.dailyCombined) return;
    exportCsv(
      report.dailyCombined.map((d: any) => ({
        Date:          d.date,
        'Menu Revenue': fmt$(d.menuRevenue || 0),
        'Shop Revenue': fmt$(d.shopRevenue || 0),
        'Total Revenue': fmt$((d.menuRevenue || 0) + (d.shopRevenue || 0)),
        'Menu Orders':  d.menuOrders || 0,
        'Shop Orders':  d.shopOrders || 0,
      })),
      `rin-business-report-${days}d.csv`,
    );
  };

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Business Report</h1>
          <p className="text-sm text-slate-500 mt-1">Combined revenue across Menu, Shop, Reservations & Users</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {PERIODS.map(p => (
            <button
              key={p.days}
              onClick={() => setDays(p.days)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                days === p.days
                  ? 'bg-[#1B3A6B] text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-[#1B3A6B]'
              }`}
            >
              {p.label}
            </button>
          ))}
          <button
            onClick={handleExport}
            disabled={!report}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 transition-all"
          >
            <Download size={13} /> Export CSV
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 h-28 animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && report && (
        <>
          {/* KPI row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Revenue"  value={fmt$(report.summary.totalRevenue)}   sub={`Last ${days} days`}                  icon={TrendingUp}  />
            <StatCard label="Menu Revenue"   value={fmt$(report.summary.menuRevenue)}    sub={`${report.summary.menuOrders} orders`} icon={ShoppingBag} />
            <StatCard label="Shop Revenue"   value={fmt$(report.summary.shopRevenue)}    sub={`${report.summary.shopOrders} orders`} icon={FileText}    />
            <StatCard label="Total Orders"   value={report.summary.totalOrders.toLocaleString()} sub="menu + shop"                  icon={ShoppingBag} />
            <StatCard label="Reservations"   value={report.summary.reservations.toLocaleString()} sub="bookings made"               icon={Calendar}    />
            <StatCard label="New Users"      value={report.summary.newUsers.toLocaleString()}     sub="accounts registered"         icon={Users}       />
            <StatCard label="Menu AOV"       value={report.summary.menuOrders > 0 ? fmt$(report.summary.menuRevenue / report.summary.menuOrders) : '$0.00'} sub="avg menu order" icon={TrendingUp} />
            <StatCard label="Shop AOV"       value={report.summary.shopOrders > 0 ? fmt$(report.summary.shopRevenue / report.summary.shopOrders) : '$0.00'} sub="avg shop order" icon={TrendingUp} />
          </div>

          {/* Combined daily revenue chart */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Daily Revenue Breakdown</p>
              <div className="flex gap-3 text-xs">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#1B3A6B] inline-block" /> Menu</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#C05428] inline-block" /> Shop</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${v}`} width={60} />
                <Tooltip formatter={(v: unknown) => fmt$(Number(v))} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Menu" stackId="a" fill="#1B3A6B" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Shop" stackId="a" fill="#C05428" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Daily table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Daily Summary</p>
              <button onClick={handleExport} className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
                <Download size={12} /> Download CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {['Date', 'Menu Revenue', 'Shop Revenue', 'Total', 'Menu Orders', 'Shop Orders'].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-black text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {report.dailyCombined.map((d: any) => {
                    const total = (d.menuRevenue || 0) + (d.shopRevenue || 0);
                    return (
                      <tr key={d.date} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-700">{d.date}</td>
                        <td className="px-4 py-3 text-[#1B3A6B] font-bold">{fmt$(d.menuRevenue || 0)}</td>
                        <td className="px-4 py-3 text-[#C05428] font-bold">{fmt$(d.shopRevenue || 0)}</td>
                        <td className="px-4 py-3 font-black text-slate-800">{fmt$(total)}</td>
                        <td className="px-4 py-3 text-slate-600">{d.menuOrders || 0}</td>
                        <td className="px-4 py-3 text-slate-600">{d.shopOrders || 0}</td>
                      </tr>
                    );
                  })}
                  {!report.dailyCombined.length && (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No paid orders in this period.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
