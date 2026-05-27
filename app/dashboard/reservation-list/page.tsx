// app/dashboard/reservations/page.tsx
'use client';

import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DataTable from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { ReservationService } from '@/services/reservationService';
import toast from 'react-hot-toast';

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

type Reservation = {
  _id: string;
  reservationId: string;
  fullName: string;
  email: string;
  phone: string;
  people: number;
  date: string;
  time: string;
  timeSlot: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes: string;
  createdAt: string;
};

type Pagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

const RESERVATION_STATUSES = ['pending', 'confirmed', 'cancelled', 'completed'] as const;

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const WEEK_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

// ─────────────────────────────────────────────
// DATE UTILS  (local-safe, same pattern as orders page)
// ─────────────────────────────────────────────

function fmtDate(d: Date): string {
  const y   = d.getFullYear();
  const m   = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

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
// CALENDAR RANGE PICKER  (same as orders page)
// ─────────────────────────────────────────────

interface CalendarPickerProps {
  rangeStart: Date | null;
  rangeEnd:   Date | null;
  onChange:  (start: Date | null, end: Date | null) => void;
  onApply:   () => void;
  onClear:   () => void;
}

function CalendarPicker({ rangeStart, rangeEnd, onChange, onApply, onClear }: CalendarPickerProps) {
  const today = new Date();
  const [year,  setYear]  = useState(rangeStart?.getFullYear()  ?? today.getFullYear());
  const [month, setMonth] = useState(rangeStart?.getMonth()     ?? today.getMonth());
  const [picking, setPicking] = useState(false);

  const shiftMonth = (dir: number) => {
    let m = month + dir, y = year;
    if (m > 11) { m = 0; y++; }
    if (m < 0)  { m = 11; y--; }
    setMonth(m); setYear(y);
  };

  const pickDay = (day: number) => {
    const clicked = new Date(year, month, day);
    if (!picking || !rangeStart) {
      onChange(clicked, null);
      setPicking(true);
    } else {
      clicked < rangeStart ? onChange(clicked, rangeStart) : onChange(rangeStart, clicked);
      setPicking(false);
    }
  };

  const firstDow    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return (
    <div style={{ padding: 14, minWidth: 280, fontSize: 13 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
        <button type="button" onClick={() => shiftMonth(-1)} style={calStyles.navBtn}>‹</button>
        <span style={{ fontWeight:500, fontSize:13 }}>{MONTHS[month]} {year}</span>
        <button type="button" onClick={() => shiftMonth(1)}  style={calStyles.navBtn}>›</button>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2 }}>
        {WEEK_DAYS.map(d => (
          <span key={d} style={{ textAlign:'center', fontSize:11, color:'#888', padding:'4px 0' }}>{d}</span>
        ))}
        {Array.from({ length: firstDow }).map((_, i) => <span key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
          const date    = new Date(year, month, day);
          const isStart = rangeStart != null && sameDay(date, rangeStart);
          const isEnd   = rangeEnd   != null && sameDay(date, rangeEnd);
          const isSingle= isStart && isEnd;
          const inRange = rangeStart != null && rangeEnd != null && date > rangeStart && date < rangeEnd;
          const bg    = (isStart || isEnd) ? '#185fa5' : inRange ? '#e6f1fb' : 'transparent';
          const color = (isStart || isEnd) ? '#fff'    : inRange ? '#185fa5' : 'inherit';
          const br: React.CSSProperties['borderRadius'] = isSingle ? 6 : isStart ? '6px 0 0 6px' : isEnd ? '0 6px 6px 0' : inRange ? 0 : 6;
          return (
            <button
              key={day} type="button" onClick={() => pickDay(day)}
              style={{ height:32, border:'none', cursor:'pointer', fontSize:13, background:bg, color, borderRadius:br, transition:'background 0.1s' }}
              onMouseEnter={e => { if (bg==='transparent') (e.currentTarget as HTMLButtonElement).style.background='#f0f0f0'; }}
              onMouseLeave={e => { if (bg==='transparent') (e.currentTarget as HTMLButtonElement).style.background='transparent'; }}
            >{day}</button>
          );
        })}
      </div>
      <div style={{ display:'flex', justifyContent:'flex-end', gap:6, marginTop:10 }}>
        <button type="button" onClick={onClear} style={calStyles.clearBtn}>Clear</button>
        <button type="button" onClick={onApply} style={calStyles.applyBtn}>Apply</button>
      </div>
    </div>
  );
}

