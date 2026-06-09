'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Clock, Users, ChefHat, Printer, CreditCard,
  Banknote, SplitSquareHorizontal, Plus, Minus,
  X, Send, CheckCircle2, ArrowLeft, Search, LayoutGrid,
} from 'lucide-react';

import { useSocket }        from '@/hooks/useSocket';
import { SessionService, ITableSession, ISessionItem, ItemCourse } from '@/services/session.service';
import { FoodService }      from '@/services/food.service';
import { CategoryService }  from '@/services/category.service';
import { useSessionItemMutation, useSendToKitchen, SessionItemPayload } from '@/hooks/useOptimisticMutation';

// ── Constants ─────────────────────────────────────────────
const TAX_RATE     = 0.095;
const SERVICE_RATE = 0.18;
const ALL_CAT_ID   = '__all__';

// ── Order status display mapping ──────────────────────────
// Maps server session.status → display order status
const ORDER_STATUS_DISPLAY: Record<string, { label: string; pill: string }> = {
  seated:         { label: 'Upcoming',     pill: 'bg-slate-100 text-slate-600'   },
  ordering:       { label: 'New',          pill: 'bg-blue-100 text-blue-700'     },
  waiting:        { label: 'In Progress',  pill: 'bg-amber-100 text-amber-700'   },
  'ready-to-pay': { label: 'Ready',        pill: 'bg-emerald-100 text-emerald-700' },
};

// Order status step pills (in order) for the picker
const ORDER_STATUS_STEPS = [
  { key: 'seated',        label: 'Upcoming',    active: 'bg-slate-500 text-white',     idle: 'bg-slate-100 text-slate-500 hover:bg-slate-200' },
  { key: 'ordering',      label: 'New',         active: 'bg-blue-600 text-white',      idle: 'bg-slate-100 text-slate-500 hover:bg-blue-50 hover:text-blue-600' },
  { key: 'waiting',       label: 'In Progress', active: 'bg-amber-500 text-white',     idle: 'bg-slate-100 text-slate-500 hover:bg-amber-50 hover:text-amber-600' },
  { key: 'ready-to-pay',  label: 'Ready',       active: 'bg-emerald-600 text-white',   idle: 'bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600' },
] as const;

const COURSE_ORDER: ItemCourse[] = ['drink', 'starter', 'main', 'dessert'];
const COURSE_LABEL: Record<ItemCourse, string> = {
  drink:   'Drinks',
  starter: 'Starters',
  main:    'Mains',
  dessert: 'Desserts',
};
const CAT_COURSE_MAP: Record<string, ItemCourse> = {
  drinks: 'drink', beverages: 'drink', cocktails: 'drink', wine: 'drink', beer: 'drink',
  starters: 'starter', snacks: 'starter', salads: 'starter', appetizers: 'starter',
  mains: 'main', main: 'main', burgers: 'main', pasta: 'main', seafood: 'main', pizza: 'main', grill: 'main',
  desserts: 'dessert', dessert: 'dessert', cakes: 'dessert',
};
const STATUS_CHIP: Record<string, string> = {
  ordered:   'bg-slate-100 text-slate-500',
  sent:      'bg-indigo-100 text-indigo-700',
  preparing: 'bg-amber-100 text-amber-700',
  ready:     'bg-emerald-100 text-emerald-700',
  served:    'bg-slate-50 text-slate-400',
};

// ── Types ─────────────────────────────────────────────────
interface FoodItem {
  _id: string;
  title: string;
  price: number;
  image?: string;
  category?: { _id: string; title: string };
}

// ── Helpers ───────────────────────────────────────────────
function fmt(n: number) { return `$${n.toFixed(2)}`; }

function useSessionTimer(seatedAt: string | undefined) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!seatedAt) return;
    const update = () => setElapsed(Math.floor((Date.now() - new Date(seatedAt).getTime()) / 1000));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [seatedAt]);
  const h = String(Math.floor(elapsed / 3600)).padStart(2, '0');
  const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
  const s = String(elapsed % 60).padStart(2, '0');
  const mins = elapsed / 60;
  const colour = mins < 60 ? 'text-emerald-600' : mins < 120 ? 'text-amber-500' : 'text-red-500';
  return { display: `${h}:${m}:${s}`, colour, isLong: mins >= 180 };
}

