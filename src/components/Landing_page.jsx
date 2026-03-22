import React, { useState, useEffect, useRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useUser, SignOutButton } from '@clerk/clerk-react';
import Header from './Header';
import Loader from './Loader';

function useInView() {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true); }, { threshold: 0.08 });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, []);
  return [ref, v];
}
function FadeIn({ children, delay = 0, style = {} }) {
  const [ref, v] = useInView();
  return <div ref={ref} style={{ opacity: v ? 1 : 0, transform: v ? 'translateY(0)' : 'translateY(22px)', transition: `opacity .55s ease ${delay}s, transform .55s ease ${delay}s`, ...style }}>{children}</div>;
}

// ── Static data ───────────────────────────────────────────────────────────────
const DAILY = {
  company: 'Amazon', title: 'Two Sum – Variant', difficulty: 'Medium',
  diffColor: '#f59e0b', tags: ['Arrays', 'Hash Map', 'O(n)'],
  desc: 'Return indices of two numbers from an array that add up to the target. Each input has exactly one solution.',
  to: '/intellicode',
};

const ACTIVITY = [
  { icon: '✓', label: 'Solved',  item: 'Longest Substring Without Repeating', co: 'Google',    t: '2h ago',    c: '#20c997' },
  { icon: '👁', label: 'Viewed',  item: 'Microsoft SDE Intern OA 2025',        co: 'Microsoft', t: '5h ago',    c: '#007BFF' },
  { icon: '✓', label: 'Solved',  item: 'Valid Parentheses',                    co: 'Adobe',     t: 'Yesterday', c: '#20c997' },
  { icon: '👁', label: 'Viewed',  item: 'Goldman Sachs Interview Experience',   co: 'Goldman',   t: '2d ago',    c: '#007BFF' },
  { icon: '✓', label: 'Solved',  item: 'Binary Search',                        co: 'Flipkart',  t: '3d ago',    c: '#20c997' },
];

const TRENDING = [
  { rank: 1, type: 'Company',  name: 'Goldman Sachs',        meta: 'OA this week · 230 views',  hot: true  },
  { rank: 2, type: 'Question', name: 'Merge K Sorted Lists', meta: 'Asked in 8 OAs · Hard',     hot: true  },
  { rank: 3, type: 'Company',  name: 'Microsoft',            meta: 'New questions added',        hot: false },
  { rank: 4, type: 'Question', name: 'LRU Cache',            meta: 'Trending · Medium',          hot: false },
  { rank: 5, type: 'Company',  name: 'Atlassian',            meta: 'Interview exp added',        hot: false },
  { rank: 6, type: 'Question', name: 'Word Break II',        meta: 'Hard · DP',                  hot: false },
];

const LEADERBOARD = [
  { rank:1,  name:'Rahul S.',  batch:'NSUT CSE \'25', solved:342, streak:28, crown:'🥇' },
  { rank:2,  name:'Priya M.',  batch:'DTU IT \'25',   solved:298, streak:21, crown:'🥈' },
  { rank:3,  name:'Aryan K.',  batch:'NSUT ECE \'25', solved:271, streak:19, crown:'🥉' },
  { rank:4,  name:'Sneha G.',  batch:'DTU CSE \'25',  solved:245, streak:14, crown:null  },
  { rank:5,  name:'Karan V.',  batch:'NSUT IT \'25',  solved:218, streak:11, crown:null  },
  { rank:6,  name:'Divya J.',  batch:'DTU ECE \'24',  solved:197, streak:9,  crown:null  },
  { rank:7,  name:'Mohit R.',  batch:'NSUT CSE \'25', solved:183, streak:7,  crown:null  },
  { rank:8,  name:'Aisha K.',  batch:'DTU IT \'25',   solved:171, streak:5,  crown:null  },
  { rank:9,  name:'Rohan S.',  batch:'NSUT ECE \'25', solved:158, streak:4,  crown:null  },
  { rank:10, name:'Neha P.',   batch:'DTU CSE \'24',  solved:144, streak:3,  crown:null  },
];

