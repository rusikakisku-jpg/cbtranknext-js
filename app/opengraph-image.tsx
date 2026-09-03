import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const alt = 'CBT RANK - Answer Key Calculator & Rank Predictor';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: 'linear-gradient(135deg, #0044cc 0%, #0b69ff 60%, #003399 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background subtle grid pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.06) 0%, transparent 50%)',
          }}
        />

        {/* Top badge */}
        <div
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '32px',
            padding: '8px 24px',
            color: '#ffffff',
            fontSize: '18px',
            fontWeight: 700,
            letterSpacing: '2px',
            marginBottom: '28px',
            display: 'flex',
          }}
        >
          🎯 FREE · INSTANT · ACCURATE
        </div>

        {/* Main title */}
        <div
          style={{
            color: '#ffffff',
            fontSize: '72px',
            fontWeight: 900,
            lineHeight: 1.1,
            textAlign: 'center',
            marginBottom: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <span>CBT RANK</span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            color: 'rgba(255,255,255,0.9)',
            fontSize: '28px',
            fontWeight: 600,
            textAlign: 'center',
            marginBottom: '40px',
            display: 'flex',
          }}
        >
          Answer Key Calculator &amp; Rank Predictor
        </div>

        {/* Feature pills row */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {['📋 Paste Response Sheet URL', '⚡ Instant Score', '🏆 Shift Rank', '📊 Category Rank'].map((item) => (
            <div
              key={item}
              style={{
                background: 'rgba(255,255,255,0.18)',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: '12px',
                padding: '10px 20px',
                color: '#ffffff',
                fontSize: '20px',
                fontWeight: 600,
                display: 'flex',
              }}
            >
              {item}
            </div>
          ))}
        </div>

        {/* Bottom domain */}
        <div
          style={{
            position: 'absolute',
            bottom: '28px',
            color: 'rgba(255,255,255,0.6)',
            fontSize: '18px',
            fontWeight: 500,
            display: 'flex',
          }}
        >
          cbtrank.com · For SSC, RRB, Railway &amp; State Exams
        </div>
      </div>
    ),
    { ...size }
  );
}
