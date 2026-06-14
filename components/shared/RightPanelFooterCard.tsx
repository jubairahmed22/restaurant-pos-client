'use client';

import Link from 'next/link';
import Image from 'next/image';
import rinLogo from '@/app/assest/Rin_Logo.png';

const navLinks = [
  { label: 'Home',        href: '/'            },
  { label: 'Menu',        href: '/menu'         },
  { label: 'Shop',        href: '/shop'         },
  { label: 'Restaurant',  href: '/restaurant'   },
  { label: 'Reservation', href: '/reservation'  },
];

export default function RightPanelFooterCard() {
  return (
    <div className="w-full bg-white rounded-3xl px-6 py-8 flex flex-col items-center gap-5 shadow-sm border border-slate-100 shrink-0">

      {/* Logo */}
      <div className="relative w-24 h-12">
        <Image
          src={rinLogo}
          alt="RIN Logo"
          fill
          className="object-contain"
          sizes="96px"
        />
      </div>

      {/* Tagline */}
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 text-center leading-tight">
        Japanese Food · Hobart, Tasmania
      </p>

      {/* Nav links */}
      <nav className="flex flex-col items-center gap-1.5 w-full">
        {navLinks.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className="text-[14px] font-semibold text-[#1B3A6B] hover:text-[#C05428] transition-colors duration-200 tracking-tight"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Divider */}
      <div className="w-full h-px bg-slate-100" />

      {/* Copyright */}
      <p className="text-[10px] text-slate-400 text-center leading-relaxed">
        © {new Date().getFullYear()} RIN Japanese Restaurant.
        <br />All rights reserved.
      </p>
    </div>
  );
}