// OA calendar events
const OA_EVENTS = {
  '2026-03-24': [{ co: 'Google',    role: 'SDE Intern', color: '#4285F4' }],
  '2026-03-25': [{ co: 'Amazon',    role: 'SDE-1',      color: '#f59e0b' }],
  '2026-03-27': [{ co: 'Microsoft', role: 'SDE Intern', color: '#00a4ef' }],
  '2026-03-28': [{ co: 'Goldman',   role: 'Quant',      color: '#20c997' }],
  '2026-03-30': [{ co: 'Atlassian', role: 'SDE Intern', color: '#0052CC' }],
  '2026-04-02': [{ co: 'Adobe',     role: 'SDE Intern', color: '#FF0000' }],
  '2026-04-05': [{ co: 'Flipkart',  role: 'SDE-1',      color: '#F7C948' }],
};

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

// ── Geometry SVG background ───────────────────────────────────────────────────
function GeometryBg() {
  return (
    <svg style={{ position:'fixed', inset:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:0, opacity:.22 }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="g1" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#20c997" stopOpacity=".15"/>
          <stop offset="100%" stopColor="#20c997" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="g2" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#007BFF" stopOpacity=".12"/>
          <stop offset="100%" stopColor="#007BFF" stopOpacity="0"/>
        </radialGradient>
      </defs>
      {/* Glow orbs */}
      <ellipse cx="15%" cy="20%" rx="340" ry="260" fill="url(#g2)" />
      <ellipse cx="85%" cy="75%" rx="300" ry="240" fill="url(#g1)" />
      {/* Grid lines */}
      {Array.from({length:18}).map((_,i)=>(
        <line key={`h${i}`} x1="0" y1={`${(i+1)*5.5}%`} x2="100%" y2={`${(i+1)*5.5}%`} stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
      ))}
      {Array.from({length:24}).map((_,i)=>(
        <line key={`v${i}`} x1={`${(i+1)*4.2}%`} y1="0" x2={`${(i+1)*4.2}%`} y2="100%" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
      ))}
      {/* Diagonal accent lines */}
      <line x1="0" y1="0" x2="30%" y2="100%" stroke="rgba(32,201,151,0.04)" strokeWidth="1.5"/>
      <line x1="100%" y1="0" x2="70%" y2="100%" stroke="rgba(0,123,255,0.04)" strokeWidth="1.5"/>
      <line x1="50%" y1="0" x2="80%" y2="100%" stroke="rgba(32,201,151,0.03)" strokeWidth="1"/>
      {/* Corner geometric shapes */}
      <polygon points="0,0 120,0 0,120" fill="rgba(32,201,151,0.04)"/>
      <polygon points="100%,100% calc(100% - 140px),100% 100%,calc(100% - 140px)" fill="rgba(0,123,255,0.04)"/>
      {/* Circles */}
      <circle cx="90%" cy="12%" r="80" fill="none" stroke="rgba(32,201,151,0.06)" strokeWidth="1.5"/>
      <circle cx="90%" cy="12%" r="50" fill="none" stroke="rgba(32,201,151,0.05)" strokeWidth="1"/>
      <circle cx="8%" cy="85%" r="60" fill="none" stroke="rgba(0,123,255,0.06)" strokeWidth="1.5"/>
      {/* Dot pattern */}
      {Array.from({length:8}).map((_,r)=>
        Array.from({length:8}).map((_,c)=>(
          <circle key={`d${r}${c}`} cx={`${c*13+5}%`} cy={`${r*13+5}%`} r="1.2" fill="rgba(255,255,255,0.06)"/>
        ))
      )}
    </svg>
  );
}

// ── Calendar ──────────────────────────────────────────────────────────────────
function OACalendar() {
  const today = new Date();
  const [cur, setCur] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const [sel, setSel] = useState(null);

  const firstDay = new Date(cur.y, cur.m, 1).getDay();
  const daysInMonth = new Date(cur.y, cur.m + 1, 0).getDate();
  const cells = Array.from({ length: firstDay }, () => null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
  while (cells.length % 7 !== 0) cells.push(null);

  const key = (d) => d ? `${cur.y}-${String(cur.m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}` : null;
  const isToday = (d) => d && today.getDate()===d && today.getMonth()===cur.m && today.getFullYear()===cur.y;
  const isSel   = (d) => d && sel === key(d);

  return (
    <div>
      {/* Month nav */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
        <span style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight:700, fontSize:15, color:'#fff', letterSpacing:'-.01em' }}>
          {MONTHS[cur.m]} {cur.y}
        </span>
        <div style={{ display:'flex', gap:6 }}>
          {['‹','›'].map((ch,i)=>(
            <button key={ch} onClick={()=>setCur(p=>{ const nm=p.m+(i?1:-1); return nm<0?{y:p.y-1,m:11}:nm>11?{y:p.y+1,m:0}:{...p,m:nm}; })}
              style={{ width:28, height:28, borderRadius:6, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)', color:'#8C8C8C', fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .2s' }}
              onMouseEnter={e=>{ e.currentTarget.style.background='rgba(32,201,151,0.12)'; e.currentTarget.style.color='#20c997'; e.currentTarget.style.borderColor='rgba(32,201,151,0.25)'; }}
              onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.06)'; e.currentTarget.style.color='#8C8C8C'; e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; }}>
              {ch}
            </button>
          ))}
        </div>
      </div>

      {/* Day headers */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2, marginBottom:4 }}>
        {DAYS.map(d=>(
          <div key={d} style={{ textAlign:'center', fontFamily:"'Space Mono',monospace", fontSize:9, color:'#6A6A6A', letterSpacing:'.1em', padding:'4px 0' }}>{d}</div>
        ))}
      </div>

      {/* Cells */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2 }}>
        {cells.map((d, i) => {
          const k = key(d);
          const ev = k && OA_EVENTS[k];
          const tod = isToday(d);
          const slc = isSel(d);
          return (
            <div key={i} onClick={()=>d && setSel(slc ? null : k)}
              style={{ minHeight:36, borderRadius:7, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:2, cursor:d?'pointer':'default', padding:'4px 2px',
                background: slc ? 'rgba(32,201,151,0.15)' : tod ? 'rgba(32,201,151,0.08)' : ev ? 'rgba(0,123,255,0.06)' : 'transparent',
                border: slc ? '1px solid rgba(32,201,151,0.4)' : tod ? '1px solid rgba(32,201,151,0.25)' : ev ? '1px solid rgba(0,123,255,0.15)' : '1px solid transparent',
                transition:'all .18s',
              }}
              onMouseEnter={e=>{ if(d && !slc) e.currentTarget.style.background='rgba(255,255,255,0.05)'; }}
              onMouseLeave={e=>{ if(d && !slc) e.currentTarget.style.background=tod?'rgba(32,201,151,0.08)':ev?'rgba(0,123,255,0.06)':'transparent'; }}>
              {d && <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:tod?700:400, color:tod?'#20c997':ev?'#fff':'#8C8C8C' }}>{d}</span>}
              {ev && <div style={{ width:5, height:5, borderRadius:'50%', background:ev[0].color }} />}
            </div>
          );
        })}
      </div>

      {/* Selected event detail */}
      {sel && OA_EVENTS[sel] && (
        <div style={{ marginTop:14, padding:'12px 14px', background:'rgba(32,201,151,0.07)', border:'1px solid rgba(32,201,151,0.2)', borderRadius:10 }}>
          {OA_EVENTS[sel].map((ev,i)=>(
            <div key={i} style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:ev.color, flexShrink:0 }} />
              <div>
                <span style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:13, color:'#fff' }}>{ev.co}</span>
                <span style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:'#8C8C8C', marginLeft:8, letterSpacing:'.08em' }}>{ev.role}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upcoming OAs legend */}
      <div style={{ marginTop:14, paddingTop:12, borderTop:'1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:'#6A6A6A', letterSpacing:'.12em', textTransform:'uppercase', marginBottom:8 }}>Upcoming OAs</div>
        {Object.entries(OA_EVENTS).slice(0,3).map(([k,evs])=>(
          <div key={k} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:evs[0].color, flexShrink:0 }} />
            <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:'#8C8C8C' }}>{evs[0].co}</span>
            <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:'#6A6A6A', marginLeft:'auto' }}>{k.slice(5)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Leaderboard Modal ─────────────────────────────────────────────────────────
function LBModal({ onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const esc = e => { if(e.key==='Escape') onClose(); };
    window.addEventListener('keydown', esc);
    return () => { document.body.style.overflow=''; window.removeEventListener('keydown',esc); };
  }, []);
  const podium = [LEADERBOARD[1],LEADERBOARD[0],LEADERBOARD[2]];
  const pc = ['#C0C0C0','#FFD700','#CD7F32'];
  const ph = [72,96,60];
  return (
    <div style={{ position:'fixed', inset:0, zIndex:999, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }} onClick={onClose}>
      <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.9)', backdropFilter:'blur(12px)' }} />
      <div style={{ position:'relative', zIndex:1, background:'#0f0f0f', border:'1px solid rgba(255,255,255,0.09)', borderRadius:20, width:'100%', maxWidth:520, maxHeight:'88vh', overflow:'hidden', display:'flex', flexDirection:'column', boxShadow:'0 40px 80px rgba(0,0,0,0.8)', animation:'fadeUp .3s ease both' }}
        onClick={e=>e.stopPropagation()}>
        <div style={{ padding:'22px 24px 18px', borderBottom:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <div>
            <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:'#20c997', letterSpacing:'.16em', textTransform:'uppercase', marginBottom:4 }}>This Week</div>
            <h2 style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight:800, fontSize:20, color:'#fff', letterSpacing:'-.02em' }}>🏆 Leaderboard</h2>
          </div>
          <button onClick={onClose} style={{ width:34, height:34, borderRadius:'50%', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.09)', color:'#8C8C8C', fontSize:16, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .2s' }}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.12)';e.currentTarget.style.color='#fff';}}
            onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.06)';e.currentTarget.style.color='#8C8C8C';}}>✕</button>
        </div>
        {/* Podium */}
        <div style={{ padding:'20px 24px 0', display:'flex', justifyContent:'center', alignItems:'flex-end', gap:10, flexShrink:0 }}>
          {podium.map((u,i)=>(
            <div key={u.rank} style={{ flex:1, textAlign:'center' }}>
              <div style={{ fontSize:18, marginBottom:4 }}>{u.crown}</div>
              <div style={{ width:38, height:38, borderRadius:'50%', background:`${pc[i]}14`, border:`2px solid ${pc[i]}`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Space Mono',monospace", fontSize:10, color:pc[i], fontWeight:700, margin:'0 auto 5px' }}>{u.name.split(' ').map(n=>n[0]).join('')}</div>
              <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:'#fff', fontWeight:500 }}>{u.name}</div>
              <div style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight:800, fontSize:15, color:pc[i] }}>{u.solved}</div>
              <div style={{ background:`${pc[i]}10`, border:`1px solid ${pc[i]}20`, borderRadius:'6px 6px 0 0', height:ph[i], marginTop:8 }} />
            </div>
          ))}
        </div>
        {/* List */}
        <div style={{ overflowY:'auto', flex:1 }}>
          {LEADERBOARD.map((u,i)=>(
            <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 22px', borderBottom:i<LEADERBOARD.length-1?'1px solid rgba(255,255,255,0.05)':'none', transition:'background .18s', cursor:'pointer' }}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(32,201,151,0.04)'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <span style={{ fontFamily:"'Space Mono',monospace", fontSize:u.crown?14:10, width:24, textAlign:'center', flexShrink:0, color:i<3?'#FFD700':'#6A6A6A' }}>{u.crown||`#${u.rank}`}</span>
              <div style={{ width:30, height:30, borderRadius:'50%', background:'rgba(32,201,151,0.08)', border:'1px solid rgba(32,201,151,0.18)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Space Mono',monospace", fontSize:9, color:'#20c997', fontWeight:700, flexShrink:0 }}>{u.name.split(' ').map(n=>n[0]).join('')}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:'#fff', fontWeight:500 }}>{u.name}</div>
                <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:'#6A6A6A', marginTop:1 }}>{u.batch}</div>
              </div>
              <div style={{ textAlign:'right', flexShrink:0 }}>
                <div style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight:700, fontSize:14, color:'#20c997' }}>{u.solved}</div>
                <div style={{ fontFamily:"'Space Mono',monospace", fontSize:8, color:'#6A6A6A' }}>🔥 {u.streak}d</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function HomeFooter() {
  return (
    <footer style={{ position:'relative', zIndex:1, background:'#080808', borderTop:'1px solid rgba(255,255,255,0.06)', marginTop:60 }}>
      {/* Accent top line */}
      <div style={{ height:1, background:'linear-gradient(90deg,transparent,#20c997,#007BFF,transparent)', opacity:.5 }} />
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'44px clamp(16px,4vw,48px) 28px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr', gap:40, marginBottom:40 }}>
          {/* Brand */}
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
              <span style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight:800, fontSize:20, background:'linear-gradient(to right,#007BFF,#20c997)', WebkitBackgroundClip:'text', color:'transparent', letterSpacing:'-.03em' }}>Codify</span>
              <span style={{ fontFamily:"'Space Mono',monospace", fontSize:8, color:'#20c997', background:'rgba(32,201,151,0.09)', border:'1px solid rgba(32,201,151,0.2)', borderRadius:4, padding:'2px 7px', letterSpacing:'.12em' }}>BETA</span>
            </div>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:'#6A6A6A', lineHeight:1.8, maxWidth:260, marginBottom:20 }}>
              Placement prep platform built for NSUT & DTU students. Real OA questions, company intel, AI-powered coding.
            </p>
            {/* Social links */}
            <div style={{ display:'flex', gap:10 }}>
              {[
                { label:'WA', color:'#25D366', href:'https://wa.me/7678246284' },
                { label:'IG', color:'#E1306C', href:'#' },
                { label:'IN', color:'#0A66C2', href:'#' },
                { label:'GM', color:'#EA4335', href:'mailto:codify.ask@gmail.com' },
              ].map(s=>(
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer"
                  style={{ width:34, height:34, borderRadius:8, background:`${s.color}12`, border:`1px solid ${s.color}25`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Space Mono',monospace", fontSize:9, color:s.color, fontWeight:700, textDecoration:'none', transition:'all .2s' }}
                  onMouseEnter={e=>{ e.currentTarget.style.background=`${s.color}22`; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.borderColor=`${s.color}50`; }}
                  onMouseLeave={e=>{ e.currentTarget.style.background=`${s.color}12`; e.currentTarget.style.transform=''; e.currentTarget.style.borderColor=`${s.color}25`; }}>
                  {s.label}
                </a>
              ))}
            </div>
          </div>
          {/* Quick links */}
          <div>
            <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:'#20c997', letterSpacing:'.16em', textTransform:'uppercase', marginBottom:16 }}>Platform</div>
            <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:10 }}>
              {[['Home','/home'],['PataKaro','/patakaro'],['IntelliCode','/intellicode'],['FTE','/fte']].map(([l,to])=>(
                <li key={l}>
                  <RouterLink to={to} style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:'#6A6A6A', textDecoration:'none', transition:'color .2s' }}
                    onMouseEnter={e=>e.currentTarget.style.color='#20c997'}
                    onMouseLeave={e=>e.currentTarget.style.color='#6A6A6A'}>
                    {l}
                  </RouterLink>
                </li>
              ))}
            </ul>
          </div>
          {/* Contact */}
          <div>
            <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:'#20c997', letterSpacing:'.16em', textTransform:'uppercase', marginBottom:16 }}>Contact</div>
            <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:10 }}>
              {[['Email us','mailto:codify.ask@gmail.com'],['WhatsApp','https://wa.me/7678246284'],['Report a bug','mailto:codify.ask@gmail.com'],['Feedback','/home']].map(([l,href])=>(
                <li key={l}>
                  <a href={href} style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:'#6A6A6A', textDecoration:'none', transition:'color .2s' }}
                    onMouseEnter={e=>e.currentTarget.style.color='#20c997'}
                    onMouseLeave={e=>e.currentTarget.style.color='#6A6A6A'}>
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {/* Bottom bar */}
        <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:20, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
          <span style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:'#6A6A6A', letterSpacing:'.08em' }}>
            © {new Date().getFullYear()} Codify · Built with 💡 for NSUT & DTU
          </span>
          <span style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:'#6A6A6A', fontStyle:'italic' }}>
            "You can if you think you can!"
          </span>
        </div>
      </div>
    </footer>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Landing_page() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [showLB, setShowLB] = useState(false);

  useEffect(() => { const t = setTimeout(() => setLoading(false), 1100); return () => clearTimeout(t); }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const name = user?.firstName || user?.fullName?.split(' ')[0] || 'there';

  return (
    <div style={{ background:'#080B0F', minHeight:'100vh', position:'relative', overflowX:'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..60,600;12..60,700;12..60,800&family=DM+Sans:wght@300;400;500&family=Space+Mono:wght@400;700&display=swap');
        :root{--a:#20c997;--ab:rgba(32,201,151,0.09);--abr:rgba(32,201,151,0.2);--bd:rgba(255,255,255,0.07);--s:#0e1218;--m:#6A6A6A;--t:#8C8C8C;}
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.2}}
        @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(32,201,151,.25)}50%{box-shadow:0 0 0 6px rgba(32,201,151,0)}}
        .card{background:var(--s);border:1px solid var(--bd);border-radius:16px;overflow:hidden;transition:border-color .22s cubic-bezier(.4,0,.2,1);}
        .card:hover{border-color:rgba(32,201,151,0.22);}
        .pill{display:inline-flex;align-items:center;gap:7px;font-family:'Space Mono',monospace;font-size:9px;color:var(--a);background:var(--ab);border:1px solid var(--abr);border-radius:100px;padding:4px 12px;letter-spacing:.15em;text-transform:uppercase;}
        .rh{transition:background .18s;cursor:pointer;}
        .rh:hover{background:rgba(32,201,151,0.05)!important;}
        .g2{display:grid;grid-template-columns:1fr 1fr;gap:18px;}
        .g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:18px;}
        .sidebar{display:grid;grid-template-columns:1fr 320px;gap:18px;}
        @media(max-width:1000px){.sidebar{grid-template-columns:1fr}.g3{grid-template-columns:1fr 1fr}}
        @media(max-width:700px){.g2{grid-template-columns:1fr}.g3{grid-template-columns:1fr}}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(32,201,151,0.25);border-radius:4px}
      `}</style>

      <GeometryBg />
      <Header />

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'calc(100vh - 64px)', position:'relative', zIndex:1 }}>
          <Loader />
        </div>
      ) : (
        <main style={{ position:'relative', zIndex:1, maxWidth:1100, margin:'0 auto', padding:'36px clamp(14px,4vw,44px) 0', display:'flex', flexDirection:'column', gap:18 }}>

          {/* ── Welcome Banner ──────────────────────────────────────── */}
          <FadeIn delay={0}>
            <div style={{ background:'linear-gradient(135deg,rgba(32,201,151,0.1),rgba(0,123,255,0.06),rgba(32,201,151,0.04))', border:'1px solid rgba(32,201,151,0.18)', borderRadius:18, padding:'24px 28px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:18, position:'relative', overflow:'hidden' }}>
              {/* Geometric accent */}
              <div style={{ position:'absolute', top:-40, right:-40, width:160, height:160, borderRadius:'50%', border:'1px solid rgba(32,201,151,0.1)', pointerEvents:'none' }} />
              <div style={{ position:'absolute', top:-20, right:-20, width:100, height:100, borderRadius:'50%', border:'1px solid rgba(32,201,151,0.07)', pointerEvents:'none' }} />

              <div style={{ position:'relative', zIndex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                  <span style={{ width:7, height:7, borderRadius:'50%', background:'#20c997', display:'inline-block', animation:'blink 2s ease infinite, pulse 2s ease infinite' }} />
                  <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:'#20c997', letterSpacing:'.16em', textTransform:'uppercase' }}>{greeting} 👋</span>
                </div>
                <h1 style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight:800, fontSize:'clamp(18px,3vw,26px)', color:'#fff', letterSpacing:'-.03em', marginBottom:6 }}>
                  Welcome back,{' '}
                  <span style={{ background:'linear-gradient(to right,#007BFF,#20c997)', WebkitBackgroundClip:'text', color:'transparent' }}>{name}</span>
                </h1>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, color:'#8C8C8C' }}>Placement season is heating up. Your next opportunity is one solve away.</p>
              </div>

              <div style={{ display:'flex', gap:10, flexWrap:'wrap', position:'relative', zIndex:1 }}>
                <RouterLink to="/patakaro"
                  style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'11px 22px', background:'#20c997', color:'#000', borderRadius:10, fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:13, textDecoration:'none', transition:'all .22s' }}
                  onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 10px 28px rgba(32,201,151,0.3)'; }}
                  onMouseLeave={e=>{ e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}>
                  Continue Prep →
                </RouterLink>
                <RouterLink to="/intellicode"
                  style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'11px 22px', background:'rgba(0,123,255,0.12)', color:'#60a5fa', border:'1px solid rgba(0,123,255,0.25)', borderRadius:10, fontFamily:"'DM Sans',sans-serif", fontSize:13, textDecoration:'none', transition:'all .22s' }}
                  onMouseEnter={e=>{ e.currentTarget.style.background='rgba(0,123,255,0.2)'; e.currentTarget.style.transform='translateY(-2px)'; }}
                  onMouseLeave={e=>{ e.currentTarget.style.background='rgba(0,123,255,0.12)'; e.currentTarget.style.transform=''; }}>
                  ⚡ IntelliCode
                </RouterLink>
                <button onClick={()=>setShowLB(true)}
                  style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'11px 22px', background:'rgba(255,215,0,0.08)', color:'#FFD700', border:'1px solid rgba(255,215,0,0.2)', borderRadius:10, fontFamily:"'DM Sans',sans-serif", fontSize:13, cursor:'pointer', transition:'all .22s' }}
                  onMouseEnter={e=>{ e.currentTarget.style.background='rgba(255,215,0,0.15)'; e.currentTarget.style.transform='translateY(-2px)'; }}
                  onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,215,0,0.08)'; e.currentTarget.style.transform=''; }}>
                  🏆 Leaderboard
                </button>
              </div>
            </div>
          </FadeIn>

          {/* ── Quick Stats strip ───────────────────────────────────── */}
          <FadeIn delay={0.05}>
            <div className="g3">
              {[
                { icon:'🔥', label:'Day Streak', value:'7 days', color:'#f59e0b' },
                { icon:'✅', label:'Solved This Week', value:'12 / 20', color:'#20c997' },
                { icon:'🏢', label:'Companies Explored', value:'8', color:'#007BFF' },
              ].map((s,i)=>(
                <div key={i} className="card" style={{ padding:'16px 20px', display:'flex', alignItems:'center', gap:14 }}>
                  <div style={{ width:42, height:42, borderRadius:10, background:`${s.color}12`, border:`1px solid ${s.color}25`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{s.icon}</div>
                  <div>
                    <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:s.color, letterSpacing:'.12em', textTransform:'uppercase', marginBottom:4 }}>{s.label}</div>
                    <div style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight:700, fontSize:18, color:'#fff', letterSpacing:'-.02em' }}>{s.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>

          {/* ── Main content: left col + right sidebar ──────────────── */}
          <div className="sidebar">
            {/* Left column */}
            <div style={{ display:'flex', flexDirection:'column', gap:18 }}>

              {/* Daily Challenge */}
              <FadeIn delay={0.1}>
                <div className="card">
                  <div style={{ padding:'18px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <span className="pill">⚡ Daily Challenge</span>
                    <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:'#20c997', letterSpacing:'.08em', background:'rgba(32,201,151,0.08)', border:'1px solid rgba(32,201,151,0.15)', borderRadius:6, padding:'3px 10px' }}>⏱ 08:42:15 left</span>
                  </div>
                  <div style={{ padding:'18px 20px' }}>
                    <div style={{ display:'flex', gap:8, marginBottom:12, alignItems:'center', flexWrap:'wrap' }}>
                      <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:'#8C8C8C', background:'#1a1a1a', border:'1px solid rgba(255,255,255,0.07)', borderRadius:5, padding:'3px 9px' }}>{DAILY.company}</span>
                      <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:DAILY.diffColor, background:`${DAILY.diffColor}12`, border:`1px solid ${DAILY.diffColor}28`, borderRadius:5, padding:'3px 9px' }}>{DAILY.difficulty}</span>
                    </div>
                    <h3 style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight:700, fontSize:20, color:'#fff', letterSpacing:'-.02em', marginBottom:10 }}>{DAILY.title}</h3>
                    <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:'#8C8C8C', lineHeight:1.78, marginBottom:14 }}>{DAILY.desc}</p>
                    <div style={{ display:'flex', gap:7, flexWrap:'wrap', marginBottom:18 }}>
                      {DAILY.tags.map(t=><span key={t} style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:'#6A6A6A', background:'#181818', border:'1px solid rgba(255,255,255,0.06)', borderRadius:5, padding:'3px 9px' }}>{t}</span>)}
                    </div>
                    <RouterLink to={DAILY.to}
                      style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'10px 22px', background:'#20c997', color:'#000', borderRadius:8, fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:13, textDecoration:'none', transition:'all .2s' }}
                      onMouseEnter={e=>{ e.currentTarget.style.opacity='.85'; e.currentTarget.style.transform='translateY(-1px)'; }}
                      onMouseLeave={e=>{ e.currentTarget.style.opacity='1'; e.currentTarget.style.transform=''; }}>
                      Solve Now →
                    </RouterLink>
                  </div>
                </div>
              </FadeIn>

              {/* Trending */}
              <FadeIn delay={0.15}>
                <div className="card">
                  <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <span className="pill">🔥 Trending This Week</span>
                    <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:'#6A6A6A', letterSpacing:'.1em' }}>LIVE</span>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr' }}>
                    {TRENDING.map((item,i)=>(
                      <div key={i} className="rh" style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 18px', borderBottom:i<4?'1px solid rgba(255,255,255,0.05)':'none', borderRight:i%2===0?'1px solid rgba(255,255,255,0.05)':'none' }}>
                        <span style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:i<3?'#20c997':'#6A6A6A', fontWeight:700, width:18, flexShrink:0 }}>#{item.rank}</span>
                        <div style={{ width:24, height:24, borderRadius:5, background:item.type==='Company'?'rgba(0,123,255,0.12)':'rgba(32,201,151,0.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, flexShrink:0 }}>{item.type==='Company'?'🏢':'💻'}</div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, color:'#ccc', fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{item.name}</div>
                          <div style={{ fontFamily:"'Space Mono',monospace", fontSize:8, color:'#6A6A6A', marginTop:1 }}>{item.meta}</div>
                        </div>
                        {item.hot && <span style={{ fontFamily:"'Space Mono',monospace", fontSize:7, color:'#f59e0b', background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:3, padding:'2px 5px', flexShrink:0 }}>HOT</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>

              {/* Recent Activity */}
              <FadeIn delay={0.2}>
                <div className="card">
                  <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <span className="pill">📋 Recent Activity</span>
                    <RouterLink to="/intellicode" style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:'#20c997', textDecoration:'none', letterSpacing:'.08em', transition:'opacity .2s' }}
                      onMouseEnter={e=>e.currentTarget.style.opacity='.7'}
                      onMouseLeave={e=>e.currentTarget.style.opacity='1'}>VIEW ALL →</RouterLink>
                  </div>
                  {ACTIVITY.map((item,i)=>(
                    <div key={i} className="rh" style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 18px', borderBottom:i<ACTIVITY.length-1?'1px solid rgba(255,255,255,0.05)':'none' }}>
                      <div style={{ width:30, height:30, borderRadius:'50%', background:`${item.c}12`, border:`1px solid ${item.c}24`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, flexShrink:0 }}>{item.icon}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:'#ddd', fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{item.item}</div>
                        <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:'#6A6A6A', marginTop:2 }}>{item.label} · {item.co}</div>
                      </div>
                      <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:'#6A6A6A', flexShrink:0 }}>{item.t}</span>
                    </div>
                  ))}
                </div>
              </FadeIn>
            </div>

            {/* Right Sidebar */}
            <div style={{ display:'flex', flexDirection:'column', gap:18 }}>

              {/* OA Calendar */}
              <FadeIn delay={0.12}>
                <div className="card" style={{ padding:'18px 18px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
                    <span className="pill" style={{ margin:0 }}>📅 OA Calendar</span>
                  </div>
                  <OACalendar />
                </div>
              </FadeIn>

              {/* Quick links */}
              <FadeIn delay={0.18}>
                <div className="card" style={{ padding:'18px' }}>
                  <div style={{ marginBottom:14 }}>
                    <span className="pill">🚀 Quick Access</span>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    {[
                      { label:'PataKaro',   sub:'Company OA Archives',   icon:'📁', to:'/patakaro',    color:'#20c997' },
                      { label:'IntelliCode',sub:'AI Coding Practice',     icon:'⚡', to:'/intellicode',  color:'#007BFF' },
                      { label:'FTE Prep',   sub:'Full-Time Role Prep',    icon:'🎯', to:'/fte',          color:'#f59e0b' },
                    ].map((l,i)=>(
                      <RouterLink key={i} to={l.to}
                        style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:10, textDecoration:'none', transition:'all .22s' }}
                        onMouseEnter={e=>{ e.currentTarget.style.background=`${l.color}08`; e.currentTarget.style.borderColor=`${l.color}25`; e.currentTarget.style.transform='translateX(3px)'; }}
                        onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.06)'; e.currentTarget.style.transform=''; }}>
                        <div style={{ width:34, height:34, borderRadius:8, background:`${l.color}12`, border:`1px solid ${l.color}22`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>{l.icon}</div>
                        <div>
                          <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:'#fff', fontWeight:500 }}>{l.label}</div>
                          <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:'#6A6A6A', marginTop:2 }}>{l.sub}</div>
                        </div>
                        <span style={{ marginLeft:'auto', color:'#6A6A6A', fontSize:12 }}>→</span>
                      </RouterLink>
                    ))}
                  </div>
                </div>
              </FadeIn>

            </div>
          </div>
        </main>
      )}

      <HomeFooter />
      {showLB && <LBModal onClose={()=>setShowLB(false)} />}
    </div>
  );
}