import { ImageResponse } from 'next/og';

export const runtime = 'edge';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://rinrestaurant.com.au';

export async function GET() {
  // Fetch the logo as a data URL so it can be embedded in the edge response
  const logoUrl = `${SITE_URL}/Rin_Logo.png`;
  let logoData: string | undefined;
  try {
    const res = await fetch(logoUrl);
    if (res.ok) {
      const buf = await res.arrayBuffer();
      logoData = `data:image/png;base64,${Buffer.from(buf).toString('base64')}`;
    }
  } catch {
    // logo fetch failed — render text fallback below
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1B3A6B 0%, #0a1e3d 100%)',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle dot pattern */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

        {/* Warm accent bar top */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: '6px',
          background: 'linear-gradient(90deg, #C05428, #e07040, #C05428)',
        }} />

        {/* Main content */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', zIndex: 1, padding: '0 80px' }}>

          {/* Logo image */}
          {logoData ? (
            <img
              src={logoData}
              width={340}
              height={197}
              style={{ objectFit: 'contain', filter: 'drop-shadow(0 4px 24px rgba(0,0,0,0.5))' }}
            />
          ) : (
            <span style={{ fontSize: '96px', fontWeight: 900, color: '#ffffff', letterSpacing: '0.3em' }}>
              RIN
            </span>
          )}

          {/* Divider */}
          <div style={{ width: '120px', height: '2px', background: '#C05428', borderRadius: '2px' }} />

          {/* Tagline */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '28px', color: 'rgba(255,255,255,0.92)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Japanese Restaurant
            </span>
            <span style={{ fontSize: '20px', color: 'rgba(255,255,255,0.6)', fontWeight: 400 }}>
              Eat In &amp; Take Away · Hobart, Tasmania
            </span>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          position: 'absolute', bottom: '0', left: '0', right: '0',
          height: '72px',
          background: 'rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '48px',
        }}>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '16px' }}>
            📍 196 Macquarie Street, Hobart TAS 7000
          </span>
          <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '16px' }}>·</span>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '16px' }}>
            📞 +61 427 634 574
          </span>
        </div>

        {/* Warm accent bar bottom */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #C05428, #e07040, #C05428)',
        }} />
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
