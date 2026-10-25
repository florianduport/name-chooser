import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { resolveLocale, translate } from '@/lib/i18n';

export function GET(request: NextRequest) {
  const locale = resolveLocale(request.nextUrl.searchParams.get('lang'));
  const kind = request.nextUrl.searchParams.get('kind') ?? 'home';
  const winner = request.nextUrl.searchParams.get('winner');

  const title = kind === 'result' && winner
    ? winner
    : kind === 'invite'
      ? translate(locale, 'invite.signInTitle')
      : translate(locale, 'landing.headline');
  const description = kind === 'result'
    ? translate(locale, 'shared.description')
    : kind === 'invite'
      ? translate(locale, 'invite.signInDescription')
      : translate(locale, 'meta.description');

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 64,
          color: '#1c1917',
          background: 'linear-gradient(135deg, #fff8ed 0%, #f9eee7 58%, #e4f4fa 100%)',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: 400,
            height: 400,
            borderRadius: 999,
            right: -120,
            top: -190,
            background: '#f7cbd2',
            opacity: 0.72,
          }}
        />
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '50px 58px',
            borderRadius: 44,
            background: 'rgba(255,255,255,0.9)',
            boxShadow: '0 28px 80px rgba(77,48,38,0.16)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div
              style={{
                width: 70,
                height: 70,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 999,
                background: '#1c1917',
                color: 'white',
                fontSize: 38,
              }}
            >
              <svg width="42" height="42" viewBox="0 0 64 64" aria-hidden="true">
                <path fill="#fff" d="M32 49.2 15.8 34.7C6.4 26.3 12.2 14 22.3 14c4.1 0 7.8 2.2 9.7 5.6A11.1 11.1 0 0 1 41.7 14c10.1 0 15.9 12.3 6.5 20.7L32 49.2Z" />
              </svg>
            </div>
            <div style={{ fontSize: 34, fontWeight: 700 }}>LeBabyName</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 940 }}>
            {kind === 'result' && (
              <div style={{ color: '#78716c', fontSize: 22, fontWeight: 700, letterSpacing: 4, marginBottom: 14 }}>
                {translate(locale, 'shared.label').toUpperCase()}
              </div>
            )}
            <div style={{ fontFamily: 'Georgia, serif', fontSize: winner ? 104 : 72, lineHeight: 1.02, letterSpacing: -3 }}>
              {title}
            </div>
            <div style={{ marginTop: 24, maxWidth: 850, color: '#57534e', fontSize: 28, lineHeight: 1.35 }}>
              {description}
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
