'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
}

interface Suggestion {
  display_name: string;
  short: string;
}

function formatShort(display: string): string {
  // Nominatim returns "street, suburb, state postcode, Australia"
  // Keep only the first 3–4 parts for a cleaner label
  const parts = display.split(', ');
  return parts.slice(0, Math.min(4, parts.length - 1)).join(', ');
}

export default function AddressAutocomplete({ value, onChange, placeholder = 'Start typing an address…', className = '', rows }: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen]               = useState(false);
  const [loading, setLoading]         = useState(false);
  const debounceRef                   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef                  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const fetchSuggestions = (q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q || q.length < 3) { setSuggestions([]); setOpen(false); return; }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=0&limit=6&countrycodes=au`;
        const res  = await fetch(url, { headers: { 'Accept-Language': 'en-AU' } });
        const data: { display_name: string }[] = await res.json();
        const results = data.map(d => ({ display_name: d.display_name, short: formatShort(d.display_name) }));
        setSuggestions(results);
        setOpen(results.length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 350);
  };

  const handleChange = (v: string) => {
    onChange(v);
    fetchSuggestions(v);
  };

  const handleSelect = (s: Suggestion) => {
    onChange(s.short);
    setSuggestions([]);
    setOpen(false);
  };

  const inputCls = `w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-[#1B3A6B] placeholder-slate-400 focus:outline-none focus:border-[#1B3A6B] focus:bg-white transition-all duration-200 ${className}`;

  return (
    <div ref={containerRef} className="relative w-full">
      {rows ? (
        <textarea
          rows={rows}
          value={value}
          onChange={e => handleChange(e.target.value)}
          placeholder={placeholder}
          className={`${inputCls} resize-none`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={e => handleChange(e.target.value)}
          placeholder={placeholder}
          className={inputCls}
        />
      )}

      {loading && (
        <span className="absolute right-3 top-3.5 text-slate-400">
          <Loader2 size={15} className="animate-spin" />
        </span>
      )}

      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
          {suggestions.map((s, i) => (
            <li
              key={i}
              onMouseDown={() => handleSelect(s)}
              className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
            >
              <MapPin size={14} className="text-slate-400 mt-0.5 shrink-0" />
              <span className="text-sm text-slate-700 leading-snug">{s.short}</span>
            </li>
          ))}
          <li className="px-4 py-1.5 text-[10px] text-slate-300 text-right">
            © OpenStreetMap contributors
          </li>
        </ul>
      )}
    </div>
  );
}
