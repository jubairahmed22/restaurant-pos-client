'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  FolderTree,
  PlusCircle,
  LayoutGrid,
  LogOut,
  Bell,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  CreditCard,
  Tag,
  Package,
  ShoppingCart,
  Store,
  Receipt,
  BarChart2,
  FileText,
  Newspaper,
  UtensilsCrossed,
  CalendarCheck,
} from 'lucide-react';
import { io } from 'socket.io-client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

type NotifKind = 'order' | 'reservation';

interface Notif {
  id: string;
  kind: NotifKind;
  title: string;
  subtitle: string;
  time: Date;
  read: boolean;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [isSidebarOpen,  setIsSidebarOpen]  = useState(false);
  const [isProfileOpen,  setIsProfileOpen]  = useState(false);
  const [isShopOpen,     setIsShopOpen]     = useState(() => pathname.startsWith('/dashboard/shop'));
  const [isNotifOpen,    setIsNotifOpen]    = useState(false);
  const [notifications,  setNotifications]  = useState<Notif[]>([]);

  const notifRef = useRef<HTMLDivElement>(null);

  // AUTH USER
  const { user, logout } = useAuthStore();

  // ── Socket.IO notification listener ──────────────────────────────────
  useEffect(() => {
    const socket = io('http://localhost:51000', { transports: ['websocket', 'polling'] });

    socket.on('connect', () => {
      socket.emit('join-room', 'admin-room');
    });

    socket.on('notification:newOrder', (data: { _id: string; orderId?: string; fullName: string; total: number; createdAt: string }) => {
      const notif: Notif = {
        id: data._id,
        kind: 'order',
        title: 'New Order',
        subtitle: `${data.fullName} — $${data.total.toFixed(2)}`,
        time: new Date(data.createdAt || Date.now()),
        read: false,
      };
      setNotifications(prev => [notif, ...prev].slice(0, 50));
      toast.success(`New order from ${data.fullName}`);
    });

    socket.on('notification:newReservation', (data: { _id: string; fullName: string; people: number; date: string; time: string; createdAt: string }) => {
      const notif: Notif = {
        id: data._id,
        kind: 'reservation',
        title: 'New Reservation',
        subtitle: `${data.fullName} · ${data.people} guests · ${data.date} ${data.time}`,
        time: new Date(data.createdAt || Date.now()),
        read: false,
      };
      setNotifications(prev => [notif, ...prev].slice(0, 50));
      toast.success(`New reservation from ${data.fullName}`);
    });

    return () => { socket.disconnect(); };
  }, []);

  // ── Close notif dropdown on outside click ────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () =>
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  const mainItems = [
    { label: 'DASHBOARD',    icon: LayoutDashboard, href: '/dashboard',            badge: '9+' },
    { label: 'TABLES',       icon: LayoutGrid,      href: '/dashboard/tables' },
    { label: 'ORDERS',       icon: ShoppingBag,     href: '/dashboard/orders' },
    { label: 'RESERVATION',  icon: ShoppingBag,     href: '/dashboard/reservation-list' },
    { label: 'FOOD ITEMS',   icon: PlusCircle,      href: '/dashboard/foods' },
    { label: 'CATEGORIES',   icon: FolderTree,      href: '/dashboard/categories' },
    { label: 'TRANSACTIONS', icon: CreditCard,      href: '/dashboard/transactions' },
    { label: 'ANALYTICS',    icon: BarChart2,       href: '/dashboard/analytics' },
    { label: 'REPORTS',      icon: FileText,        href: '/dashboard/reports' },
    { label: 'CONTENT',      icon: Newspaper,       href: '/dashboard/content' },
  ];

  const shopItems = [
    { label: 'CATEGORIES',   icon: Tag,         href: '/dashboard/shop/categories' },
    { label: 'PRODUCTS',     icon: Package,     href: '/dashboard/shop/products' },
    { label: 'ORDERS',       icon: ShoppingCart,href: '/dashboard/shop/orders' },
    { label: 'TRANSACTIONS', icon: Receipt,     href: '/dashboard/shop/transactions' },
  ];

  const isShopActive = pathname.startsWith('/dashboard/shop');

  const toggleSidebar = () =>
    setIsSidebarOpen(!isSidebarOpen);

  const handleLogout = () => {
    logout();
    toast.success('Successfully logged out');
    router.push('/login');
  };

