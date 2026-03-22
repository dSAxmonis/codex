import { useUser, useAuth, SignOutButton } from '@clerk/clerk-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import Loader from './Loader';
import api from '../Utils/api';

const UserProfile = () => {
  const { user }     = useUser();
  const { getToken } = useAuth();

  const [dbUser,      setDbUser]      = useState(null);
  const [progress,    setProgress]    = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [editing,     setEditing]     = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [form,        setForm]        = useState({});
  const [activeTab,   setActiveTab]   = useState('overview');

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        setLoading(true);
        const token = await getToken();
        const [u, p, s] = await Promise.all([
          api.users.me(token),
          api.progress.get(token),
          api.submissions.list(token),
        ]);
        setDbUser(u);
        setProgress(p.solved || []);
        setSubmissions(s.submissions || []);
        setForm({
          fullName:          u.fullName || '',
          username:          u.username || '',
          leetcodeProfile:   u.leetcodeProfile || '',
          codeforcesProfile: u.codeforcesProfile || '',
          upi:               u.upi || '',
        });
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, getToken]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = await getToken();
      const updated = await api.users.update(token, form);
      setDbUser(updated);
      setEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // ── Derived stats ──────────────────────────────────────────────────────────
  const name     = dbUser?.fullName || user?.fullName || 'User';
  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const acCount  = submissions.filter(s => s.verdict === 'AC').length;
  const waCount  = submissions.filter(s => s.verdict === 'WA').length;
  const tleCount = submissions.filter(s => s.verdict === 'TLE').length;
  const ceCount  = submissions.filter(s => s.verdict === 'CE').length;
  const acRate   = submissions.length ? Math.round((acCount / submissions.length) * 100) : 0;

  const easyCount  = progress.filter(p => p.questionId?.difficulty === 'Easy').length;
  const medCount   = progress.filter(p => p.questionId?.difficulty === 'Medium').length;
  const hardCount  = progress.filter(p => p.questionId?.difficulty === 'Hard').length;

  // ── Heatmap data ───────────────────────────────────────────────────────────
  const buildHeatmap = () => {
    const today  = new Date();
    const weeks  = 26; // 6 months
    const cells  = weeks * 7;
    const counts = {};

    submissions.forEach(s => {
      const d = new Date(s.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      counts[key] = (counts[key] || 0) + 1;
    });

    const result = [];
    for (let i = cells - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      result.push({ date: key, count: counts[key] || 0, day: d.getDay() });
    }
    return result;
  };

  const heatmapData  = buildHeatmap();
  const totalActivity = heatmapData.filter(d => d.count > 0).length;

  const heatColor = (count) => {
    if (count === 0) return 'rgba(255,255,255,0.05)';
    if (count === 1) return 'rgba(32,201,151,0.25)';
    if (count === 2) return 'rgba(32,201,151,0.45)';
    if (count === 3) return 'rgba(32,201,151,0.65)';
    return '#20c997';
  };

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const verdictColors = { AC: '#4ade80', WA: '#f87171', TLE: '#f59e0b', CE: '#a78bfa', RE: '#f87171' };

  // Donut chart helper
  const Donut = ({ data, size = 100, stroke = 14 }) => {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const total = data.reduce((a, b) => a + b.value, 0) || 1;
    let offset = 0;
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke}/>
        {data.map((d, i) => {
          const dash = (d.value / total) * circ;
          const gap  = circ - dash;
          const el = (
            <circle key={i} cx={size/2} cy={size/2} r={r} fill="none"
              stroke={d.color} strokeWidth={stroke}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              transform={`rotate(-90 ${size/2} ${size/2})`}
              style={{ transition: 'stroke-dasharray .5s ease' }}
            />
          );
          offset += dash;
          return el;
        })}
      </svg>
    );
  };

  return (
    <div style={{ background: '#080B0F', minHeight: '100vh', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..60,700;12..60,800&family=DM+Sans:wght@300;400;500&family=Space+Mono:wght@400;700&display=swap');
        :root{--a:#20c997;--ab:rgba(32,201,151,0.09);--abr:rgba(32,201,151,0.2);--bd:rgba(255,255,255,0.07);--s:#0e1218;--m:#6A6A6A;--t:#8C8C8C;}
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.2}}
        @keyframes fillBar{from{width:0}to{width:var(--w)}}
        .card{background:var(--s);border:1px solid var(--bd);border-radius:16px;overflow:hidden;transition:border-color .22s;}
        .card:hover{border-color:rgba(32,201,151,0.18);}
        .tab{padding:9px 18px;border-radius:8px;font-family:'Space Mono',monospace;font-size:9px;letter-spacing:.12em;text-transform:uppercase;cursor:pointer;border:1px solid transparent;background:transparent;color:var(--t);transition:all .2s;}
        .tab:hover{color:#fff;border-color:var(--bd);}
        .tab.active{background:var(--ab);border-color:var(--abr);color:var(--a);}
        .inp{width:100%;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.09);border-radius:10px;padding:11px 14px;color:#fff;font-family:'DM Sans',sans-serif;font-size:14px;outline:none;transition:all .22s;}
        .inp:focus{border-color:var(--abr);box-shadow:0 0 0 3px rgba(32,201,151,0.08);}
        .inp::placeholder{color:var(--m);}
        .pill{display:inline-flex;align-items:center;gap:6px;font-family:'Space Mono',monospace;font-size:9px;color:var(--a);background:var(--ab);border:1px solid var(--abr);border-radius:100px;padding:4px 12px;letter-spacing:.13em;text-transform:uppercase;}
        .hm-cell{border-radius:3px;transition:all .15s;cursor:pointer;}
        .hm-cell:hover{transform:scale(1.4);z-index:10;}
        .geo-bg{position:fixed;inset:0;pointer-events:none;z-index:0;opacity:.15;}
        .stat-bar{height:6px;border-radius:3px;transition:width .8s ease;}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(32,201,151,0.2);border-radius:4px}
        @media(max-width:700px){.profile-grid{grid-template-columns:1fr!important}.stats-row{grid-template-columns:repeat(2,1fr)!important}}
      `}</style>

      {/* Geometry bg */}
      <svg className="geo-bg" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="ug1" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#20c997" stopOpacity=".18"/><stop offset="100%" stopColor="#20c997" stopOpacity="0"/></radialGradient>
          <radialGradient id="ug2" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#007BFF" stopOpacity=".14"/><stop offset="100%" stopColor="#007BFF" stopOpacity="0"/></radialGradient>
        </defs>
        <ellipse cx="90%" cy="10%" rx="300" ry="240" fill="url(#ug1)"/>
        <ellipse cx="5%" cy="85%" rx="260" ry="200" fill="url(#ug2)"/>
        {Array.from({length:16}).map((_,i)=><line key={`h${i}`} x1="0" y1={`${(i+1)*6}%`} x2="100%" y2={`${(i+1)*6}%`} stroke="rgba(255,255,255,0.025)" strokeWidth="1"/>)}
        {Array.from({length:20}).map((_,i)=><line key={`v${i}`} x1={`${(i+1)*5}%`} y1="0" x2={`${(i+1)*5}%`} y2="100%" stroke="rgba(255,255,255,0.025)" strokeWidth="1"/>)}
        <circle cx="88%" cy="88%" r="65" fill="none" stroke="rgba(0,123,255,0.07)" strokeWidth="1.5"/>
        <polygon points="0,0 90,0 0,90" fill="rgba(32,201,151,0.04)"/>
      </svg>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <Header />

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 64px)' }}>
            <Loader />
          </div>
        ) : (
          <main style={{ maxWidth: 1060, margin: '0 auto', padding: '36px clamp(14px,4vw,44px) 80px', display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* ── Hero Card ─────────────────────────────────────────────── */}
            <div className="card" style={{ padding: '28px', animation: 'fadeUp .5s ease both', position: 'relative', overflow: 'hidden' }}>
              {/* Accent bg */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,#007BFF,#20c997)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                <div style={{ width: 76, height: 76, borderRadius: '50%', background: 'linear-gradient(135deg,#007BFF,#20c997)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: 26, color: '#fff', flexShrink: 0, position: 'relative', boxShadow: '0 0 0 3px rgba(32,201,151,0.2)' }}>
                  {user?.imageUrl ? <img src={user.imageUrl} alt={name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : initials}
                  <div style={{ position: 'absolute', bottom: 3, right: 3, width: 13, height: 13, borderRadius: '50%', background: '#20c997', border: '2px solid #0e1218', animation: 'blink 3s ease infinite' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5, flexWrap: 'wrap' }}>
                    <h1 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: 'clamp(18px,3vw,28px)', color: '#fff', letterSpacing: '-.02em' }}>{name}</h1>
                    {dbUser?.isMember && <span className="pill">⭐ Pro Member</span>}
                  </div>
                  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: 'var(--m)', marginBottom: 6 }}>{user?.primaryEmailAddress?.emailAddress}</div>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: 'var(--m)' }}>
                      📅 Joined {dbUser?.createdAt ? new Date(dbUser.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'N/A'}
                    </span>
                    {dbUser?.leetcodeProfile && (
                      <a href={`https://leetcode.com/${dbUser.leetcodeProfile}`} target="_blank" rel="noreferrer" style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: '#f59e0b', textDecoration: 'none' }}>
                        🟡 LeetCode
                      </a>
                    )}
                    {dbUser?.codeforcesProfile && (
                      <a href={`https://codeforces.com/profile/${dbUser.codeforcesProfile}`} target="_blank" rel="noreferrer" style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: '#60a5fa', textDecoration: 'none' }}>
                        🔵 Codeforces
                      </a>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button onClick={() => setEditing(!editing)}
                    style={{ padding: '10px 18px', background: editing ? 'rgba(248,113,113,0.1)' : 'var(--ab)', border: `1px solid ${editing ? 'rgba(248,113,113,0.25)' : 'var(--abr)'}`, borderRadius: 10, color: editing ? '#f87171' : 'var(--a)', fontFamily: "'DM Sans',sans-serif", fontSize: 13, cursor: 'pointer', transition: 'all .2s' }}>
                    {editing ? '✕ Cancel' : '✏️ Edit'}
                  </button>
                  <SignOutButton>
                    <button style={{ padding: '10px 18px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10, color: '#f87171', fontFamily: "'DM Sans',sans-serif", fontSize: 13, cursor: 'pointer' }}>
                      Sign Out
                    </button>
                  </SignOutButton>
                </div>
              </div>
            </div>

            {/* ── Stats Row ─────────────────────────────────────────────── */}
            <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, animation: 'fadeUp .5s ease .05s both' }}>
              {[
                { label: 'Solved',      value: dbUser?.questionsSolved || 0,  color: '#20c997', icon: '✅', sub: `${easyCount}E · ${medCount}M · ${hardCount}H` },
                { label: 'Submissions', value: submissions.length,             color: '#007BFF', icon: '📤', sub: `${acRate}% acceptance` },
                { label: 'Accepted',    value: acCount,                        color: '#4ade80', icon: '⚡', sub: `${waCount} wrong answers` },
                { label: 'Streak',      value: `${dbUser?.streak || 0}d`,      color: '#f59e0b', icon: '🔥', sub: `${totalActivity} active days` },
              ].map((s, i) => (
                <div key={i} className="card" style={{ padding: '18px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: 'var(--m)', letterSpacing: '.1em', textTransform: 'uppercase' }}>{s.label}</span>
                    <span style={{ fontSize: 16 }}>{s.icon}</span>
                  </div>
                  <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: 'clamp(20px,3vw,28px)', color: s.color, letterSpacing: '-.02em', marginBottom: 4 }}>{s.value}</div>
                  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: 'var(--m)', letterSpacing: '.07em' }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* ── Main grid ─────────────────────────────────────────────── */}
            <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 18, animation: 'fadeUp .5s ease .1s both' }}>

              {/* Left column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                {/* Activity Heatmap */}
                <div className="card" style={{ padding: '22px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <span className="pill">📊 Activity Heatmap</span>
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: 'var(--m)' }}>{totalActivity} active days · last 6 months</span>
                  </div>

                  {/* Month labels */}
                  <div style={{ display: 'flex', gap: 2, marginBottom: 4, paddingLeft: 20 }}>
                    {(() => {
                      const today = new Date();
                      const labels = [];
                      for (let w = 25; w >= 0; w -= 4) {
                        const d = new Date(today);
                        d.setDate(today.getDate() - w * 7);
                        labels.push(<span key={w} style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: 'var(--m)', flex: 1, textAlign: 'center' }}>{MONTHS[d.getMonth()]}</span>);
                      }
                      return labels;
                    })()}
                  </div>

                  <div style={{ display: 'flex', gap: 3 }}>
                    {/* Day labels */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginRight: 4 }}>
                      {['S','M','T','W','T','F','S'].map((d,i) => (
                        <div key={i} style={{ width: 12, height: 12, fontFamily: "'Space Mono',monospace", fontSize: 7, color: 'var(--m)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i%2===1?d:''}</div>
                      ))}
                    </div>
                    {/* Grid */}
                    <div style={{ display: 'flex', gap: 3, flex: 1, overflowX: 'auto' }}>
                      {Array.from({ length: 26 }, (_, weekIdx) => (
                        <div key={weekIdx} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          {Array.from({ length: 7 }, (_, dayIdx) => {
                            const cellIdx = weekIdx * 7 + dayIdx;
                            const cell = heatmapData[cellIdx];
                            return cell ? (
                              <div key={dayIdx} className="hm-cell" title={`${cell.date}: ${cell.count} submission${cell.count !== 1 ? 's' : ''}`}
                                style={{ width: 12, height: 12, background: heatColor(cell.count), borderRadius: 2 }} />
                            ) : <div key={dayIdx} style={{ width: 12, height: 12 }} />;
                          })}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Legend */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, justifyContent: 'flex-end' }}>
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: 'var(--m)' }}>Less</span>
                    {[0,1,2,3,4].map(v => <div key={v} style={{ width: 10, height: 10, background: heatColor(v), borderRadius: 2 }} />)}
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: 'var(--m)' }}>More</span>
                  </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: 8 }}>
                  {['overview','solved','submissions'].map(t => (
                    <button key={t} className={`tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>{t}</button>
                  ))}
                </div>

                {/* Overview */}
                {activeTab === 'overview' && (
                  <div className="card" style={{ padding: '22px' }}>
                    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: 'var(--a)', letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 18 }}>Profile Details</div>
                    {editing ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {[
                          { label: 'Full Name',          key: 'fullName',          placeholder: 'Your full name' },
                          { label: 'Username',           key: 'username',          placeholder: 'username' },
                          { label: 'LeetCode Profile',   key: 'leetcodeProfile',   placeholder: 'leetcode username' },
                          { label: 'Codeforces Profile', key: 'codeforcesProfile', placeholder: 'codeforces handle' },
                          { label: 'UPI ID',             key: 'upi',               placeholder: 'yourname@upi' },
                        ].map(f => (
                          <div key={f.key}>
                            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: 'var(--m)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 5 }}>{f.label}</div>
                            <input className="inp" placeholder={f.placeholder} value={form[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
                          </div>
                        ))}
                        <button onClick={handleSave} disabled={saving}
                          style={{ padding: '12px', background: '#20c997', color: '#000', border: 'none', borderRadius: 10, fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 14, cursor: 'pointer', opacity: saving ? .7 : 1, marginTop: 4 }}>
                          {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                        {[
                          { label: 'Full Name',  value: dbUser?.fullName || '—' },
                          { label: 'Username',   value: dbUser?.username  || '—' },
                          { label: 'Email',      value: user?.primaryEmailAddress?.emailAddress || '—' },
                          { label: 'LeetCode',   value: dbUser?.leetcodeProfile   || '—', link: dbUser?.leetcodeProfile ? `https://leetcode.com/${dbUser.leetcodeProfile}` : null },
                          { label: 'Codeforces', value: dbUser?.codeforcesProfile || '—', link: dbUser?.codeforcesProfile ? `https://codeforces.com/profile/${dbUser.codeforcesProfile}` : null },
                          { label: 'UPI ID',     value: dbUser?.upi || '—' },
                        ].map((f, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '13px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: 'var(--m)', letterSpacing: '.09em', textTransform: 'uppercase', width: 100, flexShrink: 0 }}>{f.label}</span>
                            {f.link ? (
                              <a href={f.link} target="_blank" rel="noreferrer" style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: 'var(--a)', textDecoration: 'none' }}>{f.value} ↗</a>
                            ) : (
                              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: '#ccc' }}>{f.value}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Solved */}
                {activeTab === 'solved' && (
                  <div className="card">
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="pill">✅ Solved Questions</span>
                      <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: 'var(--m)' }}>{progress.length} total</span>
                    </div>
                    {progress.length === 0 ? (
                      <div style={{ padding: '40px', textAlign: 'center' }}>
                        <div style={{ fontSize: 36, marginBottom: 12 }}>📭</div>
                        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: 'var(--t)', marginBottom: 16 }}>No questions solved yet.</p>
                        <Link to="/intellicode" style={{ padding: '10px 20px', background: 'var(--ab)', border: '1px solid var(--abr)', borderRadius: 8, color: 'var(--a)', fontFamily: "'DM Sans',sans-serif", fontSize: 13, textDecoration: 'none' }}>Start Solving →</Link>
                      </div>
                    ) : progress.map((p, i) => {
                      const q = p.questionId;
                      const dc = { Easy: '#4ade80', Medium: '#fbbf24', Hard: '#f87171' }[q?.difficulty] || '#fbbf24';
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: i < progress.length-1 ? '1px solid rgba(255,255,255,0.05)' : 'none', transition: 'background .18s', cursor: 'pointer' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(32,201,151,0.04)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <span style={{ color: '#4ade80', fontSize: 13 }}>✓</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: '#fff', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q?.name || 'Unknown'}</div>
                            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: 'var(--m)', marginTop: 1 }}>{q?.company}</div>
                          </div>
                          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: dc, background: `${dc}15`, border: `1px solid ${dc}28`, borderRadius: 4, padding: '2px 7px', flexShrink: 0 }}>{q?.difficulty}</span>
                          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: 'var(--m)', flexShrink: 0 }}>{new Date(p.solvedAt).toLocaleDateString()}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Submissions */}
                {activeTab === 'submissions' && (
                  <div className="card">
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="pill">📤 Submissions</span>
                      <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: 'var(--m)' }}>{submissions.length} total</span>
                    </div>
                    {submissions.length === 0 ? (
                      <div style={{ padding: '40px', textAlign: 'center' }}>
                        <div style={{ fontSize: 36, marginBottom: 12 }}>📭</div>
                        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: 'var(--t)' }}>No submissions yet.</p>
                      </div>
                    ) : submissions.slice(0,20).map((s, i) => {
                      const vc = verdictColors[s.verdict] || '#8C8C8C';
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: i < Math.min(submissions.length,20)-1 ? '1px solid rgba(255,255,255,0.05)' : 'none', transition: 'background .18s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(32,201,151,0.04)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: vc, background: `${vc}14`, border: `1px solid ${vc}28`, borderRadius: 4, padding: '2px 8px', flexShrink: 0, minWidth: 32, textAlign: 'center' }}>{s.verdict}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: '#ddd', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.questionId?.name || 'Unknown'}</div>
                            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: 'var(--m)', marginTop: 1 }}>{s.language?.toUpperCase()}</div>
                          </div>
                          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: 'var(--m)', flexShrink: 0 }}>{new Date(s.createdAt).toLocaleDateString()}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Sidebar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                {/* Difficulty Donut */}
                <div className="card" style={{ padding: '20px' }}>
                  <div className="pill" style={{ marginBottom: 16 }}>Difficulty</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', marginBottom: 16 }}>
                    <Donut size={110} stroke={14} data={[
                      { value: easyCount, color: '#4ade80' },
                      { value: medCount,  color: '#fbbf24' },
                      { value: hardCount, color: '#f87171' },
                    ]} />
                    <div style={{ position: 'absolute', textAlign: 'center' }}>
                      <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: 20, color: '#fff' }}>{progress.length}</div>
                      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: 'var(--m)' }}>solved</div>
                    </div>
                  </div>
                  {[
                    { label: 'Easy',   count: easyCount, color: '#4ade80', total: 100 },
                    { label: 'Medium', count: medCount,  color: '#fbbf24', total: 100 },
                    { label: 'Hard',   count: hardCount, color: '#f87171', total: 100 },
                  ].map(d => (
                    <div key={d.label} style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: d.color, letterSpacing: '.08em' }}>{d.label}</span>
                        <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: 'var(--m)' }}>{d.count}</span>
                      </div>
                      <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.min((d.count/Math.max(progress.length,1))*100, 100)}%`, background: d.color, borderRadius: 3, transition: 'width .8s ease' }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Verdict Breakdown */}
                <div className="card" style={{ padding: '20px' }}>
                  <div className="pill" style={{ marginBottom: 16 }}>Submissions</div>
                  {[
                    { label: 'Accepted',   count: acCount,  color: '#4ade80' },
                    { label: 'Wrong Ans',  count: waCount,  color: '#f87171' },
                    { label: 'Time Limit', count: tleCount, color: '#f59e0b' },
                    { label: 'Compile Err',count: ceCount,  color: '#a78bfa' },
                  ].map(v => (
                    <div key={v.label} style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: v.color, letterSpacing: '.07em' }}>{v.label}</span>
                        <span style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: 14, color: v.color }}>{v.count}</span>
                      </div>
                      <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${submissions.length ? Math.min((v.count/submissions.length)*100,100) : 0}%`, background: v.color, borderRadius: 2, transition: 'width .8s ease' }} />
                      </div>
                    </div>
                  ))}
                  <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: 'var(--m)' }}>Acceptance Rate</span>
                    <span style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: 16, color: '#20c997' }}>{acRate}%</span>
                  </div>
                </div>

                {/* Quick Links */}
                <div className="card" style={{ padding: '20px' }}>
                  <div className="pill" style={{ marginBottom: 14 }}>Quick Access</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'PataKaro',   icon: '📁', to: '/patakaro',    color: '#20c997' },
                      { label: 'IntelliCode',icon: '⚡', to: '/intellicode',  color: '#007BFF' },
                      { label: 'FTE Prep',   icon: '🎯', to: '/fte',          color: '#f59e0b' },
                      { label: 'Home',       icon: '🏠', to: '/home',         color: '#8C8C8C' },
                    ].map((l, i) => (
                      <Link key={i} to={l.to} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, textDecoration: 'none', transition: 'all .2s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = `${l.color}0d`; e.currentTarget.style.borderColor = `${l.color}30`; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}>
                        <span style={{ fontSize: 15 }}>{l.icon}</span>
                        <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: '#ccc', fontWeight: 500 }}>{l.label}</span>
                        <span style={{ marginLeft: 'auto', color: 'var(--m)', fontSize: 11 }}>→</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </main>
        )}

        <footer style={{ background: '#080808', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '24px clamp(14px,4vw,44px)' }}>
          <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,#20c997,#007BFF,transparent)', opacity: .4, marginBottom: 18 }} />
          <div style={{ maxWidth: 1060, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: 'var(--m)' }}>© {new Date().getFullYear()} Codify</span>
            <Link to="/home" style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: 'var(--m)', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = '#20c997'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--m)'}>← Back to Home</Link>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default UserProfile;