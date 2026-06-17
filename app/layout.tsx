import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import Providers from './providers';
import './globals.css';

// ── Font ──────────────────────────────────────────────────
const jakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',          // avoids invisible text during load
  preload: true,
});

// ── Restaurant constants ──────────────────────────────────
const SITE_URL   = process.env.NEXT_PUBLIC_SITE_URL || 'https://rinrestaurant.com.au';
const SITE_NAME  = 'RIN Japanese Restaurant Hobart';
const SITE_DESC  = 'Authentic Japanese cuisine in Hobart, Tasmania. Eat in or take away at 196 Macquarie Street. Handcrafted by Japanese chefs — sushi, ramen, tempura & more. Call +61 427 634 574.';
const OG_IMAGE   = `${SITE_URL}/og`;   // dynamic OG image at /app/og/route.tsx

// ── Viewport ──────────────────────────────────────────────
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1B3A6B',
};

// ── Metadata ──────────────────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  // Title & Description
  title: {
    default: 'RIN | Authentic Japanese Restaurant Hobart – Eat In & Take Away',
    template: '%s | RIN Japanese Restaurant Hobart',
  },
  description: SITE_DESC,

  // Keywords
  keywords: [
    'Japanese restaurant Hobart',
    'Japanese food Hobart Tasmania',
    'sushi Hobart',
    'ramen Hobart',
    'Japanese takeaway Hobart',
    'eat in take away Hobart CBD',
    'RIN restaurant',
    'Japanese chef Hobart',
    '196 Macquarie Street Hobart',
    'Japanese cuisine Tasmania',
    'authentic Japanese food Australia',
  ],

  // Authors & Creator
  authors: [{ name: 'RIN Japanese Restaurant', url: SITE_URL }],
  creator: 'RIN Japanese Restaurant',
  publisher: 'RIN Japanese Restaurant',

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Canonical
  alternates: {
    canonical: SITE_URL,
  },

  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'en_AU',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: 'RIN | Authentic Japanese Restaurant – Hobart, Tasmania',
    description: SITE_DESC,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'RIN Japanese Restaurant Hobart – 196 Macquarie Street',
        type: 'image/png',
      },
    ],
  },

  // Twitter / X
  twitter: {
    card: 'summary_large_image',
    title: 'RIN Japanese Restaurant – Hobart, Tasmania',
    description: SITE_DESC,
    images: [OG_IMAGE],
  },

  // Icons (put Rin_Logo.png in /public/)
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/Rin_Logo.png', type: 'image/png' },
    ],
    apple: '/Rin_Logo.png',
    shortcut: '/Rin_Logo.png',
  },

  // Manifest (optional — create /public/manifest.json for PWA)
  // manifest: '/manifest.json',

  // Verification (add your Google Search Console token here)
  // verification: { google: 'YOUR_TOKEN' },

  // Category
  category: 'restaurant',
};

// ── JSON-LD Structured Data ───────────────────────────────
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Restaurant',
  '@id': `${SITE_URL}/#restaurant`,
  name: 'RIN Japanese Restaurant',
  alternateName: 'RIN – Japanese Food Eat In & Take Away',
  description: 'Authentic Japanese cuisine crafted by Japanese chefs in Hobart, Tasmania. Eat in or take away.',
  url: SITE_URL,
  telephone: '+61427634574',
  email: 'rintasmania2012@yahoo.com.au',
  priceRange: '$$',
  servesCuisine: ['Japanese', 'Sushi', 'Ramen', 'Tempura'],
  hasMenu: `${SITE_URL}/menu`,
  acceptsReservations: 'True',

  address: {
    '@type': 'PostalAddress',
    streetAddress: '196 Macquarie Street',
    addressLocality: 'Hobart',
    addressRegion: 'TAS',
    postalCode: '7000',
    addressCountry: 'AU',
  },

  geo: {
    '@type': 'GeoCoordinates',
    latitude: -42.8823,
    longitude: 147.3280,
  },

  openingHoursSpecification: [
    // Monday — Closed
    { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Monday', opens: '00:00', closes: '00:00' },
    // Sunday — Closed
    { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Sunday', opens: '00:00', closes: '00:00' },
    // Tue–Sat Lunch
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Tuesday','Wednesday','Thursday','Friday','Saturday'], opens: '11:30', closes: '14:30' },
    // Tue–Sat Dinner
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Tuesday','Wednesday','Thursday','Friday','Saturday'], opens: '17:00', closes: '20:30' },
  ],

  sameAs: [
    'https://www.facebook.com/rintasmania/',
  ],

  image: OG_IMAGE,
  logo: `${SITE_URL}/Rin_Logo.png`,

  // Aggregate rating (update with real values)
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    reviewCount: '124',
    bestRating: '5',
    worstRating: '1',
  },
};

// ── Root Layout ───────────────────────────────────────────
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU" className="h-full scroll-smooth">
      <head>
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://maps.googleapis.com" />
        <link rel="preconnect" href="https://maps.gstatic.com" crossOrigin="" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />

        {/* JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${jakartaSans.variable} font-sans antialiased bg-white text-slate-600 min-h-full flex flex-col`}
      >
        <Providers>
          <div className="flex-grow">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