  return (
    <div className="min-h-screen font-inter  flex flex-col">

      {/* HEADER */}
      <header className="h-16 bg-[#1B3A6B] flex items-center justify-between px-4 md:px-6 sticky top-0 z-[60] shadow-md">

        {/* LEFT */}
        <div className="flex items-center gap-4 md:gap-8">

          {/* MOBILE MENU */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-white p-1 hover:bg-white/10 rounded-md transition"
          >
            {isSidebarOpen ? (
              <X size={24} />
            ) : (
              <Menu size={24} />
            )}
          </button>

          {/* LOGO */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => router.push('/')}
          >
            <p className="text-white font-bold text-lg">
              RIN
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3 text-white">

          {/* NOTIFICATION BELL */}
          <div className="hidden sm:block relative" ref={notifRef}>
            <button
              onClick={() => {
                setIsNotifOpen(v => !v);
                if (!isNotifOpen) markAllRead();
              }}
              className="p-2 hover:bg-white/10 rounded-full transition relative"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-[9px] flex items-center justify-center rounded-full font-bold border border-[#1B3A6B]">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* NOTIFICATION DROPDOWN */}
            {isNotifOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-bold text-slate-800">Notifications</p>
                  {notifications.length > 0 && (
                    <button
                      onClick={() => setNotifications([])}
                      className="text-[11px] text-slate-400 hover:text-red-400 transition"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* List */}
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-400">
                      <Bell size={28} strokeWidth={1.5} />
                      <p className="text-xs">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className="flex items-start gap-3 px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition">
                        <div className={`mt-0.5 p-2 rounded-xl shrink-0 ${n.kind === 'order' ? 'bg-[#C05428]/10 text-[#C05428]' : 'bg-[#1B3A6B]/10 text-[#1B3A6B]'}`}>
                          {n.kind === 'order' ? <UtensilsCrossed size={14} /> : <CalendarCheck size={14} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-slate-800">{n.title}</p>
                          <p className="text-[12px] text-slate-500 truncate">{n.subtitle}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {n.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* PROFILE */}
          <div className="relative">

            <button
              onClick={() =>
                setIsProfileOpen(!isProfileOpen)
              }
              className="flex items-center gap-3 pl-4 border-l border-white/20 hover:bg-white/10 rounded-xl px-2 py-1 transition"
            >
              {/* TEXT */}
              <div className="text-right hidden sm:block">
                <p className="text-[13px] font-semibold leading-none">
                  {user?.name || 'Admin'}
                </p>

                <p className="text-[11px] text-white/70 mt-1 capitalize">
                  {user?.role || 'Admin'}
                </p>
              </div>

              {/* AVATAR */}
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20">
                <img
                  src={`https://ui-avatars.com/api/?name=${
                    user?.name || 'Admin'
                  }&background=ffffff&color=6366F1`}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              </div>

              <ChevronDown size={16} />
            </button>

            {/* DROPDOWN */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">

                {/* TOP */}
                <div className="p-5 border-b border-slate-100">

                  <div className="flex items-center gap-4">

                    <div className="w-14 h-14 rounded-full overflow-hidden">
                      <img
                        src={`https://ui-avatars.com/api/?name=${
                          user?.name || 'Admin'
                        }&background=6366F1&color=ffffff`}
                        alt="profile"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">

                      <h3 className="font-semibold text-slate-800 truncate">
                        {user?.name || 'Admin User'}
                      </h3>

                      <p className="text-sm text-slate-500 truncate">
                        {user?.email ||
                          'admin@gmail.com'}
                      </p>

                      <span className="inline-flex mt-2 px-2 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-[11px] font-semibold uppercase tracking-wide">
                        {user?.role || 'Admin'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* MENU */}
                <div className="p-2">

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-red-500 transition"
                  >
                    <LogOut size={18} />

                    <span className="text-sm font-medium">
                      Logout
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">

        {/* MOBILE OVERLAY */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() =>
              setIsSidebarOpen(false)
            }
          />
        )}

        {/* SIDEBAR */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-100
            transform transition-transform duration-300 ease-in-out flex flex-col
            ${
              isSidebarOpen
                ? 'translate-x-0'
                : '-translate-x-full lg:translate-x-0'
            }
          `}
        >
          {/* NAV */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">

            {/* ── Main items ── */}
            {mainItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all group ${
                    isActive
                      ? 'bg-[#1B3A6B] text-white font-bold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-[#1B3A6B]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={19} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-[#1B3A6B]'} />
                    <span className="text-[11px] font-black tracking-wider uppercase">{item.label}</span>
                  </div>
                  {item.badge ? (
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${isActive ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-500 border border-emerald-100'}`}>
                      {item.badge}
                    </span>
                  ) : (
                    isActive && <ChevronRight size={14} className="opacity-50" />
                  )}
                </Link>
              );
            })}

            {/* ── Divider ── */}
            <div className="pt-1 pb-0.5">
              <div className="h-px bg-slate-100" />
            </div>

            {/* ── Shop group ── */}
            <button
              onClick={() => setIsShopOpen(v => !v)}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all group ${
                isShopActive
                  ? 'bg-[#C05428]/10 text-[#C05428]'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-[#C05428]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Store size={19} className={isShopActive ? 'text-[#C05428]' : 'text-slate-500 group-hover:text-[#C05428]'} />
                <span className="text-[11px] font-black tracking-wider uppercase">Shop</span>
              </div>
              <ChevronDown
                size={15}
                className={`transition-transform duration-200 ${isShopOpen ? 'rotate-180' : ''} ${isShopActive ? 'text-[#C05428]' : 'text-slate-400'}`}
              />
            </button>

            {/* ── Shop sub-items ── */}
            {isShopOpen && (
              <div className="ml-3 pl-3 border-l-2 border-[#C05428]/20 space-y-0.5">
                {shopItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                        isActive
                          ? 'bg-[#C05428] text-white font-bold'
                          : 'text-slate-500 hover:bg-orange-50 hover:text-[#C05428]'
                      }`}
                    >
                      <Icon size={16} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-[#C05428]'} />
                      <span className="text-[11px] font-black tracking-wider uppercase">{item.label}</span>
                      {isActive && <ChevronRight size={12} className="ml-auto opacity-60" />}
                    </Link>
                  );
                })}
              </div>
            )}
          </nav>

          {/* FOOTER */}
          <div className="p-4 border-t border-slate-100">

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3.5 text-slate-400 hover:text-red-500 rounded-2xl hover:bg-red-50 transition-all group"
            >
              <LogOut
                size={19}
                className="group-hover:rotate-12 transition-transform"
              />

              <span className="text-[11px] font-black tracking-widest uppercase">
                Logout
              </span>
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto bg-[#ebedf6]">
          {(pathname.includes('/session') || pathname.includes('/edit')) ? (
            <div className="animate-in fade-in duration-500">{children}</div>
          ) : (
            <div className="p-4 md:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
              {children}
            </div>
          )}
        </main>
      </div>

      {/* SCROLLBAR */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}
