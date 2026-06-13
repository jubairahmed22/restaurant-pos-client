'use client';

import React, { useCallback, useRef, useState } from 'react';
import { UploadCloud, X, ImageIcon, Loader2, Plus } from 'lucide-react';
import api from '@/services/axios';

/* ─── Single-image dropzone ──────────────────────────────────────────────────
   Props:
     value     – current URL string (from parent state)
     onChange  – called with the new Cloudinary URL after upload
     disabled  – optional
*/
interface SingleProps {
  mode: 'single';
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  label?: string;
}

/* ─── Multi-image dropzone ───────────────────────────────────────────────────
   Props:
     value     – current URL[] (from parent state)
     onChange  – called with the full updated URL[]
     max       – max images (default 5)
*/
interface MultiProps {
  mode: 'multiple';
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
  disabled?: boolean;
  label?: string;
}

type Props = SingleProps | MultiProps;

async function uploadSingle(file: File): Promise<string> {
  const fd = new FormData();
  fd.append('image', file);
  const { data } = await api.post('/shop/upload/single', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  if (!data.url) throw new Error('Upload failed');
  return data.url as string;
}

async function uploadMultiple(files: File[]): Promise<string[]> {
  const fd = new FormData();
  files.forEach((f) => fd.append('images', f));
  const { data } = await api.post('/shop/upload/multiple', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  if (!data.urls) throw new Error('Upload failed');
  return data.urls as string[];
}

function accepts(file: File) {
  return file.type.startsWith('image/');
}

// ─────────────────────────────────────────────────────────────────────────────
// Single mode
// ─────────────────────────────────────────────────────────────────────────────
function SingleDropzone({ value, onChange, disabled, label }: Omit<SingleProps, 'mode'>) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handle = useCallback(async (file: File) => {
    if (!accepts(file)) { setError('Only image files are allowed'); return; }
    setError('');
    setUploading(true);
    try {
      const url = await uploadSingle(file);
      onChange(url);
    } catch {
      setError('Upload failed. Try again.');
    } finally {
      setUploading(false);
    }
  }, [onChange]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handle(file);
  }, [handle]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handle(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-1.5">
      {label && <p className="text-xs font-semibold text-slate-500">{label}</p>}
      <div
        onClick={() => !uploading && !disabled && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`
          relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden
          ${dragging ? 'border-[#1B3A6B] bg-[#1B3A6B]/5 scale-[1.01]' : 'border-slate-200 bg-slate-50 hover:border-[#1B3A6B]/50 hover:bg-slate-100/60'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${value ? 'h-44' : 'h-36'}
        `}
      >
        {uploading && (
          <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center gap-2 z-10">
            <Loader2 size={24} className="animate-spin text-[#1B3A6B]" />
            <span className="text-xs font-semibold text-slate-500">Uploading…</span>
          </div>
        )}

        {value ? (
          <>
            <img src={value} alt="preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center gap-3 opacity-0 hover:opacity-100">
              <span className="text-white text-xs font-bold bg-black/50 px-3 py-1.5 rounded-full">Change</span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onChange(''); }}
                className="text-white bg-red-500 p-1.5 rounded-full hover:bg-red-600 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 p-4 text-center pointer-events-none select-none">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${dragging ? 'bg-[#1B3A6B] text-white' : 'bg-slate-200 text-slate-400'}`}>
              <UploadCloud size={22} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-600">
                {dragging ? 'Drop image here' : 'Drag & drop or click to upload'}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">PNG, JPG, WEBP — max 5 MB</p>
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={onInputChange} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Multiple mode
// ─────────────────────────────────────────────────────────────────────────────
function MultipleDropzone({ value, onChange, max = 5, disabled, label }: Omit<MultiProps, 'mode'>) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handle = useCallback(async (files: File[]) => {
    const valid = files.filter(accepts);
    if (!valid.length) { setError('Only image files are allowed'); return; }
    const allowed = valid.slice(0, max - value.length);
    if (!allowed.length) { setError(`Maximum ${max} images allowed`); return; }
    setError('');
    setUploading(true);
    try {
      const urls = await uploadMultiple(allowed);
      onChange([...value, ...urls]);
    } catch {
      setError('Upload failed. Try again.');
    } finally {
      setUploading(false);
    }
  }, [onChange, value, max]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length) handle(files);
  }, [handle]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length) handle(files);
    e.target.value = '';
  };

  const remove = (idx: number) => {
    const next = value.filter((_, i) => i !== idx);
    onChange(next);
  };

  const canAdd = value.length < max && !disabled;

  return (
    <div className="space-y-2">
      {label && <p className="text-xs font-semibold text-slate-500">{label} ({value.length}/{max})</p>}

      {/* Image grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {value.map((url, idx) => (
            <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
              <img src={url} alt={`image ${idx + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => remove(idx)}
                className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-md"
              >
                <X size={12} />
              </button>
              {idx === 0 && (
                <span className="absolute bottom-1.5 left-1.5 text-[9px] font-bold bg-[#1B3A6B] text-white px-1.5 py-0.5 rounded-full">Main</span>
              )}
            </div>
          ))}

          {/* Add more tile */}
          {canAdd && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="aspect-square rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:border-[#1B3A6B]/50 hover:bg-slate-100 transition-colors flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-[#1B3A6B] disabled:opacity-50"
            >
              {uploading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
              <span className="text-[10px] font-semibold">{uploading ? 'Uploading' : 'Add'}</span>
            </button>
          )}
        </div>
      )}

      {/* Main drop zone (shown when no images or as add area) */}
      {value.length === 0 && (
        <div
          onClick={() => !uploading && !disabled && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`
            flex flex-col items-center justify-center h-40 rounded-2xl border-2 border-dashed transition-all cursor-pointer
            ${dragging ? 'border-[#1B3A6B] bg-[#1B3A6B]/5 scale-[1.01]' : 'border-slate-200 bg-slate-50 hover:border-[#1B3A6B]/50 hover:bg-slate-100/60'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={24} className="animate-spin text-[#1B3A6B]" />
              <span className="text-xs font-semibold text-slate-500">Uploading…</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 p-4 text-center pointer-events-none select-none">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${dragging ? 'bg-[#1B3A6B] text-white' : 'bg-slate-200 text-slate-400'}`}>
                <ImageIcon size={22} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600">
                  {dragging ? 'Drop images here' : 'Drag & drop or click to upload'}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">Up to {max} images · PNG, JPG, WEBP · max 5 MB each</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Drop overlay when images exist */}
      {value.length > 0 && canAdd && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`flex items-center justify-center gap-2 h-10 rounded-xl border-2 border-dashed text-xs font-semibold transition-all ${dragging ? 'border-[#1B3A6B] bg-[#1B3A6B]/5 text-[#1B3A6B]' : 'border-slate-200 text-slate-400 hover:border-[#1B3A6B]/40'}`}
        >
          <UploadCloud size={14} />
          {dragging ? 'Drop to add' : `Drop more images here (${max - value.length} remaining)`}
        </div>
      )}

      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={onInputChange} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Unified export
// ─────────────────────────────────────────────────────────────────────────────
export default function ImageDropzone(props: Props) {
  if (props.mode === 'single') {
    const { mode: _, ...rest } = props;
    return <SingleDropzone {...rest} />;
  }
  const { mode: _, ...rest } = props;
  return <MultipleDropzone {...rest} />;
}
