'use client';

import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAdminOrders } from '@/app/hooks/useAdminOrders';
import DataTable from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

type OrderItem = {
  food: string;
  title: string;
  price: number;
  quantity: number;
};

type Order = {
  _id: string;
  orderId: string;
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
};

type QuickFilter = '' | 'today' | 'yesterday' | 'last7days' | 'last30days';

const ORDER_STATUSES = ['placed', 'preparing', 'dispatched', 'delivered', 'cancelled'] as const;
const PAYMENT_STATUSES = ['pending', 'paid', 'failed'] as const;
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const WEEK_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

// ─────────────────────────────────────────────
// DATE UTILS  ← THE FIX IS HERE
// ─────────────────────────────────────────────

/**
 * Format a Date to "YYYY-MM-DD" using LOCAL date parts.
 *
 * WHY: toISOString() converts to UTC before formatting.
 * In UTC+6 (Bangladesh), midnight local = 6 PM previous day UTC,
 * so toISOString() returns the day before. We avoid that entirely
 * by building the string from getFullYear / getMonth / getDate.
 */
function fmtDate(d: Date): string {
  const y   = d.getFullYear();
  const m   = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Parse "YYYY-MM-DD" → local midnight Date.
 *
 * WHY: new Date('2026-05-18') treats the string as UTC midnight,
 * which in UTC+6 becomes 6 AM local on the 18th — but JS date
 * display can still be off. Splitting manually and calling
 * new Date(y, m, d) creates a proper local midnight with no UTC offset.
 */
function parseLocalDate(str: string): Date | null {
  if (!str) return null;
  const parts = str.split('-');
  if (parts.length !== 3) return null;
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
}

function fmtDisplay(d: Date | null): string {
  if (!d) return '';
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth()    &&
    a.getDate()     === b.getDate()
  );
}

// ─────────────────────────────────────────────
// CALENDAR RANGE PICKER
// ─────────────────────────────────────────────

interface CalendarPickerProps {
  rangeStart: Date | null;
  rangeEnd:   Date | null;
  onChange: (start: Date | null, end: Date | null) => void;
  onApply: () => void;
  onClear: () => void;
}