const calStyles = {
  navBtn:  { width:28, height:28, border:'0.5px solid #ccc', borderRadius:6, background:'#f9f9f9', cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' } as React.CSSProperties,
  clearBtn:{ padding:'5px 12px', border:'0.5px solid #ccc', borderRadius:6, background:'none', cursor:'pointer', fontSize:12 } as React.CSSProperties,
  applyBtn:{ padding:'5px 12px', border:'0.5px solid #185fa5', borderRadius:6, background:'#185fa5', color:'#fff', cursor:'pointer', fontSize:12 } as React.CSSProperties,
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
// STATUS BADGE  (read-only display, same style as payment badge in orders)
// ─────────────────────────────────────────────

const STATUS_BADGE: Record<Reservation['status'], string> = {
  pending:   'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
  completed: 'bg-slate-50 text-slate-500 border-slate-200',
};

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────

export default function AdminReservationManagement() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const getParam     = (k: string) => searchParams.get(k) ?? '';

  // ── local state ────────────────────────────────────────────────────────
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [pagination,   setPagination]   = useState<Pagination | null>(null);
  const [isLoading,    setIsLoading]    = useState(true);
  const [updatingId,   setUpdatingId]   = useState<string | null>(null);
  const [deletingId,   setDeletingId]   = useState<string | null>(null);

  // filter state
  const [searchInput,   setSearchInput]   = useState(getParam('search'));
  const [appliedSearch, setAppliedSearch] = useState(getParam('search'));
  const [statusFilter,  setStatusFilter]  = useState(getParam('status'));
  const [page,          setPage]          = useState(Number(getParam('page')) || 1);
  const [calOpen,       setCalOpen]       = useState(false);
  const [calStart,      setCalStart]      = useState<Date | null>(parseLocalDate(getParam('startDate')));
  const [calEnd,        setCalEnd]        = useState<Date | null>(parseLocalDate(getParam('endDate')));
  const [appliedStart,  setAppliedStart]  = useState(getParam('startDate'));
  const [appliedEnd,    setAppliedEnd]    = useState(getParam('endDate'));

  const calWrapRef = useRef<HTMLDivElement>(null);

  // ── fetch ──────────────────────────────────────────────────────────────
  const fetchReservations = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await ReservationService.getAllReservationsAdmin({
        page,
        limit: 10,
        search:      appliedSearch  || undefined,
        status:      statusFilter   || undefined,
        startDate:   appliedStart   || undefined,
        endDate:     appliedEnd     || undefined,
      });
      setReservations(res.data);
      setPagination(res.pagination);
    } catch {
      toast.error('Failed to load reservations');
    } finally {
      setIsLoading(false);
    }
  }, [page, appliedSearch, statusFilter, appliedStart, appliedEnd]);

  useEffect(() => { fetchReservations(); }, [fetchReservations]);
  useEffect(() => { setPage(1); }, [appliedSearch, statusFilter, appliedStart, appliedEnd]);

  // ── sync URL ───────────────────────────────────────────────────────────
  useEffect(() => {
    const p = new URLSearchParams();
    if (appliedSearch) p.set('search',    appliedSearch);
    if (statusFilter)  p.set('status',    statusFilter);
    if (appliedStart)  p.set('startDate', appliedStart);
    if (appliedEnd)    p.set('endDate',   appliedEnd);
    if (page > 1)      p.set('page',      String(page));
    const qs = p.toString();
    router.replace(qs ? `?${qs}` : window.location.pathname, { scroll: false });
  }, [appliedSearch, statusFilter, appliedStart, appliedEnd, page, router]);

  // ── close calendar on outside click ────────────────────────────────────
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (calWrapRef.current && !calWrapRef.current.contains(e.target as Node)) setCalOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // ── handlers ───────────────────────────────────────────────────────────
  const applySearch = () => setAppliedSearch(searchInput.trim());

  const handleCalApply = () => {
    if (!calStart) { setCalOpen(false); return; }
    setAppliedStart(fmtDate(calStart));
    setAppliedEnd(calEnd ? fmtDate(calEnd) : fmtDate(calStart));
    setCalOpen(false);
  };

  const handleCalClear = () => {
    setCalStart(null); setCalEnd(null);
    setAppliedStart(''); setAppliedEnd('');
    setCalOpen(false);
  };

  const handleClearAll = () => {
    setSearchInput(''); setAppliedSearch('');
    setStatusFilter('');
    setCalStart(null); setCalEnd(null);
    setAppliedStart(''); setAppliedEnd('');
    setPage(1);
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      setUpdatingId(id);
      await ReservationService.updateReservation(id, { status: status as Reservation['status'] });
      toast.success('Status updated');
      fetchReservations();
    } catch {
      toast.error('Update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this reservation?')) return;
    try {
      setDeletingId(id);
      await ReservationService.deleteReservation(id);
      toast.success('Reservation deleted');
      fetchReservations();
    } catch {
      toast.error('Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  // ── filter pills ────────────────────────────────────────────────────────
  const activePills: FilterPill[] = [];
  if (appliedSearch)
    activePills.push({ label: `Search: "${appliedSearch}"`, onRemove: () => { setSearchInput(''); setAppliedSearch(''); } });
  if (statusFilter)
    activePills.push({ label: `Status: ${statusFilter}`, onRemove: () => setStatusFilter('') });
  if (appliedStart || appliedEnd)
    activePills.push({ label: `Dates: ${appliedStart || '…'} → ${appliedEnd || '…'}`, onRemove: handleCalClear });

  // ── calendar button label ───────────────────────────────────────────────
  const calLabel =
    calStart && calEnd && !sameDay(calStart, calEnd)
      ? `${fmtDisplay(calStart)} – ${fmtDisplay(calEnd)}`
      : calStart ? fmtDisplay(calStart) : 'Date range';

  // ── summary ─────────────────────────────────────────────────────────────
  const totalGuests = useMemo(
    () => reservations.reduce((s, r) => s + (r.people || 0), 0),
    [reservations]
  );

  // ── table columns — same structure as orders page ───────────────────────
  const columns = [
    {
      header: 'Reservation',
      accessorKey: 'reservationId',
      cell: (item: Reservation) => (
        <div className="flex flex-col">
          <span className="font-mono text-orange-500 font-bold text-xs">{item.reservationId}</span>
          <span className="text-[11px] text-slate-400 mt-0.5">{new Date(item.createdAt).toLocaleString()}</span>
        </div>
      ),
    },
    {
      header: 'Guest',
      accessorKey: 'fullName',
      cell: (item: Reservation) => (
        <div className="flex flex-col">
          <span className="font-semibold text-sm">{item.fullName}</span>
          <span className="text-xs text-slate-400">{item.email || '—'}</span>
          <span className="text-xs text-slate-400">{item.phone}</span>
        </div>
      ),
    },
    {
      header: 'Date & Time',
      accessorKey: 'date',
      cell: (item: Reservation) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-slate-700">{item.date}</span>
          <span className="text-xs text-slate-400 font-mono">{item.timeSlot}</span>
        </div>
      ),
    },
    {
      header: 'Guests',
      accessorKey: 'people',
      cell: (item: Reservation) => (
        <span className="text-sm font-semibold text-slate-700">
          {item.people} <span className="text-xs font-normal text-slate-400">{item.people === 1 ? 'person' : 'people'}</span>
        </span>
      ),
    },
    {
      header: 'Notes',
      accessorKey: 'notes',
      cell: (item: Reservation) => (
        <span className="text-xs text-slate-400 line-clamp-2 max-w-[160px]">
          {item.notes || <span className="italic text-slate-300">—</span>}
        </span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (item: Reservation) => (
        <select
          value={item.status}
          disabled={updatingId === item._id}
          onChange={e => handleStatusChange(item._id, e.target.value)}
          className="border border-slate-200 px-2 py-1 text-xs rounded-md bg-white focus:outline-none disabled:opacity-50 cursor-pointer"
        >
          {RESERVATION_STATUSES.map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      ),
    },
    {
      header: 'Action',
      accessorKey: 'action',
      cell: (item: Reservation) => (
        <button
          onClick={() => handleDelete(item._id)}
          disabled={deletingId === item._id}
          className="px-3 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded-md disabled:opacity-50 transition-colors"
        >
          {deletingId === item._id ? '…' : 'Delete'}
        </button>
      ),
    },
  ];

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
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && applySearch()}
                placeholder="Search name, phone, reservation ID…"
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

              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="h-9 pl-3 pr-7 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 appearance-none"
                style={{ backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat:'no-repeat', backgroundPosition:'right 8px center' }}
              >
                <option value="">All status</option>
                {RESERVATION_STATUSES.map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
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
                    <line x1="8"  y1="2" x2="8"  y2="6"/>
                    <line x1="3"  y1="10" x2="21" y2="10"/>
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

              {/* Clear all */}
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

        {/* ─── TABLE ────────────────────────────────────────────────── */}
        <DataTable<Reservation>
          title="Reservations"
          data={reservations}
          columns={columns}
          page={pagination?.page || 1}
          totalPages={pagination?.totalPages || 1}
          setPage={setPage}
          loading={isLoading}
        />

        {/* ─── SUMMARY STATS ──────────────────────────────────────── */}
        {/* <div className="grid grid-cols-3 sm:grid-cols-3 gap-2.5">
          <div />
          <div />
          <div className="bg-slate-50 rounded-xl p-3.5">
            <p className="text-xs text-end text-slate-400 mb-1">Total guests (this page)</p>
            <p className="text-2xl text-end font-semibold text-green-600">{totalGuests} pax</p>
          </div>
        </div> */}

      </div>
    </div>
  );
}