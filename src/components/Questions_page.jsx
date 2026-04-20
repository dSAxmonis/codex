// import React, { useState, useEffect, useCallback } from 'react';
// import Header from './Header';
// import Loader from './Loader';
// import { useNavigate } from 'react-router-dom';

// const API = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// const DIFF_COLORS = {
//   Easy:   { text: "#4ade80", bg: "rgba(74,222,128,0.1)",   border: "rgba(74,222,128,0.2)"   },
//   Medium: { text: "#fbbf24", bg: "rgba(251,191,36,0.1)",   border: "rgba(251,191,36,0.2)"   },
//   Hard:   { text: "#f87171", bg: "rgba(248,113,113,0.1)",  border: "rgba(248,113,113,0.2)"  },
// };

// const PER_PAGE = 10;

// export default function Questions_page() {
//   const [questions,  setQuestions]  = useState([]);
//   const [total,      setTotal]      = useState(0);
//   const [topics,     setTopics]     = useState([]);
//   const [companies,  setCompanies]  = useState([]);
//   const [difficulty, setDifficulty] = useState('');
//   const [topic,      setTopic]      = useState('');
//   const [company,    setCompany]    = useState('');
//   const [search,     setSearch]     = useState('');
//   const [page,       setPage]       = useState(0);
//   const [loading, setLoading]       = useState(false);
//   const [error,      setError]      = useState(null);
//   const [sideOpen,   setSideOpen]   = useState(false);
//   const navigate = useNavigate();

//   // Fetch filter options once
//   useEffect(() => {
//     fetch(`${API}/api/questions/meta`)
//       .then(r => r.json())
//       .then(data => {
//         setTopics(data.topics || []);
//         setCompanies(data.companies || []);
//       })
//       .catch(() => {});
//   }, []);

//   const fetchQuestions = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       const params = new URLSearchParams({
//         page:  page + 1,
//         limit: PER_PAGE,
//       });
//       if (difficulty) params.append('difficulty', difficulty);
//       if (topic)      params.append('topic', topic);
//       if (company)    params.append('company', company);
//       if (search)     params.append('search', search);

//       const res  = await fetch(`${API}/api/questions?${params}`);
//       if (!res.ok) throw new Error('Failed to fetch questions');
//       const data = await res.json();

//       setQuestions(data.questions || []);
//       setTotal(data.total || 0);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   }, [difficulty, topic, company, search, page]);

//   useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

//   const pageCount     = Math.ceil(total / PER_PAGE);
//   const activeFilters = [difficulty, topic, company].filter(Boolean).length;

//   const clearAll = () => {
//     setDifficulty(''); setTopic(''); setCompany(''); setSearch(''); setPage(0);
//   };

//   return (
//     <div style={{ background: "#080B0F", minHeight: "100vh", position: "relative", overflowX: "hidden" }}>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..60,700;12..60,800&family=DM+Sans:wght@300;400;500&family=Space+Mono:wght@400;700&display=swap');
//         :root{--a:#20c997;--ab:rgba(32,201,151,0.09);--abr:rgba(32,201,151,0.2);--bd:rgba(255,255,255,0.07);--s:#0e1218;}
//         *{box-sizing:border-box;margin:0;padding:0;}
//         @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
//         .pill{display:inline-flex;align-items:center;gap:6px;font-family:'Space Mono',monospace;font-size:9px;color:var(--a);background:var(--ab);border:1px solid var(--abr);border-radius:100px;padding:4px 12px;letter-spacing:.13em;text-transform:uppercase;}
//         .search-inp{width:100%;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.09);border-radius:12px;padding:12px 14px 12px 42px;color:#fff;font-family:'DM Sans',sans-serif;font-size:14px;outline:none;transition:all .22s;}
//         .search-inp::placeholder{color:#6A6A6A;}
//         .search-inp:focus{border-color:var(--abr);box-shadow:0 0 0 3px rgba(32,201,151,0.08);}
//         .filter-btn{width:100%;display:flex;align-items:center;justify-content:space-between;padding:9px 12px;border-radius:8px;border:1px solid rgba(255,255,255,0.07);background:rgba(255,255,255,0.03);color:#8C8C8C;font-family:'DM Sans',sans-serif;font-size:13px;cursor:pointer;transition:all .18s;text-align:left;}
//         .filter-btn:hover,.filter-btn.active{background:var(--ab);border-color:var(--abr);color:var(--a);}
//         .q-card{background:var(--s);border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:18px 20px;cursor:pointer;transition:all .22s;position:relative;overflow:hidden;}
//         .q-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,#007BFF,#20c997);transform:scaleX(0);transform-origin:left;transition:transform .22s;}
//         .q-card:hover{border-color:rgba(32,201,151,0.22);transform:translateY(-2px);box-shadow:0 16px 32px rgba(0,0,0,0.35);}
//         .q-card:hover::before{transform:scaleX(1);}
//         .q-card:hover .q-title{color:#20c997;}
//         .q-title{font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:16px;color:#fff;letter-spacing:-.01em;transition:color .22s;}
//         .geo-bg{position:fixed;inset:0;pointer-events:none;z-index:0;opacity:.16;}
//         .sidebar{width:240px;flex-shrink:0;}
//         .layout{display:flex;gap:20px;align-items:flex-start;}
//         .mobile-overlay{position:fixed;inset:0;z-index:200;background:rgba(0,0,0,0.92);backdrop-filter:blur(10px);display:flex;}
//         .page-btn{padding:7px 13px;border-radius:8px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.09);color:#8C8C8C;font-family:'Space Mono',monospace;font-size:10px;cursor:pointer;transition:all .18s;}
//         .page-btn:hover,.page-btn.active-page{background:var(--ab);border-color:var(--abr);color:var(--a);}
//         .page-btn:disabled{opacity:.4;cursor:not-allowed;}
//         @media(max-width:860px){.sidebar{display:none}.layout{flex-direction:column}}
//         ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(32,201,151,0.2);border-radius:4px}
//       `}</style>

