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
        <div className="relative bg-white text-[#1B3A6B] flex items-center px-6 py-4 md:px-8 gap-4 md:gap-8 
                /* Rounded corners for the box itself */
                rounded-br-[2.5rem] rounded-tr-2xl 
                /* The Scoop Logic */
                after:content-[''] after:absolute after:top-0 after:-right-[60px] 
                after:w-[60px] after:h-[60px] 
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
            <span className="font-serif text-xl md:text-2xl font-semibold tracking-tight text-[#1B3A6B] transition-colors whitespace-nowrap">
              RIN
            </span>
          </Link>

          {/* DESKTOP NAV LINKS (xl and up) */}
          <nav className="hidden xl:flex items-center gap-8">
            {navLinks.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative py-1 text-[15px] font-bold transition-colors duration-300 group whitespace-nowrap ${
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
          <div className="flex items-center gap-3 ml-2">
            {/* AUTH - DESKTOP ONLY DETAILS */}
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden md:block text-right">
                  <p className="text-[8px] text-[#1B3A6B]/60 uppercase tracking-wider leading-none">
                    {user.role}
                  </p>
                  <p className="text-[10px] font-semibold text-[#1B3A6B]">
                    {user.name}
                  </p>
                </div>

                {user?.role === 'admin' && (
                  <Link
                    href="/dashboard"
                    className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
                      pathname === '/dashboard'
                        ? 'bg-[#1B3A6B] text-white'
                        : 'bg-zinc-100 hover:bg-zinc-200 text-[#1B3A6B]'
                    }`}
                  >
                    <LayoutDashboard size={16} />
                    {/* <span className="hidden lg:inline">Dashboard</span> */}
                  </Link>
                )}
sadfasdf
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-100 hover:bg-rose-500 hover:text-white text-[#1B3A6B] transition group"
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
              className="relative flex items-center justify-center w-10 h-10 rounded-full bg-zinc-100 hover:bg-zinc-200 text-[#1B3A6B] transition"
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

      <aside className={`fixed top-0 left-0 z-[70] h-full w-[280px] bg-white text-[#1B3A6B] p-6 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        <div className="flex justify-between items-center mb-12">
          <span className="font-serif text-2xl tracking-tight font-semibold">RIN</span>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-zinc-100 rounded-full transition">
            <X size={24} />
          </button>
        </div>

        <nav className="flex flex-col gap-6">
          {navLinks.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`text-lg transition-colors ${
                  isActive 
                    ? 'font-bold text-[#1B3A6B]' 
                    : 'font-medium text-[#1B3A6B]/70 hover:text-[#1B3A6B]'
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          <hr className="border-zinc-200 my-2" />

          {!user && (
            <Link
              href="/register"
              onClick={() => setIsOpen(false)}
              className={`text-lg transition-colors ${
                pathname === '/register'
                  ? 'font-bold text-[#1B3A6B]'
                  : 'font-medium text-[#1B3A6B]/70 hover:text-[#1B3A6B]'
              }`}
            >
              Create Account
            </Link>
          )}

          {user?.role === 'admin' && (
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 text-lg transition-colors ${
                pathname === '/dashboard'
                  ? 'font-bold text-[#1B3A6B]'
                  : 'font-medium text-[#1B3A6B]/70 hover:text-[#1B3A6B]'
              }`}
            >
              <LayoutDashboard size={20} />
              Dashboard
            </Link>
          )}
        </nav>
      </aside>
    </>
  );
}