'use client';

import React, { useState } from 'react';
import { 
  LayoutDashboard, ShoppingBag, FolderTree, PlusCircle, 
  Users, Utensils, MapPin, Settings, LogOut, Search, 
  Bell, Moon, Menu, X, ChevronRight 
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { label: 'DASHBOARD', icon: LayoutDashboard, href: '/dashboard', badge: '9+' },
    { label: 'ORDERS', icon: ShoppingBag, href: '/dashboard/orders' },
    { label: 'CATEGORIES', icon: FolderTree, href: '/dashboard/categories' },
    { label: 'FOOD ITEMS', icon: PlusCircle, href: '/dashboard/foods' },
    { label: 'CUSTOMERS', icon: Users, href: '/dashboard/customers' },
    { label: 'POS', icon: Utensils, href: '/dashboard/pos' },
    { label: 'LOCATIONS', icon: MapPin, href: '/dashboard/locations' },
    { label: 'STORE SETTINGS', icon: Settings, href: '/dashboard/settings' },
  ];

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen font-inter bg-[#F8F9FD] flex flex-col selection:bg-indigo-100 selection:text-indigo-700">
      
      {/* 1. HEADER AREA */}
      <header className="h-16 bg-[#6366F1] flex items-center justify-between px-4 md:px-6 sticky top-0 z-[60] shadow-md shadow-indigo-200/20">
        <div className="flex items-center gap-4 md:gap-8">
          {/* MOBILE TOGGLE (The "Three Dot" equivalent) */}
          <button 
            onClick={toggleSidebar}
            className="lg:hidden text-white p-1 hover:bg-white/10 rounded-md transition"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/dashboard')}>
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/30">
              <span className="text-white font-black text-xl italic">M</span>
            </div>
            <span className="text-white font-black text-xl tracking-tighter italic hidden xs:block">Metor</span>
          </div>

          {/* SEARCH BAR */}
          <div className="relative hidden md:block group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-white transition-colors" size={17} />
            <input 
              placeholder="Start typing..." 
              className="bg-white/10 text-white text-sm pl-10 pr-4 py-2 rounded-xl border border-white/5 w-64 lg:w-80 placeholder:text-white/40 outline-none focus:bg-white/20 focus:border-white/20 transition-all"
            />
          </div>
        </div>

        {/* HEADER ACTIONS */}
        <div className="flex items-center gap-2 md:gap-5 text-white">
          <div className="hidden sm:flex items-center gap-3 mr-2">
             <button className="p-2 hover:bg-white/10 rounded-full transition text-white/80 hover:text-white">
               <Moon size={19} />
             </button>
             <button className="p-2 hover:bg-white/10 rounded-full transition text-white/80 hover:text-white relative">
               <Bell size={19} />
               <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#FF4B55] text-[10px] flex items-center justify-center rounded-full font-black border-2 border-[#6366F1]">18</span>
             </button>
          </div>

          <div className="flex items-center gap-3 pl-4 border-l border-white/10">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black leading-none uppercase tracking-widest text-white/90">Doris Lietz</p>
              <p className="text-[9px] font-bold text-white/50 mt-1 uppercase">Admin Account</p>
            </div>
            <div className="w-9 h-9 rounded-full border-2 border-white/20 p-0.5 shadow-inner">
               <img src="https://ui-avatars.com/api/?name=Doris+Lietz&bg=white&color=6366F1" className="w-full h-full rounded-full object-cover" alt="Admin" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        
        {/* 2. SIDEBAR NAVIGATION */}
        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <aside className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-100 
          transform transition-transform duration-300 ease-in-out flex flex-col
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          {/* Scrollable Links Section */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 custom-scrollbar">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all group ${
                    isActive 
                      ? 'bg-[#6366F1] text-white   font-bold' 
                      : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={19} className={isActive ? 'text-white' : 'text-slate-300 group-hover:text-indigo-400 transition-colors'} />
                    <span className="text-[11px] font-black tracking-[0.05em] uppercase">{item.label}</span>
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
          </nav>

          {/* Sidebar Footer (Logout) */}
          <div className="p-4 border-t border-slate-50 bg-slate-50/30">
            <button 
              onClick={() => { /* add logout logic here */ }}
              className="flex items-center gap-3 w-full px-4 py-3.5 text-slate-400 hover:text-rose-500 rounded-2xl hover:bg-rose-50 transition-all group"
            >
              <LogOut size={19} className="group-hover:rotate-12 transition-transform" />
              <span className="text-[11px] font-black tracking-widest uppercase">Terminate Session</span>
            </button>
          </div>
        </aside>

        {/* 3. MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto bg-[#ebedf6] custom-scrollbar relative">
          <div className="p-4 md:p-8 max-w-[1200px] mx-auto animate-in fade-in duration-500">
            {children}
          </div>
        </main>
      </div>

      {/* GLOBAL OVERRIDES FOR SCROLLBAR (Add to your globals.css or keep here in a style tag) */}
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