'use client';

import React from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import {
  ShoppingCart,
  User,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Navbar() {
  const cartItems = useCartStore((state) => state.items);
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    toast.success('Successfully logged out');
  };

  const navLinks = [
    { label: 'Menu', href: '/menu' },
    { label: 'Reservation', href: '/reservation' },
    { label: 'About', href: '/about' },
    { label: 'Restaurant', href: '/restaurant' },
  ];

  return (
    <header className="fixed top-0 left-0 z-50 flex items-start">
      {/* MAIN PILL 
          - relative: so we can position the scoop
          - after: the pseudo-element that creates the 'inverted' curve
      */}
      <div className="relative bg-[#0e0e0c] text-white flex items-center px-8 py-4 gap-8 rounded-br-[2.5rem] 
                      after:content-[''] after:absolute after:top-0 after:-right-[60px] after:w-[60px] after:h-[30px] 
                      after:rounded-tl-[1.5rem] after:shadow-[-20px_0_0_0_#0e0e0c] after:pointer-events-none">

        {/* LOGO */}
        <Link
          href="/"
          className="font-serif italic text-xl tracking-tight whitespace-nowrap"
        >
          Gusto
        </Link>

        {/* NAV LINKS */}
        <nav className="hidden xl:flex items-center gap-6">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[13px] font-medium text-zinc-400 hover:text-white transition whitespace-nowrap"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-3 ml-2">
          {/* AUTH */}
          {user ? (
            <div className="flex items-center gap-3">
              {/* USER INFO */}
              <div className="hidden md:block text-right">
                <p className="text-[8px] text-zinc-500 uppercase tracking-wider leading-none">
                  {user.role}
                </p>
                <p className="text-[10px] font-semibold text-white">
                  {user.name}
                </p>
              </div>

              {/* DASHBOARD */}
              {user?.role === 'admin' && (
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800 hover:bg-zinc-700 transition text-sm"
                >
                  <LayoutDashboard size={16} />
                  <span>Dashboard</span>
                </Link>
              )}

              {/* LOGOUT */}
              <button
                onClick={handleLogout}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-800 hover:bg-red-500 transition group"
              >
                <LogOut size={18} className="group-hover:text-white" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black hover:bg-zinc-200 transition text-sm font-medium whitespace-nowrap"
              >
                <User size={16} />
                <span>Sign In</span>
              </Link>

              <Link
                href="/register"
                className="text-sm text-zinc-400 hover:text-white transition whitespace-nowrap"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* CART */}
          <Link
            href="/menu"
            className="relative flex items-center justify-center w-10 h-10 rounded-full bg-zinc-800 hover:bg-zinc-700 transition"
          >
            <ShoppingCart size={18} />
            {cartItems.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#0e0e0c]">
                {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}