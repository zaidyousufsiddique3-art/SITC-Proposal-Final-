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
        <a
          href="https://sitc-proposal-final.vercel.app/"
          style={{
            pointerEvents: 'auto',
            textDecoration: 'none',
            padding: '10px 16px',
            borderRadius: '999px',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.14)',
            color: 'white',
            fontWeight: 600,
            backdropFilter: 'blur(10px)'
          }}
        >
          Sign In
        </a>
      </div>
    </div>
  );
}
