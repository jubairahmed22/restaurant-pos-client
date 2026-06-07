'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import {
  ShoppingCart,
  User,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

import rinLogo from '../../app/assest/Rin_Logo.png';
import Image from 'next/image';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const cartItems = useCartStore((state) => state.items);
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    toast.success('Successfully logged out');
    setIsOpen(false);
  };

  const navLinks = [
    { label: 'Menu', href: '/menu' },
    { label: 'Reservation', href: '/reservation' },
    // { label: 'About', href: '/about' },
    { label: 'Restaurant', href: '/restaurant' },
  ];

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      <header className="fixed top-0 left-0 z-30 flex items-start">
        {/* MAIN PILL */}
        <div className="relative bg-white text-[#1B3A6B] flex items-center px-4 py-1 md:px-8 gap-4 md:gap-4 
                /* Rounded corners for the box itself */
                rounded-br-[2.5rem] rounded-tr-2xl 
                /* The Scoop Logic */
                after:content-[''] after:absolute after:top-0 after:-right-[60px] 
                after:w-[65.5px] after:h-[48px] 
                after:rounded-tl-[2.5rem] 
                after:shadow-[-25px_-25px_0_0_#ffffff] 
                after:pointer-events-none">

          {/* MOBILE MENU TRIGGER */}
          <button
            onClick={() => setIsOpen(true)}
            className="xl:hidden p-1 hover:text-[#1B3A6B]/70 transition-colors"
          >
            <Menu size={24} />
          </button>

          {/* LOGO */}
          <Link
            href="/"
            className="flex items-center gap-2 group focus:outline-none"
          >
            {/* Container to enforce strict image scale dimensions */}
            <div className="relative w-20 h-10 md:w-20 md:h-10 transition-transform duration-200 group-hover:scale-105">
              <Image
                src={rinLogo}
                alt="RIN Logo"
                placeholder="blur" // Adds an inline layout loading state block
                priority // Bypass lazy-loading since this is an above-the-fold core branding element
                fill
                className="object-contain"
              />
            </div>

            {/* Corporate Typography Brand Text */}
            {/* <span className="font-serif text-xl md:text-2xl font-semibold tracking-tight text-[#1B3A6B] transition-colors whitespace-nowrap">
              RIN
            </span> */}
          </Link>

          {/* DESKTOP NAV LINKS (xl and up) */}
          <nav className="hidden xl:flex items-center gap-4">
            {navLinks.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative py-1 text-[14px] font-bold transition-colors duration-300 group whitespace-nowrap ${
                    isActive ? 'text-[#1B3A6B]' : 'text-[#1B3A6B]/80 hover:text-[#1B3A6B]'
                  }`}
                >
                  {item.label}
                  <span 
                    className={`absolute bottom-0 left-0 h-[2px] w-full bg-[#1B3A6B] transition-transform duration-300 ease-out ${
                      isActive 
                        ? 'scale-x-100' 
                        : 'scale-x-0 origin-right group-hover:scale-x-100 group-hover:origin-left'
                    }`} 
                  />
                </Link>
              );
            })}
          </nav>

          {/* RIGHT SIDE (Icons) */}
          <div className="flex items-center gap-3 ml-1">
            {/* AUTH - DESKTOP ONLY DETAILS */}
            {user ? (
              <div className="flex items-center gap-2">
                {/* <div className="hidden md:block text-right">
                  <p className="text-[8px] text-[#1B3A6B]/60 uppercase tracking-wider leading-none">
                    {user.role}
                  </p>
                  <p className="text-[10px] font-semibold text-[#1B3A6B]">
                    {user.name}
                  </p>
                </div> */}

                {user?.role === 'admin' && (
                  <Link
                    href="/dashboard"
                    className={`hidden sm:flex items-center gap-2 px-2 py-2 rounded-full text-sm font-medium transition ${
                      pathname === '/dashboard'
                        ? 'bg-[#1B3A6B] text-white'
                        : 'bg-zinc-100 hover:bg-zinc-200 text-[#1B3A6B]'
                    }`}
                  >
                    <LayoutDashboard size={16} />
                    {/* <span className="hidden lg:inline">Dashboard</span> */}
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="flex hidden items-center justify-center w-10 h-10 rounded-full bg-zinc-100 hover:bg-rose-500 hover:text-white text-[#1B3A6B] transition group"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition text-sm font-medium whitespace-nowrap ${
                    pathname === '/login' || pathname === '/register'
                      ? 'bg-[#1B3A6B]/10 text-[#1B3A6B] border border-[#1B3A6B]/20'
                      : 'bg-[#1B3A6B] text-white hover:bg-[#1B3A6B]/90'
                  }`}
                >
                  <User size={16} />
                  <span className="hidden sm:inline">Sign In</span>
                </Link>
              </div>
            )}

            {/* CART */}
            <Link
              href="/menu"
              className="relative flex z-50 items-center justify-center w-10 h-10 rounded-full bg-zinc-100 hover:bg-zinc-200 text-[#1B3A6B] transition"
            >
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* MOBILE SIDEBAR / DRAWER */}
      <div
        className={`fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={() => setIsOpen(false)}
      />

      <aside
  className={`fixed top-0 left-0 z-[70] h-screen w-[320px] bg-white border-r border-zinc-100 shadow-2xl transform transition-transform duration-300 ease-out ${
    isOpen ? "translate-x-0" : "-translate-x-full"
  }`}
>
  <div className="flex h-full flex-col">
    {/* Header */}
    <div className="flex items-center justify-between border-b border-zinc-100 px-8 py-6">
      <div>
        <h2 className="font-serif text-3xl tracking-tight text-[#1B3A6B]">
          RIN
        </h2>
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
          Beauty & Care
        </p>
      </div>

      <button
        onClick={() => setIsOpen(false)}
        className="rounded-full p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-black"
      >
        <X size={22} />
      </button>
    </div>

    {/* Navigation */}
    <nav className="flex-1 px-5 py-8">
      <div className="space-y-2">
        {navLinks.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`group flex items-center rounded-2xl px-5 py-3 transition-all duration-300 ${
                isActive
                  ? "bg-[#1B3A6B] text-white shadow-lg"
                  : "text-[#1B3A6B]/70 hover:bg-zinc-50 hover:text-[#1B3A6B]"
              }`}
            >
              <span className="text-[15px] font-medium">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Divider */}
      <div className="my-8 border-t border-zinc-100" />

      {/* Auth */}
      {!user && (
        <div className="space-y-3">
          <Link
            href="/login"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center gap-2 rounded-2xl bg-[#1B3A6B] px-5 py-3 font-medium text-white transition hover:bg-[#163058]"
          >
            <User size={18} />
            Sign In
          </Link>

          <Link
            href="/register"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center rounded-2xl border border-[#1B3A6B]/15 px-5 py-3 font-medium text-[#1B3A6B] transition hover:bg-[#1B3A6B]/5"
          >
            Create Account
          </Link>
        </div>
      )}

      {/* Dashboard */}
      {user?.role === "admin" && (
        <Link
          href="/dashboard"
          onClick={() => setIsOpen(false)}
          className="flex items-center gap-3 rounded-2xl px-5 py-3 text-[#1B3A6B] transition hover:bg-zinc-50"
        >
          <LayoutDashboard size={20} />
          <span className="font-medium">Dashboard</span>
        </Link>
      )}
    </nav>

    {/* Footer */}
    {user && (
      <div className="border-t border-zinc-100 p-5">
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center rounded-2xl border border-red-100 px-5 py-3 font-medium text-red-500 transition hover:bg-red-50"
        >
          Log Out
        </button>
      </div>
    )}
  </div>
</aside>
    </>
  );
}