//       {/* Geometry bg */}
//       <svg className="geo-bg" xmlns="http://www.w3.org/2000/svg">
//         <defs>
//           <radialGradient id="qg1" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#20c997" stopOpacity=".18"/><stop offset="100%" stopColor="#20c997" stopOpacity="0"/></radialGradient>
//           <radialGradient id="qg2" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#007BFF" stopOpacity=".14"/><stop offset="100%" stopColor="#007BFF" stopOpacity="0"/></radialGradient>
//         </defs>
//         <ellipse cx="85%" cy="15%" rx="280" ry="220" fill="url(#qg1)"/>
//         <ellipse cx="10%" cy="80%" rx="260" ry="200" fill="url(#qg2)"/>
//         {Array.from({length:16}).map((_,i)=><line key={`h${i}`} x1="0" y1={`${(i+1)*6}%`} x2="100%" y2={`${(i+1)*6}%`} stroke="rgba(255,255,255,0.025)" strokeWidth="1"/>)}
//         {Array.from({length:20}).map((_,i)=><line key={`v${i}`} x1={`${(i+1)*5}%`} y1="0" x2={`${(i+1)*5}%`} y2="100%" stroke="rgba(255,255,255,0.025)" strokeWidth="1"/>)}
//         <line x1="0" y1="100%" x2="30%" y2="0" stroke="rgba(32,201,151,0.04)" strokeWidth="1.5"/>
//         <circle cx="88%" cy="88%" r="65" fill="none" stroke="rgba(0,123,255,0.07)" strokeWidth="1.5"/>
//         <polygon points="100%,0 calc(100% - 90px),0 100%,90px" fill="rgba(32,201,151,0.04)"/>
//       </svg>

//       <div style={{ position: "relative", zIndex: 1 }}>
//         <Header />

//         {loading && questions.length === 0 ? (
//           <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "calc(100vh - 64px)" }}>
//             <Loader />
//           </div>
//         ) : error ? (
//           <div style={{ textAlign: "center", padding: "80px 20px" }}>
//             <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
//             <h3 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: 20, color: "#fff", marginBottom: 8 }}>Failed to load questions</h3>
//             <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "#8C8C8C", marginBottom: 20 }}>{error}</p>
//             <button onClick={fetchQuestions} style={{ padding: "9px 20px", background: "rgba(32,201,151,0.1)", border: "1px solid rgba(32,201,151,0.25)", borderRadius: 8, color: "#20c997", fontFamily: "'DM Sans',sans-serif", fontSize: 13, cursor: "pointer" }}>Try Again</button>
//           </div>
//         ) : (
//           <main style={{ maxWidth: 1200, margin: "0 auto", padding: "36px clamp(14px,4vw,44px) 80px" }}>

