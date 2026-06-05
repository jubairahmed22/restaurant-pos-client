'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { X, Trash2, Plus, Undo2, Redo2 } from 'lucide-react';
import {
  FloorPlanService,
  IFloorPlanTable,
  AddSectionPayload,
} from '@/services/floor-plan.service';

// ── Canvas constants ──────────────────────────────────────
const CANVAS_W  = 1000;   // virtual px
const CANVAS_H  = 700;
const GRID_STEP = 40;     // snap grid

function snap(v: number) {
  return Math.round(v / GRID_STEP) * GRID_STEP;
}
function toPercent(v: number, max: number) {
  return (v / max) * 100;
}
function fromPercent(pct: number, max: number) {
  return (pct / 100) * max;
}

// ── Add Section Modal ─────────────────────────────────────
function AddSectionModal({
  floorPlanName,
  onClose,
  onConfirm,
  isPending,
}: {
  floorPlanName: string;
  onClose: () => void;
  onConfirm: (payload: AddSectionPayload) => void;
  isPending: boolean;
}) {
  const [name,       setName]       = useState('');
  const [label,      setLabel]      = useState('');
  const [tableCount, setTableCount] = useState(5);
  const [naming,     setNaming]     = useState<'auto' | 'custom'>('auto');

  const preview = Array.from({ length: Math.min(tableCount, 8) }, (_, i) =>
    naming === 'auto' ? `${name || 'Section'} ${i + 1}` : `${i + 1}`
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="bg-white rounded-2xl shadow-2xl w-[460px] max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-slate-800">New Section ({floorPlanName})</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Use Sections to group tables and generate sales reports.
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Section Name */}
          <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
            <div className="flex items-center">
              <label className="w-40 px-4 py-3 text-sm font-semibold text-slate-700 shrink-0 bg-slate-50">
                Section Name
              </label>
              <input
                autoFocus
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Dining Room"
                className="flex-1 px-4 py-3 text-sm outline-none"
              />
            </div>
          </div>

          {/* Tables section */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-3">Tables</h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
              {/* Naming */}
              <div className="flex items-start px-4 py-3 gap-3">
                <span className="w-36 text-sm font-semibold text-slate-700 shrink-0 pt-0.5">Naming</span>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={naming === 'auto'}
                      onChange={() => setNaming('auto')}
                      className="accent-blue-600"
                    />
                    <span className="text-sm text-slate-700">Automatic Table Names</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={naming === 'custom'}
                      onChange={() => setNaming('custom')}
                      className="accent-blue-600"
                    />
                    <span className="text-sm text-slate-700">Custom Table Names</span>
                  </label>
                </div>
              </div>

              {/* Label */}
              <div className="flex items-center px-4 py-3">
                <span className="w-36 text-sm font-semibold text-slate-700 shrink-0">Label</span>
                <input
                  type="text"
                  value={label}
                  onChange={e => setLabel(e.target.value)}
                  placeholder={name ? name.substring(0, 3) : 'DR'}
                  className="flex-1 px-2 py-1.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400"
                />
              </div>

              {/* Number of Tables */}
              <div className="flex items-center px-4 py-3">
                <span className="w-36 text-sm font-semibold text-slate-700 shrink-0">Number of Tables</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setTableCount(c => Math.max(1, c - 1))}
                    className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 font-bold flex items-center justify-center hover:bg-slate-200"
                  >−</button>
                  <span className="w-6 text-center text-sm font-bold text-slate-800">{tableCount}</span>
                  <button
                    onClick={() => setTableCount(c => Math.min(50, c + 1))}
                    className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 font-bold flex items-center justify-center hover:bg-slate-200"
                  >+</button>
                </div>
              </div>
            </div>
          </div>

          {/* Table preview list */}
          <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
            <div className="flex items-center px-4 py-2 bg-slate-50">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide w-20">Tables</span>
            </div>
            {preview.map((t, i) => (
              <div key={i} className="flex items-center px-4 py-2.5 bg-slate-50/50">
                <span className="text-sm text-slate-600">{t}</span>
              </div>
            ))}
            {tableCount > 8 && (
              <div className="px-4 py-2 bg-slate-50/50">
                <span className="text-xs text-slate-400">+{tableCount - 8} more…</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-slate-100">
          <button
            onClick={() => {
              if (!name.trim()) { toast.error('Enter a section name'); return; }
              onConfirm({ name: name.trim(), label: label || name.substring(0, 3).toUpperCase(), tableCount, naming });
            }}
            disabled={isPending || !name.trim()}
            className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isPending ? 'Adding…' : 'Done'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Table node on canvas ──────────────────────────────────
function CanvasTable({
  table,
  isSelected,
  canvasRef,
  onSelect,
  onMove,
}: {
  table: IFloorPlanTable;
  isSelected: boolean;
  canvasRef: React.RefObject<HTMLDivElement>;
  onSelect: () => void;
  onMove: (x: number, y: number) => void;
}) {
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const isCircle = table.shape === 'circle';

  const wPct = (table.width  * GRID_STEP / CANVAS_W) * 100;
  const hPct = (table.height * GRID_STEP / CANVAS_H) * 100;

  return (
    <div
      style={{
        position:  'absolute',
        left:      `${table.x}%`,
        top:       `${table.y}%`,
        width:     `${wPct}%`,
        height:    `${hPct}%`,
        cursor:    'grab',
        touchAction: 'none',
      }}
      className={`
        flex items-center justify-center select-none transition-colors
        ${isCircle ? 'rounded-full' : 'rounded-xl'}
        ${isSelected
          ? 'bg-blue-500 text-white ring-4 ring-blue-200 ring-offset-1'
          : 'bg-slate-700 text-white hover:bg-slate-600'}
      `}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      onPointerDown={(e) => {
        e.stopPropagation();
        onSelect();
        if (!canvasRef.current) return;
        dragRef.current = {
          startX: e.clientX,
          startY: e.clientY,
          origX:  fromPercent(table.x, CANVAS_W),
          origY:  fromPercent(table.y, CANVAS_H),
        };
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!dragRef.current || !canvasRef.current) return;
        const rect   = canvasRef.current.getBoundingClientRect();
        const scaleX = CANVAS_W / rect.width;
        const scaleY = CANVAS_H / rect.height;
        const dx     = (e.clientX - dragRef.current.startX) * scaleX;
        const dy     = (e.clientY - dragRef.current.startY) * scaleY;
        const newX   = snap(dragRef.current.origX + dx);
        const newY   = snap(dragRef.current.origY + dy);
        const maxX   = CANVAS_W - table.width  * GRID_STEP;
        const maxY   = CANVAS_H - table.height * GRID_STEP;
        onMove(
          toPercent(Math.max(0, Math.min(maxX, newX)), CANVAS_W),
          toPercent(Math.max(0, Math.min(maxY, newY)), CANVAS_H),
        );
      }}
      onPointerUp={() => { dragRef.current = null; }}
    >
      <span className="text-[11px] font-bold leading-tight text-center px-1 truncate max-w-full">
        {table.label}
      </span>
    </div>
  );
}

// ── Editor Page ───────────────────────────────────────────
export default function FloorPlanEditorPage() {
  const { floorPlanId } = useParams<{ floorPlanId: string }>();
  const router          = useRouter();
  const queryClient     = useQueryClient();
  const canvasRef       = useRef<HTMLDivElement>(null!);

  const { data: plan, isLoading } = useQuery({
    queryKey: ['floorPlan', floorPlanId],
    queryFn:  () => FloorPlanService.getOne(floorPlanId),
  });

  // Local editable copy of tables
  const [tables,   setTables]   = useState<IFloorPlanTable[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [history,  setHistory]  = useState<IFloorPlanTable[][]>([]);
  const [future,   setFuture]   = useState<IFloorPlanTable[][]>([]);
  const [showAddSection, setShowAddSection] = useState(false);

  // Sync from server on load
  useEffect(() => {
    if (plan?.tables) {
      setTables(plan.tables);
      setHistory([]);
      setFuture([]);
    }
  }, [plan]);

  const selectedTable = tables.find(t => t._id === selected) ?? null;

  // ── History helpers ───────────────────────────────────
  const pushHistory = useCallback((snapshot: IFloorPlanTable[]) => {
    setHistory(h => [...h.slice(-30), snapshot]);
    setFuture([]);
  }, []);

  const undo = () => {
    if (!history.length) return;
    const prev = history[history.length - 1];
    setFuture(f => [tables, ...f]);
    setTables(prev);
    setHistory(h => h.slice(0, -1));
  };

  const redo = () => {
    if (!future.length) return;
    const next = future[0];
    setHistory(h => [...h, tables]);
    setTables(next);
    setFuture(f => f.slice(1));
  };

  // ── Table updaters ────────────────────────────────────
  const updateTable = useCallback(
    (id: string, patch: Partial<IFloorPlanTable>) => {
      setTables(prev => {
        pushHistory(prev);
        return prev.map(t => (t._id === id ? { ...t, ...patch } : t));
      });
    },
    [pushHistory]
  );

  const moveTable = useCallback((id: string, x: number, y: number) => {
    setTables(prev => prev.map(t => (t._id === id ? { ...t, x, y } : t)));
  }, []);

  const deleteSelected = () => {
    if (!selected) return;
    setTables(prev => {
      pushHistory(prev);
      return prev.map(t =>
        t._id === selected ? { ...t, isPlaced: false, x: -1, y: -1 } : t
      );
    });
    setSelected(null);
  };

  // ── Drop from panel ───────────────────────────────────
  const draggingPanelId = useRef<string | null>(null);

  const handleCanvasDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const id = draggingPanelId.current;
    if (!id || !canvasRef.current) return;
    const rect   = canvasRef.current.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    const x = snap((e.clientX - rect.left) * scaleX);
    const y = snap((e.clientY - rect.top)  * scaleY);
    setTables(prev => {
      pushHistory(prev);
      return prev.map(t =>
        t._id === id
          ? { ...t, isPlaced: true, x: toPercent(Math.max(0, x), CANVAS_W), y: toPercent(Math.max(0, y), CANVAS_H) }
          : t
      );
    });
    setSelected(id);
    draggingPanelId.current = null;
  };

  // ── Save ──────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: () =>
      FloorPlanService.saveLayout(
        floorPlanId,
        tables.map(t => ({
          _id:      t._id,
          x:        t.x,
          y:        t.y,
          shape:    t.shape,
          width:    t.width,
          height:   t.height,
          isPlaced: t.isPlaced,
        }))
      ),
    onSuccess: () => {
      toast.success('Floor plan saved');
      queryClient.invalidateQueries({ queryKey: ['floorPlan', floorPlanId] });
    },
    onError: () => toast.error('Failed to save'),
  });

  // ── Add Section ───────────────────────────────────────
  const addSectionMutation = useMutation({
    mutationFn: (payload: AddSectionPayload) =>
      FloorPlanService.addSection(floorPlanId, payload),
    onSuccess: ({ section, tables: newTables }) => {
      setTables(prev => [...prev, ...newTables]);
      queryClient.invalidateQueries({ queryKey: ['floorPlan', floorPlanId] });
      setShowAddSection(false);
      toast.success(`Section "${section.name}" added — drag tables onto the canvas`);
    },
    onError: () => toast.error('Failed to add section'),
  });

  // ── Grouped unplaced tables for right panel ───────────
  const placedTables   = tables.filter(t => t.isPlaced);
  const unplacedTables = tables.filter(t => !t.isPlaced);

  const unplacedBySection: Record<string, IFloorPlanTable[]> = {};
  unplacedTables.forEach(t => {
    if (!unplacedBySection[t.section]) unplacedBySection[t.section] = [];
    unplacedBySection[t.section].push(t);
  });

  // ── Keyboard shortcuts ────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if ((e.target as HTMLElement).tagName !== 'INPUT') deleteSelected();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') { e.preventDefault(); undo(); }
      if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); redo(); }
      if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); saveMutation.mutate(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-[100]">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white flex flex-col z-[100]" style={{ top: 0, left: 0 }}>

      {/* ── Top Bar ─────────────────────────────────── */}
      <div className="h-14 border-b border-slate-200 flex items-center justify-between px-4 shrink-0 bg-white z-10">
        <button
          onClick={() => router.push('/dashboard/tables')}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 transition"
        >
          <X size={20} />
        </button>

        <h1 className="font-bold text-slate-800 text-base">{plan?.name ?? 'Floor Plan'}</h1>

        <div className="flex items-center gap-2">
          <button
            onClick={undo}
            disabled={!history.length}
            title="Undo (⌘Z)"
            className="px-3.5 py-1.5 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition font-medium"
          >
            Undo
          </button>
          <button
            onClick={redo}
            disabled={!future.length}
            title="Redo (⌘Y)"
            className="px-3.5 py-1.5 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition font-medium"
          >
            Redo
          </button>
          <button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="px-5 py-1.5 text-sm bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-60 transition"
          >
            {saveMutation.isPending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Left Toolbar ────────────────────────── */}
        <div className="w-[72px] bg-white border-r border-slate-200 flex flex-col items-center py-5 gap-5 shrink-0">
          {/* Shape */}
          <div className="w-full px-2 flex flex-col gap-1.5">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide text-center mb-1">Shape</p>
            {/* Square / rectangle */}
            <button
              onClick={() => selected && updateTable(selected, { shape: 'square' })}
              title="Square"
              className={`w-full aspect-square rounded-lg border-2 flex items-center justify-center transition ${
                selectedTable && selectedTable.shape !== 'circle'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-400'
              }`}
            >
              <div className="w-7 h-7 rounded-md bg-slate-400" />
            </button>
            {/* Circle */}
            <button
              onClick={() => selected && updateTable(selected, { shape: 'circle' })}
              title="Circle"
              className={`w-full aspect-square rounded-lg border-2 flex items-center justify-center transition ${
                selectedTable?.shape === 'circle'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-400'
              }`}
            >
              <div className="w-7 h-7 rounded-full bg-slate-400" />
            </button>
          </div>

          <div className="w-full h-px bg-slate-100" />

          {/* Width */}
          <div className="w-full px-2 flex flex-col items-center gap-1">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Width</p>
            <input
              type="number"
              min={1} max={20}
              value={selectedTable?.width ?? 8}
              disabled={!selected}
              onChange={e => selected && updateTable(selected, { width: Math.max(1, +e.target.value) })}
              className="w-full border border-slate-200 rounded-lg px-1 py-1.5 text-center text-sm font-semibold text-slate-700 outline-none focus:border-blue-400 disabled:opacity-40"
            />
          </div>

          {/* Height */}
          <div className="w-full px-2 flex flex-col items-center gap-1">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Height</p>
            <input
              type="number"
              min={1} max={20}
              value={selectedTable?.height ?? 8}
              disabled={!selected}
              onChange={e => selected && updateTable(selected, { height: Math.max(1, +e.target.value) })}
              className="w-full border border-slate-200 rounded-lg px-1 py-1.5 text-center text-sm font-semibold text-slate-700 outline-none focus:border-blue-400 disabled:opacity-40"
            />
          </div>

          <div className="w-full h-px bg-slate-100" />

          {/* Delete */}
          <button
            onClick={deleteSelected}
            disabled={!selected}
            title="Remove from canvas (Del)"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-25 transition"
          >
            <Trash2 size={18} />
          </button>
        </div>

        {/* ── Canvas ──────────────────────────────── */}
        <div className="flex-1 bg-slate-100 overflow-auto flex items-center justify-center p-6">
          <div
            ref={canvasRef}
            className="relative bg-white shadow-md shrink-0"
            style={{
              width:       '100%',
              maxWidth:    CANVAS_W,
              aspectRatio: `${CANVAS_W} / ${CANVAS_H}`,
              backgroundImage:
                'radial-gradient(circle, #d1d5db 1.5px, transparent 1.5px)',
              backgroundSize: '20px 20px',
            }}
            onClick={() => setSelected(null)}
            onDragOver={e => e.preventDefault()}
            onDrop={handleCanvasDrop}
          >
            {placedTables.map(table => (
              <CanvasTable
                key={table._id}
                table={table}
                isSelected={selected === table._id}
                canvasRef={canvasRef}
                onSelect={() => setSelected(table._id)}
                onMove={(x, y) => moveTable(table._id, x, y)}
              />
            ))}

            {/* Empty hint */}
            {placedTables.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-slate-300 text-sm font-medium select-none">
                  Drag tables from the panel →
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Right Panel ─────────────────────────── */}
        <div className="w-52 bg-white border-l border-slate-200 flex flex-col shrink-0">
          {/* Floor plan meta */}
          <div className="px-4 py-4 border-b border-slate-100">
            <h2 className="font-bold text-blue-600 text-sm">{plan?.name}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{plan?.location}</p>
          </div>

          {/* Sections + unplaced chips */}
          <div className="flex-1 overflow-y-auto py-3 space-y-5 px-3">
            {plan?.sections.map(section => {
              const chips = unplacedBySection[section.name] ?? [];
              return (
                <div key={section._id}>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                    {section.name}
                  </h3>
                  {chips.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {chips.map(t => (
                        <div
                          key={t._id}
                          draggable
                          onDragStart={() => { draggingPanelId.current = t._id; }}
                          className="px-2.5 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-[11px] font-semibold cursor-grab hover:bg-slate-200 select-none active:opacity-60 transition"
                          title="Drag onto canvas to place"
                        >
                          {t.label}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-300 italic">All placed ✓</p>
                  )}
                </div>
              );
            })}

            {plan?.sections.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-6">
                Add a section to create tables
              </p>
            )}
          </div>

          {/* Add section button */}
          <div className="p-3 border-t border-slate-100">
            <button
              onClick={() => setShowAddSection(true)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition uppercase tracking-wide"
            >
              <Plus size={14} />
              Add Section
            </button>
          </div>
        </div>
      </div>

      {/* ── Add Section Modal ────────────────────── */}
      <AnimatePresence>
        {showAddSection && (
          <AddSectionModal
            floorPlanName={plan?.name ?? ''}
            onClose={() => setShowAddSection(false)}
            onConfirm={payload => addSectionMutation.mutate(payload)}
            isPending={addSectionMutation.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