// ── 2-copy POS Receipt Printer ────────────────────────────
function printReceipt(
  session: ITableSession,
  items: ISessionItem[],
  totals: { subtotal: number; discount: number; serviceChg: number; tax: number; total: number },
  payMethod: string,
) {
  const now = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

  const itemRows = items.map(i => `
    <tr>
      <td style="padding:2px 0">${i.qty}× ${i.name}</td>
      <td style="text-align:right;padding:2px 0">${fmt(i.price * i.qty)}</td>
    </tr>
    ${i.notes ? `<tr><td colspan="2" style="padding-left:12px;color:#666;font-style:italic;font-size:11px">${i.notes}</td></tr>` : ''}
  `).join('');

  const receipt = () => `
    <div class="copy">
      <div class="rest-name">THE RESTAURANT</div>
      <div class="sub-line">Fine Dining · Bar · Events</div>
      <div class="divider"></div>
      <div class="info-row"><span>Table</span><span>${session.tableLabel} (${session.tableSection})</span></div>
      <div class="info-row"><span>Check</span><span>#${session.checkId}</span></div>
      <div class="info-row"><span>Server</span><span>${session.serverName}</span></div>
      <div class="info-row"><span>Guests</span><span>${session.partySize}</span></div>
      <div class="info-row"><span>Date</span><span>${now}</span></div>
      <div class="divider"></div>
      <table class="items-table" cellspacing="0" cellpadding="0">
        <thead>
          <tr>
            <th style="text-align:left">Item</th>
            <th style="text-align:right">Amt</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
      <div class="divider"></div>
      <div class="totals">
        <div class="info-row"><span>Subtotal</span><span>${fmt(totals.subtotal)}</span></div>
        ${totals.discount > 0 ? `<div class="info-row disc"><span>Discount</span><span>−${fmt(totals.discount)}</span></div>` : ''}
        <div class="info-row"><span>Service (18%)</span><span>${fmt(totals.serviceChg)}</span></div>
        <div class="info-row"><span>Tax (9.5%)</span><span>${fmt(totals.tax)}</span></div>
      </div>
      <div class="total-row"><span>TOTAL</span><span>${fmt(totals.total)}</span></div>
      <div class="pay-row">Payment: ${payMethod.toUpperCase()}</div>
      <div class="divider"></div>
      <div class="footer">Thank you for dining with us!<br/>Please visit again</div>
    </div>
  `;

  const html = `<!DOCTYPE html><html><head><title>Receipt ${session.checkId}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: 'Courier New', monospace; font-size: 12px; margin: 0; background: #fff; }
    .copy { width: 72mm; margin: 0 auto; padding: 6mm 4mm; }
    .rest-name { text-align:center; font-size:16px; font-weight:900; letter-spacing:2px; margin-bottom:2px; }
    .sub-line  { text-align:center; font-size:10px; color:#555; margin-bottom:6px; }
    .divider   { border:none; border-top:1px dashed #333; margin:8px 0; }
    .info-row  { display:flex; justify-content:space-between; margin:2px 0; }
    .disc      { color:#16a34a; }
    .items-table { width:100%; border-collapse:collapse; font-size:12px; }
    .items-table th { border-bottom:1px solid #333; padding-bottom:4px; margin-bottom:4px; font-size:11px; }
    .totals { margin:4px 0; }
    .total-row { display:flex; justify-content:space-between; font-size:16px; font-weight:900; margin:8px 0 4px; border-top:2px solid #000; padding-top:6px; }
    .pay-row   { text-align:center; font-size:11px; margin:4px 0; font-weight:bold; }
    .footer    { text-align:center; font-size:11px; color:#555; margin-top:8px; line-height:1.6; }
    .separator { width:72mm; margin:8mm auto; border:none; border-top:3px dashed #000; }
    @page { margin: 0; size: 80mm auto; }
    @media print { html,body { width:80mm; } }
  </style></head><body>
    ${receipt()}
    <hr class="separator"/>
    ${receipt()}
  </body></html>`;

  const win = window.open('', '_blank', 'width=420,height=680');
  if (!win) { toast.error('Pop-up blocked — allow pop-ups to print'); return; }
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 600);
}