//             {/* Page header */}
//             <div style={{ marginBottom: 28, animation: "fadeUp .5s ease both" }}>
//               <span className="pill" style={{ marginBottom: 12, display: "inline-flex" }}>⚡ IntelliCode</span>
//               <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
//                 <div>
//                   <h1 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: "clamp(24px,4vw,38px)", color: "#fff", letterSpacing: "-.03em", marginBottom: 6 }}>
//                     OA{" "}
//                     <span style={{ background: "linear-gradient(to right,#007BFF,#20c997)", WebkitBackgroundClip: "text", color: "transparent" }}>Question Bank</span>
//                   </h1>
//                   <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "#8C8C8C" }}>{total} questions total</p>
//                 </div>
//                 {activeFilters > 0 && (
//                   <button onClick={clearAll} style={{ padding: "9px 16px", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 8, color: "#f87171", fontFamily: "'DM Sans',sans-serif", fontSize: 13, cursor: "pointer" }}>
//                     Clear {activeFilters} filter{activeFilters > 1 ? "s" : ""}
//                   </button>
//                 )}
//               </div>

//               {/* Search */}
//               <div style={{ position: "relative", marginTop: 20 }}>
//                 <svg style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#6A6A6A" }} width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
//                 <input className="search-inp" placeholder="Search questions..." value={search}
//                   onChange={e => { setSearch(e.target.value); setPage(0); }} />
//                 {search && <button onClick={() => { setSearch(''); setPage(0); }} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#6A6A6A", cursor: "pointer", fontSize: 16 }}>✕</button>}
//               </div>
//             </div>

//             <div className="layout">
//               {/* Sidebar */}
//               <div className="sidebar">
//                 <FilterPanel
//                   difficulty={difficulty} setDifficulty={v => { setDifficulty(v); setPage(0); }}
//                   topic={topic}           setTopic={v => { setTopic(v); setPage(0); }}
//                   company={company}       setCompany={v => { setCompany(v); setPage(0); }}
//                   topics={topics}         companies={companies}
//                 />
//               </div>

//               {/* Mobile overlay */}
//               {sideOpen && (
//                 <div className="mobile-overlay" onClick={() => setSideOpen(false)}>
//                   <div style={{ background: "#0e1218", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "0 16px 16px 0", padding: 20, width: 280, height: "100vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
//                     <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
//                       <span className="pill">Filters</span>
//                       <button onClick={() => setSideOpen(false)} style={{ background: "none", border: "none", color: "#8C8C8C", cursor: "pointer", fontSize: 18 }}>✕</button>
//                     </div>
//                     <FilterPanel
//                       difficulty={difficulty} setDifficulty={v => { setDifficulty(v); setPage(0); }}
//                       topic={topic}           setTopic={v => { setTopic(v); setPage(0); }}
//                       company={company}       setCompany={v => { setCompany(v); setPage(0); }}
//                       topics={topics}         companies={companies}
//                     />
//                   </div>
//                 </div>
//               )}

//               {/* Questions list */}
//               <div style={{ flex: 1, minWidth: 0 }}>
//                 {questions.length === 0 ? (
//                   <div style={{ textAlign: "center", padding: "60px 20px", background: "#0e1218", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16 }}>
//                     <div style={{ fontSize: 40, marginBottom: 16 }}>🔍</div>
//                     <h3 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: 20, color: "#fff", marginBottom: 8 }}>No questions found</h3>
//                     <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "#8C8C8C", marginBottom: 20 }}>Try adjusting your filters</p>
//                     <button onClick={clearAll} style={{ padding: "9px 20px", background: "rgba(32,201,151,0.1)", border: "1px solid rgba(32,201,151,0.25)", borderRadius: 8, color: "#20c997", fontFamily: "'DM Sans',sans-serif", fontSize: 13, cursor: "pointer" }}>Clear all filters</button>
//                   </div>
//                 ) : (
//                   <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
//                     {questions.map((q, i) => {
//                       const dc = DIFF_COLORS[q.difficulty] || DIFF_COLORS.Medium;
//                       return (
//                         <div key={q._id || q.id} className="q-card"
//                           style={{ animationDelay: `${i * 0.03}s`, animation: "fadeUp .45s ease both" }}
//                          onClick={() => navigate(`/upsolve/${q.legacyId || q.id}`)}>
//                           <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
//                             <span className="q-title">{q.name}</span>
//                             <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: dc.text, background: dc.bg, border: `1px solid ${dc.border}`, borderRadius: 5, padding: "3px 9px", flexShrink: 0, letterSpacing: ".08em" }}>{q.difficulty}</span>
//                           </div>
//                           <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
//                             {q.topics?.slice(0,3).map(t => (
//                               <span key={t} style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: "#60a5fa", background: "rgba(0,123,255,0.08)", border: "1px solid rgba(0,123,255,0.15)", borderRadius: 4, padding: "2px 8px", letterSpacing: ".08em" }}>{t}</span>
//                             ))}
//                             {q.company && <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: "#c084fc", background: "rgba(192,132,252,0.08)", border: "1px solid rgba(192,132,252,0.18)", borderRadius: 4, padding: "2px 8px", marginLeft: "auto", letterSpacing: ".08em" }}>🏢 {q.company}</span>}
//                             {q.rating && <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: "#20c997", letterSpacing: ".08em" }}>★ {q.rating}</span>}
//                           </div>
//                         </div>
//                       );
//                     })}