function CalendarPicker({ rangeStart, rangeEnd, onChange, onApply, onClear }: CalendarPickerProps) {
  const today = new Date();
  const [year,  setYear]  = useState(rangeStart?.getFullYear()  ?? today.getFullYear());
  const [month, setMonth] = useState(rangeStart?.getMonth()     ?? today.getMonth());
  const [picking, setPicking] = useState(false);

  const shiftMonth = (dir: number) => {
    let m = month + dir;
    let y = year;
    if (m > 11) { m = 0; y++; }
    if (m < 0)  { m = 11; y--; }
    setMonth(m);
    setYear(y);
  };

  // Click handler — always uses new Date(year, month, day) for local date
  const pickDay = (day: number) => {
    const clicked = new Date(year, month, day); // local midnight, no UTC offset
    if (!picking || !rangeStart) {
      onChange(clicked, null);
      setPicking(true);
    } else {
      if (clicked < rangeStart) {
        onChange(clicked, rangeStart);
      } else {
        onChange(rangeStart, clicked);
      }
      setPicking(false);
    }
  };

  const firstDow    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return (
    <div style={{ padding: 14, minWidth: 280, fontSize: 13 }}>

      {/* ── Navigation ── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
        <button type="button" onClick={() => shiftMonth(-1)} style={styles.navBtn}>‹</button>
        <span style={{ fontWeight:500, fontSize:13 }}>{MONTHS[month]} {year}</span>
        <button type="button" onClick={() => shiftMonth(1)}  style={styles.navBtn}>›</button>
      </div>

      {/* ── Grid ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2 }}>

        {/* Weekday headers */}
        {WEEK_DAYS.map(d => (
          <span key={d} style={{ textAlign:'center', fontSize:11, color:'#888', padding:'4px 0' }}>{d}</span>
        ))}

        {/* Empty cells before first day */}
        {Array.from({ length: firstDow }).map((_, i) => <span key={`e${i}`} />)}

        {/* Day cells */}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
          const date    = new Date(year, month, day); // local date
          const isStart = rangeStart != null && sameDay(date, rangeStart);
          const isEnd   = rangeEnd   != null && sameDay(date, rangeEnd);
          const isSingle= isStart && isEnd;
          const inRange = rangeStart != null && rangeEnd != null
                          && date > rangeStart && date < rangeEnd;

          // Background & text color
          const bg    = (isStart || isEnd) ? '#185fa5' : inRange ? '#e6f1fb' : 'transparent';
          const color = (isStart || isEnd) ? '#fff'    : inRange ? '#185fa5' : 'inherit';

          // Border radius — bridge between start and end
          const br: React.CSSProperties['borderRadius'] = isSingle
            ? 6
            : isStart  ? '6px 0 0 6px'
            : isEnd    ? '0 6px 6px 0'
            : inRange  ? 0
            : 6;

          return (
            <button
              key={day}
              type="button"
              onClick={() => pickDay(day)}
              style={{
                height:32, border:'none', cursor:'pointer', fontSize:13,
                background: bg, color, borderRadius: br,
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => {
                if (bg === 'transparent')
                  (e.currentTarget as HTMLButtonElement).style.background = '#f0f0f0';
              }}
              onMouseLeave={e => {
                if (bg === 'transparent')
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              }}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* ── Footer ── */}
      <div style={{ display:'flex', justifyContent:'flex-end', gap:6, marginTop:10 }}>
        <button type="button" onClick={onClear} style={styles.clearBtn}>Clear</button>
        <button type="button" onClick={onApply} style={styles.applyBtn}>Apply</button>
      </div>
    </div>
  );
}

const styles = {
  navBtn: {
    width:28, height:28, border:'0.5px solid #ccc', borderRadius:6,
    background:'#f9f9f9', cursor:'pointer', fontSize:16,
    display:'flex', alignItems:'center', justifyContent:'center',
  } as React.CSSProperties,
  clearBtn: {
    padding:'5px 12px', border:'0.5px solid #ccc', borderRadius:6,
    background:'none', cursor:'pointer', fontSize:12,
  } as React.CSSProperties,
  applyBtn: {
    padding:'5px 12px', border:'0.5px solid #185fa5', borderRadius:6,
    background:'#185fa5', color:'#fff', cursor:'pointer', fontSize:12,
  } as React.CSSProperties,
};

// ─────────────────────────────────────────────
// ACTIVE FILTER PILLS
// ─────────────────────────────────────────────

interface FilterPill { label: string; onRemove: () => void; }

function ActiveFilterPills({ pills }: { pills: FilterPill[] }) {
  if (pills.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {pills.map((p, i) => (
        <span key={i} className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
          {p.label}
          <button onClick={p.onRemove} className="ml-1 text-blue-400 hover:text-blue-700 leading-none" aria-label={`Remove ${p.label}`}>×</button>
        </span>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN PAGE COMPONENT
// ─────────────────────────────────────────────

export default function AdminOrderManagement() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const getParam     = (k: string) => searchParams.get(k) ?? '';

  const [searchInput, setSearchInputLocal] = useState(getParam('search'));
  const [calOpen,     setCalOpen]   = useState(false);

  // Use parseLocalDate so that "2026-05-18" → May 18 local, not May 17
  const [calStart, setCalStart] = useState<Date | null>(parseLocalDate(getParam('startDate')));
  const [calEnd,   setCalEnd]   = useState<Date | null>(parseLocalDate(getParam('endDate')));

  const calWrapRef = useRef<HTMLDivElement>(null);

  const {
    orders, pagination, isLoading,
    setPage, updateStatus, deleteOrder,
    filters,
    setSearchInput: hookSetSearch, 
    applySearch, applyFilter, applyQuickFilter, applyDateRange, clearFilters,
  } = useAdminOrders();

  // ── Hydrate hook from URL on mount ────────────────────────────────────
  useEffect(() => {
    const s  = getParam('search');
    const os = getParam('orderStatus');
    const ps = getParam('paymentStatus');
    const qf = getParam('quickFilter') as QuickFilter;
    const sd = getParam('startDate');
    const ed = getParam('endDate');
    hookSetSearch(s);
    if (os)       applyFilter('orderStatus',   os);
    if (ps)       applyFilter('paymentStatus', ps);
    if (qf)       applyQuickFilter(qf);
    if (sd || ed) applyDateRange(sd, ed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Write URL whenever filters change ────────────────────────────────
  const buildURL = useCallback(() => {
    const p = new URLSearchParams();
    if (filters.search)        p.set('search',        filters.search);
    if (filters.orderStatus)   p.set('orderStatus',   filters.orderStatus);
    if (filters.paymentStatus) p.set('paymentStatus', filters.paymentStatus);
    if (filters.quickFilter)   p.set('quickFilter',   filters.quickFilter);
    if (filters.startDate)     p.set('startDate',     filters.startDate);
    if (filters.endDate)       p.set('endDate',       filters.endDate);
    return p.toString() ? `?${p.toString()}` : '';
  }, [filters]);

  useEffect(() => {
    router.replace(buildURL() || window.location.pathname, { scroll: false });
  }, [buildURL, router]);

  // ── Close calendar on outside click ──────────────────────────────────
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (calWrapRef.current && !calWrapRef.current.contains(e.target as Node))
        setCalOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // ── Calendar handlers ─────────────────────────────────────────────────
  const handleCalApply = () => {
    if (!calStart) { setCalOpen(false); return; }
    // fmtDate uses local parts — no UTC offset shift
    const start = fmtDate(calStart);
    const end   = calEnd ? fmtDate(calEnd) : start;
    applyDateRange(start, end);
    applyFilter('quickFilter', '');
    setCalOpen(false);
  };

  const handleCalClear = () => {
    setCalStart(null);
    setCalEnd(null);
    applyDateRange('', '');
    setCalOpen(false);
  };

  // ── Clear all ─────────────────────────────────────────────────────────
  const handleClearAll = () => {
    setSearchInputLocal('');
    setCalStart(null);
    setCalEnd(null);
    clearFilters();
  };

  // ── Active filter pills ───────────────────────────────────────────────
  const activePills: FilterPill[] = [];
  if (filters.search)
    activePills.push({ label:`Search: "${filters.search}"`, onRemove:()=>{ setSearchInputLocal(''); hookSetSearch(''); applySearch(); } });
  if (filters.orderStatus)
    activePills.push({ label:`Status: ${filters.orderStatus}`,   onRemove:()=>applyFilter('orderStatus','') });
  if (filters.paymentStatus)
    activePills.push({ label:`Payment: ${filters.paymentStatus}`, onRemove:()=>applyFilter('paymentStatus','') });
  if (filters.quickFilter)
    activePills.push({ label:`Period: ${filters.quickFilter}`,   onRemove:()=>applyQuickFilter('') });
  if (filters.startDate || filters.endDate)
    activePills.push({ label:`Dates: ${filters.startDate||'…'} → ${filters.endDate||'…'}`, onRemove:handleCalClear });

  // ── Calendar label ────────────────────────────────────────────────────
  const calLabel =
    calStart && calEnd && !sameDay(calStart, calEnd)
      ? `${fmtDisplay(calStart)} – ${fmtDisplay(calEnd)}`
      : calStart
      ? fmtDisplay(calStart)
      : 'Date range';

  // ── Table columns ─────────────────────────────────────────────────────
  const columns = [
    {
      header: 'Order', accessorKey: 'orderId',
      cell: (item: Order) => (
        <div className="flex flex-col">
          <span className="font-mono text-orange-500 font-bold text-xs">{item.orderId}</span>
          <span className="text-[11px] text-slate-400 mt-0.5">{new Date(item.createdAt).toLocaleString()}</span>
        </div>
      ),
    },
    {
      header: 'Customer', accessorKey: 'fullName',
      cell: (item: Order) => (
        <div className="flex flex-col">
          <span className="font-semibold text-sm">{item.fullName}</span>
          <span className="text-xs text-slate-400">{item.email || '—'}</span>
          <span className="text-xs text-slate-400">{item.phone}</span>
        </div>
      ),
    },
    {
      header: 'Total', accessorKey: 'total',
      cell: (item: Order) => <span className="font-bold text-orange-500">AUD {item.total.toLocaleString()}</span>,
    },
    {
      header: 'Payment', accessorKey: 'paymentStatus',
      cell: (item: Order) => {
        const map: Record<string,string> = {
          pending: 'bg-amber-50 text-amber-700 border-amber-200',
          paid:    'bg-green-50 text-green-700 border-green-200',
          failed:  'bg-red-50 text-red-700 border-red-200',
        };
        return <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${map[item.paymentStatus]}`}>{item.paymentStatus}</span>;
      },
    },
    {
      header: 'Status', accessorKey: 'orderStatus',
      cell: (item: Order) => (
        <select
          value={item.orderStatus}
          disabled={updateStatus.isPending}
          onChange={e => updateStatus.mutate({ id: item._id, orderStatus: e.target.value as Order['orderStatus'] })}
          className="border border-slate-200 px-2 py-1 text-xs rounded-md bg-white focus:outline-none disabled:opacity-50"
        >
          {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      ),
    },
    {
      header: 'Action', accessorKey: 'action',
      cell: (item: Order) => (
        <button
          onClick={() => deleteOrder.mutate(item._id)}
          // disabled={deleteOrder.isPending}
          className="px-3 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded-md disabled:opacity-50 transition-colors"
        >
          Delete
        </button>
      ),
    },
  ];

  const totalRevenue = useMemo(
    () => orders.reduce((s: number, o: Order) => s + (o.total || 0), 0),
    [orders]
  );

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <div className="space-y-4">

     {/* ─── FILTER BAR ─────────────────────────────────────────────── */}
<div className="flex flex-col gap-3">

  <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col gap-3">

    {/* Top row: search + divider + dropdowns */}
    <div className="flex flex-wrap items-center gap-2">

      {/* Search */}
      <div className="flex gap-1.5 flex-1 min-w-[220px]">
        <input
          value={searchInput}
          onChange={e => { setSearchInputLocal(e.target.value); hookSetSearch(e.target.value); }}
          onKeyDown={e => e.key === 'Enter' && applySearch()}
          placeholder="Search name, email, phone, order ID…"
          className="flex-1 min-w-0 h-9 px-3 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
        />
        <Button
          onClick={applySearch}
          className="h-9 px-4 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-1.5 whitespace-nowrap"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          Search
        </Button>
      </div>

      {/* Divider */}
      <div className="w-px h-7 bg-slate-200 hidden sm:block" />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-1.5">
        <select
          value={filters.orderStatus}
          onChange={e => applyFilter('orderStatus', e.target.value)}
          className="h-9 pl-3 pr-7 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 appearance-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
        >
          <option value="">All status</option>
          {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select
          value={filters.paymentStatus}
          onChange={e => applyFilter('paymentStatus', e.target.value)}
          className="h-9 pl-3 pr-7 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 appearance-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
        >
          <option value="">All payment</option>
          {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select
          value={filters.quickFilter}
          onChange={e => applyQuickFilter(e.target.value as QuickFilter)}
          className="h-9 pl-3 pr-7 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 appearance-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
        >
          <option value="">Quick filter</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="last7days">Last 7 days</option>
          <option value="last30days">Last 30 days</option>
        </select>

        {/* Calendar range picker */}
        <div className="relative" ref={calWrapRef}>
          <button
            type="button"
            onClick={() => setCalOpen(v => !v)}
            className={`h-9 px-3 text-sm border rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap ${
              calStart
                ? 'border-blue-400 bg-blue-50 text-blue-700 font-medium'
                : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span>{calLabel}</span>
          </button>

          {calOpen && (
            <div className="absolute top-11 left-0 z-50 bg-white border border-slate-200 rounded-xl shadow-lg">
              <CalendarPicker
                rangeStart={calStart}
                rangeEnd={calEnd}
                onChange={(s, e) => { setCalStart(s); setCalEnd(e); }}
                onApply={handleCalApply}
                onClear={handleCalClear}
              />
            </div>
          )}
        </div>

        <button
          onClick={handleClearAll}
          className="h-9 px-3 text-sm border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1.5 ml-auto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
          Clear all
        </button>
      </div>
    </div>

    {/* Active filter pills */}
    <ActiveFilterPills pills={activePills} />
  </div>

  {/* ─── TABLE ──────────────────────────────────────────────────── */}
  <DataTable<Order>
    title="Admin Orders"
    data={orders}
    columns={columns}
    page={pagination?.page || 1}
    totalPages={pagination?.totalPages || 1}
    setPage={setPage}
    loading={isLoading}
  />

  {/* ─── SUMMARY STATS ──────────────────────────────────────────── */}
  <div className="grid grid-cols-3 sm:grid-cols-3 gap-2.5">
    <div></div>
    <div></div>
    <div className="bg-slate-50 rounded-xl p-3.5">
      <p className="text-xs text-end text-slate-400 mb-1">Revenue (this page)</p>
      <p className="text-2xl text-end font-semibold text-green-600">AUD {totalRevenue.toLocaleString()}</p>
    </div>
 
  </div>

</div>

    </div>
  );
}