import { Link } from 'react-router-dom';
import Antigravity from './Antigravity';

export default function HeroAntigravity() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden', background: '#05060a' }}>
      {/* Canvas layer */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <Antigravity
          count={300}
          magnetRadius={6}
          ringRadius={7}
          waveSpeed={0.4}
          waveAmplitude={1}
          particleSize={1.5}
          lerpSpeed={0.05}
          color="#0a62f0"
          autoAnimate
          particleVariance={1}
          rotationSpeed={0}
          depthFactor={1}
          pulseSpeed={3}
          particleShape="capsule"
          fieldStrength={10}
        />
      </div>

      {/* Premium overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(60% 60% at 50% 30%, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0) 45%), linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.85) 100%)'
        }}
      />

      {/* Top navigation bar */}
      <nav
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 20,
          padding: '20px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/sitc_logo_final.png" alt="SITC" style={{ height: 60, objectFit: 'contain', opacity: 0.9 }} />
        </div>
        <Link
          to="/login"
          style={{
            pointerEvents: 'auto',
            textDecoration: 'none',
            padding: '10px 28px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #0a62f0, #5fa9ff)',
            color: 'white',
            fontWeight: 600,
            fontSize: '0.85rem',
            letterSpacing: '0.03em',
            transition: 'all 0.25s ease',
            boxShadow: '0 4px 20px rgba(10, 98, 240, 0.3)',
          }}
        >
          Sign In
        </Link>
      </nav>

      {/* Center hero content */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          padding: '0 24px',
          textAlign: 'center',
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 16px',
            borderRadius: 999,
            background: 'rgba(10, 98, 240, 0.12)',
            border: '1px solid rgba(10, 98, 240, 0.2)',
            marginBottom: 32,
            fontSize: '0.8rem',
            color: '#5fa9ff',
            fontWeight: 500,
            letterSpacing: '0.04em',
          }}
        >
          ✦ Premium Corporate Travel Solutions
        </div>

        {/* Title */}
        <h1
          style={{
            fontFamily: 'Montserrat, system-ui, sans-serif',
            fontSize: 'clamp(2.2rem, 5vw, 4rem)',
            fontWeight: 800,
            color: 'white',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            margin: 0,
            textShadow: '0 0 60px rgba(10,98,240,0.25)',
            maxWidth: 700,
          }}
        >
          Travel Proposal Portal
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: 'clamp(1rem, 1.5vw, 1.2rem)',
            color: 'rgba(255,255,255,0.55)',
            marginTop: 20,
            maxWidth: 520,
            lineHeight: 1.6,
            fontWeight: 400,
          }}
        >
          Create professional travel proposals in minutes.
          Designed for corporate travel teams to build, manage,
          and deliver premium experiences.
        </p>

        {/* CTA Buttons */}
        <div
          style={{
            marginTop: 40,
            pointerEvents: 'auto',
          }}
        >
          <Link
            to="/login"
            style={{
              textDecoration: 'none',
              padding: '14px 36px',
              borderRadius: 12,
              background: 'linear-gradient(135deg, #0a62f0, #5fa9ff)',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.95rem',
              letterSpacing: '0.02em',
              transition: 'all 0.25s ease',
              boxShadow: '0 8px 30px rgba(10, 98, 240, 0.35)',
            }}
          >
            Get Started →
          </Link>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 120,
          background: 'linear-gradient(transparent, #05060a)',
          zIndex: 5,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
