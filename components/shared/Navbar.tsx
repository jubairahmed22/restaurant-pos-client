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
  Utensils,
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
    { label: 'Home', href: '/' },
    { label: 'Menu', href: '/menu' },
    { label: 'Reservation', href: '/reservation' },
    { label: 'Corporate Order', href: '/corporate-order' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'Location', href: '/location' },
    { label: 'Contact Us', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 bg-white border-b border-slate-100 z-50">
      <div className="max-w-8xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* LOGO */}
        <Link
          href="/"
          className="flex items-center gap-2 text-2xl font-black text-orange-600 tracking-tight"
        >
          <Utensils className="h-6 w-6" />
          <span>GOURMET KITCHEN</span>
        </Link>

        {/* NAV LINKS */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-slate-600 hover:text-orange-600 transition"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-4">

          {/* CART */}
          <Link
            href="/cart"
            className="relative p-2.5 bg-orange-50 rounded-full text-orange-600 hover:bg-orange-100 transition"
          >
            <ShoppingCart size={20} />

            {cartItems.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {cartItems.reduce(
                  (acc, i) => acc + i.quantity,
                  0
                )}
              </span>
            )}
          </Link>

          {/* AUTH SECTION */}
          {user ? (
            <div className="flex items-center gap-3 border-l pl-4 border-slate-200">

              {/* DASHBOARD (ADMIN ONLY) */}
              {user?.role === 'admin' && (
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-orange-600 transition"
                >
                  <LayoutDashboard size={16} />
                  <span>Dashboard</span>
                </Link>
              )}

              {/* USER INFO */}
              <div className="text-right hidden sm:block">
                <p className="text-xs text-slate-400 capitalize">
                  {user.role}
                </p>
                <p className="text-sm font-bold text-slate-800">
                  {user.name}
                </p>
              </div>

              {/* LOGOUT */}
              <button
                onClick={handleLogout}
                className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">

              {/* SIGN IN */}
              <Link
                href="/login"
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-4 py-2 rounded-xl transition"
              >
                <User size={16} />
                <span>Sign In</span>
              </Link>

              {/* SIGN UP */}
              <Link
                href="/register"
                className="text-sm font-semibold text-slate-600 hover:text-orange-600 transition"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}