//                     {/* Pagination */}
//                     {pageCount > 1 && (
//                       <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 24, flexWrap: "wrap" }}>
//                         <button className="page-btn" onClick={() => setPage(p => Math.max(0, p-1))} disabled={page === 0}>← Prev</button>
//                         {Array.from({ length: Math.min(pageCount, 7) }, (_, i) => {
//                           const pg = pageCount <= 7 ? i : Math.max(0, page - 3) + i;
//                           if (pg >= pageCount) return null;
//                           return <button key={pg} className={`page-btn ${pg === page ? "active-page" : ""}`} onClick={() => setPage(pg)}>{pg + 1}</button>;
//                         })}
//                         <button className="page-btn" onClick={() => setPage(p => Math.min(pageCount-1, p+1))} disabled={page === pageCount-1}>Next →</button>
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </main>
//         )}

//         {/* Footer */}
//         <footer style={{ background: "#080808", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "28px clamp(14px,4vw,44px)" }}>
//           <div style={{ height: 1, background: "linear-gradient(90deg,transparent,#20c997,#007BFF,transparent)", opacity: .4, marginBottom: 20 }} />
//           <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
//             <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "#6A6A6A" }}>© {new Date().getFullYear()} Codify · IntelliCode</span>
//             <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "#6A6A6A", fontStyle: "italic" }}>"Master algorithms, one problem at a time"</span>
//           </div>
//         </footer>
//       </div>
//     </div>
//   );
// }

// function FilterPanel({ difficulty, setDifficulty, topic, setTopic, company, setCompany, topics, companies }) {
//   const Section = ({ title, children }) => (
//     <div style={{ marginBottom: 24 }}>
//       <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: "#6A6A6A", letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 10 }}>{title}</div>
//       <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>{children}</div>
//     </div>
//   );

//   return (
//     <div style={{ background: "#0e1218", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "18px 16px", position: "sticky", top: 84 }}>
//       <div style={{ marginBottom: 20 }}>
//         <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "#20c997", letterSpacing: ".14em", textTransform: "uppercase" }}>⚙ Filters</span>
//       </div>

//       <Section title="Difficulty">
//         {['Easy','Medium','Hard'].map(d => (
//           <button key={d} className={`filter-btn ${difficulty === d ? 'active' : ''}`} onClick={() => setDifficulty(difficulty === d ? '' : d)}>
//             <span>{d}</span>
//             <span style={{ width: 8, height: 8, borderRadius: "50%", background: d === 'Easy' ? '#4ade80' : d === 'Medium' ? '#fbbf24' : '#f87171', flexShrink: 0 }} />
//           </button>
//         ))}
//       </Section>

//       <Section title="Topic">
//         {topics.map(t => (
//           <button key={t} className={`filter-btn ${topic === t ? 'active' : ''}`} onClick={() => setTopic(topic === t ? '' : t)}>{t}</button>
//         ))}
//       </Section>

//       <Section title="Company">
//         {companies.map(c => (
//           <button key={c} className={`filter-btn ${company === c ? 'active' : ''}`} onClick={() => setCompany(company === c ? '' : c)}>{c}</button>
//         ))}
//       </Section>
//     </div>
//   );
// }


import React, { useState, useEffect, useCallback } from 'react';
import Header from './Header';
import Loader from './Loader';
import { useNavigate } from 'react-router-dom';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const DIFF_COLORS = {
  Easy:   { text: "#4ade80", bg: "rgba(74,222,128,0.1)",   border: "rgba(74,222,128,0.2)"   },
  Medium: { text: "#fbbf24", bg: "rgba(251,191,36,0.1)",   border: "rgba(251,191,36,0.2)"   },
  Hard:   { text: "#f87171", bg: "rgba(248,113,113,0.1)",  border: "rgba(248,113,113,0.2)"  },
};

