'use client';

// ── CacheManager ──────────────────────────────────────────
// Layer 1: in-memory Map  (session lifetime, zero latency)
// Layer 2: localStorage   (cross-session persistence)
// Works with React Query — use as a backing store for
// initialData / placeholderData to make first renders instant.

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // ms; 0 = never expire
}

export interface CacheOptions {
  ttl?: number;      // default 5 min
  persist?: boolean; // write to localStorage (default true)
}

const DEFAULT_TTL = 5 * 60 * 1000; // 5 min
const LS_PREFIX   = 'rms_cache_';

export class CacheManager {
  private memory = new Map<string, CacheEntry<unknown>>();

  // ── READ ────────────────────────────────────────────────

  get<T>(key: string): T | null {
    // 1. Memory
    const mem = this.memory.get(key);
    if (mem) {
      if (this.alive(mem)) return mem.data as T;
      this.memory.delete(key);
    }

    // 2. localStorage (SSR-safe)
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(LS_PREFIX + key);
      if (!raw) return null;
      const entry = JSON.parse(raw) as CacheEntry<T>;
      if (!this.alive(entry)) {
        localStorage.removeItem(LS_PREFIX + key);
        return null;
      }
      this.memory.set(key, entry as CacheEntry<unknown>); // warm memory
      return entry.data;
    } catch {
      return null;
    }
  }

  // ── WRITE ───────────────────────────────────────────────

  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const ttl   = options.ttl  ?? DEFAULT_TTL;
    const persist = options.persist ?? true;
    const entry: CacheEntry<T> = { data, timestamp: Date.now(), ttl };

    this.memory.set(key, entry as CacheEntry<unknown>);

    if (persist && typeof window !== 'undefined') {
      try {
        localStorage.setItem(LS_PREFIX + key, JSON.stringify(entry));
      } catch {
        // quota exceeded — silent fail
      }
    }
  }

  // ── INVALIDATE ──────────────────────────────────────────

  invalidate(key: string): void {
    this.memory.delete(key);
    if (typeof window !== 'undefined') {
      try { localStorage.removeItem(LS_PREFIX + key); } catch {}
    }
  }

  invalidatePrefix(prefix: string): void {
    for (const k of this.memory.keys()) {
      if (k.startsWith(prefix)) this.memory.delete(k);
    }
    if (typeof window === 'undefined') return;
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith(LS_PREFIX + prefix))
        .forEach(k => localStorage.removeItem(k));
    } catch {}
  }

  clear(): void {
    this.memory.clear();
    if (typeof window === 'undefined') return;
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith(LS_PREFIX))
        .forEach(k => localStorage.removeItem(k));
    } catch {}
  }

  // ── UTILS ───────────────────────────────────────────────

  private alive(entry: CacheEntry<unknown>): boolean {
    if (entry.ttl === 0) return true;
    return Date.now() - entry.timestamp < entry.ttl;
  }
}

// Singleton
export const cacheManager = new CacheManager();

// ── Cache keys ───────────────────────────────────────────

export const CacheKeys = {
  bootstrap:    ()           => 'bootstrap',
  tables:       ()           => 'tables',
  tableSession: (tableId: string) => `session:${tableId}`,
  foods:        (catId: string)   => `foods:${catId}`,
  categories:   ()           => 'categories',
} as const;
