import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
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
          background: 'linear-gradient(135deg, #1B3A6B 0%, #0f2447 100%)',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Background pattern */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.05,
          backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', zIndex: 1 }}>
          {/* Restaurant Name */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '96px', fontWeight: 900, color: '#ffffff', letterSpacing: '0.3em' }}>
              RIN
            </span>
            <span style={{ fontSize: '22px', color: '#F59E0B', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              Japanese Restaurant
            </span>
          </div>

          {/* Divider */}
          <div style={{ width: '120px', height: '2px', background: '#F59E0B', borderRadius: '2px' }} />

          {/* Tagline */}
          <span style={{ fontSize: '20px', color: 'rgba(255,255,255,0.8)', fontWeight: 400 }}>
            Eat In &amp; Take Away · Hobart, Tasmania
          </span>

          {/* Address */}
          <span style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}>
            196 Macquarie Street, Hobart TAS 7000
          </span>
        </div>

        {/* Bottom badge */}
        <div style={{
          position: 'absolute', bottom: '32px',
          display: 'flex', gap: '32px', alignItems: 'center',
        }}>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>
            +61 427 634 574
          </span>
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '14px' }}>·</span>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>
            rintasmania2012@yahoo.com.au
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
