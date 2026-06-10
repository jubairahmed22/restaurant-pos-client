'use client';

import { useRouter, usePathname } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function MobileBackButton() {
  const router   = useRouter();
  const pathname = usePathname();

  // Don't show on the home page
  if (pathname === '/') return null;

  return (
    <button
      onClick={() => router.back()}
      aria-label="Go back"
      className="xl:hidden fixed top-[52px] left-3 z-20 w-9 h-9 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-full flex items-center justify-center text-[#1B3A6B] shadow-sm active:scale-95 transition-transform"
    >
      <ArrowLeft size={16} strokeWidth={2.5} />
    </button>
  );
}
