'use client';

import { useState, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Link2, Loader2, Trash2, X, ImagePlus, FileVideo,
  Globe, Plus, Edit3, CheckCircle, ExternalLink,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { ReviewService, type Review } from '@/services/review.service';
import { BlogService, type Blog } from '@/services/blog.service';

/* ── helpers ───────────────────────────────────────────────────────────────── */
function getDomain(url: string) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; }
}

function getYouTubeId(url: string) {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^&?\s]{11})/);
  return m ? m[1] : null;
}

/* ── REVIEW PREVIEW CARD ───────────────────────────────────────────────────── */
function ReviewPreviewCard({ r, onDelete }: { r: Review; onDelete?: () => void }) {
  return (
    <a
      href={r.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-[#1B3A6B]/20 transition-all"
      onClick={e => onDelete && e.preventDefault()}
    >
      {r.image && (
        <div className="relative w-full h-44 overflow-hidden bg-slate-100">
          <Image src={r.image} alt={r.title} fill className="object-cover" unoptimized />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          {r.favicon && (
            <Image src={r.favicon} alt="" width={16} height={16} className="rounded-sm" unoptimized />
          )}
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{r.domain || getDomain(r.url)}</span>
        </div>
        <p className="text-[#1B3A6B] font-bold text-sm leading-snug line-clamp-2">{r.title || r.url}</p>
        {r.description && (
          <p className="text-slate-500 text-xs mt-1.5 leading-relaxed line-clamp-2">{r.description}</p>
        )}
      </div>
      {onDelete && (
        <div className="flex justify-end px-4 pb-3">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(); }}
            className="text-rose-400 hover:text-rose-600 transition-colors p-1.5 rounded-lg hover:bg-rose-50"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </a>
  );
}

/* ── BLOG CARD (dashboard list) ────────────────────────────────────────────── */
function BlogListCard({ blog, onEdit, onDelete }: { blog: Blog; onEdit: () => void; onDelete: () => void }) {
  const ytId = blog.videoLink ? getYouTubeId(blog.videoLink) : null;
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Image strip */}
      {blog.images.length > 0 && (
        <div className={`grid gap-0.5 ${blog.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {blog.images.slice(0, 4).map((img, i) => (
            <div key={i} className="relative aspect-video overflow-hidden bg-slate-100">
              <Image src={img} alt="" fill className="object-cover" unoptimized />
              {i === 3 && blog.images.length > 4 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-black text-lg">+{blog.images.length - 4}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {/* Video */}
      {ytId && (
        <div className="relative aspect-video bg-slate-900">
          <iframe
            src={`https://www.youtube.com/embed/${ytId}`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}
      {!ytId && blog.videoLink && (
        <a
          href={blog.videoLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 bg-slate-50 border-b border-slate-100 text-sm text-[#1B3A6B] font-medium hover:bg-slate-100 transition-colors"
        >
          <FileVideo size={16} className="shrink-0" />
          <span className="truncate">{blog.videoLink}</span>
          <ExternalLink size={12} className="shrink-0 ml-auto" />
        </a>
      )}
      <div className="p-4">
        <h3 className="font-black text-[#1B3A6B] text-sm mb-1.5">{blog.title}</h3>
        {blog.paragraph && (
          <p className="text-slate-500 text-xs leading-relaxed line-clamp-3">{blog.paragraph}</p>
        )}
        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#1B3A6B] bg-[#1B3A6B]/5 hover:bg-[#1B3A6B]/10 rounded-xl transition-colors"
          >
            <Edit3 size={12} /> Edit
          </button>
          <button
            onClick={onDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
          >
            <Trash2 size={12} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   REVIEWS TAB
══════════════════════════════════════════════════════════════════════════════ */
function ReviewsTab() {
  const qc = useQueryClient();
  const [url, setUrl]       = useState('');
  const [preview, setPreview] = useState<Partial<Review> | null>(null);
  const [fetching, setFetching] = useState(false);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['reviews'],
    queryFn: ReviewService.getAll,
  });

  const createMut = useMutation({
    mutationFn: ReviewService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews'] });
      setPreview(null);
      setUrl('');
      toast.success('Review saved');
    },
    onError: () => toast.error('Failed to save review'),
  });

  const deleteMut = useMutation({
    mutationFn: ReviewService.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reviews'] }); toast.success('Deleted'); },
    onError: () => toast.error('Delete failed'),
  });

  const fetchPreview = async () => {
    if (!url.trim()) return;
    setFetching(true);
    setPreview(null);
    try {
      const res = await fetch(`https://api.microlink.io?url=${encodeURIComponent(url.trim())}`);
      const json = await res.json();
      if (json.status === 'success') {
        setPreview({
          url:         json.data.url || url.trim(),
          title:       json.data.title || '',
          description: json.data.description || '',
          image:       json.data.image?.url || '',
          favicon:     json.data.logo?.url || '',
          domain:      getDomain(json.data.url || url.trim()),
          siteName:    json.data.publisher || '',
        });
      } else {
        // Fallback: save with just the URL
        setPreview({ url: url.trim(), title: '', description: '', image: '', favicon: '', domain: getDomain(url.trim()), siteName: '' });
        toast('Could not load full preview — URL will be saved as-is', { icon: 'ℹ️' });
      }
    } catch {
      setPreview({ url: url.trim(), title: '', description: '', image: '', favicon: '', domain: getDomain(url.trim()), siteName: '' });
    } finally {
      setFetching(false);
    }
  };

  const handleSave = () => {
    if (!preview?.url) return;
    createMut.mutate({
      url:         preview.url,
      title:       preview.title || '',
      description: preview.description || '',
      image:       preview.image || '',
      favicon:     preview.favicon || '',
      domain:      preview.domain || '',
      siteName:    preview.siteName || '',
    });
  };

  return (
    <div className="space-y-6">
      {/* URL input + fetch */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-[#1B3A6B] font-black text-sm uppercase tracking-widest mb-4">
          Add Article / Review Link
        </h3>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Link2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchPreview()}
              placeholder="https://example.com/review-article"
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-[#1B3A6B] font-medium placeholder-slate-400 outline-none focus:border-[#1B3A6B] focus:bg-white transition-all"
            />
          </div>
          <button
            onClick={fetchPreview}
            disabled={!url.trim() || fetching}
            className="flex items-center gap-2 px-5 py-3 bg-[#1B3A6B] text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-[#1B3A6B]/90 transition-all disabled:opacity-40 shrink-0"
          >
            {fetching ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />}
            Fetch
          </button>
        </div>

        {/* Preview card */}
        {preview && (
          <div className="mt-5 space-y-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Preview</p>
            <ReviewPreviewCard r={preview as Review} />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={createMut.isPending}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#C05428] text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-[#C05428]/90 transition-all disabled:opacity-50"
              >
                {createMut.isPending ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                Save Review
              </button>
              <button
                onClick={() => { setPreview(null); setUrl(''); }}
                className="px-4 py-2.5 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Saved reviews */}
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
          Saved Reviews ({reviews.length})
        </p>
        {isLoading && (
          <div className="flex items-center gap-2 text-slate-400 text-sm py-8 justify-center">
            <Loader2 size={16} className="animate-spin" /> Loading…
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {reviews.map(r => (
            <ReviewPreviewCard
              key={r._id}
              r={r}
              onDelete={() => deleteMut.mutate(r._id)}
            />
          ))}
        </div>
        {!isLoading && reviews.length === 0 && (
          <div className="py-16 text-center text-slate-400 text-sm">
            No reviews yet. Paste a link above to add one.
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   BLOG FORM (shared for create + edit)
══════════════════════════════════════════════════════════════════════════════ */
function BlogForm({
  initial,
  onSave,
  onCancel,
  isSaving,
}: {
  initial?: Blog;
  onSave: (fd: FormData) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [title,     setTitle]     = useState(initial?.title     || '');
  const [paragraph, setParagraph] = useState(initial?.paragraph || '');
  const [videoLink, setVideoLink] = useState(initial?.videoLink || '');
  const [files,     setFiles]     = useState<File[]>([]);
  const [keepImgs,  setKeepImgs]  = useState<string[]>(initial?.images || []);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
  };

  const removeFile   = (i: number) => setFiles(prev => prev.filter((_, idx) => idx !== i));
  const removeKeep   = (i: number) => setKeepImgs(prev => prev.filter((_, idx) => idx !== i));

  const handleSubmit = () => {
    if (!title.trim()) { toast.error('Title is required'); return; }
    const fd = new FormData();
    fd.append('title',     title.trim());
    fd.append('paragraph', paragraph);
    fd.append('videoLink', videoLink.trim());
    keepImgs.forEach(url => fd.append('existingImages', url));
    files.forEach(f => fd.append('images', f));
    onSave(fd);
  };

  const ytId = videoLink ? getYouTubeId(videoLink) : null;

  return (
    <div className="space-y-5">
      {/* Title */}
      <div>
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
          Blog Title *
        </label>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Our Grand Opening Night…"
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-[#1B3A6B] font-medium placeholder-slate-400 outline-none focus:border-[#1B3A6B] focus:bg-white transition-all"
        />
      </div>

      {/* Paragraph */}
      <div>
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
          Content / Paragraph
        </label>
        <textarea
          rows={5}
          value={paragraph}
          onChange={e => setParagraph(e.target.value)}
          placeholder="Share your story, event details, or update…"
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-[#1B3A6B] font-medium placeholder-slate-400 outline-none focus:border-[#1B3A6B] focus:bg-white transition-all resize-none"
        />
      </div>

      {/* Video link */}
      <div>
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
          Video Link (YouTube or Google Drive)
        </label>
        <div className="relative">
          <FileVideo size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={videoLink}
            onChange={e => setVideoLink(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=…"
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-[#1B3A6B] font-medium placeholder-slate-400 outline-none focus:border-[#1B3A6B] focus:bg-white transition-all"
          />
        </div>
        {ytId && (
          <div className="mt-3 rounded-xl overflow-hidden aspect-video bg-slate-900">
            <iframe
              src={`https://www.youtube.com/embed/${ytId}`}
              className="w-full h-full"
              allowFullScreen
            />
          </div>
        )}
      </div>

      {/* Images */}
      <div>
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
          Images (Cloudinary upload — multiple)
        </label>

        {/* Existing images (edit mode) */}
        {keepImgs.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
            {keepImgs.map((img, i) => (
              <div key={i} className="relative group">
                <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100">
                  <Image src={img} alt="" fill className="object-cover" unoptimized />
                </div>
                <button
                  onClick={() => removeKeep(i)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* New file previews */}
        {files.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
            {files.map((f, i) => (
              <div key={i} className="relative group">
                <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100">
                  <Image src={URL.createObjectURL(f)} alt="" fill className="object-cover" unoptimized />
                </div>
                <button
                  onClick={() => removeFile(i)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-slate-300 rounded-xl text-xs font-bold text-slate-400 hover:border-[#1B3A6B]/40 hover:text-[#1B3A6B] transition-all w-full justify-center"
        >
          <ImagePlus size={15} /> Add Images
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFiles}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 bg-[#1B3A6B] text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-[#1B3A6B]/90 transition-all disabled:opacity-50"
        >
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
          {initial ? 'Update Blog' : 'Publish Blog'}
        </button>
        <button
          onClick={onCancel}
          className="px-5 py-3 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   BLOGS TAB
══════════════════════════════════════════════════════════════════════════════ */
function BlogsTab() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState<Blog | null>(null);

  const { data: blogs = [], isLoading } = useQuery({
    queryKey: ['blogs'],
    queryFn: BlogService.getAll,
  });

  const createMut = useMutation({
    mutationFn: BlogService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['blogs'] }); setShowForm(false); toast.success('Blog published'); },
    onError: () => toast.error('Failed to publish'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, fd }: { id: string; fd: FormData }) => BlogService.update(id, fd),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['blogs'] }); setEditing(null); toast.success('Blog updated'); },
    onError: () => toast.error('Update failed'),
  });

  const deleteMut = useMutation({
    mutationFn: BlogService.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['blogs'] }); toast.success('Deleted'); },
    onError: () => toast.error('Delete failed'),
  });

  const isSaving = createMut.isPending || updateMut.isPending;

  return (
    <div className="space-y-6">

      {/* CREATE FORM */}
      {(showForm || editing) ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-[#1B3A6B] font-black text-sm uppercase tracking-widest mb-5">
            {editing ? 'Edit Blog Post' : 'New Blog Post'}
          </h3>
          <BlogForm
            key={editing?._id ?? 'new'}
            initial={editing ?? undefined}
            isSaving={isSaving}
            onSave={fd => {
              if (editing) updateMut.mutate({ id: editing._id, fd });
              else         createMut.mutate(fd);
            }}
            onCancel={() => { setShowForm(false); setEditing(null); }}
          />
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-5 py-3 bg-[#1B3A6B] text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-[#1B3A6B]/90 transition-all shadow-sm"
        >
          <Plus size={14} /> New Blog Post
        </button>
      )}

      {/* BLOG LIST */}
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
          Published Blogs ({blogs.length})
        </p>
        {isLoading && (
          <div className="flex items-center gap-2 text-slate-400 text-sm py-8 justify-center">
            <Loader2 size={16} className="animate-spin" /> Loading…
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {blogs.map(blog => (
            <BlogListCard
              key={blog._id}
              blog={blog}
              onEdit={() => { setEditing(blog); setShowForm(false); }}
              onDelete={() => deleteMut.mutate(blog._id)}
            />
          ))}
        </div>
        {!isLoading && blogs.length === 0 && (
          <div className="py-16 text-center text-slate-400 text-sm">
            No blog posts yet. Click "New Blog Post" to get started.
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════════════════════════ */
type Tab = 'reviews' | 'blogs';

export default function ContentPage() {
  const [tab, setTab] = useState<Tab>('reviews');

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif italic text-[#1B3A6B]">Content</h1>
        <p className="text-slate-400 text-sm mt-1 font-medium">
          Manage articles, reviews, and blog posts shown on the Reservation page.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex border-b-2 border-slate-100 mb-8">
        {([['reviews', 'Reviews & Articles'], ['blogs', 'Blogs']] as [Tab, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`
              relative px-6 py-3 text-xs font-black uppercase tracking-widest transition-colors duration-200
              ${tab === key ? 'text-[#1B3A6B]' : 'text-slate-400 hover:text-slate-700'}
            `}
          >
            {label}
            {tab === key && (
              <span className="absolute bottom-[-2px] left-0 right-0 h-[3px] bg-[#1B3A6B] rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'reviews' ? <ReviewsTab /> : <BlogsTab />}
    </div>
  );
}
