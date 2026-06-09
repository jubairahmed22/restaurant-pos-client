'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { ArrowLeft, Edit2, Users, Clock } from 'lucide-react';

import { useSocket }        from '@/hooks/useSocket';
import { FloorPlanService, IFloorPlanTable } from '@/services/floor-plan.service';
import { SessionService, ITableSession }   from '@/services/session.service';
import { TableService }     from '@/services/table.service';

// ── Order status grouping ─────────────────────────────────
interface OrderGroup {
  key: string; label: string; statuses: string[]; isCompleted?: boolean;
  bg: string; badge: string; dot: string;
}
const ORDER_GROUPS: OrderGroup[] = [
  { key: 'upcoming',    label: 'Upcoming',    statuses: ['seated'],       bg: 'bg-slate-50',   badge: 'bg-slate-200 text-slate-700',    dot: 'bg-slate-400'   },
  { key: 'new',         label: 'New',         statuses: ['ordering'],     bg: 'bg-blue-50',    badge: 'bg-blue-200 text-blue-800',      dot: 'bg-blue-400'    },
  { key: 'in-progress', label: 'In Progress', statuses: ['waiting'],      bg: 'bg-amber-50',   badge: 'bg-amber-200 text-amber-800',    dot: 'bg-amber-400'   },
  { key: 'ready',       label: 'Ready',       statuses: ['ready-to-pay'], bg: 'bg-emerald-50', badge: 'bg-emerald-200 text-emerald-800', dot: 'bg-emerald-500' },
  { key: 'complete',    label: 'Complete',    statuses: [], isCompleted: true, bg: 'bg-slate-100', badge: 'bg-slate-300 text-slate-700', dot: 'bg-slate-400' },
];

function fmt(n: number) { return `$${n.toFixed(2)}`; }

// ── Status config ─────────────────────────────────────────
const STATUS_CFG = {
  'empty':          { label: 'Available',     bg: 'bg-white',       text: 'text-slate-400',   ring: 'ring-slate-200',   dot: 'bg-slate-300'   },
  'seated':         { label: 'Seated',        bg: 'bg-emerald-50',  text: 'text-emerald-700', ring: 'ring-emerald-300', dot: 'bg-emerald-400' },
  'ordering':       { label: 'Ordering',      bg: 'bg-blue-50',     text: 'text-blue-700',    ring: 'ring-blue-300',    dot: 'bg-blue-400'    },
  'waiting':        { label: 'Waiting',       bg: 'bg-amber-50',    text: 'text-amber-700',   ring: 'ring-amber-300',   dot: 'bg-amber-400'   },
  'ready-to-pay':   { label: 'Ready to Pay',  bg: 'bg-rose-50',     text: 'text-rose-700',    ring: 'ring-rose-300',    dot: 'bg-rose-400'    },
  'needs-cleaning': { label: 'Cleaning',      bg: 'bg-slate-100',   text: 'text-slate-500',   ring: 'ring-slate-300',   dot: 'bg-slate-400'   },
} as const;

type TableStatus = keyof typeof STATUS_CFG;

