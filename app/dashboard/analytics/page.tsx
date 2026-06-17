'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, Users,
  Clock, ShoppingBag, Target, Globe,
} from 'lucide-react';
import { AnalyticsService } from '@/services/analytics.service';

// ─── Constants ────────────────────────────────────────────────────────────────

const BLUE    = '#1B3A6B';
const ORANGE  = '#C05428';
const GREEN   = '#10b981';
const PURPLE  = '#8b5cf6';
const COLORS  = [BLUE, ORANGE, GREEN, PURPLE, '#f59e0b', '#ec4899'];
const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt$ = (n: number) => `$${n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtPct = (n: number | null) => n == null ? '—' : `${n > 0 ? '+' : ''}${n.toFixed(1)}%`;

function KpiTile({
  label, value, sub, icon: Icon, trend,
}: { label: string; value: string; sub?: string; icon: React.ElementType; trend?: number | null }) {
  const up = trend != null && trend >= 0;
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</span>
        <div className="w-9 h-9 rounded-xl bg-[#1B3A6B]/8 flex items-center justify-center">
          <Icon size={17} className="text-[#1B3A6B]" />
        </div>
      </div>
      <p className="text-2xl font-black text-slate-800">{value}</p>
      {(sub || trend != null) && (
        <div className="flex items-center gap-2">
          {trend != null && (
            <span className={`text-xs font-bold flex items-center gap-1 ${up ? 'text-emerald-600' : 'text-red-500'}`}>
              {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {fmtPct(trend)}
            </span>
          )}
          {sub && <span className="text-xs text-slate-400">{sub}</span>}
        </div>
      )}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1B3A6B] text-white px-4 py-3 rounded-xl shadow-xl text-xs">
      <p className="font-bold mb-1 opacity-70">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="font-bold">{p.name}: {typeof p.value === 'number' && p.name?.toLowerCase().includes('rev') ? fmt$(p.value) : p.value}</p>
      ))}
    </div>
  );
};

// ─── Period selector ──────────────────────────────────────────────────────────

const PERIODS = [
  { label: '7 days',  days: 7 },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsDashboard() {
  const [days, setDays] = useState(30);

  const { data: finData, isLoading: finLoading } = useQuery({
    queryKey: ['analytics-financial', days],
    queryFn:  () => AnalyticsService.getFinancial(days),
  });

  const { data: mktData, isLoading: mktLoading } = useQuery({
    queryKey: ['analytics-marketing', days],
    queryFn:  () => AnalyticsService.getMarketing(days),
  });

  const { data: cvtData, isLoading: cvtLoading } = useQuery({
    queryKey: ['analytics-conversion', days],
    queryFn:  () => AnalyticsService.getConversion(days),
  });

  const { data: attrData, isLoading: attrLoading } = useQuery({
    queryKey: ['analytics-attribution', days],
    queryFn:  () => AnalyticsService.getAttribution(days),
  });

  const fin  = finData?.data;
  const mkt  = mktData?.data;
  const cvt  = cvtData?.data;
  const attr = attrData?.data;

  const loading = finLoading || mktLoading || cvtLoading || attrLoading;

  // Normalise day-of-week data (MongoDB $dayOfWeek: 1=Sun, 7=Sat)
  const dowData = (mkt?.byDayOfWeek || []).map((d: any) => ({
    day:    DAYS_OF_WEEK[d._id - 1] ?? d._id,
    orders: d.orders,
    revenue: d.revenue,
  }));

  // Peak hours
  const hourData = (mkt?.byHour || []).map((d: any) => ({
    hour:   `${String(d._id).padStart(2, '0')}:00`,
    orders: d.orders,
  }));

  // Session split
  const sessionData = (fin?.bySession || []).map((d: any) => ({
    name:  d._id,
    value: d.revenue,
    count: d.count,
  }));

  // Payment method
  const methodData = (fin?.byPaymentMethod || []).map((d: any) => ({
    name:  d._id === 'square' ? 'Card (Square)' : 'Cash',
    value: d.revenue,
    count: d.count,
  }));

  // Attribution source
  const sourceData = (attr?.bySource || []).slice(0, 6).map((d: any) => ({
    source:  d._id || 'direct',
    revenue: d.revenue,
    orders:  d.orders,
  }));

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Intelligence Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Financial · Marketing · Conversion · Attribution</p>
        </div>
        <div className="flex gap-2">
          {PERIODS.map(p => (
            <button
              key={p.days}
              onClick={() => setDays(p.days)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                days === p.days
                  ? 'bg-[#1B3A6B] text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-[#1B3A6B] hover:text-[#1B3A6B]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 h-28 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && fin && (
        <>
          {/* ── FINANCIAL INTELLIGENCE ── */}
          <section>
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
              <DollarSign size={14} /> Financial Intelligence
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiTile label="Total Revenue"      value={fmt$(fin.summary.totalRevenue)}        icon={DollarSign} trend={fin.summary.revenueChange} sub="vs prev period" />
              <KpiTile label="Menu Revenue"       value={fmt$(fin.summary.menuRevenue)}          icon={ShoppingBag} />
              <KpiTile label="Shop Revenue"       value={fmt$(fin.summary.shopRevenue)}          icon={ShoppingBag} />
              <KpiTile label="Avg Order Value"    value={fmt$(fin.summary.averageOrderValue)}    icon={TrendingUp} sub={`${fin.summary.totalOrders} orders`} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              {/* Daily revenue line chart */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Daily Revenue</p>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={fin.dailyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="_id" tick={{ fontSize: 10 }} tickFormatter={v => v.slice(5)} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${v}`} width={55} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="revenue" stroke={BLUE} strokeWidth={2.5} dot={false} name="Revenue" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Session split + payment method */}
              <div className="flex flex-col gap-6">
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex-1">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Revenue by Session</p>
                  <ResponsiveContainer width="100%" height={100}>
                    <PieChart>
                      <Pie data={sessionData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={28} outerRadius={44}>
                        {sessionData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: unknown) => fmt$(Number(v))} />
                      <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex-1">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Payment Method</p>
                  <ResponsiveContainer width="100%" height={100}>
                    <PieChart>
                      <Pie data={methodData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={28} outerRadius={44}>
                        {methodData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: unknown) => fmt$(Number(v))} />
                      <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </section>

          {/* ── MARKETING INTELLIGENCE ── */}
          {mkt && (
            <section>
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                <Target size={14} /> Marketing Intelligence
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales by day of week */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Orders by Day of Week</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={dowData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="orders" fill={BLUE} radius={[4, 4, 0, 0]} name="Orders" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Peak hours */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Orders by Hour</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={hourData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="hour" tick={{ fontSize: 9 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="orders" fill={ORANGE} radius={[4, 4, 0, 0]} name="Orders" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Top categories */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Revenue by Category</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={mkt.topCategories} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `$${v}`} />
                      <YAxis dataKey="_id" type="category" tick={{ fontSize: 10 }} width={80} />
                      <Tooltip formatter={(v: unknown) => fmt$(Number(v))} />
                      <Bar dataKey="revenue" fill={GREEN} radius={[0, 4, 4, 0]} name="Revenue" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Item velocity */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Top Items by Units Sold</p>
                  <div className="space-y-3">
                    {(mkt.itemVelocity || []).slice(0, 8).map((item: any, i: number) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs font-black text-slate-400 w-4">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-700 truncate">{item._id}</p>
                          <div className="h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${Math.min(100, (item.totalSold / (mkt.itemVelocity[0]?.totalSold || 1)) * 100)}%`, background: COLORS[i % COLORS.length] }}
                            />
                          </div>
                        </div>
                        <span className="text-xs font-black text-slate-600 shrink-0">{item.totalSold} sold</span>
                      </div>
                    ))}
                    {!mkt.itemVelocity?.length && <p className="text-xs text-slate-400">No data for this period.</p>}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ── CONVERSION FUNNEL ── */}
          {cvt && (
            <section>
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                <Clock size={14} /> Conversion Funnel
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiTile label="Total Orders"       value={cvt.totalOrders.toLocaleString()}                  icon={ShoppingBag} />
                <KpiTile label="Payment Rate"        value={`${cvt.paymentConversionRate?.toFixed(1)}%`}      icon={TrendingUp} sub="orders paid" />
                <KpiTile label="Failure Rate"        value={`${cvt.paymentFailureRate?.toFixed(1)}%`}         icon={TrendingDown} />
                <KpiTile label="Avg Completed Value" value={fmt$(cvt.avgCompletedOrderValue)}                 icon={DollarSign} />
              </div>
              <div className="mt-4 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Order Status Breakdown</p>
                <div className="flex flex-wrap gap-3">
                  {(cvt.byOrderStatus || []).map((s: any) => (
                    <div key={s._id} className="flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-2.5 border border-slate-100">
                      <span className="text-xs font-bold text-slate-600 capitalize">{s._id}</span>
                      <span className="text-sm font-black text-[#1B3A6B]">{s.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ── ATTRIBUTION ── */}
          {attr && (
            <section>
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                <Globe size={14} /> Attribution
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Revenue by Traffic Source</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={sourceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="source" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${v}`} />
                      <Tooltip formatter={(v: unknown) => fmt$(Number(v))} />
                      <Bar dataKey="revenue" fill={PURPLE} radius={[4, 4, 0, 0]} name="Revenue" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Source Breakdown</p>
                  <div className="space-y-3">
                    {(attr.bySource || []).map((s: any, i: number) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                        <span className="flex-1 text-xs font-semibold text-slate-700 truncate capitalize">{s._id || 'direct'}</span>
                        <span className="text-xs font-black text-slate-600">{s.orders} orders</span>
                        <span className="text-xs font-bold text-slate-400">{fmt$(s.revenue)}</span>
                      </div>
                    ))}
                    {!attr.bySource?.length && (
                      <p className="text-xs text-slate-400">Attribution data builds up as orders are placed. Most orders will show as "direct" until UTM links are shared.</p>
                    )}
                  </div>
                </div>
              </div>
              {attr.byCampaign?.length > 0 && (
                <div className="mt-4 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Top Campaigns</p>
                  <div className="flex flex-wrap gap-3">
                    {attr.byCampaign.map((c: any, i: number) => (
                      <div key={i} className="bg-slate-50 rounded-xl px-4 py-2.5 border border-slate-100">
                        <p className="text-xs font-bold text-slate-700">{c._id}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{c.orders} orders · {fmt$(c.revenue)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}
        </>
      )}

      {!loading && !fin && (
        <div className="text-center py-20 text-slate-400">
          <Users size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-semibold">No data available for this period.</p>
        </div>
      )}
    </div>
  );
}