const PER_PAGE = 10;

export default function Questions_page() {
  const [questions,  setQuestions]  = useState([]);
  const [total,      setTotal]      = useState(0);
  const [topics,     setTopics]     = useState([]);
  const [companies,  setCompanies]  = useState([]);
  const [difficulty, setDifficulty] = useState('');
  const [topic,      setTopic]      = useState('');
  const [company,    setCompany]    = useState('');
  const [search,     setSearch]     = useState('');
  const [page,       setPage]       = useState(0);
  const [loading, setLoading]       = useState(false);
  const [error,      setError]      = useState(null);
  const [sideOpen,   setSideOpen]   = useState(false);
  const navigate = useNavigate();

  // Fetch filter options once
  useEffect(() => {
    fetch(`${API}/api/questions/meta`)
      .then(r => r.json())
      .then(data => {
        setTopics(data.topics || []);
        setCompanies(data.companies || []);
      })
      .catch(() => {});
  }, []);

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page:  page + 1,
        limit: PER_PAGE,
      });
      if (difficulty) params.append('difficulty', difficulty);
      if (topic)      params.append('topic', topic);
      if (company)    params.append('company', company);
      if (search)     params.append('search', search);

      const res  = await fetch(`${API}/api/questions?${params}`);
      if (!res.ok) throw new Error('Failed to fetch questions');
      const data = await res.json();

      setQuestions(data.questions || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [difficulty, topic, company, search, page]);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  const pageCount     = Math.ceil(total / PER_PAGE);
  const activeFilters = [difficulty, topic, company].filter(Boolean).length;

  const clearAll = () => {
    setDifficulty(''); setTopic(''); setCompany(''); setSearch(''); setPage(0);
  };

  return (
    <div style={{ background: "#080B0F", minHeight: "100vh", position: "relative", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..60,700;12..60,800&family=DM+Sans:wght@300;400;500&family=Space+Mono:wght@400;700&display=swap');
        :root{--a:#20c997;--ab:rgba(32,201,151,0.09);--abr:rgba(32,201,151,0.2);--bd:rgba(255,255,255,0.07);--s:#0e1218;}
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .pill{display:inline-flex;align-items:center;gap:6px;font-family:'Space Mono',monospace;font-size:9px;color:var(--a);background:var(--ab);border:1px solid var(--abr);border-radius:100px;padding:4px 12px;letter-spacing:.13em;text-transform:uppercase;}
        .search-inp{width:100%;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.09);border-radius:12px;padding:12px 14px 12px 42px;color:#fff;font-family:'DM Sans',sans-serif;font-size:14px;outline:none;transition:all .22s;}
        .search-inp::placeholder{color:#6A6A6A;}
        .search-inp:focus{border-color:var(--abr);box-shadow:0 0 0 3px rgba(32,201,151,0.08);}
        .filter-btn{width:100%;display:flex;align-items:center;justify-content:space-between;padding:9px 12px;border-radius:8px;border:1px solid rgba(255,255,255,0.07);background:rgba(255,255,255,0.03);color:#8C8C8C;font-family:'DM Sans',sans-serif;font-size:13px;cursor:pointer;transition:all .18s;text-align:left;}
        .filter-btn:hover,.filter-btn.active{background:var(--ab);border-color:var(--abr);color:var(--a);}
        .q-card{background:var(--s);border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:18px 20px;cursor:pointer;transition:all .22s;position:relative;overflow:hidden;}
        .q-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,#007BFF,#20c997);transform:scaleX(0);transform-origin:left;transition:transform .22s;}
        .q-card:hover{border-color:rgba(32,201,151,0.22);transform:translateY(-2px);box-shadow:0 16px 32px rgba(0,0,0,0.35);}
        .q-card:hover::before{transform:scaleX(1);}
        .q-card:hover .q-title{color:#20c997;}
        .q-title{font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:16px;color:#fff;letter-spacing:-.01em;transition:color .22s;}
        .geo-bg{position:fixed;inset:0;pointer-events:none;z-index:0;opacity:.16;}
        .sidebar{width:240px;flex-shrink:0;}
        .layout{display:flex;gap:20px;align-items:flex-start;}
        .mobile-overlay{position:fixed;inset:0;z-index:200;background:rgba(0,0,0,0.92);backdrop-filter:blur(10px);display:flex;}
        .page-btn{padding:7px 13px;border-radius:8px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.09);color:#8C8C8C;font-family:'Space Mono',monospace;font-size:10px;cursor:pointer;transition:all .18s;}
        .page-btn:hover,.page-btn.active-page{background:var(--ab);border-color:var(--abr);color:var(--a);}
        .page-btn:disabled{opacity:.4;cursor:not-allowed;}
        @media(max-width:860px){.sidebar{display:none}.layout{flex-direction:column}}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(32,201,151,0.2);border-radius:4px}
      `}</style>

      {/* Geometry bg */}
      <svg className="geo-bg" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="qg1" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#20c997" stopOpacity=".18"/><stop offset="100%" stopColor="#20c997" stopOpacity="0"/></radialGradient>
          <radialGradient id="qg2" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#007BFF" stopOpacity=".14"/><stop offset="100%" stopColor="#007BFF" stopOpacity="0"/></radialGradient>
        </defs>
        <ellipse cx="85%" cy="15%" rx="280" ry="220" fill="url(#qg1)"/>
        <ellipse cx="10%" cy="80%" rx="260" ry="200" fill="url(#qg2)"/>
        {Array.from({length:16}).map((_,i)=><line key={`h${i}`} x1="0" y1={`${(i+1)*6}%`} x2="100%" y2={`${(i+1)*6}%`} stroke="rgba(255,255,255,0.025)" strokeWidth="1"/>)}
        {Array.from({length:20}).map((_,i)=><line key={`v${i}`} x1={`${(i+1)*5}%`} y1="0" x2={`${(i+1)*5}%`} y2="100%" stroke="rgba(255,255,255,0.025)" strokeWidth="1"/>)}
        <line x1="0" y1="100%" x2="30%" y2="0" stroke="rgba(32,201,151,0.04)" strokeWidth="1.5"/>
        <circle cx="88%" cy="88%" r="65" fill="none" stroke="rgba(0,123,255,0.07)" strokeWidth="1.5"/>
        <polygon points="100%,0 calc(100% - 90px),0 100%,90px" fill="rgba(32,201,151,0.04)"/>
      </svg>

      <div style={{ position: "relative", zIndex: 1 }}>
        <Header />

        {loading && questions.length === 0 ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "calc(100vh - 64px)" }}>
            <Loader />
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
            <h3 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: 20, color: "#fff", marginBottom: 8 }}>Failed to load questions</h3>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "#8C8C8C", marginBottom: 20 }}>{error}</p>
            <button onClick={fetchQuestions} style={{ padding: "9px 20px", background: "rgba(32,201,151,0.1)", border: "1px solid rgba(32,201,151,0.25)", borderRadius: 8, color: "#20c997", fontFamily: "'DM Sans',sans-serif", fontSize: 13, cursor: "pointer" }}>Try Again</button>
          </div>
        ) : (
          <main style={{ maxWidth: 1200, margin: "0 auto", padding: "36px clamp(14px,4vw,44px) 80px" }}>

            {/* Page header */}
            <div style={{ marginBottom: 28, animation: "fadeUp .5s ease both" }}>
              <span className="pill" style={{ marginBottom: 12, display: "inline-flex" }}>⚡ IntelliCode</span>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                <div>
                  <h1 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: "clamp(24px,4vw,38px)", color: "#fff", letterSpacing: "-.03em", marginBottom: 6 }}>
                    OA{" "}
                    <span style={{ background: "linear-gradient(to right,#007BFF,#20c997)", WebkitBackgroundClip: "text", color: "transparent" }}>Question Bank</span>
                  </h1>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "#8C8C8C" }}>{total} questions total</p>
                </div>
                {activeFilters > 0 && (
                  <button onClick={clearAll} style={{ padding: "9px 16px", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 8, color: "#f87171", fontFamily: "'DM Sans',sans-serif", fontSize: 13, cursor: "pointer" }}>
                    Clear {activeFilters} filter{activeFilters > 1 ? "s" : ""}
                  </button>
                )}
              </div>

              {/* Search */}
              <div style={{ position: "relative", marginTop: 20 }}>
                <svg style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#6A6A6A" }} width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                <input className="search-inp" placeholder="Search questions..." value={search}
                  onChange={e => { setSearch(e.target.value); setPage(0); }} />
                {search && <button onClick={() => { setSearch(''); setPage(0); }} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#6A6A6A", cursor: "pointer", fontSize: 16 }}>✕</button>}
              </div>

              {/* Active filter chips */}
              {(difficulty || topic || company) && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                  <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: '#6A6A6A', letterSpacing: '.1em', textTransform: 'uppercase', alignSelf: 'center' }}>Active:</span>
                  {difficulty && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 100, background: 'rgba(32,201,151,0.1)', border: '1px solid rgba(32,201,151,0.25)', color: '#20c997', fontFamily: "'DM Sans',sans-serif", fontSize: 12 }}>{difficulty} <button onClick={() => setDifficulty('')} style={{ background: 'none', border: 'none', color: '#20c997', cursor: 'pointer', padding: 0, lineHeight: 1, fontSize: 14 }}>×</button></span>}
                  {topic && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 100, background: 'rgba(0,123,255,0.1)', border: '1px solid rgba(0,123,255,0.25)', color: '#60a5fa', fontFamily: "'DM Sans',sans-serif", fontSize: 12 }}>{topic} <button onClick={() => setTopic('')} style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', padding: 0, lineHeight: 1, fontSize: 14 }}>×</button></span>}
                  {company && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 100, background: 'rgba(192,132,252,0.1)', border: '1px solid rgba(192,132,252,0.25)', color: '#c084fc', fontFamily: "'DM Sans',sans-serif", fontSize: 12 }}>{company} <button onClick={() => setCompany('')} style={{ background: 'none', border: 'none', color: '#c084fc', cursor: 'pointer', padding: 0, lineHeight: 1, fontSize: 14 }}>×</button></span>}
                </div>
              )}
            </div>

            <div className="layout">
              {/* Sidebar */}
              <div className="sidebar">
                <FilterPanel
                  difficulty={difficulty} setDifficulty={v => { setDifficulty(v); setPage(0); }}
                  topic={topic}           setTopic={v => { setTopic(v); setPage(0); }}
                  company={company}       setCompany={v => { setCompany(v); setPage(0); }}
                  topics={topics}         companies={companies}
                />
              </div>

              {/* Mobile overlay */}
              {sideOpen && (
                <div className="mobile-overlay" onClick={() => setSideOpen(false)}>
                  <div style={{ background: "#0e1218", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "0 16px 16px 0", padding: 20, width: 280, height: "100vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                      <span className="pill">Filters</span>
                      <button onClick={() => setSideOpen(false)} style={{ background: "none", border: "none", color: "#8C8C8C", cursor: "pointer", fontSize: 18 }}>✕</button>
                    </div>
                    <FilterPanel
                      difficulty={difficulty} setDifficulty={v => { setDifficulty(v); setPage(0); }}
                      topic={topic}           setTopic={v => { setTopic(v); setPage(0); }}
                      company={company}       setCompany={v => { setCompany(v); setPage(0); }}
                      topics={topics}         companies={companies}
                    />
                  </div>
                </div>
              )}

              {/* Questions list */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {questions.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "60px 20px", background: "#0e1218", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16 }}>
                    <div style={{ fontSize: 40, marginBottom: 16 }}>🔍</div>
                    <h3 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: 20, color: "#fff", marginBottom: 8 }}>No questions found</h3>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "#8C8C8C", marginBottom: 20 }}>Try adjusting your filters</p>
                    <button onClick={clearAll} style={{ padding: "9px 20px", background: "rgba(32,201,151,0.1)", border: "1px solid rgba(32,201,151,0.25)", borderRadius: 8, color: "#20c997", fontFamily: "'DM Sans',sans-serif", fontSize: 13, cursor: "pointer" }}>Clear all filters</button>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {questions.map((q, i) => {
                      const dc = DIFF_COLORS[q.difficulty] || DIFF_COLORS.Medium;
                      return (
                        <div key={q._id || q.id} className="q-card"
                          style={{ animationDelay: `${i * 0.03}s`, animation: "fadeUp .45s ease both" }}
                         onClick={() => navigate(`/upsolve/${q.legacyId || q.id}`)}>
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
                            <span className="q-title">{q.name}</span>
                            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: dc.text, background: dc.bg, border: `1px solid ${dc.border}`, borderRadius: 5, padding: "3px 9px", flexShrink: 0, letterSpacing: ".08em" }}>{q.difficulty}</span>
                          </div>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                            {q.topics?.slice(0,3).map(t => (
                              <span key={t} style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: "#60a5fa", background: "rgba(0,123,255,0.08)", border: "1px solid rgba(0,123,255,0.15)", borderRadius: 4, padding: "2px 8px", letterSpacing: ".08em" }}>{t}</span>
                            ))}
                            {q.company && <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: "#c084fc", background: "rgba(192,132,252,0.08)", border: "1px solid rgba(192,132,252,0.18)", borderRadius: 4, padding: "2px 8px", marginLeft: "auto", letterSpacing: ".08em" }}>🏢 {q.company}</span>}
                            {q.rating && <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: "#20c997", letterSpacing: ".08em" }}>★ {q.rating}</span>}
                          </div>
                        </div>
                      );
                    })}

                    {/* Pagination */}
                    {pageCount > 1 && (
                      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 24, flexWrap: "wrap" }}>
                        <button className="page-btn" onClick={() => setPage(p => Math.max(0, p-1))} disabled={page === 0}>← Prev</button>
                        {Array.from({ length: Math.min(pageCount, 7) }, (_, i) => {
                          const pg = pageCount <= 7 ? i : Math.max(0, page - 3) + i;
                          if (pg >= pageCount) return null;
                          return <button key={pg} className={`page-btn ${pg === page ? "active-page" : ""}`} onClick={() => setPage(pg)}>{pg + 1}</button>;
                        })}
                        <button className="page-btn" onClick={() => setPage(p => Math.min(pageCount-1, p+1))} disabled={page === pageCount-1}>Next →</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </main>
        )}


      </div>
    </div>
  );
}

function FilterPanel({ difficulty, setDifficulty, topic, setTopic, company, setCompany, topics, companies }) {
  const [expandedSection, setExpandedSection] = React.useState('difficulty');

  const Section = ({ id, title, children, count }) => {
    const isOpen = expandedSection === id;
    return (
      <div style={{ marginBottom: 4 }}>
        <button onClick={() => setExpandedSection(isOpen ? null : id)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 10px', borderRadius: 8, background: 'transparent', border: 'none', color: count ? '#20c997' : '#8C8C8C', fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all .15s' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {title}
            {count > 0 && <span style={{ background: '#20c997', color: '#000', borderRadius: '50%', width: 14, height: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700 }}>{count}</span>}
          </span>
          <span style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .2s', fontSize: 10 }}>▼</span>
        </button>
        {isOpen && <div style={{ display: 'flex', flexDirection: 'column', gap: 3, paddingBottom: 8, paddingLeft: 4 }}>{children}</div>}
      </div>
    );
  };

  return (
    <div style={{ background: '#0e1218', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '16px 12px', position: 'sticky', top: 84, maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: '#20c997', letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 16, padding: '0 4px' }}>⚙ Filters</div>

      <Section id="difficulty" title="Difficulty" count={difficulty ? 1 : 0}>
        {['Easy','Medium','Hard'].map(d => (
          <button key={d} className={`filter-btn ${difficulty === d ? 'active' : ''}`} onClick={() => setDifficulty(difficulty === d ? '' : d)}>
            <span>{d}</span>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: d === 'Easy' ? '#4ade80' : d === 'Medium' ? '#fbbf24' : '#f87171', flexShrink: 0 }} />
          </button>
        ))}
      </Section>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '4px 0' }} />

      <Section id="topic" title="Topic" count={topic ? 1 : 0}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {topics.map(t => (
            <button key={t} onClick={() => setTopic(topic === t ? '' : t)} style={{ padding: '3px 8px', borderRadius: 5, border: `1px solid ${topic === t ? 'rgba(32,201,151,0.4)' : 'rgba(255,255,255,0.07)'}`, background: topic === t ? 'rgba(32,201,151,0.1)' : 'rgba(255,255,255,0.03)', color: topic === t ? '#20c997' : '#8C8C8C', fontFamily: "'DM Sans',sans-serif", fontSize: 11, cursor: 'pointer', transition: 'all .15s' }}>{t}</button>
          ))}
        </div>
      </Section>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '4px 0' }} />

      <Section id="company" title="Company" count={company ? 1 : 0}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {companies.map(c => (
            <button key={c} onClick={() => setCompany(company === c ? '' : c)} style={{ padding: '3px 8px', borderRadius: 5, border: `1px solid ${company === c ? 'rgba(192,132,252,0.4)' : 'rgba(255,255,255,0.07)'}`, background: company === c ? 'rgba(192,132,252,0.1)' : 'rgba(255,255,255,0.03)', color: company === c ? '#c084fc' : '#8C8C8C', fontFamily: "'DM Sans',sans-serif", fontSize: 11, cursor: 'pointer', transition: 'all .15s' }}>{c}</button>
          ))}
        </div>
      </Section>
    </div>
  );
}