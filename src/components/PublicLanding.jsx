import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// ── Hooks ─────────────────────────────────────────────────────────────────────
function useScrollReveal(threshold = 0.1) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { threshold });
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function useCountUp(target, duration = 1800, active = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [active, target, duration]);
  return count;
}

function useMouseParallax() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handle = (e) => {
      setPos({ x: (e.clientX / window.innerWidth - 0.5) * 2, y: (e.clientY / window.innerHeight - 0.5) * 2 });
    };
    window.addEventListener('mousemove', handle);
    return () => window.removeEventListener('mousemove', handle);
  }, []);
  return pos;
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar({ navigate }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? 'rgba(8,18,35,0.88)' : 'rgba(8,18,35,0.2)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      borderBottom: scrolled ? '1px solid rgba(77,255,243,0.08)' : '1px solid transparent',
      transition: 'all 0.4s ease', fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: '#4DFFF3', letterSpacing: '-0.5px' }}>Codify</span>
          <span style={{ fontSize: 9, fontWeight: 700, color: '#4DFFF3', border: '1px solid rgba(77,255,243,0.4)', borderRadius: 4, padding: '2px 6px', letterSpacing: '0.1em' }}>BETA</span>
        </div>

        <div style={{ display: 'flex', gap: 36 }} className="nav-desktop">
          {[['how-it-works','How It Works'],['features','Features'],['pricing','Pricing'],['faq','FAQ']].map(([id, label]) => (
            <button key={id} onClick={() => scrollTo(id)} style={{ background: 'none', border: 'none', fontSize: 14, color: 'rgba(250,250,250,0.7)', cursor: 'pointer', transition: 'color 0.2s', fontFamily: "'Inter', sans-serif" }}
              onMouseEnter={e => e.target.style.color = '#FAFAFA'}
              onMouseLeave={e => e.target.style.color = 'rgba(250,250,250,0.7)'}>
              {label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10 }} className="nav-desktop">
          <button onClick={() => navigate('/sign-in')} style={{ background: 'transparent', border: '1px solid rgba(250,250,250,0.2)', borderRadius: 8, padding: '8px 20px', color: 'rgba(250,250,250,0.8)', fontSize: 14, cursor: 'pointer', transition: 'all 0.2s', fontFamily: "'Inter', sans-serif" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(77,255,243,0.5)'; e.currentTarget.style.color = '#FAFAFA'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(250,250,250,0.2)'; e.currentTarget.style.color = 'rgba(250,250,250,0.8)'; }}>
            Sign In
          </button>
          <button onClick={() => navigate('/sign-up')} style={{ background: '#4DFFF3', border: 'none', borderRadius: 8, padding: '8px 20px', color: '#000814', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.25s', fontFamily: "'Inter', sans-serif" }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 0 24px rgba(77,255,243,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
            Get Started →
          </button>
        </div>

        <button className="nav-mobile" onClick={() => setMobileOpen(!mobileOpen)} style={{ background: 'none', border: 'none', color: '#FAFAFA', cursor: 'pointer', fontSize: 22 }}>
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>

      {mobileOpen && (
        <div style={{ background: 'rgba(8,18,35,0.97)', backdropFilter: 'blur(20px)', padding: '20px 32px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {[['how-it-works','How It Works'],['features','Features'],['pricing','Pricing'],['faq','FAQ']].map(([id, label]) => (
            <button key={id} onClick={() => scrollTo(id)} style={{ background: 'none', border: 'none', fontSize: 16, color: 'rgba(250,250,250,0.8)', cursor: 'pointer', textAlign: 'left', fontFamily: "'Inter', sans-serif" }}>{label}</button>
          ))}
          <button onClick={() => navigate('/sign-up')} style={{ background: '#4DFFF3', border: 'none', borderRadius: 8, padding: '12px', color: '#000814', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>Get Started →</button>
        </div>
      )}
    </nav>
  );
}

// ── Particles Canvas ──────────────────────────────────────────────────────────
function Particles() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    const particles = [];
    const colors = ['#4DFFF3', '#40C8E0', '#5B9FBF', '#A3D5E8'];

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    const init = () => {
      particles.length = 0;
      for (let i = 0; i < 70; i++) {
        particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3 - 0.1, r: Math.random() * 1.5 + 0.5, alpha: Math.random() * 0.35 + 0.05, color: colors[Math.floor(Math.random() * colors.length)] });
      }
    };
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        ctx.save(); ctx.globalAlpha = p.alpha;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color; ctx.fill(); ctx.restore();
        p.x += p.vx; p.y += p.vy;
        if (p.y < -10) p.y = canvas.height + 10;
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
      }
      animId = requestAnimationFrame(draw);
    };
    resize(); init(); draw();
    window.addEventListener('resize', () => { resize(); init(); });
    return () => cancelAnimationFrame(animId);
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2, opacity: 0.6 }} />;
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function Hero({ navigate }) {
  const [loaded, setLoaded] = useState(false);
  const canvasRef = useRef(null);
  const mouse = useMouseParallax();

  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const drawGrain = (ctx, w, h) => {
      const d = ctx.createImageData(w, h);
      for (let i = 0; i < d.data.length; i += 4) {
        const v = Math.random() * 255; d.data[i] = v; d.data[i+1] = v; d.data[i+2] = v; d.data[i+3] = Math.random() * 18 + 4;
      }
      ctx.putImageData(d, 0, 0);
    };
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; drawGrain(ctx, canvas.width, canvas.height); };
    resize(); window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <section id="hero" style={{
      position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden', fontFamily: "'Inter', sans-serif",
      background: `radial-gradient(ellipse 90% 60% at 15% -5%, rgba(163,213,232,0.45) 0%, transparent 55%), radial-gradient(ellipse 50% 35% at 85% 5%, rgba(77,255,243,0.12) 0%, transparent 50%), radial-gradient(ellipse 70% 80% at 50% 100%, rgba(0,8,20,0.9) 0%, transparent 70%), linear-gradient(168deg, #7ECDE8 0%, #4A9EC0 12%, #2A6A8E 28%, #123558 48%, #0A1828 68%, #000814 100%)`,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @keyframes hero-float { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-18px) scale(1.05); } }
        @keyframes hero-fade-up { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
        @keyframes hero-pill-in { from { opacity:0; transform:translateY(16px) scale(0.95); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes dot-pulse { 0%,100% { box-shadow:0 0 6px #4DFFF3; transform:scale(1); } 50% { box-shadow:0 0 14px #4DFFF3,0 0 24px rgba(77,255,243,0.3); transform:scale(1.3); } }
        @keyframes ticker-scroll { from { transform:translateX(0); } to { transform:translateX(-33.333%); } }
        @keyframes fade-slide-in { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse-dot { 0%,100% { transform:scale(1); opacity:1; } 50% { transform:scale(1.5); opacity:0.6; } }
        @keyframes float-blob { 0%,100% { transform:translateY(0) scale(1); } 50% { transform:translateY(-30px) scale(1.05); } }
        @keyframes shimmer { 0% { background-position:-200% center; } 100% { background-position:200% center; } }
        @keyframes spin-slow { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        @keyframes glow-pulse { 0%,100% { opacity:0.4; } 50% { opacity:0.8; } }
        .nav-desktop { display:flex !important; }
        .nav-mobile { display:none !important; }
        @media (max-width:768px) { .nav-desktop { display:none !important; } .nav-mobile { display:flex !important; } }
      `}</style>

      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1, mixBlendMode: 'overlay' }} />
      <Particles />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, rgba(0,8,20,0.65) 100%)', pointerEvents: 'none', zIndex: 3 }} />

      {/* Parallax orbs */}
      <div style={{ position: 'absolute', top: -80, left: -60, width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, rgba(91,159,191,0.25) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 1, animation: 'hero-float 6s ease-in-out infinite', transform: `translate(${mouse.x * 15}px, ${mouse.y * 10}px)` }} />
      <div style={{ position: 'absolute', bottom: '15%', right: '8%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(77,255,243,0.1) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 1, animation: 'hero-float 8s ease-in-out infinite reverse', transform: `translate(${mouse.x * -20}px, ${mouse.y * -15}px)` }} />
      <div style={{ position: 'absolute', top: '30%', right: '20%', width: 150, height: 150, borderRadius: '50%', background: 'radial-gradient(circle, rgba(163,213,232,0.08) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 1, transform: `translate(${mouse.x * 25}px, ${mouse.y * 20}px)` }} />

      <div style={{ position: 'relative', zIndex: 5, maxWidth: 1300, margin: '0 auto', padding: '0 32px', paddingTop: 120, width: '100%' }}>
        <div style={{ position: 'absolute', top: 24, right: 0, fontSize: 11, color: 'rgba(250,250,250,0.2)', fontStyle: 'italic', letterSpacing: '0.02em', lineHeight: 1.7, maxWidth: 220, textAlign: 'right', animation: loaded ? 'hero-fade-up 1.2s ease 1s both' : 'none' }}>
          and how it's a pain<br />they know they don't understand
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: '1px solid rgba(77,255,243,0.3)', borderRadius: 999, padding: '6px 16px', marginBottom: 40, background: 'rgba(77,255,243,0.05)', animation: loaded ? 'hero-pill-in 0.8s ease 0.2s both' : 'none' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4DFFF3', display: 'inline-block', animation: 'dot-pulse 2s ease-in-out infinite' }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(250,250,250,0.75)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Placement Season 2026 · Built for NSUT & DTU
          </span>
        </div>

        <div style={{ marginBottom: 28, animation: loaded ? 'hero-fade-up 0.8s ease 0.35s both' : 'none' }}>
          <h1 style={{ fontSize: 'clamp(48px,8vw,88px)', fontWeight: 900, color: '#FAFAFA', lineHeight: 1.04, letterSpacing: '-0.03em', margin: '0 0 8px' }}>Crack Every OA.</h1>
          <h1 style={{ fontSize: 'clamp(48px,8vw,88px)', fontWeight: 900, lineHeight: 1.04, letterSpacing: '-0.03em', margin: 0, background: 'linear-gradient(90deg, #4DFFF3 0%, #40C8E0 50%, #5B9FBF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Land Every Offer.</h1>
        </div>

        <p style={{ fontSize: 'clamp(15px,2vw,18px)', color: 'rgba(250,250,250,0.55)', lineHeight: 1.7, maxWidth: 520, margin: '0 0 48px', animation: loaded ? 'hero-fade-up 0.8s ease 0.5s both' : 'none' }}>
          Company OA archives, real-time 1v1 coding battles, AI-powered practice, interview experiences, and placement intel — all in one place.
        </p>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', animation: loaded ? 'hero-fade-up 0.8s ease 0.65s both' : 'none' }}>
          <button onClick={() => navigate('/sign-up')} style={{ background: '#4DFFF3', border: 'none', borderRadius: 10, padding: '16px 32px', color: '#000814', fontSize: 15, fontWeight: 700, cursor: 'pointer', transition: 'all 0.25s', minHeight: 52, fontFamily: "'Inter', sans-serif", letterSpacing: '0.01em' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 0 32px rgba(77,255,243,0.45),0 8px 24px rgba(0,0,0,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
            Get Started Free →
          </button>
          <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} style={{ background: 'transparent', border: '1px solid rgba(250,250,250,0.2)', borderRadius: 10, padding: '16px 32px', color: 'rgba(250,250,250,0.8)', fontSize: 15, fontWeight: 500, cursor: 'pointer', transition: 'all 0.25s', minHeight: 52, fontFamily: "'Inter', sans-serif" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(77,255,243,0.4)'; e.currentTarget.style.background = 'rgba(77,255,243,0.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(250,250,250,0.2)'; e.currentTarget.style.background = 'transparent'; }}>
            See Features
          </button>
        </div>

        {/* Hero stats preview */}
        <div style={{ marginTop: 80, display: 'flex', gap: 32, flexWrap: 'wrap', animation: loaded ? 'hero-fade-up 0.8s ease 0.9s both' : 'none' }}>
          {[['500+','OA Questions'],['50+','Companies'],['1K+','Students'],['95%','Success Rate']].map(([val, label]) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: '#FAFAFA', letterSpacing: '-0.04em' }}>{val}</span>
              <span style={{ fontSize: 11, color: 'rgba(176,176,176,0.5)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 200, background: 'linear-gradient(to bottom, transparent 0%, #000814 100%)', pointerEvents: 'none', zIndex: 6 }} />
    </section>
  );
}

// ── Ticker ────────────────────────────────────────────────────────────────────
function Ticker() {
  const items = ['PATAKARO', '✦', 'INTELLICODE', '✦', 'CODECAST BATTLES', '✦', 'OA DISCUSSION', '✦', 'COMPANY INTEL', '✦', 'AI HINTS', '✦', 'MOCK OA', '✦', 'PLACEMENT PREP', '✦'];
  const track = [...items, ...items, ...items];
  return (
    <div style={{ background: '#000814', borderTop: '1px solid rgba(77,255,243,0.08)', borderBottom: '1px solid rgba(77,255,243,0.08)', overflow: 'hidden', padding: '14px 0', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: 'flex', whiteSpace: 'nowrap', animation: 'ticker-scroll 30s linear infinite' }}>
        {track.map((item, i) => (
          <span key={i} style={{ padding: '0 20px', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: item === '✦' ? 'rgba(77,255,243,0.4)' : 'rgba(176,176,176,0.45)', textTransform: 'uppercase' }}>{item}</span>
        ))}
      </div>
    </div>
  );
}

// ── Stats ─────────────────────────────────────────────────────────────────────
function Stats() {
  const { ref, visible } = useScrollReveal(0.15);
  const statsData = [
    { value: 500, suffix: '+', label: 'OA Questions', desc: 'From real company assessments' },
    { value: 50, suffix: '+', label: 'Companies', desc: 'FAANG to top Indian product cos' },
    { value: 1000, suffix: '+', label: 'Students', desc: 'NSUT & DTU placements helped' },
    { value: 95, suffix: '%', label: 'Satisfaction', desc: "Students who'd recommend Codify" },
  ];

  return (
    <section ref={ref} style={{ background: '#000814', padding: '0 32px 80px', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 1300, margin: '0 auto' }}>
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(77,255,243,0.09)', borderRadius: 24, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
          {statsData.map((stat, i) => {
            const count = useCountUp(stat.value, 1600, visible);
            return (
              <div key={i} style={{ padding: '44px 32px', borderRight: i < 3 ? '1px solid rgba(77,255,243,0.07)' : 'none', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)', transition: `opacity 0.6s ease ${i * 0.1}s, transform 0.6s ease ${i * 0.1}s`, cursor: 'default' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(77,255,243,0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ fontSize: 'clamp(36px,4vw,56px)', fontWeight: 900, color: '#FAFAFA', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 10 }}>
                  {count >= 1000 ? `${(count/1000).toFixed(0)}K` : count}{stat.suffix}
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#4DFFF3', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>{stat.label}</div>
                <div style={{ fontSize: 13, color: 'rgba(176,176,176,0.55)', lineHeight: 1.5 }}>{stat.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── Features ──────────────────────────────────────────────────────────────────
function CodeVisual() {
  const lines = [
    '// PataKaro — Google SDE Intern OA 2026',
    'function maxProfit(prices) {',
    '  let min = Infinity, profit = 0;',
    '  for (const p of prices) {',
    '    if (p < min) min = p;',
    '    else if (p - min > profit)',
    '      profit = p - min;',
    '  }',
    '  return profit;',
    '}',
    '',
    '// ✓ Passed 212/212 test cases',
    '// Time: O(n)  Space: O(1)',
  ];
  return (
    <div style={{ background: 'rgba(8,18,35,0.9)', border: '1px solid rgba(77,255,243,0.15)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
      <div style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(77,255,243,0.08)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF5F57' }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FFBD2E' }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#28CA41' }} />
        <span style={{ marginLeft: 12, fontSize: 11, color: 'rgba(176,176,176,0.5)', letterSpacing: '0.05em' }}>solution.js</span>
      </div>
      <div style={{ padding: '20px 24px' }}>
        {lines.map((line, i) => (
          <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 2 }}>
            <span style={{ fontSize: 12, color: 'rgba(176,176,176,0.25)', minWidth: 20, textAlign: 'right', userSelect: 'none' }}>{i + 1}</span>
            <span style={{ fontSize: 13, lineHeight: 1.65, fontFamily: "'Courier New', monospace", color: line.startsWith('//') ? 'rgba(77,255,243,0.5)' : line.includes('function') || line.includes('const') || line.includes('let') || line.includes('for') || line.includes('if') || line.includes('return') ? '#9DEDFF' : line.includes('✓') ? '#4DFFF3' : '#DADADA' }}>
              {line || '\u00A0'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CodeCastVisual() {
  const [active, setActive] = useState(0);
  const steps = [
    { step: '01', title: 'Challenge created', desc: 'Pick a question and share room code' },
    { step: '02', title: 'Battle starts', desc: 'Live code sync — see opponent typing' },
    { step: '03', title: 'Winner announced', desc: 'Most test cases passed wins' },
  ];
  useEffect(() => {
    const t = setInterval(() => setActive(a => (a + 1) % 3), 2000);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ background: 'rgba(8,18,35,0.8)', border: '1px solid rgba(64,200,224,0.15)', borderRadius: 20, padding: 28, boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: '#40C8E0', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 8 }}>⚔️ CODECAST · LIVE 1v1 BATTLE</div>
        <div style={{ fontSize: 15, color: '#FAFAFA', marginBottom: 4 }}>Two Sum — Easy</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4DFFF3', animation: 'dot-pulse 1.5s ease-in-out infinite' }} />
          <span style={{ fontSize: 12, color: 'rgba(176,176,176,0.5)' }}>2 players · 15:23 remaining</span>
        </div>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 4, height: 4, marginBottom: 24, overflow: 'hidden' }}>
        <div style={{ width: '42%', height: '100%', background: 'linear-gradient(90deg, #4DFFF3, #40C8E0)', borderRadius: 4 }} />
      </div>
      {steps.map((s, i) => (
        <div key={i} onClick={() => setActive(i)} style={{ display: 'flex', gap: 16, padding: '12px 16px', borderRadius: 10, cursor: 'pointer', background: active === i ? 'rgba(64,200,224,0.08)' : 'transparent', border: active === i ? '1px solid rgba(64,200,224,0.2)' : '1px solid transparent', marginBottom: 8, transition: 'all 0.2s' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: active === i ? '#40C8E0' : 'rgba(176,176,176,0.4)', letterSpacing: '0.05em', paddingTop: 2 }}>{s.step}</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: active === i ? '#FAFAFA' : 'rgba(250,250,250,0.6)', marginBottom: 2 }}>{s.title}</div>
            <div style={{ fontSize: 12, color: 'rgba(176,176,176,0.5)' }}>{s.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function IntelliCodeVisual() {
  const questions = [
    { name: 'Two Sum', diff: 'Easy', color: '#20c997', company: 'Google' },
    { name: 'Merge K Sorted Lists', diff: 'Hard', color: '#ef4444', company: 'Microsoft' },
    { name: 'LRU Cache', diff: 'Medium', color: '#f59e0b', company: 'Amazon' },
  ];
  return (
    <div style={{ background: 'rgba(8,18,35,0.8)', border: '1px solid rgba(91,159,191,0.15)', borderRadius: 20, padding: 24, boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
      <div style={{ fontSize: 11, color: 'rgba(176,176,176,0.5)', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 20 }}>INTELLICODE · DSA PRACTICE</div>
      {questions.map((q, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, marginBottom: 10, transition: 'all 0.2s', cursor: 'pointer' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = `${q.color}30`; e.currentTarget.style.background = 'rgba(77,255,243,0.03)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#FAFAFA', marginBottom: 3 }}>{q.name}</div>
            <div style={{ fontSize: 11, color: 'rgba(176,176,176,0.5)' }}>{q.company}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: q.color }}>{q.diff}</div>
            <div style={{ fontSize: 11, color: 'rgba(77,255,243,0.4)', marginTop: 2 }}>Solve →</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function DiscussionVisual() {
  const posts = [
    { title: 'Google SDE Intern OA 2026 — DP Questions', votes: 47, company: 'Google', diff: 'Hard' },
    { title: 'Microsoft OA: Array + Graph combo', votes: 32, company: 'Microsoft', diff: 'Medium' },
    { title: 'Goldman Sachs Quant OA breakdown', votes: 28, company: 'Goldman', diff: 'Hard' },
  ];
  return (
    <div style={{ background: 'rgba(8,18,35,0.8)', border: '1px solid rgba(163,213,232,0.15)', borderRadius: 20, padding: 24, boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
      <div style={{ fontSize: 11, color: 'rgba(176,176,176,0.5)', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 20 }}>OA DISCUSSION · COMMUNITY</div>
      {posts.map((p, i) => (
        <div key={i} style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, marginBottom: 10, transition: 'all 0.2s', cursor: 'pointer' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(163,213,232,0.2)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#007BFF', background: 'rgba(0,123,255,0.1)', padding: '2px 8px', borderRadius: 4 }}>{p.company}</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: p.diff === 'Hard' ? '#ef4444' : '#f59e0b', background: p.diff === 'Hard' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)', padding: '2px 8px', borderRadius: 4 }}>{p.diff}</span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#FAFAFA', marginBottom: 6, lineHeight: 1.4 }}>{p.title}</div>
          <div style={{ fontSize: 11, color: '#4DFFF3' }}>▲ {p.votes} upvotes</div>
        </div>
      ))}
    </div>
  );
}

function Features() {
  const { ref, visible } = useScrollReveal(0.05);
  const features = [
    { tag: 'PATAKARO', title: 'Every company.\nEvery OA detail.', subtitle: 'Browse 500+ real OA questions from Google, Microsoft, Amazon, and 50+ more — sorted by company, topic, and difficulty. Submitted by NSUT & DTU seniors who sat the actual assessments.', cta: 'Browse PataKaro →', visual: 'code', align: 'left', color: '#4DFFF3' },
    { tag: 'CODECAST · LIVE BATTLES', title: '1v1 coding battles,\nin real-time.', subtitle: 'Challenge a friend to a live 1v1 coding battle. Pick a question, share the room code, code simultaneously, and see who passes more test cases. Real pressure, real improvement.', cta: 'Start a Battle →', visual: 'cast', align: 'right', color: '#40C8E0' },
    { tag: 'INTELLICODE', title: 'Practice DSA\nwith context.', subtitle: 'Every question comes with full context — company, difficulty, topics, and CodeCast walkthroughs. Learn how to think, not just what to copy. AI hints to nudge you in the right direction.', cta: 'Practice Now →', visual: 'intellicode', align: 'left', color: '#5B9FBF' },
    { tag: 'OA DISCUSSION', title: 'Community-driven\nOA intelligence.', subtitle: 'Share and discover OA experiences from real students. Upvote the best insights, earn points for contributing, and climb the leaderboard. Knowledge shared is knowledge multiplied.', cta: 'Join Discussion →', visual: 'discussion', align: 'right', color: '#A3D5E8' },
  ];

  return (
    <section id="features" ref={ref} style={{ background: '#000814', padding: '80px 32px 120px', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 1300, margin: '0 auto' }}>
        <div style={{ marginBottom: 80, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.6s ease, transform 0.6s ease' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#4DFFF3', letterSpacing: '0.12em', textTransform: 'uppercase' }}>What we built</span>
        </div>

        {features.map((feat, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center', marginBottom: i < features.length - 1 ? 120 : 0, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(40px)', transition: `opacity 0.7s ease ${0.1 + i * 0.15}s, transform 0.7s ease ${0.1 + i * 0.15}s` }} className="feature-row">
            <div style={{ order: feat.align === 'right' ? 2 : 1 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: feat.color, letterSpacing: '0.14em', textTransform: 'uppercase', display: 'block', marginBottom: 20 }}>{feat.tag}</span>
              <h2 style={{ fontSize: 'clamp(28px,3.5vw,44px)', fontWeight: 800, color: '#FAFAFA', lineHeight: 1.1, letterSpacing: '-0.02em', margin: '0 0 24px', whiteSpace: 'pre-line' }}>{feat.title}</h2>
              <p style={{ fontSize: 16, color: 'rgba(176,176,176,0.75)', lineHeight: 1.75, margin: '0 0 32px', maxWidth: 460 }}>{feat.subtitle}</p>
              <a href="#" style={{ fontSize: 14, fontWeight: 600, color: feat.color, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'gap 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.gap = '10px'}
                onMouseLeave={e => e.currentTarget.style.gap = '6px'}>
                {feat.cta}
              </a>
            </div>
            <div style={{ order: feat.align === 'right' ? 1 : 2 }}>
              {feat.visual === 'code' && <CodeVisual />}
              {feat.visual === 'cast' && <CodeCastVisual />}
              {feat.visual === 'intellicode' && <IntelliCodeVisual />}
              {feat.visual === 'discussion' && <DiscussionVisual />}
            </div>
          </div>
        ))}
      </div>
      <style>{`.feature-row { @media (max-width:768px) { grid-template-columns:1fr !important; } }`}</style>
    </section>
  );
}

// ── How It Works ──────────────────────────────────────────────────────────────
function HowItWorks() {
  const { ref, visible } = useScrollReveal(0.1);
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    { num: '01', title: 'Find your OA', subtitle: 'Discover your company', desc: 'Search our archive of 500+ real OA questions by company, year, or topic. Filter for exactly what you need.', color: '#4DFFF3', detail: 'Smart search · Filter by role · Sort by difficulty' },
    { num: '02', title: 'Practice with intent', subtitle: 'Actually understand it', desc: 'Solve questions with AI hints, view CodeCast walkthroughs, and battle friends in live 1v1 CodeCast matches.', color: '#40C8E0', detail: 'CodeCast walkthroughs · AI hints · Live battles' },
    { num: '03', title: 'Study company intel', subtitle: 'Know before you go', desc: 'Dive into placement intel — interview rounds, cut-off trends, HR patterns, shared by students who made it through.', color: '#5B9FBF', detail: 'Round breakdown · HR patterns · Cut-offs' },
    { num: '04', title: 'Land the offer', subtitle: 'Walk in with confidence', desc: 'Show up overprepared. Share your experience, earn points, help juniors, and pay it forward.', color: '#A3D5E8', detail: 'Mock OAs · Progress tracking · Community' },
  ];

  useEffect(() => {
    if (!visible) return;
    const t = setInterval(() => setActiveStep(s => (s + 1) % steps.length), 3200);
    return () => clearInterval(t);
  }, [visible]);

  return (
    <section id="how-it-works" ref={ref} style={{ background: '#000814', padding: '100px 32px', fontFamily: "'Inter', sans-serif", position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '10%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(77,255,243,0.04) 0%, transparent 70%)', pointerEvents: 'none', animation: 'float-blob 8s ease-in-out infinite' }} />

      <div style={{ maxWidth: 1300, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 64, flexWrap: 'wrap', gap: 24, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)', transition: 'opacity 0.6s ease, transform 0.6s ease' }}>
          <div>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#4DFFF3', letterSpacing: '0.14em', textTransform: 'uppercase', display: 'block', marginBottom: 16 }}>The workflow</span>
            <h2 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 900, color: '#FAFAFA', letterSpacing: '-0.025em', lineHeight: 1.08, margin: 0 }}>
              From zero to offer,<br />
              <span style={{ background: 'linear-gradient(90deg, #4DFFF3 0%, #40C8E0 60%, #5B9FBF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>step by step.</span>
            </h2>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {steps.map((s, i) => (
              <button key={i} onClick={() => setActiveStep(i)} style={{ width: activeStep === i ? 28 : 8, height: 8, borderRadius: 999, border: 'none', background: activeStep === i ? s.color : 'rgba(255,255,255,0.15)', cursor: 'pointer', transition: 'all 0.35s ease', padding: 0, boxShadow: activeStep === i ? `0 0 10px ${s.color}` : 'none' }} />
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }} className="hiw-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {steps.map((step, i) => (
              <div key={i} onClick={() => setActiveStep(i)} style={{ cursor: 'pointer', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(40px)', transition: `opacity 0.6s ease ${i * 0.15}s, transform 0.6s ease ${i * 0.15}s` }}>
                <div style={{ background: activeStep === i ? 'rgba(77,255,243,0.05)' : 'rgba(255,255,255,0.02)', border: `1px solid ${activeStep === i ? `${step.color}40` : 'rgba(255,255,255,0.06)'}`, borderRadius: 20, padding: '28px 24px', transition: 'all 0.35s ease', boxShadow: activeStep === i ? `0 0 40px ${step.color}12,0 16px 48px rgba(0,0,0,0.4)` : '0 8px 24px rgba(0,0,0,0.2)', position: 'relative' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: activeStep === i ? step.color : 'rgba(176,176,176,0.3)', letterSpacing: '0.12em', marginBottom: 16 }}>STEP {step.num}</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: '#FAFAFA', marginBottom: 6 }}>{step.title}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: activeStep === i ? step.color : 'rgba(176,176,176,0.4)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>{step.subtitle}</div>
                  <p style={{ fontSize: 13, color: 'rgba(176,176,176,0.65)', lineHeight: 1.7, margin: 0 }}>{step.desc}</p>
                  {activeStep === i && (
                    <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {step.detail.split(' · ').map(d => (
                        <span key={d} style={{ fontSize: 10, fontWeight: 600, color: step.color, background: `${step.color}12`, border: `1px solid ${step.color}25`, borderRadius: 999, padding: '3px 10px' }}>{d}</span>
                      ))}
                    </div>
                  )}
                  {activeStep === i && <div style={{ position: 'absolute', top: -1, right: -1, width: 8, height: 8, borderRadius: '50%', background: step.color, boxShadow: `0 0 12px ${step.color}`, animation: 'pulse-dot 1.4s ease-in-out infinite' }} />}
                </div>
              </div>
            ))}
          </div>

          {/* Flow Diagram */}
          <div style={{ position: 'sticky', top: 100, opacity: visible ? 1 : 0, transform: visible ? 'translateX(0)' : 'translateX(40px)', transition: 'opacity 0.7s ease 0.3s, transform 0.7s ease 0.3s' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(77,255,243,0.08)', borderRadius: 24, padding: 32, position: 'relative', overflow: 'hidden', minHeight: 480 }}>
              <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(77,255,243,0.03) 1px, transparent 1px),linear-gradient(90deg, rgba(77,255,243,0.03) 1px, transparent 1px)', backgroundSize: '32px 32px', borderRadius: 24, pointerEvents: 'none' }} />
              <svg width="100%" height="480" viewBox="0 0 400 480" style={{ overflow: 'visible' }}>
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4DFFF3" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#5B9FBF" stopOpacity="0.2" />
                  </linearGradient>
                  <filter id="glow2">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>
                {steps.map((step, i) => {
                  const y = 60 + i * 100;
                  const isActive = activeStep === i;
                  const isDone = activeStep > i;
                  return (
                    <g key={i}>
                      {i < steps.length - 1 && (
                        <line x1="200" y1={y + 32} x2="200" y2={y + 68} stroke={isDone ? 'url(#lineGrad)' : 'rgba(255,255,255,0.06)'} strokeWidth="2" strokeDasharray="6 4" style={{ transition: 'stroke 0.4s ease' }} />
                      )}
                      {isActive && <circle cx="200" cy={y} r="44" fill="none" stroke={step.color} strokeWidth="1" opacity="0">
                        <animate attributeName="r" from="32" to="52" dur="1.8s" repeatCount="indefinite" />
                        <animate attributeName="opacity" from="0.4" to="0" dur="1.8s" repeatCount="indefinite" />
                      </circle>}
                      <circle cx="200" cy={y} r="30" fill={isActive ? `${step.color}20` : isDone ? `${step.color}10` : 'rgba(255,255,255,0.03)'} stroke={isActive ? step.color : isDone ? `${step.color}50` : 'rgba(255,255,255,0.08)'} strokeWidth={isActive ? '2' : '1'} filter={isActive ? 'url(#glow2)' : 'none'} style={{ transition: 'all 0.4s ease' }} />
                      {isDone ? <path d={`M${190},${y} L${197},${y+8} L${210},${y-8}`} stroke={step.color} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /> :
                        <text x="200" y={y + 5} textAnchor="middle" fill={isActive ? step.color : 'rgba(176,176,176,0.4)'} fontSize="13" fontWeight="700" style={{ fontFamily: "'Inter', sans-serif" }}>{step.num}</text>}
                      <text x="248" y={y - 6} fill={isActive ? '#FAFAFA' : 'rgba(176,176,176,0.6)'} fontSize="13" fontWeight={isActive ? '700' : '500'} style={{ fontFamily: "'Inter', sans-serif", transition: 'fill 0.3s' }}>{step.title}</text>
                      <text x="248" y={y + 10} fill={isActive ? step.color : 'rgba(176,176,176,0.3)'} fontSize="10" style={{ fontFamily: "'Inter', sans-serif", transition: 'fill 0.3s', letterSpacing: '0.04em' }}>{step.subtitle}</text>
                    </g>
                  );
                })}
              </svg>
              <div style={{ padding: '14px 18px', background: `${steps[activeStep].color}08`, border: `1px solid ${steps[activeStep].color}20`, borderRadius: 12, transition: 'all 0.3s' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: steps[activeStep].color, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Currently: {steps[activeStep].title}</div>
                <div style={{ fontSize: 12, color: 'rgba(176,176,176,0.6)' }}>{steps[activeStep].detail.split(' · ').map(d => `· ${d}`).join('  ')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Comparison ────────────────────────────────────────────────────────────────
function Comparison() {
  const { ref, visible } = useScrollReveal(0.1);
  const [hoveredRow, setHoveredRow] = useState(null);

  const featuresList = [
    'Real company OA questions', 'NSUT & DTU specific content', 'Live 1v1 CodeCast battles',
    'Company placement intel', 'AI-powered hints', 'OA Discussion forum',
    'Mock OA environment', 'Reward points system', 'Student community',
  ];
  const platforms = [
    { name: 'Codify', tag: 'YOU ARE HERE', highlight: true, color: '#4DFFF3', support: [true,true,true,true,true,true,true,true,true] },
    { name: 'LeetCode', tag: 'Generic', highlight: false, color: 'rgba(176,176,176,0.5)', support: [false,false,false,false,true,false,false,false,false] },
    { name: 'InterviewBit', tag: 'Outdated', highlight: false, color: 'rgba(176,176,176,0.5)', support: [false,false,false,false,false,true,false,false,false] },
    { name: 'GFG', tag: 'Generic', highlight: false, color: 'rgba(176,176,176,0.5)', support: [false,false,false,false,false,false,false,false,false] },
  ];

  return (
    <section id="comparison" ref={ref} style={{ background: '#000814', padding: '80px 32px 100px', fontFamily: "'Inter', sans-serif", position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 800, height: 400, background: 'radial-gradient(ellipse, rgba(77,255,243,0.03) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: 56, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)', transition: 'opacity 0.6s ease, transform 0.6s ease' }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#4DFFF3', letterSpacing: '0.14em', textTransform: 'uppercase', display: 'block', marginBottom: 16 }}>Why Codify</span>
          <h2 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 900, color: '#FAFAFA', letterSpacing: '-0.025em', lineHeight: 1.08, margin: '0 auto 16px' }}>
            Built different.<br />
            <span style={{ background: 'linear-gradient(90deg, #4DFFF3 0%, #40C8E0 60%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Not just another platform.</span>
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(176,176,176,0.55)', margin: '0 auto', maxWidth: 420 }}>Generic platforms weren't built for your placement season. We were.</p>
        </div>

        <div style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(40px)', transition: 'opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s', overflowX: 'auto' }}>
          <div style={{ minWidth: 640 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr' }}>
              <div style={{ padding: '16px 20px' }} />
              {platforms.map((p, i) => (
                <div key={i} style={{ padding: '20px 12px 16px', textAlign: 'center', position: 'relative', background: p.highlight ? 'rgba(77,255,243,0.05)' : 'transparent', borderRadius: '16px 16px 0 0', border: p.highlight ? '1px solid rgba(77,255,243,0.15)' : '1px solid transparent', borderBottom: 'none', transition: 'background 0.2s' }}>
                  {p.highlight && <div style={{ position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)', width: '60%', height: 2, background: 'linear-gradient(90deg, transparent, #4DFFF3, transparent)', borderRadius: 2 }} />}
                  <div style={{ fontSize: 13, fontWeight: 800, color: p.highlight ? '#4DFFF3' : '#FAFAFA', marginBottom: 4 }}>{p.name}</div>
                  <div style={{ fontSize: 9, fontWeight: 600, color: p.highlight ? 'rgba(77,255,243,0.6)' : 'rgba(176,176,176,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{p.tag}</div>
                </div>
              ))}
            </div>

            {featuresList.map((feat, fi) => (
              <div key={fi} onMouseEnter={() => setHoveredRow(fi)} onMouseLeave={() => setHoveredRow(null)} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', background: hoveredRow === fi ? 'rgba(77,255,243,0.02)' : fi % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent', borderTop: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }}>
                <div style={{ padding: '16px 20px', fontSize: 13, color: hoveredRow === fi ? '#FAFAFA' : 'rgba(176,176,176,0.7)', display: 'flex', alignItems: 'center', gap: 10, transition: 'color 0.2s' }}>
                  <span style={{ width: 4, height: 4, borderRadius: '50%', background: hoveredRow === fi ? '#4DFFF3' : 'rgba(176,176,176,0.2)', display: 'inline-block', transition: 'background 0.2s' }} />
                  {feat}
                </div>
                {platforms.map((p, pi) => (
                  <div key={pi} style={{ padding: '16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: p.highlight ? 'rgba(77,255,243,0.03)' : 'transparent', borderLeft: p.highlight ? '1px solid rgba(77,255,243,0.08)' : 'none', borderRight: p.highlight ? '1px solid rgba(77,255,243,0.08)' : 'none' }}>
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: p.support[fi] ? `${p.color}15` : 'rgba(255,255,255,0.03)', border: `1px solid ${p.support[fi] ? `${p.color}35` : 'rgba(255,255,255,0.06)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                      {p.support[fi] ? (
                        <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2 5.5l2.5 2.5 4.5-5" stroke={p.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      ) : (
                        <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M2 2l5 5M7 2l-5 5" stroke="rgba(176,176,176,0.2)" strokeWidth="1.3" strokeLinecap="round" /></svg>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ padding: 20 }} />
              {platforms.map((p, i) => (
                <div key={i} style={{ padding: '16px 12px', textAlign: 'center', background: p.highlight ? 'rgba(77,255,243,0.05)' : 'transparent', borderRadius: p.highlight ? '0 0 16px 16px' : 0, border: p.highlight ? '1px solid rgba(77,255,243,0.15)' : '1px solid transparent', borderTop: 'none' }}>
                  {p.highlight && (
                    <button style={{ background: '#4DFFF3', border: 'none', borderRadius: 8, padding: '8px 16px', color: '#000814', fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all 0.25s', fontFamily: "'Inter', sans-serif" }}
                      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 20px rgba(77,255,243,0.4)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                      Get Started →
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Pricing ───────────────────────────────────────────────────────────────────
function Pricing() {
  const { ref, visible } = useScrollReveal(0.1);
  const [annual, setAnnual] = useState(false);

  const plans = [
    { name: 'Free', tagline: 'Get your bearings', monthly: 0, yearly: 0, color: '#5B9FBF', features: ['50 OA questions (curated)', '3 CodeCast walkthroughs', 'Company intel snippets', 'Basic AI hints (5/day)', 'Community access', 'OA Discussion access'], missing: ['Full OA archive', 'Unlimited CodeCasts', 'Mock OA environment', 'Priority updates'], cta: 'Start Free', popular: false },
    { name: 'Pro', tagline: 'For serious placement prep', monthly: 299, yearly: 199, color: '#4DFFF3', features: ['Full OA archive (500+ questions)', 'Unlimited CodeCasts', 'All company placement intel', 'Unlimited AI hints', 'Mock OA environment', 'Live 1v1 CodeCast battles', 'Priority content drops', 'Progress tracking'], missing: [], cta: 'Get Pro', popular: true },
    { name: 'Team', tagline: 'For study groups & clubs', monthly: 799, yearly: 549, color: '#A3D5E8', features: ['Everything in Pro', 'Up to 10 members', 'Shared progress dashboard', 'Group mock OA sessions', 'Dedicated support', 'Custom leaderboard'], missing: [], cta: 'Contact Us', popular: false },
  ];

  return (
    <section id="pricing" ref={ref} style={{ background: '#000814', padding: '80px 32px 100px', fontFamily: "'Inter', sans-serif", position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 900, height: 400, background: 'radial-gradient(ellipse, rgba(77,255,243,0.04) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: 48, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)', transition: 'opacity 0.6s ease, transform 0.6s ease' }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#4DFFF3', letterSpacing: '0.14em', textTransform: 'uppercase', display: 'block', marginBottom: 16 }}>Simple pricing</span>
          <h2 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 900, color: '#FAFAFA', letterSpacing: '-0.025em', lineHeight: 1.08, margin: '0 0 16px' }}>
            Invest in your future.<br />
            <span style={{ background: 'linear-gradient(90deg, #4DFFF3 0%, #40C8E0 60%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Less than one missed salary.</span>
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(176,176,176,0.55)', maxWidth: 400, margin: '0 auto' }}>No hidden fees. Cancel anytime. Start free and upgrade when you're ready.</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 48, opacity: visible ? 1 : 0, transition: 'opacity 0.6s ease 0.2s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 999, padding: '6px 6px 6px 20px' }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: !annual ? '#FAFAFA' : 'rgba(176,176,176,0.5)', transition: 'color 0.25s' }}>Monthly</span>
            <button onClick={() => setAnnual(!annual)} style={{ position: 'relative', width: 48, height: 26, borderRadius: 999, background: annual ? '#4DFFF3' : 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', padding: 0, transition: 'background 0.3s' }}>
              <div style={{ position: 'absolute', top: 3, left: annual ? 'calc(100% - 23px)' : 3, width: 20, height: 20, borderRadius: '50%', background: annual ? '#000814' : 'rgba(255,255,255,0.8)', transition: 'left 0.3s, background 0.3s' }} />
            </button>
            <span style={{ fontSize: 13, fontWeight: 500, color: annual ? '#FAFAFA' : 'rgba(176,176,176,0.5)', transition: 'color 0.25s' }}>Annual</span>
            {annual && <span style={{ fontSize: 10, fontWeight: 700, background: 'rgba(77,255,243,0.15)', color: '#4DFFF3', border: '1px solid rgba(77,255,243,0.3)', borderRadius: 999, padding: '3px 10px' }}>SAVE 33%</span>}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {plans.map((plan, i) => {
            const [hovered, setHovered] = useState(false);
            const price = annual ? plan.yearly : plan.monthly;
            return (
              <div key={plan.name} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{ position: 'relative', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0) scale(1)' : 'translateY(50px) scale(0.97)', transition: `opacity 0.6s ease ${i * 0.15}s, transform 0.6s ease ${i * 0.15}s`, flex: 1, minWidth: 260, maxWidth: 340 }}>
                {plan.popular && <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: '#4DFFF3', color: '#000814', fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 16px', borderRadius: 999, zIndex: 10, whiteSpace: 'nowrap', boxShadow: '0 0 20px rgba(77,255,243,0.4)' }}>✦ Most Popular</div>}
                <div style={{ background: plan.popular ? 'rgba(77,255,243,0.06)' : hovered ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)', border: `1px solid ${plan.popular ? 'rgba(77,255,243,0.25)' : hovered ? `${plan.color}25` : 'rgba(255,255,255,0.07)'}`, borderRadius: 24, padding: '36px 28px', boxSizing: 'border-box', position: 'relative', overflow: 'hidden', transition: 'all 0.35s ease', boxShadow: plan.popular ? '0 0 60px rgba(77,255,243,0.06),0 24px 64px rgba(0,0,0,0.4)' : hovered ? '0 16px 48px rgba(0,0,0,0.3)' : '0 8px 24px rgba(0,0,0,0.2)', transform: hovered && !plan.popular ? 'translateY(-4px)' : 'translateY(0)' }}>
                  {plan.popular && <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '70%', height: 1, background: 'linear-gradient(90deg, transparent, #4DFFF3, transparent)' }} />}
                  <div style={{ fontSize: 11, fontWeight: 700, color: plan.color, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>{plan.name}</div>
                  <div style={{ fontSize: 14, color: 'rgba(176,176,176,0.6)', marginBottom: 28 }}>{plan.tagline}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                    {price > 0 && <span style={{ fontSize: 18, fontWeight: 600, color: 'rgba(250,250,250,0.5)' }}>₹</span>}
                    <span style={{ fontSize: price === 0 ? 42 : 48, fontWeight: 900, color: '#FAFAFA', letterSpacing: '-0.04em', lineHeight: 1 }}>{price === 0 ? 'Free' : price}</span>
                    {price > 0 && <span style={{ fontSize: 13, color: 'rgba(176,176,176,0.45)', marginLeft: 4 }}>/ mo</span>}
                  </div>
                  {annual && price > 0 && <div style={{ fontSize: 11, color: '#4DFFF3', marginBottom: 24, fontWeight: 600 }}>Billed ₹{price * 12}/yr · Save {Math.round(((plan.monthly - price) / plan.monthly) * 100)}%</div>}
                  <button style={{ width: '100%', padding: '14px 20px', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.25s', fontFamily: "'Inter', sans-serif", marginBottom: 28, background: plan.popular ? '#4DFFF3' : 'transparent', color: plan.popular ? '#000814' : plan.color, border: plan.popular ? 'none' : `1px solid ${plan.color}50`, boxShadow: plan.popular && hovered ? '0 0 32px rgba(77,255,243,0.45)' : 'none' }}>
                    {plan.cta} →
                  </button>
                  <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 24 }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {plan.features.map((f, fi) => (
                      <div key={fi} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ width: 18, height: 18, borderRadius: '50%', background: `${plan.color}15`, border: `1px solid ${plan.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5l2.5 2.5 4-4" stroke={plan.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </span>
                        <span style={{ fontSize: 13, color: 'rgba(176,176,176,0.8)', lineHeight: 1.4 }}>{f}</span>
                      </div>
                    ))}
                    {plan.missing.map((f, fi) => (
                      <div key={fi} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <svg width="7" height="7" viewBox="0 0 7 7" fill="none"><path d="M1.5 1.5l4 4M5.5 1.5l-4 4" stroke="rgba(176,176,176,0.2)" strokeWidth="1.2" strokeLinecap="round" /></svg>
                        </span>
                        <span style={{ fontSize: 13, color: 'rgba(176,176,176,0.25)', textDecoration: 'line-through' }}>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: 'center', marginTop: 40, opacity: visible ? 1 : 0, transition: 'opacity 0.6s ease 0.6s' }}>
          <p style={{ fontSize: 12, color: 'rgba(176,176,176,0.35)', margin: 0 }}>All prices in INR · Student-friendly pricing · <a href="#" style={{ color: 'rgba(77,255,243,0.5)', textDecoration: 'none' }}>Refund policy</a></p>
        </div>
      </div>
    </section>
  );
}

// ── Testimonials ──────────────────────────────────────────────────────────────
function Testimonials() {
  const { ref, visible } = useScrollReveal(0.05);
  const [page, setPage] = useState(0);
  const totalPages = 2;

  const testimonials = [
    { name: 'Arjun Sharma', college: 'NSUT · CSE 2025', company: '→ Microsoft', color: '#4DFFF3', rating: 5, quote: 'Found the exact Microsoft OA I sat, with a CodeCast explaining the optimal approach. I went from solving it in 2 hours to under 30 minutes. Codify is literally why I have this offer.', avatar: 'AS', bg: 'linear-gradient(135deg, #1a4a6e, #0a2035)' },
    { name: 'Priya Mehta', college: 'DTU · IT 2025', company: '→ Goldman Sachs', color: '#40C8E0', rating: 5, quote: 'The company intel section is insane. I knew Goldman\'s interview structure, the HR patterns, even the approximate cut-off before I sat the OA. I felt like I was cheating — except I wasn\'t.', avatar: 'PM', bg: 'linear-gradient(135deg, #0e3a52, #051a28)' },
    { name: 'Rahul Verma', college: 'NSUT · ECE 2025', company: '→ Amazon', color: '#5B9FBF', rating: 5, quote: 'I\'d been grinding LeetCode for 3 months with zero placement progress. Then a friend sent me Codify. Within 2 weeks I had my Amazon OA prep done. Different league.', avatar: 'RV', bg: 'linear-gradient(135deg, #1a2a4a, #0a1228)' },
    { name: 'Sneha Agarwal', college: 'DTU · CSE 2025', company: '→ Flipkart', color: '#A3D5E8', rating: 5, quote: 'The live 1v1 CodeCast battles are addictive. Competing with a friend under real time pressure improved my speed way more than solo practice ever did.', avatar: 'SA', bg: 'linear-gradient(135deg, #0a3040, #051828)' },
    { name: 'Karan Singh', college: 'NSUT · CSE 2026', company: '→ Josh Technology', color: '#4DFFF3', rating: 5, quote: 'The OA Discussion forum is gold. Someone posted the exact questions from my Goldman OA two days before it happened. The community knows what\'s coming.', avatar: 'KS', bg: 'linear-gradient(135deg, #1a4040, #0a2020)' },
    { name: 'Ananya Roy', college: 'DTU · COE 2025', company: '→ Rubrik', color: '#40C8E0', rating: 5, quote: 'AI hints are smart — they nudge you in the right direction without giving the answer away. Changed how I approach problems. Also the points leaderboard keeps me motivated.', avatar: 'AR', bg: 'linear-gradient(135deg, #1a3a5a, #0a1830)' },
  ];

  const perPage = 3;
  const visibleCards = testimonials.slice(page * perPage, page * perPage + perPage);

  useEffect(() => {
    if (!visible) return;
    const t = setInterval(() => setPage(p => (p + 1) % totalPages), 4500);
    return () => clearInterval(t);
  }, [visible]);

  return (
    <section id="testimonials" ref={ref} style={{ background: '#000814', padding: '80px 32px 100px', fontFamily: "'Inter', sans-serif", position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 700, height: 300, background: 'radial-gradient(ellipse, rgba(77,255,243,0.04) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48, flexWrap: 'wrap', gap: 20, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)', transition: 'opacity 0.6s ease, transform 0.6s ease' }}>
          <div>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#4DFFF3', letterSpacing: '0.14em', textTransform: 'uppercase', display: 'block', marginBottom: 16 }}>Real students, real results</span>
            <h2 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 900, color: '#FAFAFA', letterSpacing: '-0.025em', lineHeight: 1.08, margin: 0 }}>
              They came, they prepped,<br />
              <span style={{ background: 'linear-gradient(90deg, #4DFFF3 0%, #40C8E0 60%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>they landed the offer.</span>
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setPage(p => (p - 1 + totalPages) % totalPages)} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#FAFAFA', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', padding: 0 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(77,255,243,0.4)'; e.currentTarget.style.background = 'rgba(77,255,243,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}>
              ‹
            </button>
            <div style={{ display: 'flex', gap: 6 }}>
              {[0,1].map(i => <button key={i} onClick={() => setPage(i)} style={{ width: page === i ? 24 : 8, height: 8, borderRadius: 999, border: 'none', background: page === i ? '#4DFFF3' : 'rgba(255,255,255,0.15)', cursor: 'pointer', transition: 'all 0.3s', padding: 0, boxShadow: page === i ? '0 0 8px #4DFFF3' : 'none' }} />)}
            </div>
            <button onClick={() => setPage(p => (p + 1) % totalPages)} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#FAFAFA', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', padding: 0 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(77,255,243,0.4)'; e.currentTarget.style.background = 'rgba(77,255,243,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}>
              ›
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease 0.2s' }} className="testi-grid">
          {visibleCards.map((t, i) => {
            const [hov, setHov] = useState(false);
            return (
              <div key={`${page}-${i}`} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ background: hov ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.025)', border: `1px solid ${hov ? `${t.color}25` : 'rgba(255,255,255,0.07)'}`, borderRadius: 20, padding: '28px 24px', transition: 'all 0.35s', position: 'relative', overflow: 'hidden', transform: hov ? 'translateY(-4px)' : 'translateY(0)', boxShadow: hov ? `0 20px 60px rgba(0,0,0,0.4)` : '0 8px 24px rgba(0,0,0,0.2)', animation: `fade-slide-in 0.5s ease ${i * 0.1}s both` }}>
                <div style={{ position: 'absolute', top: 16, right: 20, fontSize: 64, color: 'rgba(77,255,243,0.05)', lineHeight: 1, fontFamily: 'Georgia, serif', userSelect: 'none' }}>"</div>
                <div style={{ display: 'flex', gap: 3, marginBottom: 16 }}>
                  {[1,2,3,4,5].map(s => <svg key={s} width="12" height="12" viewBox="0 0 12 12" fill="#4DFFF3"><path d="M6 1l1.2 3.6H11L8.1 6.8l1.1 3.6L6 8.5l-3.2 1.9 1.1-3.6L1 4.6h3.8L6 1z" /></svg>)}
                </div>
                <p style={{ fontSize: 14, color: 'rgba(250,250,250,0.75)', lineHeight: 1.72, margin: '0 0 24px', position: 'relative', zIndex: 1 }}>"{t.quote}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: t.bg, border: `1px solid ${t.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: t.color, flexShrink: 0 }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#FAFAFA', marginBottom: 2 }}>{t.name}</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, color: 'rgba(176,176,176,0.5)' }}>{t.college}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: t.color }}>{t.company}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 48, padding: '20px 24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(77,255,243,0.07)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32, flexWrap: 'wrap', opacity: visible ? 1 : 0, transition: 'opacity 0.6s ease 0.5s' }}>
          {[['1,000+','Students helped'],['4.9/5','Average rating'],['NSUT & DTU','Campus focused'],['2026','Placement season']].map(([val, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#FAFAFA', letterSpacing: '-0.02em' }}>{val}</div>
              <div style={{ fontSize: 11, color: 'rgba(176,176,176,0.45)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
      <style>{`.testi-grid { @media (max-width:900px) { grid-template-columns:1fr 1fr !important; } @media (max-width:580px) { grid-template-columns:1fr !important; } }`}</style>
    </section>
  );
}

// ── FAQ ───────────────────────────────────────────────────────────────────────
function FAQ() {
  const { ref, visible } = useScrollReveal(0.05);
  const [open, setOpen] = useState(null);

  const faqs = [
    { q: 'Is Codify free to use?', a: 'Codify has a generous free tier — curated OA questions, company intel snippets, basic AI hints, OA Discussion access, and community. Pro unlocks the full archive, unlimited CodeCasts, live battles, and priority content.' },
    { q: 'Which colleges is Codify built for?', a: 'Purpose-built for NSUT and DTU students. Our OA archive, company intel, and placement data is specifically sourced from students at these colleges. We know the companies that visit your campus.' },
    { q: 'How is Codify different from LeetCode?', a: "LeetCode is a general-purpose practice platform. Codify is an intelligence layer built for placement season — real OA questions from companies that visited your campus, insider company intel, live 1v1 battles, and community discussion." },
    { q: 'What is CodeCast?', a: 'CodeCast is our live 1v1 coding battle feature. Pick a question, create a room, share the code with a friend, and battle in real-time. Both players code simultaneously, submit, and the one who passes more test cases wins.' },
    { q: 'How does the OA Discussion work?', a: 'Students share real OA experiences — questions asked, difficulty, approach — and earn points for contributing. Upvote the best posts, add comments, and build reputation on the leaderboard. The community is the best source of fresh OA intel.' },
    { q: 'Are the OA questions actually from real companies?', a: 'Every question has been submitted by real students who sat real assessments. We verify submissions, remove duplicates, and tag by company, year, and role. If it\'s in Codify, a real person faced it in a real OA.' },
  ];

  return (
    <section id="faq" ref={ref} style={{ background: '#000814', padding: '80px 32px 100px', fontFamily: "'Inter', sans-serif", position: 'relative' }}>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(77,255,243,0.03) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative' }}>
        <div style={{ marginBottom: 60, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)', transition: 'opacity 0.6s ease, transform 0.6s ease' }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#4DFFF3', letterSpacing: '0.14em', textTransform: 'uppercase', display: 'block', marginBottom: 16 }}>Got questions</span>
          <h2 style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 800, color: '#FAFAFA', letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1 }}>Things people ask us.</h2>
        </div>

        <div style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)', transition: 'opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s' }}>
          {faqs.map((faq, i) => (
            <div key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }} onClick={() => setOpen(open === i ? null : i)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 0', gap: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: open === i ? '#FAFAFA' : 'rgba(250,250,250,0.75)', margin: 0, lineHeight: 1.4, transition: 'color 0.2s' }}>{faq.q}</h3>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: open === i ? 'rgba(77,255,243,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${open === i ? 'rgba(77,255,243,0.3)' : 'rgba(255,255,255,0.08)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.25s', transform: open === i ? 'rotate(45deg)' : 'rotate(0)' }}>
                  <span style={{ fontSize: 18, color: open === i ? '#4DFFF3' : 'rgba(250,250,250,0.5)', lineHeight: 1, marginTop: -1 }}>+</span>
                </div>
              </div>
              {open === i && (
                <div style={{ paddingBottom: 24, fontSize: 15, color: 'rgba(176,176,176,0.7)', lineHeight: 1.75 }}>{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA Section ───────────────────────────────────────────────────────────────
function CTASection({ navigate }) {
  const { ref, visible } = useScrollReveal(0.1);
  return (
    <section ref={ref} style={{ margin: '0 32px 80px', borderRadius: 28, overflow: 'hidden', fontFamily: "'Inter', sans-serif", background: 'radial-gradient(ellipse 80% 70% at 20% 50%, rgba(77,255,243,0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 80% 30%, rgba(64,200,224,0.06) 0%, transparent 55%), linear-gradient(135deg, #0D2035 0%, #051018 50%, #000814 100%)', border: '1px solid rgba(77,255,243,0.1)', boxShadow: '0 0 80px rgba(77,255,243,0.04),0 32px 80px rgba(0,0,0,0.5)' }}>
      <div style={{ position: 'relative', padding: '80px 64px', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(77,255,243,0.06) 0%, transparent 70%)', pointerEvents: 'none', animation: 'glow-pulse 3s ease-in-out infinite' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#4DFFF3', letterSpacing: '0.14em', textTransform: 'uppercase', display: 'block', marginBottom: 24, opacity: visible ? 1 : 0, transition: 'opacity 0.6s ease', animation: visible ? 'hero-fade-up 0.8s ease 0.1s both' : 'none' }}>
            Placement season is now
          </span>
          <h2 style={{ fontSize: 'clamp(32px,5vw,64px)', fontWeight: 900, color: '#FAFAFA', letterSpacing: '-0.03em', lineHeight: 1.06, margin: '0 0 24px', animation: visible ? 'hero-fade-up 0.8s ease 0.2s both' : 'none' }}>
            Your OA is next week.<br />
            <span style={{ background: 'linear-gradient(90deg, #4DFFF3 0%, #40C8E0 60%, #5B9FBF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Are you ready?</span>
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(176,176,176,0.6)', lineHeight: 1.65, maxWidth: 480, margin: '0 auto 40px', animation: visible ? 'hero-fade-up 0.8s ease 0.35s both' : 'none' }}>
            Join 1,000+ NSUT & DTU students who've already used Codify to land their dream offers. Start free today.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', animation: visible ? 'hero-fade-up 0.8s ease 0.5s both' : 'none' }}>
            <button onClick={() => navigate('/sign-up')} style={{ background: '#4DFFF3', border: 'none', borderRadius: 12, padding: '18px 40px', color: '#000814', fontSize: 16, fontWeight: 800, cursor: 'pointer', transition: 'all 0.25s', fontFamily: "'Inter', sans-serif", letterSpacing: '0.01em' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 0 40px rgba(77,255,243,0.5),0 12px 32px rgba(0,0,0,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
              Get Started Free →
            </button>
            <button onClick={() => navigate('/sign-in')} style={{ background: 'transparent', border: '1px solid rgba(250,250,250,0.2)', borderRadius: 12, padding: '18px 40px', color: 'rgba(250,250,250,0.8)', fontSize: 16, fontWeight: 500, cursor: 'pointer', transition: 'all 0.25s', fontFamily: "'Inter', sans-serif" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(77,255,243,0.4)'; e.currentTarget.style.color = '#FAFAFA'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(250,250,250,0.2)'; e.currentTarget.style.color = 'rgba(250,250,250,0.8)'; }}>
              Sign In
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer({ navigate }) {
  return (
    <footer style={{ background: '#000814', borderTop: '1px solid rgba(77,255,243,0.06)', padding: '60px 32px 32px', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 1300, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 48 }} className="footer-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: '#4DFFF3', letterSpacing: '-0.5px' }}>Codify</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: '#4DFFF3', border: '1px solid rgba(77,255,243,0.4)', borderRadius: 4, padding: '2px 6px', letterSpacing: '0.1em' }}>BETA</span>
            </div>
            <p style={{ fontSize: 14, color: 'rgba(176,176,176,0.5)', lineHeight: 1.7, maxWidth: 280, margin: '0 0 24px' }}>The placement prep platform built specifically for NSUT & DTU students. Crack every OA. Land every offer.</p>
            <div style={{ fontSize: 12, color: 'rgba(176,176,176,0.3)' }}>© 2026 Codify · Built for NSUT & DTU</div>
          </div>
          {[
            { title: 'Product', links: [['PataKaro', '/patakaro'], ['IntelliCode', '/intellicode'], ['CodeCast', '/codecast'], ['Discussion', '/discussion']] },
            { title: 'Company', links: [['About', '#'], ['Blog', '#'], ['Careers', '#'], ['Contact', '#']] },
            { title: 'Legal', links: [['Privacy', '#'], ['Terms', '#'], ['Refund Policy', '#'], ['Security', '#']] },
          ].map(col => (
            <div key={col.title}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(250,250,250,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>{col.title}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {col.links.map(([label, href]) => (
                  <a key={label} href={href} onClick={e => { if (href.startsWith('/')) { e.preventDefault(); navigate(href); } }} style={{ fontSize: 14, color: 'rgba(176,176,176,0.5)', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.target.style.color = '#FAFAFA'}
                    onMouseLeave={e => e.target.style.color = 'rgba(176,176,176,0.5)'}>
                    {label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ fontSize: 12, color: 'rgba(176,176,176,0.3)' }}>Built with ❤️ for NSUT & DTU placement warriors</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4DFFF3', animation: 'dot-pulse 2s ease-in-out infinite' }} />
            <span style={{ fontSize: 12, color: 'rgba(77,255,243,0.6)' }}>All systems operational</span>
          </div>
        </div>
      </div>
      <style>{`.footer-grid { @media (max-width:768px) { grid-template-columns:1fr 1fr !important; } @media (max-width:480px) { grid-template-columns:1fr !important; } }`}</style>
    </footer>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────
export default function PublicLanding() {
  const navigate = useNavigate();

  return (
    <div style={{ background: '#000814', color: '#FAFAFA', overflowX: 'hidden' }}>
      <Navbar navigate={navigate} />
      <Hero navigate={navigate} />
      <Ticker />
      <Stats />
      <Features />
      <HowItWorks />
      <Comparison />
      <Pricing />
      <Testimonials />
      <FAQ />
      <CTASection navigate={navigate} />
      <Footer navigate={navigate} />
    </div>
  );
}


// import React, { useState, useEffect, useRef } from "react";
// import { useNavigate } from "react-router-dom";

// // ── Hooks ──────────────────────────────────────────────────────────────────
// function useHover() {
//   const [h, setH] = useState(false);
//   return [h, { onMouseEnter: () => setH(true), onMouseLeave: () => setH(false) }];
// }
// function useInView() {
//   const ref = useRef(null);
//   const [v, setV] = useState(false);
//   useEffect(() => {
//     const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true); }, { threshold: 0.12 });
//     if (ref.current) o.observe(ref.current);
//     return () => o.disconnect();
//   }, []);
//   return [ref, v];
// }

// // ── Data ───────────────────────────────────────────────────────────────────
// const NAV_LINKS = ["Features", "How It Works", "Pricing", "FAQ"];

// const FEATURES = [
//   { icon: "📁", title: "PataKaro", tag: "ARCHIVES", desc: "Company hiring timelines, OA patterns, interview experiences from placed seniors — all in one searchable archive." },
//   { icon: "⚡", title: "IntelliCode", tag: "AI CODING", desc: "Solve real OA questions with AI hints, auto test-case generation, and a blazing mobile-first code editor." },
//   { icon: "🔗", title: "CodeCast", tag: "COLLABORATE", desc: "Real-time collaborative coding sessions. Code with friends, crack problems together, ship faster." },
//   { icon: "🏢", title: "Company Intel", tag: "RESEARCH", desc: "CGPA cutoffs, branch eligibility, backlog policies, test duration — stop guessing, start preparing." },
//   { icon: "📊", title: "OA Tracker", tag: "PROGRESS", desc: "Track every question you've solved. See your weak spots. Build streaks. Compete with your batch." },
//   { icon: "🎯", title: "FTE Ready", tag: "FULL-TIME", desc: "Separate curated prep tracks for SDE Intern vs Full-Time roles with different question difficulty tiers." },
// ];

// const STEPS = [
//   { num: "01", title: "Sign Up Free", desc: "Create your account in 30 seconds — no credit card, no hassle." },
//   { num: "02", title: "Pick Your Track", desc: "Choose Intern or FTE prep. Filter by company, role, or CGPA cutoff." },
//   { num: "03", title: "Practice & Learn", desc: "Solve OA questions, read interview experiences, use IntelliCode." },
//   { num: "04", title: "Get Placed", desc: "Walk into your interview prepared. Land the offer you deserve." },
// ];

// const COMPARISON = [
//   { feature: "Real OA Questions", codify: true, leetcode: false, gfg: false },
//   { feature: "Company-specific Intel", codify: true, leetcode: false, gfg: true },
//   { feature: "Interview Experiences", codify: true, leetcode: false, gfg: true },
//   { feature: "AI Code Assistance", codify: true, leetcode: false, gfg: false },
//   { feature: "Mobile Code Editor", codify: true, leetcode: true, gfg: false },
//   { feature: "CGPA / Branch Filter", codify: true, leetcode: false, gfg: false },
//   { feature: "Free Core Access", codify: true, leetcode: true, gfg: true },
//   { feature: "Built for NSUT / DTU", codify: true, leetcode: false, gfg: false },
// ];

// const PLANS = [
//   {
//     name: "Free",
//     price: "₹0",
//     period: "forever",
//     desc: "Everything you need to get started.",
//     features: ["PataKaro access", "Company intel", "Interview experiences", "Basic OA questions", "CodeCast (limited)"],
//     cta: "Get Started Free",
//     highlight: false,
//   },
//   {
//     name: "Pro",
//     price: "₹99",
//     period: "/ month",
//     desc: "Serious prep for serious candidates.",
//     features: ["Everything in Free", "Full OA question bank", "AI code hints & debug", "IntelliCode unlimited", "Progress tracker", "Priority support"],
//     cta: "Start Pro",
//     highlight: true,
//   },
//   {
//     name: "Batch",
//     price: "₹49",
//     period: "/ user / month",
//     desc: "For study groups & placement cells.",
//     features: ["Everything in Pro", "Up to 20 members", "Shared progress dashboard", "Batch leaderboard", "Placement cell branding"],
//     cta: "Contact Us",
//     highlight: false,
//   },
// ];

// const TESTIMONIALS = [
//   { name: "Aryan Mehta", batch: "NSUT CSE '25", text: "PataKaro literally saved me. Found the exact OA pattern for Goldman Sachs 3 days before the test.", avatar: "AM" },
//   { name: "Priya Sharma", batch: "DTU IT '25", text: "IntelliCode's AI hints are unreal. Solved questions I'd never have figured out on my own.", avatar: "PS" },
//   { name: "Rahul Singh", batch: "NSUT ECE '24", text: "Got placed at Microsoft. Used Codify for every single mock OA. 10/10 would recommend.", avatar: "RS" },
//   { name: "Sneha Gupta", batch: "DTU CSE '25", text: "The interview experiences section is gold. Knew exactly what to expect in my Atlassian interview.", avatar: "SG" },
//   { name: "Karan Verma", batch: "NSUT IT '25", text: "CodeCast with my group made prep actually fun. We'd do OAs together every weekend.", avatar: "KV" },
//   { name: "Divya Jain", batch: "DTU ECE '24", text: "Placed at Amazon. Codify had SDE questions from Amazon's actual OA. Game changer.", avatar: "DJ" },
// ];

// const FAQS = [
//   { q: "Is Codify free to use?", a: "Yes! The core features — PataKaro, company intel, and interview experiences — are completely free. Pro features like IntelliCode AI hints and the full question bank require a Pro subscription." },
//   { q: "Which colleges is Codify built for?", a: "Primarily NSUT and DTU students, but the content is useful for any engineering college student preparing for placements." },
//   { q: "How is Codify different from LeetCode?", a: "LeetCode is great for DSA practice but has no company-specific OA archives or placement intel. Codify is built specifically for placement season — real questions, real experiences, real intel." },
//   { q: "Can I access Codify on mobile?", a: "Absolutely. IntelliCode is mobile-first — you can code, test, and submit solutions from your phone with a UI designed for small screens." },
//   { q: "How do I cancel my Pro subscription?", a: "Cancel anytime from your profile page. No questions asked, no lock-in period." },
//   { q: "Are the OA questions actually from real companies?", a: "Yes. Questions are sourced and verified by students who've appeared in actual OAs at those companies." },
// ];

// const MARQUEE_ITEMS = ["PataKaro", "IntelliCode", "CodeCast", "OA Prep", "Company Intel", "AI Hints", "Interview Experiences", "NSUT", "DTU", "Get Placed ✦"];

// // ── Main Component ─────────────────────────────────────────────────────────
// export default function PublicLanding() {
//   const navigate = useNavigate();
//   const [scrolled, setScrolled] = useState(false);
//   const [mobileMenu, setMobileMenu] = useState(false);
//   const [openFaq, setOpenFaq] = useState(null);
//   const [heroVisible, setHeroVisible] = useState(false);

//   useEffect(() => {
//     setTimeout(() => setHeroVisible(true), 100);
//     const onScroll = () => setScrolled(window.scrollY > 30);
//     window.addEventListener("scroll", onScroll);
//     return () => window.removeEventListener("scroll", onScroll);
//   }, []);

//   const goToSignIn = () => navigate("/sign-in");

//   const scrollTo = (id) => {
//     document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
//     setMobileMenu(false);
//   };

//   return (
//     <div style={{ background: "#0A0A0A", minHeight: "100vh", overflowX: "hidden", fontFamily: "'DM Sans', sans-serif" }}>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..60,600;12..60,700;12..60,800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&family=Space+Mono:wght@400;700&display=swap');

//         *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

//         :root {
//           --accent: #20c997;
//           --accent-dim: rgba(32,201,151,0.09);
//           --accent-border: rgba(32,201,151,0.2);
//           --surface: #141414;
//           --surface2: #1a1a1a;
//           --border: rgba(255,255,255,0.07);
//           --muted: #6A6A6A;
//           --secondary: #8C8C8C;
//         }

//         html { scroll-behavior: smooth; }

//         @keyframes fadeUp {
//           from { opacity:0; transform:translateY(28px); }
//           to   { opacity:1; transform:translateY(0);    }
//         }
//         @keyframes breathe {
//           0%,100% { transform:scale(1);    opacity:.055; }
//           50%      { transform:scale(1.1); opacity:.09;  }
//         }
//         @keyframes marq {
//           from { transform:translateX(0); }
//           to   { transform:translateX(-50%); }
//         }
//         @keyframes shimmer {
//           from { transform:translateX(-100%); }
//           to   { transform:translateX(200%);  }
//         }
//         @keyframes blink {
//           0%,100% { opacity:1; }
//           50%      { opacity:.2; }
//         }
//         @keyframes spin {
//           to { transform:rotate(360deg); }
//         }

//         .dot-grid {
//           background-image: radial-gradient(circle, rgba(255,255,255,0.11) 1px, transparent 1px);
//           background-size: 28px 28px;
//           mask-image: radial-gradient(ellipse 75% 75% at 50% 50%, black 30%, transparent 100%);
//           -webkit-mask-image: radial-gradient(ellipse 75% 75% at 50% 50%, black 30%, transparent 100%);
//         }

//         .glow { position:absolute; border-radius:50%; filter:blur(90px); pointer-events:none; animation:breathe 7s ease-in-out infinite; }

//         .marquee-wrap { overflow:hidden; }
//         .marquee-track { display:flex; animation:marq 28s linear infinite; white-space:nowrap; }

//         .pill {
//           display:inline-flex; align-items:center; gap:7px;
//           font-family:'Space Mono',monospace; font-size:10px;
//           color:var(--accent); background:var(--accent-dim);
//           border:1px solid var(--accent-border);
//           border-radius:100px; padding:5px 14px;
//           letter-spacing:.15em; text-transform:uppercase;
//         }

//         .btn-primary {
//           position:relative; overflow:hidden;
//           display:inline-flex; align-items:center; gap:8px;
//           padding:13px 26px; background:var(--accent);
//           color:#000; border:none; border-radius:10px;
//           font-family:'DM Sans',sans-serif; font-size:14px; font-weight:600;
//           cursor:pointer; text-decoration:none;
//           transition:all .22s cubic-bezier(.4,0,.2,1);
//         }
//         .btn-primary:hover { transform:translateY(-3px); box-shadow:0 14px 36px rgba(32,201,151,.32); }
//         .btn-primary::after {
//           content:''; position:absolute; top:0; left:-100%; width:50%; height:100%;
//           background:linear-gradient(90deg,transparent,rgba(255,255,255,.28),transparent);
//         }
//         .btn-primary:hover::after { animation:shimmer .55s ease forwards; }

//         .btn-ghost {
//           display:inline-flex; align-items:center; gap:8px;
//           padding:13px 26px; background:transparent;
//           color:var(--secondary); border:1px solid var(--border);
//           border-radius:10px; font-family:'DM Sans',sans-serif;
//           font-size:14px; font-weight:400; cursor:pointer;
//           transition:all .22s cubic-bezier(.4,0,.2,1);
//         }
//         .btn-ghost:hover { border-color:var(--accent-border); color:#fff; transform:translateY(-2px); }

//         .nav-a {
//           font-family:'DM Sans',sans-serif; font-size:14px; color:var(--secondary);
//           cursor:pointer; background:none; border:none; padding:0;
//           transition:color .2s;
//         }
//         .nav-a:hover { color:#fff; }

//         .feat-card {
//           background:var(--surface); border:1px solid var(--border);
//           border-radius:14px; padding:28px 24px;
//           transition:all .22s cubic-bezier(.4,0,.2,1);
//           position:relative; overflow:hidden;
//         }
//         .feat-card:hover {
//           border-color:var(--accent-border);
//           transform:translateY(-6px);
//           box-shadow:0 24px 48px rgba(32,201,151,.07);
//           background:rgba(32,201,151,.04);
//         }
//         .feat-card::before {
//           content:''; position:absolute; top:0; left:0; right:0; height:2px;
//           background:linear-gradient(90deg,#007BFF,#20c997);
//           transform:scaleX(0); transform-origin:left;
//           transition:transform .22s cubic-bezier(.4,0,.2,1);
//         }
//         .feat-card:hover::before { transform:scaleX(1); }

//         .step-card {
//           padding:32px 28px; border-left:1px solid var(--border);
//           transition:border-color .22s;
//         }
//         .step-card:hover { border-color:var(--accent-border); }

//         .plan-card {
//           background:var(--surface); border:1px solid var(--border);
//           border-radius:16px; padding:32px 28px;
//           transition:all .22s cubic-bezier(.4,0,.2,1);
//         }
//         .plan-card:hover { transform:translateY(-4px); box-shadow:0 20px 40px rgba(0,0,0,.4); }
//         .plan-card.highlight {
//           border-color:var(--accent-border);
//           background:linear-gradient(135deg, rgba(32,201,151,.08), rgba(0,123,255,.05));
//         }

//         .testi-card {
//           background:var(--surface); border:1px solid var(--border);
//           border-radius:14px; padding:24px;
//           transition:all .22s cubic-bezier(.4,0,.2,1);
//         }
//         .testi-card:hover { border-color:var(--accent-border); transform:translateY(-4px); }

//         .faq-item {
//           border-bottom:1px solid var(--border);
//           transition:border-color .2s;
//         }
//         .faq-item:hover { border-color:var(--accent-border); }

//         .faq-q {
//           width:100%; display:flex; justify-content:space-between; align-items:center;
//           padding:20px 0; background:none; border:none; cursor:pointer;
//           font-family:'DM Sans',sans-serif; font-size:15px; font-weight:500;
//           color:#fff; text-align:left; gap:16px;
//           transition:color .2s;
//         }
//         .faq-q:hover { color:var(--accent); }

//         .check { color:var(--accent); font-size:16px; }
//         .cross { color:#3a3a3a; font-size:16px; }

//         .avatar {
//           width:40px; height:40px; border-radius:50%;
//           background:var(--accent-dim); border:1px solid var(--accent-border);
//           display:flex; align-items:center; justify-content:center;
//           font-family:'Space Mono',monospace; font-size:11px;
//           font-weight:700; color:var(--accent); flex-shrink:0;
//         }

//         .section { padding:96px clamp(20px,5vw,72px); }
//         .section-sm { padding:64px clamp(20px,5vw,72px); }
//         .container { max-width:1100px; margin:0 auto; }
//         .section-head { text-align:center; margin-bottom:56px; }

//         h1,h2,h3 { font-family:'Bricolage Grotesque',sans-serif; }

//         .grid-3 { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; }
//         .grid-4 { display:grid; grid-template-columns:repeat(4,1fr); gap:1px; background:var(--border); border-radius:14px; overflow:hidden; }
//         .grid-3-plans { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; }
//         .grid-2-testi { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }

//         @media(max-width:960px){
//           .grid-3 { grid-template-columns:repeat(2,1fr); }
//           .grid-3-plans { grid-template-columns:1fr; max-width:420px; margin:0 auto; }
//           .grid-2-testi { grid-template-columns:repeat(2,1fr); }
//           .grid-4 { grid-template-columns:repeat(2,1fr); }
//           .comp-table { font-size:13px; }
//         }
//         @media(max-width:640px){
//           .grid-3 { grid-template-columns:1fr; }
//           .grid-2-testi { grid-template-columns:1fr; }
//           .grid-4 { grid-template-columns:1fr; }
//           .hero-btns { flex-direction:column; align-items:stretch; }
//         }

//         .ham { display:flex; flex-direction:column; gap:5px; background:none; border:none; cursor:pointer; padding:4px; }
//         .ham-bar { width:22px; height:1.5px; background:#fff; transition:all .22s; display:block; }

//         .mobile-menu {
//           position:fixed; inset:0; background:rgba(10,10,10,.97);
//           z-index:200; display:flex; flex-direction:column;
//           align-items:center; justify-content:center; gap:36px;
//         }
//         .mobile-menu-link {
//           font-family:'Bricolage Grotesque',sans-serif; font-weight:700;
//           font-size:clamp(28px,7vw,44px); color:#fff; cursor:pointer;
//           background:none; border:none; letter-spacing:-.02em;
//           transition:color .2s;
//         }
//         .mobile-menu-link:hover { color:var(--accent); }
//       `}</style>

//       {/* ── NAV ─────────────────────────────────────────────────────────── */}
//       <nav style={{
//         position:"sticky", top:0, zIndex:100,
//         background: scrolled ? "rgba(10,10,10,.92)" : "transparent",
//         backdropFilter: scrolled ? "blur(18px)" : "none",
//         borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
//         transition:"all .3s cubic-bezier(.4,0,.2,1)",
//       }}>
//         <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 clamp(20px,4vw,48px)", height:64, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
//           {/* Logo */}
//           <div style={{ display:"flex", alignItems:"center", gap:8 }}>
//             <span style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight:800, fontSize:20, background:"linear-gradient(to right,#007BFF,#20c997)", WebkitBackgroundClip:"text", color:"transparent", letterSpacing:"-.03em" }}>Codify</span>
//             <span className="pill" style={{ fontSize:8, padding:"2px 7px" }}>BETA</span>
//           </div>

//           {/* Desktop links */}
//           <div style={{ display:"flex", gap:32 }} className="desktop-nav-links">
//             {NAV_LINKS.map(l => (
//               <button key={l} className="nav-a" onClick={() => scrollTo(l.toLowerCase().replace(/ /g, "-"))}>{l}</button>
//             ))}
//           </div>

//           {/* CTA + Ham */}
//           <div style={{ display:"flex", alignItems:"center", gap:12 }}>
//             <button className="btn-ghost" style={{ padding:"9px 18px", fontSize:13 }} onClick={goToSignIn}>Sign In</button>
//             <button className="btn-primary" style={{ padding:"9px 18px", fontSize:13 }} onClick={goToSignIn}>Get Started →</button>
//             <button className="ham" onClick={() => setMobileMenu(true)} style={{ marginLeft:4 }}>
//               <span className="ham-bar"/><span className="ham-bar"/><span className="ham-bar"/>
//             </button>
//           </div>
//         </div>
//       </nav>

//       {mobileMenu && (
//         <div className="mobile-menu">
//           <button onClick={() => setMobileMenu(false)} style={{ position:"absolute", top:20, right:24, background:"none", border:"none", color:"#fff", fontSize:26, cursor:"pointer" }}>✕</button>
//           {NAV_LINKS.map(l => (
//             <button key={l} className="mobile-menu-link" onClick={() => scrollTo(l.toLowerCase().replace(/ /g,"-"))}>{l}</button>
//           ))}
//           <button className="btn-primary" onClick={goToSignIn}>Get Started →</button>
//         </div>
//       )}

//       {/* ── HERO ─────────────────────────────────────────────────────────── */}
//       <section style={{ position:"relative", minHeight:"92vh", display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", textAlign:"center", padding:"80px clamp(20px,5vw,72px) 60px", overflow:"hidden" }}>
//         <div className="dot-grid" style={{ position:"absolute", inset:0, zIndex:0 }}/>
//         <div className="glow" style={{ width:700, height:700, background:"#20c997", top:"5%", left:"50%", transform:"translateX(-50%)", opacity:.055 }}/>
//         <div className="glow" style={{ width:450, height:450, background:"#007BFF", top:"35%", left:"15%", opacity:.045, animationDelay:"2.5s" }}/>
//         <div className="glow" style={{ width:350, height:350, background:"#20c997", top:"40%", right:"10%", opacity:.04, animationDelay:"4s" }}/>

//         <div style={{ position:"relative", zIndex:1, maxWidth:820 }}>
//           <div style={{ display:"flex", justifyContent:"center", marginBottom:28, animation: heroVisible?"fadeUp .6s ease both":"none", animationDelay:".1s", opacity: heroVisible?undefined:0 }}>
//             <span className="pill">
//               <span style={{ width:6, height:6, borderRadius:"50%", background:"var(--accent)", animation:"blink 2s ease infinite" }}/>
//               Placement Season 2026 · Built for NSUT & DTU
//             </span>
//           </div>

//           <h1 style={{
//             fontWeight:800, fontSize:"clamp(40px,7.5vw,76px)", letterSpacing:"-.045em", lineHeight:1.06, color:"#fff", marginBottom:22,
//             animation: heroVisible?"fadeUp .6s ease both":"none", animationDelay:".2s", opacity: heroVisible?undefined:0,
//           }}>
//             Crack Every OA.<br/>
//             <span style={{ background:"linear-gradient(90deg,#007BFF,#20c997)", WebkitBackgroundClip:"text", color:"transparent" }}>Land Every Offer.</span>
//           </h1>

//           <p style={{
//             fontFamily:"'DM Sans',sans-serif", fontSize:"clamp(15px,2vw,17px)", fontWeight:300,
//             color:"#8C8C8C", lineHeight:1.82, maxWidth:520, margin:"0 auto 36px",
//             animation: heroVisible?"fadeUp .6s ease both":"none", animationDelay:".3s", opacity: heroVisible?undefined:0,
//           }}>
//             Company OA archives, AI-powered coding practice, interview experiences, and placement intel — all in one place.
//           </p>

//           <div className="hero-btns" style={{
//             display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap",
//             animation: heroVisible?"fadeUp .6s ease both":"none", animationDelay:".4s", opacity: heroVisible?undefined:0,
//           }}>
//             <button className="btn-primary" style={{ fontSize:15, padding:"14px 30px" }} onClick={goToSignIn}>
//               Get Started Free →
//             </button>
//             <button className="btn-ghost" style={{ fontSize:15, padding:"14px 30px" }} onClick={() => scrollTo("features")}>
//               See Features
//             </button>
//           </div>

//           {/* Stats */}
//           <div style={{
//             display:"flex", justifyContent:"center", gap:48, flexWrap:"wrap",
//             marginTop:72, paddingTop:36, borderTop:"1px solid rgba(255,255,255,0.07)",
//             animation: heroVisible?"fadeUp .6s ease both":"none", animationDelay:".5s", opacity: heroVisible?undefined:0,
//           }}>
//             {[["500+","OA Questions"],["50+","Companies"],["1K+","Students"],["95%","Satisfaction"]].map(([v,l]) => (
//               <div key={l} style={{ textAlign:"center" }}>
//                 <div style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight:800, fontSize:"clamp(26px,4vw,38px)", color:"#fff", letterSpacing:"-.03em" }}>{v}</div>
//                 <div style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:"var(--muted)", letterSpacing:".14em", textTransform:"uppercase", marginTop:4 }}>{l}</div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ── MARQUEE ──────────────────────────────────────────────────────── */}
//       <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)", borderBottom:"1px solid rgba(255,255,255,0.06)", padding:"14px 0", background:"#070707" }}>
//         <div className="marquee-wrap">
//           <div className="marquee-track">
//             {[...MARQUEE_ITEMS,...MARQUEE_ITEMS,...MARQUEE_ITEMS].map((item,i) => (
//               <span key={i} style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:"var(--muted)", letterSpacing:".13em", textTransform:"uppercase", marginRight:48 }}>
//                 {item}<span style={{ color:"var(--accent)", marginLeft:48 }}>✦</span>
//               </span>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* ── FEATURES ─────────────────────────────────────────────────────── */}
//       <section className="section" id="features">
//         <div className="container">
//           <FadeSection>
//             <div className="section-head">
//               <div className="pill" style={{ marginBottom:20 }}>Features</div>
//               <h2 style={{ fontWeight:800, fontSize:"clamp(28px,4vw,46px)", color:"#fff", letterSpacing:"-.035em" }}>
//                 Everything you need to{" "}
//                 <em style={{ fontStyle:"italic", fontWeight:400, color:"var(--muted)" }}>get placed</em>
//               </h2>
//               <p style={{ color:"var(--secondary)", fontSize:15, lineHeight:1.8, maxWidth:480, margin:"14px auto 0" }}>
//                 Six powerful tools built specifically for engineering students facing placement season.
//               </p>
//             </div>
//           </FadeSection>
//           <div className="grid-3">
//             {FEATURES.map((f,i) => (
//               <FadeSection key={i} delay={i*0.08}>
//                 <div className="feat-card">
//                   <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18 }}>
//                     <span style={{ fontSize:22 }}>{f.icon}</span>
//                     <span className="pill" style={{ fontSize:9 }}>{f.tag}</span>
//                   </div>
//                   <h3 style={{ fontWeight:700, fontSize:19, color:"#fff", letterSpacing:"-.02em", marginBottom:10 }}>{f.title}</h3>
//                   <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, color:"var(--secondary)", lineHeight:1.78 }}>{f.desc}</p>
//                 </div>
//               </FadeSection>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
//       <section className="section" id="how-it-works" style={{ background:"#070707", borderTop:"1px solid var(--border)", borderBottom:"1px solid var(--border)" }}>
//         <div className="container">
//           <FadeSection>
//             <div className="section-head">
//               <div className="pill" style={{ marginBottom:20 }}>How It Works</div>
//               <h2 style={{ fontWeight:800, fontSize:"clamp(28px,4vw,46px)", color:"#fff", letterSpacing:"-.035em" }}>
//                 Four steps to{" "}
//                 <span style={{ background:"linear-gradient(90deg,#007BFF,#20c997)", WebkitBackgroundClip:"text", color:"transparent" }}>placement ready</span>
//               </h2>
//             </div>
//           </FadeSection>
//           <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:0 }}>
//             {STEPS.map((s,i) => (
//               <FadeSection key={i} delay={i*0.1}>
//                 <div className="step-card">
//                   <div style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:"var(--accent)", letterSpacing:".18em", marginBottom:16 }}>{s.num}</div>
//                   <h3 style={{ fontWeight:700, fontSize:18, color:"#fff", letterSpacing:"-.02em", marginBottom:10 }}>{s.title}</h3>
//                   <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, color:"var(--secondary)", lineHeight:1.78 }}>{s.desc}</p>
//                 </div>
//               </FadeSection>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ── COMPARISON ───────────────────────────────────────────────────── */}
//       <section className="section" id="codify-vs-others">
//         <div className="container">
//           <FadeSection>
//             <div className="section-head">
//               <div className="pill" style={{ marginBottom:20 }}>Comparison</div>
//               <h2 style={{ fontWeight:800, fontSize:"clamp(28px,4vw,46px)", color:"#fff", letterSpacing:"-.035em" }}>
//                 Codify vs the rest
//               </h2>
//               <p style={{ color:"var(--secondary)", fontSize:15, lineHeight:1.8, maxWidth:440, margin:"14px auto 0" }}>
//                 See why students choose Codify over generic DSA platforms.
//               </p>
//             </div>
//           </FadeSection>
//           <FadeSection>
//             <div style={{ overflowX:"auto" }}>
//               <table className="comp-table" style={{ width:"100%", borderCollapse:"collapse", fontFamily:"'DM Sans',sans-serif" }}>
//                 <thead>
//                   <tr>
//                     {["Feature","Codify","LeetCode","GFG"].map((h,i) => (
//                       <th key={h} style={{
//                         padding:"14px 20px", textAlign: i===0?"left":"center",
//                         fontFamily:"'Space Mono',monospace", fontSize:10,
//                         color: i===1?"var(--accent)":"var(--muted)",
//                         letterSpacing:".14em", textTransform:"uppercase",
//                         borderBottom:"1px solid var(--border)",
//                         background: i===1?"rgba(32,201,151,.05)":"transparent",
//                       }}>{h}</th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {COMPARISON.map((row,i) => (
//                     <tr key={i} style={{ borderBottom:"1px solid var(--border)" }}>
//                       <td style={{ padding:"14px 20px", color:"var(--secondary)", fontSize:14 }}>{row.feature}</td>
//                       <td style={{ padding:"14px 20px", textAlign:"center", background:"rgba(32,201,151,.03)" }}><span className="check">✓</span></td>
//                       <td style={{ padding:"14px 20px", textAlign:"center" }}><span className={row.leetcode?"check":"cross"}>{row.leetcode?"✓":"✗"}</span></td>
//                       <td style={{ padding:"14px 20px", textAlign:"center" }}><span className={row.gfg?"check":"cross"}>{row.gfg?"✓":"✗"}</span></td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </FadeSection>
//         </div>
//       </section>

//       {/* ── PRICING ──────────────────────────────────────────────────────── */}
//       <section className="section" id="pricing" style={{ background:"#070707", borderTop:"1px solid var(--border)" }}>
//         <div className="container">
//           <FadeSection>
//             <div className="section-head">
//               <div className="pill" style={{ marginBottom:20 }}>Pricing</div>
//               <h2 style={{ fontWeight:800, fontSize:"clamp(28px,4vw,46px)", color:"#fff", letterSpacing:"-.035em" }}>
//                 Simple,{" "}
//                 <em style={{ fontStyle:"italic", fontWeight:400, color:"var(--muted)" }}>honest</em>
//                 {" "}pricing
//               </h2>
//               <p style={{ color:"var(--secondary)", fontSize:15, lineHeight:1.8, maxWidth:420, margin:"14px auto 0" }}>
//                 Start free. Upgrade when you need more firepower for placement season.
//               </p>
//             </div>
//           </FadeSection>
//           <div className="grid-3-plans" style={{ maxWidth:960, margin:"0 auto" }}>
//             {PLANS.map((plan,i) => (
//               <FadeSection key={i} delay={i*0.1}>
//                 <div className={`plan-card${plan.highlight?" highlight":""}`} style={{ position:"relative" }}>
//                   {plan.highlight && (
//                     <div style={{ position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)" }}>
//                       <span className="pill" style={{ fontSize:9, padding:"4px 12px" }}>Most Popular</span>
//                     </div>
//                   )}
//                   <div style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:"var(--muted)", letterSpacing:".16em", textTransform:"uppercase", marginBottom:16 }}>{plan.name}</div>
//                   <div style={{ display:"flex", alignItems:"baseline", gap:6, marginBottom:8 }}>
//                     <span style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight:800, fontSize:38, color:"#fff", letterSpacing:"-.04em" }}>{plan.price}</span>
//                     <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"var(--muted)" }}>{plan.period}</span>
//                   </div>
//                   <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"var(--secondary)", marginBottom:24, lineHeight:1.7 }}>{plan.desc}</p>
//                   <ul style={{ listStyle:"none", display:"flex", flexDirection:"column", gap:10, marginBottom:28 }}>
//                     {plan.features.map((f,j) => (
//                       <li key={j} style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
//                         <span style={{ color:"var(--accent)", fontSize:14, marginTop:1 }}>✓</span>
//                         <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"var(--secondary)", lineHeight:1.6 }}>{f}</span>
//                       </li>
//                     ))}
//                   </ul>
//                   <button className={plan.highlight?"btn-primary":"btn-ghost"} style={{ width:"100%", justifyContent:"center" }} onClick={goToSignIn}>
//                     {plan.cta}
//                   </button>
//                 </div>
//               </FadeSection>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
//       <section className="section" id="testimonials">
//         <div className="container">
//           <FadeSection>
//             <div className="section-head">
//               <div className="pill" style={{ marginBottom:20 }}>Testimonials</div>
//               <h2 style={{ fontWeight:800, fontSize:"clamp(28px,4vw,46px)", color:"#fff", letterSpacing:"-.035em" }}>
//                 Students who{" "}
//                 <span style={{ background:"linear-gradient(90deg,#007BFF,#20c997)", WebkitBackgroundClip:"text", color:"transparent" }}>got placed</span>
//               </h2>
//             </div>
//           </FadeSection>
//           <div className="grid-2-testi">
//             {TESTIMONIALS.map((t,i) => (
//               <FadeSection key={i} delay={i*0.07}>
//                 <div className="testi-card">
//                   <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:"var(--secondary)", lineHeight:1.78, marginBottom:20 }}>
//                     "{t.text}"
//                   </p>
//                   <div style={{ display:"flex", alignItems:"center", gap:12 }}>
//                     <div className="avatar">{t.avatar}</div>
//                     <div>
//                       <div style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:500, fontSize:14, color:"#fff" }}>{t.name}</div>
//                       <div style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:"var(--muted)", letterSpacing:".1em" }}>{t.batch}</div>
//                     </div>
//                   </div>
//                 </div>
//               </FadeSection>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ── FAQ ──────────────────────────────────────────────────────────── */}
//       <section className="section" id="faq" style={{ background:"#070707", borderTop:"1px solid var(--border)" }}>
//         <div className="container" style={{ maxWidth:720 }}>
//           <FadeSection>
//             <div className="section-head">
//               <div className="pill" style={{ marginBottom:20 }}>FAQ</div>
//               <h2 style={{ fontWeight:800, fontSize:"clamp(28px,4vw,46px)", color:"#fff", letterSpacing:"-.035em" }}>
//                 Common questions
//               </h2>
//             </div>
//           </FadeSection>
//           <div>
//             {FAQS.map((faq,i) => (
//               <div key={i} className="faq-item">
//                 <button className="faq-q" onClick={() => setOpenFaq(openFaq===i?null:i)}>
//                   <span>{faq.q}</span>
//                   <span style={{ color:"var(--accent)", fontSize:18, flexShrink:0, transition:"transform .22s", transform: openFaq===i?"rotate(45deg)":"rotate(0)" }}>+</span>
//                 </button>
//                 {openFaq===i && (
//                   <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:"var(--secondary)", lineHeight:1.8, paddingBottom:20 }}>
//                     {faq.a}
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ── CTA BANNER ───────────────────────────────────────────────────── */}
//       <section className="section" style={{ position:"relative", overflow:"hidden", textAlign:"center" }}>
//         <div className="dot-grid" style={{ position:"absolute", inset:0, zIndex:0 }}/>
//         <div className="glow" style={{ width:600, height:400, background:"#20c997", top:"50%", left:"50%", transform:"translate(-50%,-50%)", opacity:.06 }}/>
//         <div style={{ position:"relative", zIndex:1, maxWidth:600, margin:"0 auto" }}>
//           <h2 style={{ fontWeight:800, fontSize:"clamp(30px,5vw,52px)", color:"#fff", letterSpacing:"-.04em", marginBottom:16 }}>
//             Ready to crack<br/>
//             <span style={{ background:"linear-gradient(90deg,#007BFF,#20c997)", WebkitBackgroundClip:"text", color:"transparent" }}>placement season?</span>
//           </h2>
//           <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:16, color:"var(--secondary)", lineHeight:1.8, marginBottom:32 }}>
//             Join 1,000+ students who use Codify to prepare smarter. It's free to start.
//           </p>
//           <button className="btn-primary" style={{ fontSize:15, padding:"16px 36px" }} onClick={goToSignIn}>
//             Get Started Free →
//           </button>
//         </div>
//       </section>

//       {/* ── FOOTER ───────────────────────────────────────────────────────── */}
//       <footer style={{ background:"#000", borderTop:"1px solid var(--border)", padding:"48px clamp(20px,5vw,72px) 32px" }}>
//         <div style={{ maxWidth:1100, margin:"0 auto" }}>
//           {/* Accent line */}
//           <div style={{ height:1, background:"linear-gradient(90deg,transparent,var(--accent),transparent)", marginBottom:48, opacity:.4 }}/>
//           <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:40, marginBottom:48 }}>
//             <div>
//               <span style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight:800, fontSize:20, background:"linear-gradient(to right,#007BFF,#20c997)", WebkitBackgroundClip:"text", color:"transparent", letterSpacing:"-.03em" }}>Codify</span>
//               <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"var(--muted)", lineHeight:1.8, marginTop:12, maxWidth:240 }}>
//                 Placement prep platform built for engineering students. Real questions, real intel, real results.
//               </p>
//             </div>
//             {[
//               { heading:"Product", links:["Features","How It Works","Pricing","FAQ"] },
//               { heading:"Platform", links:["PataKaro","IntelliCode","CodeCast","FTE Prep"] },
//               { heading:"Connect", links:["Instagram","LinkedIn","Discord","Contact"] },
//             ].map(col => (
//               <div key={col.heading}>
//                 <div style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:"var(--accent)", letterSpacing:".16em", textTransform:"uppercase", marginBottom:16 }}>{col.heading}</div>
//                 <ul style={{ listStyle:"none", display:"flex", flexDirection:"column", gap:10 }}>
//                   {col.links.map(l => (
//                     <li key={l}>
//                       <button style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"var(--muted)", background:"none", border:"none", cursor:"pointer", padding:0, transition:"color .2s" }}
//                         onMouseEnter={e=>e.target.style.color="#fff"} onMouseLeave={e=>e.target.style.color="var(--muted)"}
//                         onClick={goToSignIn}>{l}</button>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             ))}
//           </div>
//           <div style={{ borderTop:"1px solid var(--border)", paddingTop:24, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
//             <span style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:"var(--muted)", letterSpacing:".1em" }}>© 2026 CODIFY · ALL RIGHTS RESERVED</span>
//             <span style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:"var(--muted)", letterSpacing:".1em" }}>BUILT FOR NSUT & DTU STUDENTS</span>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// }

// // ── FadeSection wrapper ────────────────────────────────────────────────────
// function FadeSection({ children, delay = 0 }) {
//   const [ref, inView] = useInView();
//   return (
//     <div ref={ref} style={{
//       opacity: inView ? 1 : 0,
//       transform: inView ? "translateY(0)" : "translateY(24px)",
//       transition: `opacity .55s ease ${delay}s, transform .55s ease ${delay}s`,
//     }}>
//       {children}
//     </div>
//   );
// }