function elapsed(seatedAt: string) {
  const diff = Math.floor((Date.now() - new Date(seatedAt).getTime()) / 1000);
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

// ── Seat Modal ────────────────────────────────────────────
function SeatModal({
  table,
  onClose,
  onConfirm,
  isPending,
}: {
  table: IFloorPlanTable;
  onClose: () => void;
  onConfirm: (partySize: number, serverName: string) => void;
  isPending: boolean;
}) {
  const [partySize,   setPartySize]   = useState(2);
  const [serverName,  setServerName]  = useState('');

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1,    y: 0 }}
        exit={{   opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.15 }}
        className="bg-white rounded-2xl shadow-2xl w-80 overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">Seat {table.label}</h3>
          <p className="text-sm text-slate-400 mt-0.5">{table.section} · up to {table.capacity} guests</p>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Party size */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
              Number of guests
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setPartySize(p => Math.max(1, p - 1))}
                className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 font-bold text-lg flex items-center justify-center hover:bg-slate-200 transition"
              >−</button>
              <span className="text-3xl font-bold text-slate-800 w-10 text-center tabular-nums">
                {partySize}
              </span>
              <button
                onClick={() => setPartySize(p => Math.min(table.capacity, p + 1))}
                className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 font-bold text-lg flex items-center justify-center hover:bg-slate-200 transition"
              >+</button>
            </div>
          </div>

          {/* Server */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
              Server name
            </label>
            <input
              type="text"
              value={serverName}
              onChange={e => setServerName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && onConfirm(partySize, serverName || 'Staff')}
              placeholder="e.g. Jordan M."
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(partySize, serverName || 'Staff')}
            disabled={isPending}
            className="flex-1 py-2.5 bg-[#1B3A6B] text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 transition shadow-sm"
          >
            {isPending ? 'Seating…' : 'Seat Table'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Table Node on Canvas ──────────────────────────────────
function TableNode({
  table,
  onClick,
  onPrefetch,
}: {
  table: IFloorPlanTable;
  onClick: () => void;
  onPrefetch: () => void;
}) {
  const status = (table.status ?? 'empty') as TableStatus;
  const cfg    = STATUS_CFG[status] ?? STATUS_CFG['empty'];
  const isCircle = table.shape === 'circle';

  // Width/height as % of canvas (same formula as editor: width * 40 / 1000 * 100)
  const wPct = (table.width  * 40 / 1000) * 100;
  const hPct = (table.height * 40 / 700 ) * 100;

  const hasSession = !!table.currentSession;

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.08, zIndex: 10 }}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.12 }}
      onClick={onClick}
      onMouseEnter={onPrefetch}
      style={{
        position: 'absolute',
        left:     `${table.x}%`,
        top:      `${table.y}%`,
        width:    `${wPct}%`,
        height:   `${hPct}%`,
      }}
      className={`
        flex flex-col items-center justify-center cursor-pointer gap-0.5
        ${isCircle ? 'rounded-full' : 'rounded-xl'}
        ${cfg.bg} ring-2 ${cfg.ring}
        shadow-sm hover:shadow-md transition-shadow
      `}
    >
      <span className={`text-[11px] font-bold leading-tight ${cfg.text} truncate px-1 max-w-full`}>
        {table.label}
      </span>

      {hasSession && table.currentSession?.seatedAt && (
        <span className={`text-[9px] font-medium ${cfg.text} opacity-80`}>
          {elapsed(table.currentSession.seatedAt)}
        </span>
      )}

      {!hasSession && status === 'empty' && (
        <span className="text-[9px] text-slate-300">{table.capacity}p</span>
      )}
    </motion.button>
  );
}

