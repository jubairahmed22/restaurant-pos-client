import type { NextConfig } from 'next';
asdfsadf
const nextConfig: NextConfig = {
  // ── Core ──────────────────────────────────────────────
  reactStrictMode: true,
  poweredByHeader: false,       // remove X-Powered-By for security
  compress: true,               // gzip responses

  // ── Images ────────────────────────────────────────────
  images: {
    formats: ['image/avif', 'image/webp'],  // serve modern formats
    deviceSizes: [375, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,    // 30-day browser cache
    remotePatterns: [
      // Allow images from your backend (Cloudinary, S3, etc.)
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'ortazz.com.au' },
      { protocol: 'http',  hostname: 'ortazz.com.au' },
      // UI avatars (used in dashboard)
      { protocol: 'https', hostname: 'ui-avatars.com' },
    ],
  },

  // ── HTTP Headers ──────────────────────────────────────
  async headers() {
    return [
      {
        // Cache static assets aggressively
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Cache optimised images
        source: '/_next/image(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
        ],
      },
      {
        // Security headers for all routes
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options',    value: 'nosniff' },
          { key: 'X-Frame-Options',           value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection',          value: '1; mode=block' },
          { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },

  // ── Redirects ─────────────────────────────────────────
  async redirects() {
    return [];
  },

  // ── Experimental (Next 16) ────────────────────────────
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
};

export default nextConfig;