// ── Notes Modal ───────────────────────────────────────────
function NotesModal({ item, onSave, onClose }: {
  item: ISessionItem; onSave: (notes: string) => void; onClose: () => void;
}) {
  const [notes, setNotes] = useState(item.notes ?? '');
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[200]">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
        className="bg-white rounded-2xl shadow-2xl p-6 w-80">
        <h4 className="text-sm font-bold text-slate-800 mb-3">Notes — {item.name}</h4>
        <textarea autoFocus value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="e.g. No onions, extra sauce…"
          className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 resize-none h-20" />
        <div className="flex gap-2 mt-4 justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-semibold">Cancel</button>
          <button onClick={() => { onSave(notes); onClose(); }} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold">Save</button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Payment Success ───────────────────────────────────────
function PaymentSuccess({ tableLabel, total, onDone }: { tableLabel: string; total: number; onDone: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="fixed inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center z-[200]">
      <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
        <CheckCircle2 className="w-12 h-12 text-emerald-600" />
      </motion.div>
      <h2 className="text-3xl font-bold text-slate-800 mb-2">Payment Complete</h2>
      <p className="text-slate-400 mb-1">Table {tableLabel} · {fmt(total)}</p>
      <p className="text-sm text-slate-300 mb-8">2 copies sent to printer</p>
      <button onClick={onDone} className="px-8 py-3 bg-[#1B3A6B] text-white rounded-2xl font-semibold text-base hover:bg-indigo-700 transition">
        Back to Floor Plan
      </button>
    </motion.div>
  );
}

// ── Food Card ─────────────────────────────────────────────
function FoodCard({ food, onAdd }: { food: FoodItem; onAdd: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
      onClick={onAdd}
      className="bg-white border border-slate-100 rounded-xl overflow-hidden text-left hover:border-indigo-200 hover:shadow-md transition-all group flex flex-col"
    >
      {/* Image */}
      <div className="relative w-full aspect-[4/3] bg-slate-100 overflow-hidden shrink-0">
        {food.image ? (
          <img
            src={food.image}
            alt={food.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <ChefHat className="w-7 h-7" />
          </div>
        )}
        {/* Quick add badge */}
        <div className="absolute top-1.5 right-1.5 w-6 h-6 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
          <Plus className="w-3.5 h-3.5 text-indigo-600" />
        </div>
      </div>

      {/* Info */}
      <div className="p-2 flex-1 flex flex-col justify-between">
        <p className="text-[11px] font-semibold text-slate-700 leading-tight line-clamp-2">{food.title}</p>
        <p className="text-xs font-bold text-indigo-600 mt-1">{fmt(food.price)}</p>
      </div>
    </motion.button>
  );
}

// ── Main Session Page ─────────────────────────────────────
export default function TableSessionPage() {
  const { tableId }  = useParams<{ tableId: string }>();
  const router       = useRouter();
  const queryClient  = useQueryClient();
  const socket       = useSocket();

  const [activeCat,     setActiveCat]     = useState<string>('');
  const [search,        setSearch]        = useState('');
  const [notesTarget,   setNotesTarget]   = useState<ISessionItem | null>(null);
  const [splitMode,     setSplitMode]     = useState(false);
  const [activeGuest,   setActiveGuest]   = useState(1);
  const [payMethod,     setPayMethod]     = useState<'cash' | 'card' | 'split'>('cash');
  const [cashTendered,  setCashTendered]  = useState('');
  const [discountVal,   setDiscountVal]   = useState('');
  const [discountType,  setDiscountType]  = useState<'pct' | 'fixed'>('pct');
  const [discountReason,setDiscountReason]= useState('');
  const [showPaySuccess,setShowPaySuccess]= useState(false);

  // ── Local items — instant rendering, no server round-trip ─
  // Source of truth for the order list UI. Synced from server
  // when no mutations are in-flight.
  const [localItems, setLocalItems] = useState<ISessionItem[]>([]);

  // Debounce state for qty changes: tracks the target qty per item _id
  const qtyTarget = useRef<Record<string, number>>({});
  const qtyTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // ── Data Fetching ──────────────────────────────────────
  const { data: session, isLoading: sessionLoading } = useQuery<ITableSession>({
    queryKey: ['session', 'table', tableId],
    queryFn:  () => SessionService.getActiveForTable(tableId),
    refetchInterval: 8_000,
    staleTime: 3_000,
    enabled: !!tableId,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn:  CategoryService.getAllCategories,
    staleTime: 5 * 60 * 1000,
    select: (d: any) => d.data ?? d,
  });

  // Foods for the active category (or ALL)
  const { data: foods = [] } = useQuery<FoodItem[]>({
    queryKey: ['foods', activeCat],
    queryFn:  () =>
      activeCat === ALL_CAT_ID
        ? FoodService.getAllFoods('')
        : FoodService.getAllFoods(`category=${activeCat}`),
    staleTime: 5 * 60 * 1000,
    enabled: !!activeCat,
    select: (d: any) => d.data ?? d,
  });

  // Sync localItems from server whenever session data arrives,
  // but skip the sync if qty debounce timers are still pending
  // (user is mid-tap — don't overwrite their in-progress changes).
  useEffect(() => {
    if (!session?.orderItems) return;
    const hasPending = Object.keys(qtyTarget.current).length > 0;
    if (!hasPending) setLocalItems(session.orderItems);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.orderItems]);

  // Set first category on load
  useEffect(() => {
    if (categories.length && !activeCat) setActiveCat(ALL_CAT_ID);
  }, [categories, activeCat]);

  // Prefetch on hover
  const prefetchCategory = (catId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['foods', catId],
      queryFn:  () =>
        catId === ALL_CAT_ID
          ? FoodService.getAllFoods('')
          : FoodService.getAllFoods(`category=${catId}`),
      staleTime: 5 * 60 * 1000,
    });
  };

  // ── Socket ────────────────────────────────────────────
  useEffect(() => {
    if (!socket || !tableId) return;
    socket.emit('join-table-session', tableId);
    const onUpdate = (data: { tableId: string }) => {
      if (data.tableId === tableId)
        queryClient.invalidateQueries({ queryKey: ['session', 'table', tableId] });
    };
    socket.on('session:updated',  onUpdate);
    socket.on('session:itemReady',onUpdate);
    return () => {
      socket.off('session:updated',  onUpdate);
      socket.off('session:itemReady',onUpdate);
      socket.emit('leave-table-session', tableId);
    };
  }, [socket, tableId, queryClient]);

  // ── Timer ─────────────────────────────────────────────
  const { display: timerDisplay, colour: timerColour, isLong } = useSessionTimer(session?.seatedAt);

  // ── Mutations ─────────────────────────────────────────
  const itemMutation    = useSessionItemMutation(session?._id);
  const kitchenMutation = useSendToKitchen(session?._id);

  const completeMutation = useMutation({
    mutationFn: () => SessionService.complete(session!._id, payMethod),
    onSuccess: () => {
      setShowPaySuccess(true);
      printReceipt(session!, items, { subtotal, discount, serviceChg, tax, total }, payMethod);
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
    onError: () => toast.error('Payment failed — please retry'),
  });

  const discountMutation = useMutation({
    mutationFn: () => SessionService.applyDiscount(session!._id, parseFloat(discountVal) || 0, discountType, discountReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session', 'table', tableId] });
      toast.success('Discount applied');
    },
  });

  const statusMutation = useMutation({
    mutationFn: (newStatus: 'seated' | 'ordering' | 'waiting' | 'ready-to-pay') =>
      SessionService.updateStatus(session!._id, newStatus),
    onSuccess: (updated) => {
      queryClient.setQueryData(['session', 'table', tableId], updated);
      queryClient.invalidateQueries({ queryKey: ['activeSessions'], refetchType: 'none' });
      toast.success(`Status → ${ORDER_STATUS_DISPLAY[updated.status]?.label ?? updated.status}`);
    },
    onError: () => toast.error('Failed to update status'),
  });

  // Quick complete — marks session done, timer stops, table resets
  const quickCompleteMutation = useMutation({
    mutationFn: () => SessionService.complete(session!._id, payMethod || 'cash'),
    onSuccess: () => {
      setShowPaySuccess(true);
      printReceipt(session!, items, { subtotal, discount, serviceChg, tax, total }, payMethod || 'cash');
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      queryClient.invalidateQueries({ queryKey: ['activeSessions'], refetchType: 'none' });
    },
    onError: () => toast.error('Failed to complete — please retry'),
  });

  // ── Handlers ──────────────────────────────────────────

  // Add item — updates localItems instantly, then fires API
  const addItem = useCallback((food: FoodItem) => {
    if (!session) return;
    const catTitle = (food.category?.title ?? '').toLowerCase();
    const course: ItemCourse = CAT_COURSE_MAP[catTitle] ?? 'main';

    // Check against localItems so rapid adds accumulate correctly
    const existing = localItems.find(
      i => i.productId === food._id && i.status === 'ordered' && (!splitMode || i.guestIndex === activeGuest)
    );

    if (existing) {
      // Instant local increment
      setLocalItems(prev =>
        prev.map(i => i._id === existing._id ? { ...i, qty: i.qty + 1 } : i)
      );
      // Track so the sync effect doesn't wipe it
      qtyTarget.current[existing._id] = (qtyTarget.current[existing._id] ?? existing.qty) + 1;
      // Debounce the API call the same way as changeQty
      clearTimeout(qtyTimers.current[existing._id]);
      const finalId = existing._id;
      qtyTimers.current[finalId] = setTimeout(() => {
        const qty = qtyTarget.current[finalId];
        if (qty !== undefined) {
          delete qtyTarget.current[finalId];
          itemMutation.mutate({ action: 'update', item: { id: finalId, updates: { qty } } as SessionItemPayload });
        }
      }, 600);
    } else {
      const tmpId = `tmp-${Date.now()}`;
      const newItem: ISessionItem = {
        _id: tmpId, productId: food._id, name: food.title, price: food.price,
        qty: 1, notes: '', course, status: 'ordered',
        guestIndex: splitMode ? activeGuest : null, sentAt: null, servedAt: null,
      } as ISessionItem;
      // Instant local append
      setLocalItems(prev => [...prev, newItem]);
      // Fire API — server will replace tmpId with a real ObjectId;
      // the onSuccess setQueryData → useEffect sync will reconcile.
      itemMutation.mutate({ action: 'add', item: { ...newItem } as SessionItemPayload });
    }

    toast.success(`+ ${food.title}`, { duration: 800, icon: '🍽️' });
  }, [session, localItems, splitMode, activeGuest, itemMutation]);

  // changeQty — instant local update + debounced single API call
  const changeQty = (item: ISessionItem, delta: number) => {
    if (item.status !== 'ordered') return;

    // Accumulate across rapid taps (closure over qtyTarget ref)
    const current = qtyTarget.current[item._id] ?? item.qty;
    const newQty  = current + delta;

    if (newQty <= 0) {
      // Remove: clear debounce, update local, fire API immediately
      clearTimeout(qtyTimers.current[item._id]);
      delete qtyTarget.current[item._id];
      setLocalItems(prev => prev.filter(i => i._id !== item._id));
      itemMutation.mutate({ action: 'remove', item: { id: item._id } });
      return;
    }

    // Track the latest target qty
    qtyTarget.current[item._id] = newQty;

    // Instant local render — zero latency
    setLocalItems(prev => prev.map(i => i._id === item._id ? { ...i, qty: newQty } : i));

    // Reset debounce — only ONE API call fires after tapping stops
    clearTimeout(qtyTimers.current[item._id]);
    const capturedId = item._id;
    qtyTimers.current[capturedId] = setTimeout(() => {
      const finalQty = qtyTarget.current[capturedId];
      if (finalQty !== undefined) {
        delete qtyTarget.current[capturedId];
        itemMutation.mutate({
          action: 'update',
          item: { id: capturedId, updates: { qty: finalQty } } as SessionItemPayload,
        });
      }
    }, 600);
  };

  const saveNotes = (item: ISessionItem, notes: string) => {
    // Update local immediately
    setLocalItems(prev => prev.map(i => i._id === item._id ? { ...i, notes } : i));
    itemMutation.mutate({ action: 'update', item: { id: item._id, updates: { notes } } as SessionItemPayload });
  };

  const removeItem = (item: ISessionItem) => {
    clearTimeout(qtyTimers.current[item._id]);
    delete qtyTarget.current[item._id];
    setLocalItems(prev => prev.filter(i => i._id !== item._id));
    itemMutation.mutate({ action: 'remove', item: { id: item._id } });
  };

  const sendToKitchen = () => {
    if (!session) return;
    const unsentIds = localItems.filter(i => i.status === 'ordered').map(i => i._id);
    if (!unsentIds.length) { toast('No new items to send', { icon: 'ℹ️' }); return; }
    kitchenMutation.mutate(unsentIds, {
      onSuccess: () => toast.success(`${unsentIds.length} item${unsentIds.length > 1 ? 's' : ''} sent to kitchen 🍳`),
      onError:   () => toast.error('Failed to send to kitchen'),
    });
  };

  // ── Totals — driven by localItems, not server cache ──
  const items      = localItems;
  const subtotal   = items.reduce((s, i) => s + i.price * i.qty, 0);
  const dv         = parseFloat(discountVal) || 0;
  const discount   = discountType === 'pct' ? subtotal * (dv / 100) : Math.min(dv, subtotal);
  const afterDisc  = subtotal - discount;
  const serviceChg = afterDisc * SERVICE_RATE;
  const tax        = afterDisc * TAX_RATE;
  const total      = afterDisc + serviceChg + tax;
  const change     = Math.max(0, parseFloat(cashTendered || '0') - total);
  const canPay     = total > 0 && (payMethod !== 'cash' || parseFloat(cashTendered || '0') >= total);
  const hasUnsent  = items.some(i => i.status === 'ordered');

  // ── Menu display ──────────────────────────────────────
  const filteredFoods: FoodItem[] = search
    ? foods.filter(f => f.title.toLowerCase().includes(search.toLowerCase()))
    : foods;

  // When "All" tab is active, group by category
  const foodsByCategory: { catTitle: string; items: FoodItem[] }[] = [];
  if (activeCat === ALL_CAT_ID && !search) {
    const map: Record<string, FoodItem[]> = {};
    foods.forEach(f => {
      const title = f.category?.title ?? 'Other';
      if (!map[title]) map[title] = [];
      map[title].push(f);
    });
    Object.entries(map).forEach(([catTitle, items]) => foodsByCategory.push({ catTitle, items }));
  }

  // ── Loading / No-session guards ───────────────────────
  if (sessionLoading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-[100]">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!session) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-[100] gap-4">
        <p className="text-slate-400 text-lg">No active session for this table</p>
        <button onClick={() => router.back()} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold">
          Go Back
        </button>
      </div>
    );
  }

  return (
    // Full-screen overlay — completely independent of dashboard layout padding
    <div className="fixed inset-0 bg-slate-50 flex flex-col z-[100] overflow-hidden">

      {/* ── TOP HEADER ──────────────────────────────── */}
      <div className="h-14 bg-white border-b border-slate-200 flex items-center gap-3 px-4 shrink-0 shadow-sm z-10">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 shrink-0">
          <span className="font-bold text-slate-800 text-base">{session.tableLabel}</span>
          <span className="text-slate-400 text-sm hidden sm:inline">· {session.tableSection}</span>
          <span className={`font-bold tabular-nums text-lg ${timerColour} ml-1`}>{timerDisplay}</span>
        </div>

        <div className="flex items-center gap-2 text-xs shrink-0">
          <div className="flex items-center gap-1 bg-slate-100 rounded-full px-2.5 py-1 text-slate-500 font-semibold">
            <Users className="w-3 h-3" />{session.partySize}
          </div>
          <div className="hidden md:block text-slate-400">
            <span className="text-slate-600 font-semibold">{session.serverName}</span>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {isLong && (
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              ⚠ Long session
            </div>
          )}
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${
            session.status === 'seated'   ? 'bg-emerald-100 text-emerald-700' :
            session.status === 'ordering' ? 'bg-blue-100 text-blue-700'       :
            session.status === 'waiting'  ? 'bg-amber-100 text-amber-700'     :
                                            'bg-rose-100 text-rose-700'
          }`}>{session.status}</span>
          <span className="text-xs text-slate-300 font-mono hidden lg:block">#{session.checkId}</span>
        </div>
      </div>

      {/* ── ORDER STATUS BAR ─────────────────────────── */}
      <div className="h-10 bg-white border-b border-slate-100 flex items-center gap-2 px-4 shrink-0">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 shrink-0">Order Status</span>
        <div className="flex items-center gap-1.5 flex-1">
          {ORDER_STATUS_STEPS.map(step => (
            <button
              key={step.key}
              disabled={statusMutation.isPending}
              onClick={() => session.status !== step.key && statusMutation.mutate(step.key as any)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition ${
                session.status === step.key ? step.active : step.idle
              }`}
            >
              {step.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            if (confirm('Mark this order as Complete and close the session?')) {
              quickCompleteMutation.mutate();
            }
          }}
          disabled={quickCompleteMutation.isPending}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 transition shrink-0 disabled:opacity-50"
        >
          <CheckCircle2 className="w-3 h-3" />
          {quickCompleteMutation.isPending ? 'Completing…' : 'Complete'}
        </button>
      </div>

      {/* ── THREE-PANEL BODY ─────────────────────────── */}
      <div className="flex flex-1 overflow-hidden min-h-0">

        {/* ═══ LEFT — Menu browser ════════════════════ */}
        <div className="flex flex-col bg-white border-r border-slate-200 shrink-0" style={{ width: '38%', minWidth: 300 }}>

          {/* Category tabs */}
          <div className="flex gap-0.5 px-2 pt-2 pb-0 overflow-x-auto shrink-0 border-b border-slate-100">
            {/* "All" tab */}
            <button
              key={ALL_CAT_ID}
              onClick={() => { setActiveCat(ALL_CAT_ID); setSearch(''); }}
              onMouseEnter={() => prefetchCategory(ALL_CAT_ID)}
              className={`flex items-center gap-1 px-3 py-2 text-xs font-bold whitespace-nowrap rounded-t-lg shrink-0 transition-all border-b-2 ${
                activeCat === ALL_CAT_ID
                  ? 'text-indigo-600 border-indigo-600 bg-indigo-50'
                  : 'text-slate-400 border-transparent hover:text-slate-600'
              }`}
            >
              <LayoutGrid className="w-3 h-3" /> All
            </button>
            {categories.map((cat: { _id: string; title: string }) => (
              <button
                key={cat._id}
                onClick={() => { setActiveCat(cat._id); setSearch(''); }}
                onMouseEnter={() => prefetchCategory(cat._id)}
                className={`px-3 py-2 text-xs font-bold whitespace-nowrap rounded-t-lg shrink-0 transition-all border-b-2 ${
                  activeCat === cat._id
                    ? 'text-indigo-600 border-indigo-600 bg-indigo-50'
                    : 'text-slate-400 border-transparent hover:text-slate-600'
                }`}
              >
                {cat.title}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="px-2 py-2 shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search menu…"
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none focus:border-indigo-300 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Food grid — "All" shows category sections, others show flat grid */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {activeCat === ALL_CAT_ID && !search ? (
              /* Grouped by category */
              <div className="px-2 pb-2 space-y-4">
                {foodsByCategory.map(({ catTitle, items: catFoods }) => (
                  <div key={catTitle}>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 py-2 sticky top-0 bg-white z-10">
                      {catTitle}
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {catFoods.map(food => (
                        <FoodCard key={food._id} food={food} onAdd={() => addItem(food)} />
                      ))}
                    </div>
                  </div>
                ))}
                {foodsByCategory.length === 0 && (
                  <div className="py-16 text-center text-slate-300 text-sm">Loading menu…</div>
                )}
              </div>
            ) : (
              /* Flat grid for single category / search results */
              <div className="px-2 pb-2 grid grid-cols-3 gap-2 pt-1 content-start">
                {filteredFoods.map(food => (
                  <FoodCard key={food._id} food={food} onAdd={() => addItem(food)} />
                ))}
                {filteredFoods.length === 0 && (
                  <div className="col-span-3 py-16 text-center text-slate-300 text-sm">
                    {search ? 'No results' : 'No items in this category'}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ═══ MIDDLE — Order list ════════════════════ */}
        <div className="flex flex-col bg-white border-r border-slate-200 shrink-0 min-h-0" style={{ width: '32%', minWidth: 260 }}>

          {/* Order header */}
          <div className="h-11 px-4 border-b border-slate-100 flex items-center justify-between shrink-0">
            <h3 className="font-bold text-slate-700 text-sm">
              Order
              <span className="ml-1.5 text-xs font-semibold text-slate-400">{items.length} item{items.length !== 1 ? 's' : ''}</span>
            </h3>
            <button
              onClick={() => setSplitMode(m => !m)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                splitMode ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              <SplitSquareHorizontal className="w-3 h-3" /> Split
            </button>
          </div>

          {/* Split guest selector */}
          {splitMode && (
            <div className="px-3 py-2 border-b border-slate-100 flex gap-1.5 shrink-0 overflow-x-auto">
              {Array.from({ length: session.guestCount }, (_, i) => i + 1).map(g => (
                <button key={g} onClick={() => setActiveGuest(g)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold shrink-0 transition ${
                    activeGuest === g ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                  G{g}
                </button>
              ))}
            </div>
          )}

          {/* Items list */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-2">
                <ChefHat className="w-10 h-10 opacity-30" />
                <p className="text-sm">No items yet</p>
                <p className="text-xs">← Select from the menu</p>
              </div>
            ) : (
              COURSE_ORDER.map(course => {
                const ci = splitMode
                  ? items.filter(i => i.course === course && i.guestIndex === activeGuest)
                  : items.filter(i => i.course === course);
                if (!ci.length) return null;
                return (
                  <div key={course}>
                    <div className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-300 bg-slate-50">
                      {COURSE_LABEL[course]}
                    </div>
                    {ci.map(item => (
                      <motion.div key={item._id} layout initial={{ opacity: 0, x: -8 }} animate={{ opacity: item.status !== 'ordered' ? 0.65 : 1, x: 0 }}
                        className="flex items-center gap-2 px-3 py-2.5 border-b border-slate-50 hover:bg-slate-50/50 transition">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-700 truncate">{item.name}</p>
                          {item.notes ? (
                            <p onClick={() => setNotesTarget(item)} className="text-[10px] text-slate-400 cursor-pointer hover:text-indigo-500 truncate">
                              📝 {item.notes}
                            </p>
                          ) : item.status === 'ordered' ? (
                            <p onClick={() => setNotesTarget(item)} className="text-[10px] text-slate-300 cursor-pointer hover:text-indigo-400">
                              + add note
                            </p>
                          ) : null}
                          <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded mt-0.5 uppercase ${STATUS_CHIP[item.status] ?? ''}`}>
                            {item.status}
                          </span>
                        </div>

                        {item.status === 'ordered' ? (
                          <div className="flex items-center gap-0.5 shrink-0">
                            <button onClick={() => changeQty(item, -1)} className="w-5 h-5 rounded bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition">
                              <Minus className="w-2.5 h-2.5" />
                            </button>
                            <span className="w-5 text-center text-xs font-bold text-slate-700">{item.qty}</span>
                            <button onClick={() => changeQty(item, 1)} className="w-5 h-5 rounded bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition">
                              <Plus className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 w-6 text-center shrink-0">{item.qty}×</span>
                        )}

                        <span className="text-xs font-semibold text-slate-600 w-12 text-right shrink-0">{fmt(item.price * item.qty)}</span>

                        {item.status === 'ordered' && (
                          <button onClick={() => removeItem(item)}
                            className="w-5 h-5 flex items-center justify-center text-slate-300 hover:text-red-400 rounded transition shrink-0">
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </div>
                );
              })
            )}
          </div>

          {/* Send to kitchen */}
          <div className="p-3 border-t border-slate-100 shrink-0">
            <button onClick={sendToKitchen} disabled={!hasUnsent || kitchenMutation.isPending}
              className="w-full py-2.5 bg-indigo-600 disabled:bg-indigo-200 text-white disabled:text-indigo-300 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 transition">
              <Send className="w-4 h-4" />
              {kitchenMutation.isPending ? 'Sending…' : `Send to Kitchen${hasUnsent ? ` (${items.filter(i=>i.status==='ordered').length})` : ''}`}
            </button>
          </div>
        </div>

        {/* ═══ RIGHT — Checkout ════════════════════════ */}
        <div className="flex flex-col bg-white flex-1 min-w-0 min-h-0 overflow-hidden">

          {/* Checkout header */}
          <div className="h-11 px-4 border-b border-slate-100 flex items-center shrink-0">
            <h3 className="font-bold text-slate-700 text-sm">Checkout</h3>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0 px-4 py-3 space-y-3">

            {/* Course subtotals */}
            {items.length > 0 && (
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">Summary</p>
                {COURSE_ORDER.map(course => {
                  const ci = items.filter(i => i.course === course);
                  if (!ci.length) return null;
                  const sub = ci.reduce((s, i) => s + i.price * i.qty, 0);
                  return (
                    <div key={course} className="flex justify-between text-xs text-slate-500">
                      <span>{COURSE_LABEL[course]}</span><span>{fmt(sub)}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Discount */}
            <div className="border-t border-slate-100 pt-3">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-2">Discount</p>
              <div className="flex gap-2">
                <input type="number" value={discountVal} onChange={e => setDiscountVal(e.target.value)}
                  placeholder="0" min={0}
                  className="flex-1 px-2 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-300" />
                <select value={discountType} onChange={e => setDiscountType(e.target.value as 'pct' | 'fixed')}
                  className="px-2 py-1.5 border border-slate-200 rounded-lg text-xs outline-none bg-white">
                  <option value="pct">%</option>
                  <option value="fixed">$</option>
                </select>
              </div>
              <input type="text" value={discountReason} onChange={e => setDiscountReason(e.target.value)}
                placeholder="Reason (optional)"
                className="w-full mt-1.5 px-2 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-300" />
              {discountVal && (
                <button onClick={() => discountMutation.mutate()}
                  className="w-full mt-1.5 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition">
                  Apply Discount
                </button>
              )}
            </div>

            {/* Totals */}
            <div className="border-t border-slate-100 pt-3 space-y-1.5">
              <div className="flex justify-between text-xs text-slate-500"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
              {discount > 0 && <div className="flex justify-between text-xs text-emerald-600"><span>Discount</span><span>−{fmt(discount)}</span></div>}
              <div className="flex justify-between text-xs text-slate-500"><span>Service 18%</span><span>{fmt(serviceChg)}</span></div>
              <div className="flex justify-between text-xs text-slate-500"><span>Tax 9.5%</span><span>{fmt(tax)}</span></div>
              <div className="flex justify-between font-bold text-slate-800 pt-2 border-t border-slate-200">
                <span>Total</span><span className="text-base">{fmt(total)}</span>
              </div>
            </div>

            {/* Payment method */}
            <div className="border-t border-slate-100 pt-3">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-2">Payment Method</p>
              <div className="flex gap-1.5">
                {(['cash', 'card', 'split'] as const).map(m => (
                  <button key={m} onClick={() => setPayMethod(m)}
                    className={`flex-1 py-2.5 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 transition border-2 ${
                      payMethod === m ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-100 text-slate-400 hover:border-slate-200'
                    }`}>
                    {m === 'cash'  && <Banknote className="w-4 h-4" />}
                    {m === 'card'  && <CreditCard className="w-4 h-4" />}
                    {m === 'split' && <SplitSquareHorizontal className="w-4 h-4" />}
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Cash calculator */}
            {payMethod === 'cash' && (
              <div className="bg-slate-50 rounded-xl p-3 space-y-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">Cash Tendered</p>
                <input type="number" value={cashTendered} onChange={e => setCashTendered(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold text-right outline-none focus:border-indigo-300 bg-white" />
                <div className="flex justify-between bg-emerald-50 rounded-xl px-3 py-2 font-bold text-emerald-700">
                  <span className="text-xs">Change</span>
                  <span>{fmt(change)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="p-3 space-y-2 border-t border-slate-100 shrink-0">
            <button onClick={() => completeMutation.mutate()} disabled={!canPay || completeMutation.isPending}
              className="w-full py-3 bg-emerald-600 disabled:bg-emerald-200 text-white disabled:text-emerald-300 rounded-xl font-bold text-sm hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-sm">
              <CheckCircle2 className="w-4 h-4" />
              {completeMutation.isPending ? 'Processing…' : 'Process Payment'}
            </button>
            <button
              onClick={() => printReceipt(session, items, { subtotal, discount, serviceChg, tax, total }, payMethod)}
              className="w-full py-2.5 bg-slate-100 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-200 transition flex items-center justify-center gap-2">
              <Printer className="w-4 h-4" />
              Print Bill (2 copies)
            </button>
          </div>
        </div>
      </div>

      {/* ── Modals ─────────────────────────────────────── */}
      <AnimatePresence>
        {notesTarget && (
          <NotesModal item={notesTarget} onSave={notes => saveNotes(notesTarget, notes)} onClose={() => setNotesTarget(null)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showPaySuccess && (
          <PaymentSuccess tableLabel={session.tableLabel} total={total} onDone={() => router.push('/dashboard/tables')} />
        )}
      </AnimatePresence>
    </div>
  );
}
