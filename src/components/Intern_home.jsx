import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "./Header";
import Loader from "./Loader";
import { useUser } from "@clerk/clerk-react";

const API = process.env.REACT_APP_API_URL || "http://localhost:8000";

function Intern_home() {
  const [posts, setPosts]         = useState([]);
  const [total, setTotal]         = useState(0);
  const [search, setSearch]       = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState(null);
  const { isSignedIn }            = useUser();
  const navigate                  = useNavigate();

  const fetchCompanies = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({ limit: 100 });
      if (search)    params.append("search", search);
      if (catFilter) params.append("category", catFilter);

      const res  = await fetch(`${API}/api/companies?${params}`);
      if (!res.ok) throw new Error("Failed to fetch companies");
      const data = await res.json();

      setPosts(data.companies || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [search, catFilter]);

  useEffect(() => {
    if (!isSignedIn) { navigate("/"); return; }
    fetchCompanies();
  }, [isSignedIn, navigate, fetchCompanies]);

  const categories = ["SDE Intern", "FTE", "SWE Intern", "Quant"];

  return (
    <div style={{ background: "#080B0F", minHeight: "100vh", position: "relative", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..60,700;12..60,800&family=DM+Sans:wght@300;400;500&family=Space+Mono:wght@400;700&display=swap');
        :root{--a:#20c997;--ab:rgba(32,201,151,0.09);--abr:rgba(32,201,151,0.2);--bd:rgba(255,255,255,0.07);--s:#0e1218;--m:#6A6A6A;--t:#8C8C8C;}
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        .search-input{width:100%;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.09);border-radius:12px;padding:13px 16px 13px 44px;color:#fff;font-family:'DM Sans',sans-serif;font-size:14px;outline:none;transition:all .22s;}
        .search-input::placeholder{color:#6A6A6A;}
        .search-input:focus{border-color:var(--abr);background:rgba(32,201,151,0.05);box-shadow:0 0 0 3px rgba(32,201,151,0.08);}
        .cat-btn{padding:8px 16px;border-radius:100px;font-family:'Space Mono',monospace;font-size:9px;letter-spacing:.12em;text-transform:uppercase;cursor:pointer;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.03);color:#8C8C8C;transition:all .2s;}
        .cat-btn:hover{border-color:var(--abr);color:var(--a);}
        .cat-btn.active{background:var(--ab);border-color:var(--abr);color:var(--a);}
        .company-card{background:#0e1218;border:1px solid rgba(255,255,255,0.07);border-radius:14px;transition:all .22s cubic-bezier(.4,0,.2,1);cursor:pointer;overflow:hidden;position:relative;}
        .company-card:hover{border-color:rgba(32,201,151,0.25);transform:translateY(-3px);box-shadow:0 20px 40px rgba(0,0,0,0.4);}
        .company-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,#007BFF,#20c997);transform:scaleX(0);transform-origin:left;transition:transform .22s;}
        .company-card:hover::before{transform:scaleX(1);}
        .tag{display:inline-flex;align-items:center;font-family:'Space Mono',monospace;font-size:9px;letter-spacing:.1em;text-transform:uppercase;border-radius:5px;padding:3px 9px;}
        .pill{display:inline-flex;align-items:center;gap:7px;font-family:'Space Mono',monospace;font-size:9px;color:var(--a);background:var(--ab);border:1px solid var(--abr);border-radius:100px;padding:4px 12px;letter-spacing:.13em;text-transform:uppercase;}
        .geo-bg{position:fixed;inset:0;pointer-events:none;z-index:0;opacity:.18;}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(32,201,151,0.2);border-radius:4px}
      `}</style>

      {/* Geometry background */}
      <svg className="geo-bg" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="pg1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#20c997" stopOpacity=".18"/>
            <stop offset="100%" stopColor="#20c997" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="pg2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#007BFF" stopOpacity=".14"/>
            <stop offset="100%" stopColor="#007BFF" stopOpacity="0"/>
          </radialGradient>
        </defs>
        <ellipse cx="10%" cy="25%" rx="300" ry="240" fill="url(#pg2)"/>
        <ellipse cx="90%" cy="70%" rx="280" ry="220" fill="url(#pg1)"/>
        {Array.from({length:16}).map((_,i)=><line key={`h${i}`} x1="0" y1={`${(i+1)*6}%`} x2="100%" y2={`${(i+1)*6}%`} stroke="rgba(255,255,255,0.025)" strokeWidth="1"/>)}
        {Array.from({length:20}).map((_,i)=><line key={`v${i}`} x1={`${(i+1)*5}%`} y1="0" x2={`${(i+1)*5}%`} y2="100%" stroke="rgba(255,255,255,0.025)" strokeWidth="1"/>)}
        <line x1="0" y1="0" x2="25%" y2="100%" stroke="rgba(32,201,151,0.04)" strokeWidth="1.5"/>
        <line x1="100%" y1="0" x2="75%" y2="100%" stroke="rgba(0,123,255,0.04)" strokeWidth="1.5"/>
        <circle cx="88%" cy="10%" r="70" fill="none" stroke="rgba(32,201,151,0.07)" strokeWidth="1.5"/>
        <circle cx="88%" cy="10%" r="44" fill="none" stroke="rgba(32,201,151,0.05)" strokeWidth="1"/>
        <polygon points="0,0 100,0 0,100" fill="rgba(32,201,151,0.04)"/>
      </svg>

      <div style={{ position: "relative", zIndex: 1 }}>
        <Header />

        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "calc(100vh - 64px)" }}>
            <Loader />
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
            <h3 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: 20, color: "#fff", marginBottom: 8 }}>Failed to load companies</h3>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "#8C8C8C", marginBottom: 20 }}>{error}</p>
            <button onClick={fetchCompanies} style={{ padding: "9px 20px", background: "rgba(32,201,151,0.1)", border: "1px solid rgba(32,201,151,0.25)", borderRadius: 8, color: "#20c997", fontFamily: "'DM Sans',sans-serif", fontSize: 13, cursor: "pointer" }}>
              Try Again
            </button>
          </div>
        ) : (
          <main style={{ maxWidth: 1100, margin: "0 auto", padding: "40px clamp(14px,4vw,44px) 80px" }}>

            {/* Page header */}
            <div style={{ marginBottom: 36, animation: "fadeUp .5s ease both" }}>
              <span className="pill" style={{ marginBottom: 14, display: "inline-flex" }}>📁 PataKaro Archives</span>
              <h1 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: "clamp(26px,4vw,40px)", color: "#fff", letterSpacing: "-.03em", marginBottom: 8 }}>
                Company{" "}
                <span style={{ background: "linear-gradient(to right,#007BFF,#20c997)", WebkitBackgroundClip: "text", color: "transparent" }}>Placement Intel</span>
              </h1>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "#8C8C8C" }}>
                {total} companies · Hiring timelines, OA patterns & interview experiences
              </p>
            </div>

            {/* Search + filters */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 32, animation: "fadeUp .5s ease .05s both" }}>
              <div style={{ position: "relative" }}>
                <svg style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#6A6A6A" }} width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input
                  className="search-input"
                  placeholder="Search by company name..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                {search && (
                  <button onClick={() => setSearch("")} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#6A6A6A", cursor: "pointer", fontSize: 16 }}>✕</button>
                )}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button className={`cat-btn ${!catFilter ? "active" : ""}`} onClick={() => setCatFilter("")}>All</button>
                {categories.map(c => (
                  <button key={c} className={`cat-btn ${catFilter === c ? "active" : ""}`} onClick={() => setCatFilter(catFilter === c ? "" : c)}>{c}</button>
                ))}
              </div>
            </div>

            {/* Company cards */}
            {posts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", background: "#0e1218", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16 }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>🔍</div>
                <h3 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: 20, color: "#fff", marginBottom: 8 }}>No companies found</h3>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "#8C8C8C", marginBottom: 20 }}>Try a different search or clear filters</p>
                <button onClick={() => { setSearch(""); setCatFilter(""); }} style={{ padding: "9px 20px", background: "rgba(32,201,151,0.1)", border: "1px solid rgba(32,201,151,0.25)", borderRadius: 8, color: "#20c997", fontFamily: "'DM Sans',sans-serif", fontSize: 13, cursor: "pointer" }}>Clear filters</button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(310px,1fr))", gap: 16 }}>
                {posts.map((post, i) => (
                  <CompanyCard key={post._id} post={post} delay={i * 0.04} />
                ))}
              </div>
            )}
          </main>
        )}

        {/* Footer */}
        <footer style={{ background: "#080808", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "28px clamp(14px,4vw,44px)" }}>
          <div style={{ height: 1, background: "linear-gradient(90deg,transparent,#20c997,#007BFF,transparent)", opacity: .4, marginBottom: 24 }} />
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "#6A6A6A" }}>© {new Date().getFullYear()} Codify · PataKaro Archives</span>
            <div style={{ display: "flex", gap: 20 }}>
              {[["Home", "/home"], ["IntelliCode", "/intellicode"], ["FTE", "/fte"]].map(([l, to]) => (
                <Link key={l} to={to} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#6A6A6A", textDecoration: "none", transition: "color .2s" }}
                  onMouseEnter={e => e.currentTarget.style.color = "#20c997"}
                  onMouseLeave={e => e.currentTarget.style.color = "#6A6A6A"}>{l}</Link>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

function CompanyCard({ post, delay }) {
  const [open, setOpen] = useState(false);

  // Support both old JSON shape and new MongoDB shape
  const name     = post.name     || post.username || "";
  const logo     = post.logo     || "";
  const category = post.category || "";
  const location = post.location || "";
  const cgpa     = post.cgpaCriteria ? `${post.cgpaCriteria}` : (post.CGPA_criteria || "").replace("CGPA-Criteria :","").trim();
  const backlogs = post.backlogsPolicy || (post.backlogs || "").replace("Min Backlogs :","").trim();
  const branches = post.branchesAllowed || (post.branches || "").replace("Branches Allowed :","").trim();
  const id       = post._id || post.id;

  const details = [
    { label: "Category", value: category, icon: "🏷" },
    { label: "Location", value: location, icon: "📍" },
    { label: "CGPA",     value: cgpa,     icon: "🎓" },
    { label: "Backlogs", value: backlogs, icon: "📋" },
    { label: "Branches", value: branches, icon: "🌿" },
  ].filter(d => d.value);

  const catColor = category.toLowerCase().includes("fte") ? "#007BFF"
    : category.toLowerCase().includes("quant") ? "#f59e0b"
    : "#20c997";

  return (
    <div className="company-card" style={{ animationDelay: `${delay}s`, animation: "fadeUp .5s ease both" }}>
      <div style={{ padding: "18px 18px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 10, background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {logo ? <img src={logo} alt={name} style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : <span style={{ fontSize: 22 }}>🏢</span>}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: 15, color: "#fff", letterSpacing: "-.01em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</h3>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: "#6A6A6A", marginTop: 3 }}>
              {post.postedDate ? new Date(post.postedDate).toLocaleDateString() : post.date || ""}
            </div>
          </div>
          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: catColor, background: `${catColor}12`, border: `1px solid ${catColor}25`, borderRadius: 5, padding: "3px 8px", letterSpacing: ".1em", flexShrink: 0 }}>
            {category || "SDE"}
          </span>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          {location && <span className="tag" style={{ background: "rgba(0,123,255,0.08)", color: "#60a5fa", border: "1px solid rgba(0,123,255,0.15)" }}>📍 {location}</span>}
          {cgpa && <span className="tag" style={{ background: "rgba(245,158,11,0.08)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.18)" }}>🎓 CGPA {cgpa}+</span>}
        </div>

        <button onClick={() => setOpen(!open)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "9px 12px", color: "#8C8C8C", fontFamily: "'DM Sans',sans-serif", fontSize: 13, cursor: "pointer", transition: "all .2s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(32,201,151,0.06)"; e.currentTarget.style.borderColor = "rgba(32,201,151,0.2)"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#8C8C8C"; }}>
          <span>{open ? "Hide details" : "View details"}</span>
          <span style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform .2s", fontSize: 12 }}>▼</span>
        </button>
      </div>

      {open && (
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "14px 18px 16px", background: "rgba(255,255,255,0.02)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
            {details.map(d => (
              <div key={d.label} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ fontSize: 13, flexShrink: 0, marginTop: 1 }}>{d.icon}</span>
                <div>
                  <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: "#6A6A6A", letterSpacing: ".1em", textTransform: "uppercase", display: "block", marginBottom: 2 }}>{d.label}</span>
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#ccc" }}>{d.value}</span>
                </div>
              </div>
            ))}
          </div>
          <Link to={`/patakaro/details/${id}`} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 18px", background: "#20c997", color: "#000", borderRadius: 8, fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 13, textDecoration: "none", transition: "opacity .2s" }}
            onMouseEnter={e => e.currentTarget.style.opacity = ".85"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
            Full Details →
          </Link>
        </div>
      )}
    </div>
  );
}

export default Intern_home;