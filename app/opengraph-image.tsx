import { ImageResponse } from 'next/og';

// Image metadata
export const alt = 'My E-commerce - Product Catalog Management';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

// Image generation
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          position: 'relative',
        }}
      >
        {/* Background pattern */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            opacity: 0.1,
            display: 'flex',
            flexWrap: 'wrap',
          }}
        >
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              style={{
                width: '120px',
                height: '120px',
                margin: '20px',
                border: '2px solid white',
                borderRadius: '12px',
              }}
            />
          ))}
        </div>

        {/* Shopping cart icon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '40px',
          }}
        >
          <svg
            width="160"
            height="160"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="32" cy="32" r="32" fill="white" fillOpacity="0.2" />
            <g transform="translate(13, 13)">
              <path
                d="M1 10 L6 10 L10 25 L35 25 L39 12 L11 12"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <circle cx="14" cy="33" r="3" fill="white" />
              <circle cx="31" cy="33" r="3" fill="white" />
              <line
                x1="1"
                y1="10"
                x2="1"
                y2="2"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </g>
          </svg>
        </div>

        {/* Main text */}
        <div
          style={{
            display: 'flex',
            fontSize: '72px',
            fontWeight: 'bold',
            letterSpacing: '-0.025em',
            marginBottom: '20px',
          }}
        >
          My E-commerce
        </div>

        {/* Subtitle */}
        <div
          style={{
            display: 'flex',
            fontSize: '36px',
            opacity: 0.9,
            fontWeight: '400',
          }}
        >
          Product Catalog Management System
        </div>

        {/* Bottom badge */}
        <div
          style={{
            position: 'absolute',
            bottom: '60px',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            padding: '20px 40px',
            background: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '50px',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div style={{ display: 'flex', fontSize: '28px' }}>
            🚀 Fast • 📦 Organized • 💎 Professional
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
