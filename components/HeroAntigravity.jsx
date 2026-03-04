import { Link } from 'react-router-dom';
import Antigravity from './Antigravity';

export default function HeroAntigravity() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden', background: '#05050a' }}>
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
            'radial-gradient(60% 60% at 50% 30%, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0) 45%), linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.85) 100%)'
        }}
      />

      {/* Center branding */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none'
        }}
      >
        <img src="/sitc_logo_final.png" alt="SITC" style={{ height: 120, objectFit: 'contain', marginBottom: 24, opacity: 0.95 }} />
        <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '2.6rem', fontWeight: 700, color: 'white', letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0, textShadow: '0 2px 30px rgba(0,0,0,0.6)' }}>
          Travel Proposal Portal
        </h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', color: 'rgba(255,255,255,0.5)', marginTop: 12, letterSpacing: '0.06em' }}>
          Premium Corporate Travel Solutions
        </p>
      </div>

      {/* Top bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          padding: '18px 22px',
          display: 'flex',
          justifyContent: 'flex-end'
        }}
      >
        <Link
          to="/login"
          style={{
            pointerEvents: 'auto',
            textDecoration: 'none',
            padding: '10px 24px',
            borderRadius: '999px',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.14)',
            color: 'white',
            fontWeight: 600,
            backdropFilter: 'blur(10px)',
            fontSize: '0.9rem',
            letterSpacing: '0.04em',
            transition: 'all 0.2s ease'
          }}
        >
          Sign In →
        </Link>
      </div>
    </div>
  );
}
