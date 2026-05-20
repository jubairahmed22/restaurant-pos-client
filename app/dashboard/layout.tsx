'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  FolderTree,
  PlusCircle,
  Utensils,
  LogOut,
  Bell,
  Moon,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [isSidebarOpen, setIsSidebarOpen] =
    useState(false);

  const [isProfileOpen, setIsProfileOpen] =
    useState(false);

  // AUTH USER
  const { user, logout } = useAuthStore();

  const menuItems = [
    {
      label: 'DASHBOARD',
      icon: LayoutDashboard,
      href: '/dashboard',
      badge: '9+',
    },

    {
      label: 'POS',
      icon: Utensils,
      href: '/dashboard/pos',
    },

    {
      label: 'ORDERS',
      icon: ShoppingBag,
      href: '/dashboard/orders',
    },

    {
      label: 'FOOD ITEMS',
      icon: PlusCircle,
      href: '/dashboard/foods',
    },

    {
      label: 'CATEGORIES',
      icon: FolderTree,
      href: '/dashboard/categories',
    },
  ];

  const toggleSidebar = () =>
    setIsSidebarOpen(!isSidebarOpen);

  const handleLogout = () => {
    logout();

    toast.success('Successfully logged out');

    router.push('/login');
  };

  return (
    <div className="min-h-screen font-inter bg-[#F8F9FD] flex flex-col">

      {/* HEADER */}
      <header className="h-16 bg-[#6366F1] flex items-center justify-between px-4 md:px-6 sticky top-0 z-[60] shadow-md">

        {/* LEFT */}
        <div className="flex items-center gap-4 md:gap-8">
sadfasdf
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
              Los Pollos Hermanos
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3 text-white">

          {/* ACTIONS */}
          <div className="hidden sm:flex items-center gap-2">

            <button className="p-2 hover:bg-white/10 rounded-full transition">
              <Moon size={18} />
            </button>

            <button className="p-2 hover:bg-white/10 rounded-full transition relative">
              <Bell size={18} />

              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-[9px] flex items-center justify-center rounded-full font-bold border border-[#6366F1]">
                2
              </span>
            </button>
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

            {menuItems.map((item) => {
              const isActive =
                pathname === item.href;

              const Icon = item.icon;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() =>
                    setIsSidebarOpen(false)
                  }
                  className={`flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all group ${
                    isActive
                      ? 'bg-[#6366F1] text-white font-bold'
                      : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">

                    <Icon
                      size={19}
                      className={
                        isActive
                          ? 'text-white'
                          : 'text-slate-300 group-hover:text-indigo-400'
                      }
                    />

                    <span className="text-[11px] font-black tracking-[0.05em] uppercase">
                      {item.label}
                    </span>
                  </div>

                  {item.badge ? (
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-emerald-50 text-emerald-500 border border-emerald-100'
                      }`}
                    >
                      {item.badge}
                    </span>
                  ) : (
                    isActive && (
                      <ChevronRight
                        size={14}
                        className="opacity-50"
                      />
                    )
                  )}
                </Link>
              );
            })}
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

          <div className="p-4 md:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
            {children}
          </div>
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