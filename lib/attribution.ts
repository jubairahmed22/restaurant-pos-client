'use client';

// ─── Attribution tracking — first-touch UTM capture ──────────────────────────
// Stores source/medium/campaign in sessionStorage on first page load.
// Retrieved and sent with every order submission for attribution reporting.

const KEY = 'rin_attr';

export interface Attribution {
  source:      string;
  medium:      string;
  campaign:    string;
  referrer:    string;
  landingPage: string;
  capturedAt:  string;
}

export function captureAttribution(): void {
  if (typeof window === 'undefined') return;
  if (sessionStorage.getItem(KEY)) return; // first-touch only

  const params   = new URLSearchParams(window.location.search);
  const referrer = document.referrer;

  let source = params.get('utm_source') || '';
  if (!source && referrer) {
    try { source = new URL(referrer).hostname.replace(/^www\./, ''); } catch { source = 'referral'; }
  }
  if (!source) source = 'direct';

  const attr: Attribution = {
    source,
    medium:      params.get('utm_medium')   || '',
    campaign:    params.get('utm_campaign') || '',
    referrer:    referrer ? new URL(referrer).hostname.replace(/^www\./, '') : '',
    landingPage: window.location.pathname,
    capturedAt:  new Date().toISOString(),
  };

  sessionStorage.setItem(KEY, JSON.stringify(attr));
}

export function getAttribution(): Attribution | null {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch { return null; }
}