// ── Live Floor View ───────────────────────────────────────
export default function LiveFloorPage() {
  const { floorPlanId } = useParams<{ floorPlanId: string }>();
  const router          = useRouter();
  const queryClient     = useQueryClient();
  const socket          = useSocket('admin-room');

  const [seatTarget, setSeatTarget] = useState<IFloorPlanTable | null>(null);
  const [filter,     setFilter]     = useState<TableStatus | 'all'>('all');

  // ── Fetch floor plan + its tables ─────────────────────
  const { data: plan, isLoading } = useQuery({
    queryKey: ['floorPlan', floorPlanId, 'live'],
    queryFn:  () => FloorPlanService.getOne(floorPlanId),
    refetchInterval: 15_000,
    staleTime: 8_000,
  });

  const tables: IFloorPlanTable[] = plan?.tables ?? [];
  const placed = tables.filter(t => t.isPlaced);

  // ── Active sessions for orders panel ──────────────────
  const { data: activeSessions = [] } = useQuery<ITableSession[]>({
    queryKey: ['activeSessions'],
    queryFn:  SessionService.getActiveSessions,
    refetchInterval: 10_000,
    staleTime: 5_000,
  });

  // ── Real-time socket updates ───────────────────────────
  useEffect(() => {
    if (!socket) return;

    const onStatusChange = (payload: { tableId: string; status: string }) => {
      queryClient.setQueryData(
        ['floorPlan', floorPlanId, 'live'],
        (prev: typeof plan) => {
          if (!prev) return prev;
          return {
            ...prev,
            tables: prev.tables?.map(t =>
              t._id === payload.tableId
                ? { ...t, status: payload.status as TableStatus }
                : t
            ),
          };
        }
      );
    };

    const onSessionCompleted = () => {
      queryClient.invalidateQueries({ queryKey: ['floorPlan', floorPlanId, 'live'] });
    };

    socket.on('table:statusChanged', onStatusChange);
    socket.on('session:completed',   onSessionCompleted);

    return () => {
      socket.off('table:statusChanged', onStatusChange);
      socket.off('session:completed',   onSessionCompleted);
    };
  }, [socket, queryClient, floorPlanId]);

  // ── Seat table ─────────────────────────────────────────
  const seatMutation = useMutation({
    mutationFn: ({ tableId, partySize, serverName }: { tableId: string; partySize: number; serverName: string }) =>
      SessionService.create({ tableId, partySize, serverName, guestCount: partySize }),
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: ['floorPlan', floorPlanId, 'live'] });
      toast.success(`${seatTarget?.label} seated`);
      setSeatTarget(null);
      router.push(`/dashboard/tables/${session.table}/session`);
    },
    onError: () => toast.error('Failed to seat table'),
  });

  // ── Clean table ────────────────────────────────────────
  const cleanMutation = useMutation({
    mutationFn: (tableId: string) => TableService.updateStatus(tableId, 'empty'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['floorPlan', floorPlanId, 'live'] });
      toast.success('Table marked clean');
    },
  });

  // ── Prefetch on hover ──────────────────────────────────
  const handlePrefetch = useCallback((tableId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['session', 'table', tableId],
      queryFn:  () => SessionService.getActiveForTable(tableId),
      staleTime: 5_000,
    });
  }, [queryClient]);

  // ── Handle table click ─────────────────────────────────
  const handleTableClick = (table: IFloorPlanTable) => {
    const status = table.status ?? 'empty';
    if (status === 'empty')           return setSeatTarget(table);
    if (status === 'needs-cleaning')  return cleanMutation.mutate(table._id);
    if (table.currentSession)         return router.push(`/dashboard/tables/${table._id}/session`);
    setSeatTarget(table);
  };

  // ── Stats ──────────────────────────────────────────────
  const stats = {
    total:    placed.length,
    occupied: placed.filter(t => !['empty', 'needs-cleaning'].includes(t.status ?? 'empty')).length,
    empty:    placed.filter(t => t.status === 'empty' || !t.status).length,
    cleaning: placed.filter(t => t.status === 'needs-cleaning').length,
  };

  const filtered = filter === 'all'
    ? placed
    : placed.filter(t => (t.status ?? 'empty') === filter);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-[#1B3A6B] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      {/* ── Header ──────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard/tables')}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 transition shadow-sm"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{plan?.name}</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {plan?.location} · Click an empty table to seat guests
            </p>
          </div>
        </div>

        <button
          onClick={() => router.push(`/dashboard/tables/plans/${floorPlanId}/edit`)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition shadow-sm"
        >
          <Edit2 size={14} />
          Edit Layout
        </button>
      </div>

      {/* ── Stats ───────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Tables', value: stats.total,    color: 'text-slate-700'    },
          { label: 'Occupied',     value: stats.occupied, color: 'text-indigo-600'   },
          { label: 'Available',    value: stats.empty,    color: 'text-emerald-600'  },
          { label: 'Cleaning',     value: stats.cleaning, color: 'text-slate-400'    },
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-400">{s.label}</p>
            <p className={`text-3xl font-bold mt-1 tabular-nums ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Filter pills ────────────────────────────── */}
      <div className="flex gap-2 flex-wrap">
        {(['all', ...Object.keys(STATUS_CFG)] as (TableStatus | 'all')[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
              filter === f
                ? 'bg-[#1B3A6B] text-white'
                : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-400'
            }`}
          >
            {f === 'all' ? 'All Tables' : STATUS_CFG[f]?.label}
          </button>
        ))}
      </div>

      {/* ── Canvas ──────────────────────────────────── */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        <div
          className="relative w-full"
          style={{
            paddingBottom: '70%',
            backgroundImage:
              'linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        >
          {filtered.map(table => (
            <TableNode
              key={table._id}
              table={table}
              onClick={() => handleTableClick(table)}
              onPrefetch={() => table.currentSession && handlePrefetch(table._id)}
            />
          ))}

          {/* Empty state */}
          {placed.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-300">
              <p className="text-sm font-medium">No tables placed on this floor plan</p>
              <button
                onClick={() => router.push(`/dashboard/tables/plans/${floorPlanId}/edit`)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-500 text-xs font-semibold hover:bg-slate-200 transition"
              >
                Open Editor →
              </button>
            </div>
          )}
        </div>

        {/* ── Legend ──────────────────────────────── */}
        <div className="border-t border-slate-100 px-5 py-3 flex gap-5 flex-wrap">
          {(Object.entries(STATUS_CFG) as [TableStatus, typeof STATUS_CFG[TableStatus]][]).map(([status, cfg]) => (
            <div key={status} className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
              <span className="text-xs text-slate-400">{cfg.label}</span>
            </div>
          ))}
          <p className="text-xs text-slate-300 ml-auto">
            Tap cleaning table to mark it empty · tap occupied table to open session
          </p>
        </div>
      </div>

      {/* ── Seat Modal ──────────────────────────────── */}
      <AnimatePresence>
        {seatTarget && (
          <SeatModal
            table={seatTarget}
            onClose={() => setSeatTarget(null)}
            onConfirm={(partySize, serverName) =>
              seatMutation.mutate({ tableId: seatTarget._id, partySize, serverName })
            }
            isPending={seatMutation.isPending}
          />
        )}
      </AnimatePresence>

      {/* ── Orders Status Panel ──────────────────────── */}
      <div>
        <h2 className="text-base font-bold text-slate-700 mb-3">Live Orders</h2>
        <div className="grid grid-cols-5 gap-3">
          {ORDER_GROUPS.map(group => {
            const groupSessions = group.isCompleted
              ? [] // completed shown separately on the orders page
              : activeSessions.filter(s => group.statuses.includes(s.status));

            return (
              <div key={group.key} className={`${group.bg} rounded-2xl border border-white p-4 shadow-sm`}>
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${group.dot}`} />
                    <span className="text-xs font-bold text-slate-600">{group.label}</span>
                  </div>
                  <span className={`text-[11px] font-black px-2 py-0.5 rounded-full ${group.badge}`}>
                    {groupSessions.length}
                  </span>
                </div>

                {/* Sessions */}
                <div className="space-y-2">
                  {groupSessions.length === 0 ? (
                    <p className="text-[11px] text-slate-300 text-center py-3">No orders</p>
                  ) : (
                    groupSessions.map(s => (
                      <button
                        key={s._id}
                        onClick={() => router.push(`/dashboard/tables/${s.table}/session`)}
                        className="w-full text-left bg-white rounded-xl px-3 py-2.5 shadow-sm hover:shadow-md hover:ring-1 hover:ring-indigo-200 transition group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 transition">
                            {s.tableLabel}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">#{s.checkId?.slice(-5)}</span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[10px] text-slate-400">{s.orderItems.length} item{s.orderItems.length !== 1 ? 's' : ''}</span>
                          <span className="text-[10px] font-semibold text-slate-600">{fmt(s.total)}</span>
                        </div>
                        {s.serverName && (
                          <p className="text-[10px] text-slate-300 mt-0.5 truncate">{s.serverName}</p>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
