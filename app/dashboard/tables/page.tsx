'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { LayoutGrid, ChevronDown, Plus, Edit2, Trash2 } from 'lucide-react';
import { FloorPlanService, IFloorPlan } from '@/services/floor-plan.service';

// ── Create Floor Plan Modal ───────────────────────────────
function CreateFloorPlanModal({
  onClose,
  onConfirm,
  isPending,
}: {
  onClose: () => void;
  onConfirm: (name: string, location: string) => void;
  isPending: boolean;
}) {
  const [name, setName]         = useState('');
  const [location, setLocation] = useState('Main Location');

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="bg-white rounded-2xl shadow-2xl w-[420px] overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Floor Plan Details</h2>
        </div>

        <div className="divide-y divide-slate-100">
          {/* Name row */}
          <div className="flex items-center">
            <label className="w-44 px-6 py-4 text-sm font-semibold text-slate-700 bg-blue-50 shrink-0 border-r border-slate-100">
              Floor Plan Name
            </label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && name.trim() && onConfirm(name.trim(), location)}
              placeholder="e.g. Main Dining"
              className="flex-1 px-4 py-4 text-sm outline-none"
            />
          </div>

          {/* Location row */}
          <div className="flex items-center">
            <label className="w-44 px-6 py-4 text-sm font-semibold text-slate-700 shrink-0 border-r border-slate-100">
              Location
            </label>
            <div className="flex-1 relative">
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full px-4 py-4 text-sm outline-none pr-10"
              />
              <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center px-6 py-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-blue-500 hover:bg-blue-50 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={() => name.trim() && onConfirm(name.trim(), location.trim() || 'Main Location')}
            disabled={!name.trim() || isPending}
            className="px-5 py-2 text-sm font-semibold rounded-lg transition disabled:opacity-40
              bg-slate-200 text-slate-500 hover:bg-slate-300 disabled:cursor-not-allowed"
          >
            {isPending ? 'Creating…' : 'Done'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Floor Plan Row ────────────────────────────────────────
function FloorPlanRow({
  plan,
  onOpen,
  onEdit,
  onDelete,
}: {
  plan: IFloorPlan;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-4 group">
      <div className="flex-1 min-w-0 cursor-pointer" onClick={onOpen}>
        <p className="text-sm font-semibold text-slate-800 group-hover:text-[#1B3A6B] transition">
          {plan.name}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          {plan.sections.length} section{plan.sections.length !== 1 ? 's' : ''} ·{' '}
          {plan.tableCount ?? 0} table{(plan.tableCount ?? 0) !== 1 ? 's' : ''}
        </p>
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
        <button
          onClick={onOpen}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-[#1B3A6B] text-xs font-semibold hover:bg-indigo-100 transition"
        >
          Open Floor
        </button>
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 transition"
        >
          <Edit2 size={12} />
          Edit Layout
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg text-slate-300 hover:bg-red-50 hover:text-red-500 transition"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────
export default function TablesPage() {
  const router      = useRouter();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [filterLoc,  setFilterLoc]  = useState('all');

  const { data: plans = [], isLoading } = useQuery<IFloorPlan[]>({
    queryKey: ['floorPlans'],
    queryFn:  FloorPlanService.getAll,
    staleTime: 30_000,
  });

  const createMutation = useMutation({
    mutationFn: ({ name, location }: { name: string; location: string }) =>
      FloorPlanService.create({ name, location }),
    onSuccess: (plan) => {
      queryClient.invalidateQueries({ queryKey: ['floorPlans'] });
      toast.success(`"${plan.name}" created`);
      setShowCreate(false);
      router.push(`/dashboard/tables/plans/${plan._id}/edit`);
    },
    onError: () => toast.error('Failed to create floor plan'),
  });

  const deleteMutation = useMutation({
    mutationFn: FloorPlanService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['floorPlans'] });
      toast.success('Floor plan removed');
    },
    onError: () => toast.error('Failed to delete'),
  });

  // Unique locations
  const locations = ['all', ...Array.from(new Set(plans.map(p => p.location)))];
  const filtered  = filterLoc === 'all' ? plans : plans.filter(p => p.location === filterLoc);

  // Group by location
  const byLocation: Record<string, IFloorPlan[]> = {};
  filtered.forEach(p => {
    if (!byLocation[p.location]) byLocation[p.location] = [];
    byLocation[p.location].push(p);
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-slate-800">Floor Plans</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow-sm"
        >
          Create a Floor Plan
        </button>
      </div>

      <hr className="border-slate-200 mb-6" />

      {/* Location filter */}
      {locations.length > 2 && (
        <div className="flex gap-2 mb-5 flex-wrap">
          {locations.map(loc => (
            <button
              key={loc}
              onClick={() => setFilterLoc(loc)}
              className={`flex items-center gap-1 px-3 py-1.5 border rounded-lg text-sm font-medium transition ${
                filterLoc === loc
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
              }`}
            >
              {loc === 'all' ? 'All Locations' : loc}
              <ChevronDown size={13} />
            </button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {plans.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-5">
            <LayoutGrid size={28} className="text-slate-400" />
          </div>
          <h3 className="text-base font-bold text-slate-700 mb-2">No floor plans yet</h3>
          <p className="text-sm text-slate-400 mb-6 max-w-xs">
            Create your first floor plan to manage tables, sections, and seating.
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
          >
            <Plus size={15} />
            Create a Floor Plan
          </button>
        </motion.div>
      )}

      {/* Plans grouped by location */}
      {Object.entries(byLocation).map(([location, locationPlans]) => (
        <div key={location} className="mb-8">
          <div className="mb-3">
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700">
              {location}
              <ChevronDown size={13} />
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 divide-y divide-slate-100">
            <div className="py-3">
              <p className="text-sm font-bold text-slate-800">{location}</p>
            </div>

            {locationPlans.map(plan => (
              <FloorPlanRow
                key={plan._id}
                plan={plan}
                onOpen={() => router.push(`/dashboard/tables/plans/${plan._id}`)}
                onEdit={() => router.push(`/dashboard/tables/plans/${plan._id}/edit`)}
                onDelete={() => {
                  if (confirm(`Delete "${plan.name}"? All its tables will be removed.`)) {
                    deleteMutation.mutate(plan._id);
                  }
                }}
              />
            ))}

            <p className="py-3 text-xs text-slate-400">
              Floor Plans are displayed on devices with open checks and floor plans enabled.
            </p>
          </div>
        </div>
      ))}

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <CreateFloorPlanModal
            onClose={() => setShowCreate(false)}
            onConfirm={(name, location) => createMutation.mutate({ name, location })}
            isPending={createMutation.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
