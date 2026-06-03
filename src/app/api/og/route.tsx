import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get('title') || 'EduPlatform by Boxspox';
    const desc = searchParams.get('desc') || 'Master Web Development and Coding Interactive Courses.';
    const category = searchParams.get('category') || 'Course';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            backgroundColor: '#0f172a',
            padding: '80px 100px',
            fontFamily: 'sans-serif',
          }}
        >
          {/* Background Elements */}
          <div
            style={{
              position: 'absolute',
              top: '-10%',
              right: '-5%',
              width: '600px',
              height: '600px',
              backgroundColor: 'rgba(16, 185, 129, 0.2)', // brand primary blur
              filter: 'blur(100px)',
              borderRadius: '50%',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-10%',
              left: '-10%',
              width: '500px',
              height: '500px',
              backgroundColor: 'rgba(59, 130, 246, 0.2)', // blue blur
              filter: 'blur(100px)',
              borderRadius: '50%',
            }}
          />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              border: '2px solid rgba(16, 185, 129, 0.5)',
              color: '#10b981',
              padding: '12px 24px',
              borderRadius: '100px',
              fontSize: 32,
              fontWeight: 800,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginBottom: 40,
            }}
          >
            {category}
          </div>

          <h1
            style={{
              fontSize: 80,
              fontWeight: 900,
              color: 'white',
              lineHeight: 1.1,
              marginBottom: 30,
              maxWidth: '900px',
            }}
          >
            {title}
          </h1>

          <p
            style={{
              fontSize: 36,
              color: '#94a3b8',
              lineHeight: 1.4,
              maxWidth: '900px',
              fontWeight: 500,
              marginBottom: 60,
            }}
          >
            {desc}
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: 'auto',
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                backgroundColor: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 24,
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m8 3 4 8 5-5 5 15H2L8 3z"/>
              </svg>
            </div>
            <span style={{ fontSize: 40, fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>
              Boxspox
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.error(e.message);
    return new Response('Failed to generate image', { status: 500 });
  }
}
