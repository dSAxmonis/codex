import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// ── Hooks ──────────────────────────────────────────────────────────────────
function useHover() {
  const [h, setH] = useState(false);
  return [h, { onMouseEnter: () => setH(true), onMouseLeave: () => setH(false) }];
}
function useInView() {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true); }, { threshold: 0.12 });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, []);
  return [ref, v];
}

// ── Data ───────────────────────────────────────────────────────────────────
const NAV_LINKS = ["Features", "How It Works", "Pricing", "FAQ"];

const FEATURES = [
  { icon: "📁", title: "PataKaro", tag: "ARCHIVES", desc: "Company hiring timelines, OA patterns, interview experiences from placed seniors — all in one searchable archive." },
  { icon: "⚡", title: "IntelliCode", tag: "AI CODING", desc: "Solve real OA questions with AI hints, auto test-case generation, and a blazing mobile-first code editor." },
  { icon: "🔗", title: "CodeCast", tag: "COLLABORATE", desc: "Real-time collaborative coding sessions. Code with friends, crack problems together, ship faster." },
  { icon: "🏢", title: "Company Intel", tag: "RESEARCH", desc: "CGPA cutoffs, branch eligibility, backlog policies, test duration — stop guessing, start preparing." },
  { icon: "📊", title: "OA Tracker", tag: "PROGRESS", desc: "Track every question you've solved. See your weak spots. Build streaks. Compete with your batch." },
  { icon: "🎯", title: "FTE Ready", tag: "FULL-TIME", desc: "Separate curated prep tracks for SDE Intern vs Full-Time roles with different question difficulty tiers." },
];

const STEPS = [
  { num: "01", title: "Sign Up Free", desc: "Create your account in 30 seconds — no credit card, no hassle." },
  { num: "02", title: "Pick Your Track", desc: "Choose Intern or FTE prep. Filter by company, role, or CGPA cutoff." },
  { num: "03", title: "Practice & Learn", desc: "Solve OA questions, read interview experiences, use IntelliCode." },
  { num: "04", title: "Get Placed", desc: "Walk into your interview prepared. Land the offer you deserve." },
];

const COMPARISON = [
  { feature: "Real OA Questions", codify: true, leetcode: false, gfg: false },
  { feature: "Company-specific Intel", codify: true, leetcode: false, gfg: true },
  { feature: "Interview Experiences", codify: true, leetcode: false, gfg: true },
  { feature: "AI Code Assistance", codify: true, leetcode: false, gfg: false },
  { feature: "Mobile Code Editor", codify: true, leetcode: true, gfg: false },
  { feature: "CGPA / Branch Filter", codify: true, leetcode: false, gfg: false },
  { feature: "Free Core Access", codify: true, leetcode: true, gfg: true },
  { feature: "Built for NSUT / DTU", codify: true, leetcode: false, gfg: false },
];

const PLANS = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    desc: "Everything you need to get started.",
    features: ["PataKaro access", "Company intel", "Interview experiences", "Basic OA questions", "CodeCast (limited)"],
    cta: "Get Started Free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "₹99",
    period: "/ month",
    desc: "Serious prep for serious candidates.",
    features: ["Everything in Free", "Full OA question bank", "AI code hints & debug", "IntelliCode unlimited", "Progress tracker", "Priority support"],
    cta: "Start Pro",
    highlight: true,
  },
  {
    name: "Batch",
    price: "₹49",
    period: "/ user / month",
    desc: "For study groups & placement cells.",
    features: ["Everything in Pro", "Up to 20 members", "Shared progress dashboard", "Batch leaderboard", "Placement cell branding"],
    cta: "Contact Us",
    highlight: false,
  },
];

const TESTIMONIALS = [
  { name: "Aryan Mehta", batch: "NSUT CSE '25", text: "PataKaro literally saved me. Found the exact OA pattern for Goldman Sachs 3 days before the test.", avatar: "AM" },
  { name: "Priya Sharma", batch: "DTU IT '25", text: "IntelliCode's AI hints are unreal. Solved questions I'd never have figured out on my own.", avatar: "PS" },
  { name: "Rahul Singh", batch: "NSUT ECE '24", text: "Got placed at Microsoft. Used Codify for every single mock OA. 10/10 would recommend.", avatar: "RS" },
  { name: "Sneha Gupta", batch: "DTU CSE '25", text: "The interview experiences section is gold. Knew exactly what to expect in my Atlassian interview.", avatar: "SG" },
  { name: "Karan Verma", batch: "NSUT IT '25", text: "CodeCast with my group made prep actually fun. We'd do OAs together every weekend.", avatar: "KV" },
  { name: "Divya Jain", batch: "DTU ECE '24", text: "Placed at Amazon. Codify had SDE questions from Amazon's actual OA. Game changer.", avatar: "DJ" },
];

const FAQS = [
  { q: "Is Codify free to use?", a: "Yes! The core features — PataKaro, company intel, and interview experiences — are completely free. Pro features like IntelliCode AI hints and the full question bank require a Pro subscription." },
  { q: "Which colleges is Codify built for?", a: "Primarily NSUT and DTU students, but the content is useful for any engineering college student preparing for placements." },
  { q: "How is Codify different from LeetCode?", a: "LeetCode is great for DSA practice but has no company-specific OA archives or placement intel. Codify is built specifically for placement season — real questions, real experiences, real intel." },
  { q: "Can I access Codify on mobile?", a: "Absolutely. IntelliCode is mobile-first — you can code, test, and submit solutions from your phone with a UI designed for small screens." },
  { q: "How do I cancel my Pro subscription?", a: "Cancel anytime from your profile page. No questions asked, no lock-in period." },
  { q: "Are the OA questions actually from real companies?", a: "Yes. Questions are sourced and verified by students who've appeared in actual OAs at those companies." },
];

const MARQUEE_ITEMS = ["PataKaro", "IntelliCode", "CodeCast", "OA Prep", "Company Intel", "AI Hints", "Interview Experiences", "NSUT", "DTU", "Get Placed ✦"];

// ── Main Component ─────────────────────────────────────────────────────────
export default function PublicLanding() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setHeroVisible(true), 100);
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goToSignIn = () => navigate("/sign-in");

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenu(false);
  };

  return (
    <div style={{ background: "#0A0A0A", minHeight: "100vh", overflowX: "hidden", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..60,600;12..60,700;12..60,800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&family=Space+Mono:wght@400;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --accent: #20c997;
          --accent-dim: rgba(32,201,151,0.09);
          --accent-border: rgba(32,201,151,0.2);
          --surface: #141414;
          --surface2: #1a1a1a;
          --border: rgba(255,255,255,0.07);
          --muted: #6A6A6A;
          --secondary: #8C8C8C;
        }

        html { scroll-behavior: smooth; }

        @keyframes fadeUp {
          from { opacity:0; transform:translateY(28px); }
          to   { opacity:1; transform:translateY(0);    }
        }
        @keyframes breathe {
          0%,100% { transform:scale(1);    opacity:.055; }
          50%      { transform:scale(1.1); opacity:.09;  }
        }
        @keyframes marq {
          from { transform:translateX(0); }
          to   { transform:translateX(-50%); }
        }
        @keyframes shimmer {
          from { transform:translateX(-100%); }
          to   { transform:translateX(200%);  }
        }
        @keyframes blink {
          0%,100% { opacity:1; }
          50%      { opacity:.2; }
        }
        @keyframes spin {
          to { transform:rotate(360deg); }
        }

        .dot-grid {
          background-image: radial-gradient(circle, rgba(255,255,255,0.11) 1px, transparent 1px);
          background-size: 28px 28px;
          mask-image: radial-gradient(ellipse 75% 75% at 50% 50%, black 30%, transparent 100%);
          -webkit-mask-image: radial-gradient(ellipse 75% 75% at 50% 50%, black 30%, transparent 100%);
        }

        .glow { position:absolute; border-radius:50%; filter:blur(90px); pointer-events:none; animation:breathe 7s ease-in-out infinite; }

        .marquee-wrap { overflow:hidden; }
        .marquee-track { display:flex; animation:marq 28s linear infinite; white-space:nowrap; }

        .pill {
          display:inline-flex; align-items:center; gap:7px;
          font-family:'Space Mono',monospace; font-size:10px;
          color:var(--accent); background:var(--accent-dim);
          border:1px solid var(--accent-border);
          border-radius:100px; padding:5px 14px;
          letter-spacing:.15em; text-transform:uppercase;
        }

        .btn-primary {
          position:relative; overflow:hidden;
          display:inline-flex; align-items:center; gap:8px;
          padding:13px 26px; background:var(--accent);
          color:#000; border:none; border-radius:10px;
          font-family:'DM Sans',sans-serif; font-size:14px; font-weight:600;
          cursor:pointer; text-decoration:none;
          transition:all .22s cubic-bezier(.4,0,.2,1);
        }
        .btn-primary:hover { transform:translateY(-3px); box-shadow:0 14px 36px rgba(32,201,151,.32); }
        .btn-primary::after {
          content:''; position:absolute; top:0; left:-100%; width:50%; height:100%;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,.28),transparent);
        }
        .btn-primary:hover::after { animation:shimmer .55s ease forwards; }

        .btn-ghost {
          display:inline-flex; align-items:center; gap:8px;
          padding:13px 26px; background:transparent;
          color:var(--secondary); border:1px solid var(--border);
          border-radius:10px; font-family:'DM Sans',sans-serif;
          font-size:14px; font-weight:400; cursor:pointer;
          transition:all .22s cubic-bezier(.4,0,.2,1);
        }
        .btn-ghost:hover { border-color:var(--accent-border); color:#fff; transform:translateY(-2px); }

        .nav-a {
          font-family:'DM Sans',sans-serif; font-size:14px; color:var(--secondary);
          cursor:pointer; background:none; border:none; padding:0;
          transition:color .2s;
        }
        .nav-a:hover { color:#fff; }

        .feat-card {
          background:var(--surface); border:1px solid var(--border);
          border-radius:14px; padding:28px 24px;
          transition:all .22s cubic-bezier(.4,0,.2,1);
          position:relative; overflow:hidden;
        }
        .feat-card:hover {
          border-color:var(--accent-border);
          transform:translateY(-6px);
          box-shadow:0 24px 48px rgba(32,201,151,.07);
          background:rgba(32,201,151,.04);
        }
        .feat-card::before {
          content:''; position:absolute; top:0; left:0; right:0; height:2px;
          background:linear-gradient(90deg,#007BFF,#20c997);
          transform:scaleX(0); transform-origin:left;
          transition:transform .22s cubic-bezier(.4,0,.2,1);
        }
        .feat-card:hover::before { transform:scaleX(1); }

        .step-card {
          padding:32px 28px; border-left:1px solid var(--border);
          transition:border-color .22s;
        }
        .step-card:hover { border-color:var(--accent-border); }

        .plan-card {
          background:var(--surface); border:1px solid var(--border);
          border-radius:16px; padding:32px 28px;
          transition:all .22s cubic-bezier(.4,0,.2,1);
        }
        .plan-card:hover { transform:translateY(-4px); box-shadow:0 20px 40px rgba(0,0,0,.4); }
        .plan-card.highlight {
          border-color:var(--accent-border);
          background:linear-gradient(135deg, rgba(32,201,151,.08), rgba(0,123,255,.05));
        }

        .testi-card {
          background:var(--surface); border:1px solid var(--border);
          border-radius:14px; padding:24px;
          transition:all .22s cubic-bezier(.4,0,.2,1);
        }
        .testi-card:hover { border-color:var(--accent-border); transform:translateY(-4px); }

        .faq-item {
          border-bottom:1px solid var(--border);
          transition:border-color .2s;
        }
        .faq-item:hover { border-color:var(--accent-border); }

        .faq-q {
          width:100%; display:flex; justify-content:space-between; align-items:center;
          padding:20px 0; background:none; border:none; cursor:pointer;
          font-family:'DM Sans',sans-serif; font-size:15px; font-weight:500;
          color:#fff; text-align:left; gap:16px;
          transition:color .2s;
        }
        .faq-q:hover { color:var(--accent); }

        .check { color:var(--accent); font-size:16px; }
        .cross { color:#3a3a3a; font-size:16px; }

        .avatar {
          width:40px; height:40px; border-radius:50%;
          background:var(--accent-dim); border:1px solid var(--accent-border);
          display:flex; align-items:center; justify-content:center;
          font-family:'Space Mono',monospace; font-size:11px;
          font-weight:700; color:var(--accent); flex-shrink:0;
        }

        .section { padding:96px clamp(20px,5vw,72px); }
        .section-sm { padding:64px clamp(20px,5vw,72px); }
        .container { max-width:1100px; margin:0 auto; }
        .section-head { text-align:center; margin-bottom:56px; }

        h1,h2,h3 { font-family:'Bricolage Grotesque',sans-serif; }

        .grid-3 { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; }
        .grid-4 { display:grid; grid-template-columns:repeat(4,1fr); gap:1px; background:var(--border); border-radius:14px; overflow:hidden; }
        .grid-3-plans { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; }
        .grid-2-testi { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }

        @media(max-width:960px){
          .grid-3 { grid-template-columns:repeat(2,1fr); }
          .grid-3-plans { grid-template-columns:1fr; max-width:420px; margin:0 auto; }
          .grid-2-testi { grid-template-columns:repeat(2,1fr); }
          .grid-4 { grid-template-columns:repeat(2,1fr); }
          .comp-table { font-size:13px; }
        }
        @media(max-width:640px){
          .grid-3 { grid-template-columns:1fr; }
          .grid-2-testi { grid-template-columns:1fr; }
          .grid-4 { grid-template-columns:1fr; }
          .hero-btns { flex-direction:column; align-items:stretch; }
        }

        .ham { display:flex; flex-direction:column; gap:5px; background:none; border:none; cursor:pointer; padding:4px; }
        .ham-bar { width:22px; height:1.5px; background:#fff; transition:all .22s; display:block; }

        .mobile-menu {
          position:fixed; inset:0; background:rgba(10,10,10,.97);
          z-index:200; display:flex; flex-direction:column;
          align-items:center; justify-content:center; gap:36px;
        }
        .mobile-menu-link {
          font-family:'Bricolage Grotesque',sans-serif; font-weight:700;
          font-size:clamp(28px,7vw,44px); color:#fff; cursor:pointer;
          background:none; border:none; letter-spacing:-.02em;
          transition:color .2s;
        }
        .mobile-menu-link:hover { color:var(--accent); }
      `}</style>

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav style={{
        position:"sticky", top:0, zIndex:100,
        background: scrolled ? "rgba(10,10,10,.92)" : "transparent",
        backdropFilter: scrolled ? "blur(18px)" : "none",
        borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
        transition:"all .3s cubic-bezier(.4,0,.2,1)",
      }}>
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 clamp(20px,4vw,48px)", height:64, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          {/* Logo */}
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight:800, fontSize:20, background:"linear-gradient(to right,#007BFF,#20c997)", WebkitBackgroundClip:"text", color:"transparent", letterSpacing:"-.03em" }}>Codify</span>
            <span className="pill" style={{ fontSize:8, padding:"2px 7px" }}>BETA</span>
          </div>

          {/* Desktop links */}
          <div style={{ display:"flex", gap:32 }} className="desktop-nav-links">
            {NAV_LINKS.map(l => (
              <button key={l} className="nav-a" onClick={() => scrollTo(l.toLowerCase().replace(/ /g, "-"))}>{l}</button>
            ))}
          </div>

          {/* CTA + Ham */}
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <button className="btn-ghost" style={{ padding:"9px 18px", fontSize:13 }} onClick={goToSignIn}>Sign In</button>
            <button className="btn-primary" style={{ padding:"9px 18px", fontSize:13 }} onClick={goToSignIn}>Get Started →</button>
            <button className="ham" onClick={() => setMobileMenu(true)} style={{ marginLeft:4 }}>
              <span className="ham-bar"/><span className="ham-bar"/><span className="ham-bar"/>
            </button>
          </div>
        </div>
      </nav>

      {mobileMenu && (
        <div className="mobile-menu">
          <button onClick={() => setMobileMenu(false)} style={{ position:"absolute", top:20, right:24, background:"none", border:"none", color:"#fff", fontSize:26, cursor:"pointer" }}>✕</button>
          {NAV_LINKS.map(l => (
            <button key={l} className="mobile-menu-link" onClick={() => scrollTo(l.toLowerCase().replace(/ /g,"-"))}>{l}</button>
          ))}
          <button className="btn-primary" onClick={goToSignIn}>Get Started →</button>
        </div>
      )}

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section style={{ position:"relative", minHeight:"92vh", display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", textAlign:"center", padding:"80px clamp(20px,5vw,72px) 60px", overflow:"hidden" }}>
        <div className="dot-grid" style={{ position:"absolute", inset:0, zIndex:0 }}/>
        <div className="glow" style={{ width:700, height:700, background:"#20c997", top:"5%", left:"50%", transform:"translateX(-50%)", opacity:.055 }}/>
        <div className="glow" style={{ width:450, height:450, background:"#007BFF", top:"35%", left:"15%", opacity:.045, animationDelay:"2.5s" }}/>
        <div className="glow" style={{ width:350, height:350, background:"#20c997", top:"40%", right:"10%", opacity:.04, animationDelay:"4s" }}/>

        <div style={{ position:"relative", zIndex:1, maxWidth:820 }}>
          <div style={{ display:"flex", justifyContent:"center", marginBottom:28, animation: heroVisible?"fadeUp .6s ease both":"none", animationDelay:".1s", opacity: heroVisible?undefined:0 }}>
            <span className="pill">
              <span style={{ width:6, height:6, borderRadius:"50%", background:"var(--accent)", animation:"blink 2s ease infinite" }}/>
              Placement Season 2026 · Built for NSUT & DTU
            </span>
          </div>

          <h1 style={{
            fontWeight:800, fontSize:"clamp(40px,7.5vw,76px)", letterSpacing:"-.045em", lineHeight:1.06, color:"#fff", marginBottom:22,
            animation: heroVisible?"fadeUp .6s ease both":"none", animationDelay:".2s", opacity: heroVisible?undefined:0,
          }}>
            Crack Every OA.<br/>
            <span style={{ background:"linear-gradient(90deg,#007BFF,#20c997)", WebkitBackgroundClip:"text", color:"transparent" }}>Land Every Offer.</span>
          </h1>

          <p style={{
            fontFamily:"'DM Sans',sans-serif", fontSize:"clamp(15px,2vw,17px)", fontWeight:300,
            color:"#8C8C8C", lineHeight:1.82, maxWidth:520, margin:"0 auto 36px",
            animation: heroVisible?"fadeUp .6s ease both":"none", animationDelay:".3s", opacity: heroVisible?undefined:0,
          }}>
            Company OA archives, AI-powered coding practice, interview experiences, and placement intel — all in one place.
          </p>

          <div className="hero-btns" style={{
            display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap",
            animation: heroVisible?"fadeUp .6s ease both":"none", animationDelay:".4s", opacity: heroVisible?undefined:0,
          }}>
            <button className="btn-primary" style={{ fontSize:15, padding:"14px 30px" }} onClick={goToSignIn}>
              Get Started Free →
            </button>
            <button className="btn-ghost" style={{ fontSize:15, padding:"14px 30px" }} onClick={() => scrollTo("features")}>
              See Features
            </button>
          </div>

          {/* Stats */}
          <div style={{
            display:"flex", justifyContent:"center", gap:48, flexWrap:"wrap",
            marginTop:72, paddingTop:36, borderTop:"1px solid rgba(255,255,255,0.07)",
            animation: heroVisible?"fadeUp .6s ease both":"none", animationDelay:".5s", opacity: heroVisible?undefined:0,
          }}>
            {[["500+","OA Questions"],["50+","Companies"],["1K+","Students"],["95%","Satisfaction"]].map(([v,l]) => (
              <div key={l} style={{ textAlign:"center" }}>
                <div style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight:800, fontSize:"clamp(26px,4vw,38px)", color:"#fff", letterSpacing:"-.03em" }}>{v}</div>
                <div style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:"var(--muted)", letterSpacing:".14em", textTransform:"uppercase", marginTop:4 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MARQUEE ──────────────────────────────────────────────────────── */}
      <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)", borderBottom:"1px solid rgba(255,255,255,0.06)", padding:"14px 0", background:"#070707" }}>
        <div className="marquee-wrap">
          <div className="marquee-track">
            {[...MARQUEE_ITEMS,...MARQUEE_ITEMS,...MARQUEE_ITEMS].map((item,i) => (
              <span key={i} style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:"var(--muted)", letterSpacing:".13em", textTransform:"uppercase", marginRight:48 }}>
                {item}<span style={{ color:"var(--accent)", marginLeft:48 }}>✦</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── FEATURES ─────────────────────────────────────────────────────── */}
      <section className="section" id="features">
        <div className="container">
          <FadeSection>
            <div className="section-head">
              <div className="pill" style={{ marginBottom:20 }}>Features</div>
              <h2 style={{ fontWeight:800, fontSize:"clamp(28px,4vw,46px)", color:"#fff", letterSpacing:"-.035em" }}>
                Everything you need to{" "}
                <em style={{ fontStyle:"italic", fontWeight:400, color:"var(--muted)" }}>get placed</em>
              </h2>
              <p style={{ color:"var(--secondary)", fontSize:15, lineHeight:1.8, maxWidth:480, margin:"14px auto 0" }}>
                Six powerful tools built specifically for engineering students facing placement season.
              </p>
            </div>
          </FadeSection>
          <div className="grid-3">
            {FEATURES.map((f,i) => (
              <FadeSection key={i} delay={i*0.08}>
                <div className="feat-card">
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18 }}>
                    <span style={{ fontSize:22 }}>{f.icon}</span>
                    <span className="pill" style={{ fontSize:9 }}>{f.tag}</span>
                  </div>
                  <h3 style={{ fontWeight:700, fontSize:19, color:"#fff", letterSpacing:"-.02em", marginBottom:10 }}>{f.title}</h3>
                  <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, color:"var(--secondary)", lineHeight:1.78 }}>{f.desc}</p>
                </div>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="section" id="how-it-works" style={{ background:"#070707", borderTop:"1px solid var(--border)", borderBottom:"1px solid var(--border)" }}>
        <div className="container">
          <FadeSection>
            <div className="section-head">
              <div className="pill" style={{ marginBottom:20 }}>How It Works</div>
              <h2 style={{ fontWeight:800, fontSize:"clamp(28px,4vw,46px)", color:"#fff", letterSpacing:"-.035em" }}>
                Four steps to{" "}
                <span style={{ background:"linear-gradient(90deg,#007BFF,#20c997)", WebkitBackgroundClip:"text", color:"transparent" }}>placement ready</span>
              </h2>
            </div>
          </FadeSection>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:0 }}>
            {STEPS.map((s,i) => (
              <FadeSection key={i} delay={i*0.1}>
                <div className="step-card">
                  <div style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:"var(--accent)", letterSpacing:".18em", marginBottom:16 }}>{s.num}</div>
                  <h3 style={{ fontWeight:700, fontSize:18, color:"#fff", letterSpacing:"-.02em", marginBottom:10 }}>{s.title}</h3>
                  <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, color:"var(--secondary)", lineHeight:1.78 }}>{s.desc}</p>
                </div>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPARISON ───────────────────────────────────────────────────── */}
      <section className="section" id="codify-vs-others">
        <div className="container">
          <FadeSection>
            <div className="section-head">
              <div className="pill" style={{ marginBottom:20 }}>Comparison</div>
              <h2 style={{ fontWeight:800, fontSize:"clamp(28px,4vw,46px)", color:"#fff", letterSpacing:"-.035em" }}>
                Codify vs the rest
              </h2>
              <p style={{ color:"var(--secondary)", fontSize:15, lineHeight:1.8, maxWidth:440, margin:"14px auto 0" }}>
                See why students choose Codify over generic DSA platforms.
              </p>
            </div>
          </FadeSection>
          <FadeSection>
            <div style={{ overflowX:"auto" }}>
              <table className="comp-table" style={{ width:"100%", borderCollapse:"collapse", fontFamily:"'DM Sans',sans-serif" }}>
                <thead>
                  <tr>
                    {["Feature","Codify","LeetCode","GFG"].map((h,i) => (
                      <th key={h} style={{
                        padding:"14px 20px", textAlign: i===0?"left":"center",
                        fontFamily:"'Space Mono',monospace", fontSize:10,
                        color: i===1?"var(--accent)":"var(--muted)",
                        letterSpacing:".14em", textTransform:"uppercase",
                        borderBottom:"1px solid var(--border)",
                        background: i===1?"rgba(32,201,151,.05)":"transparent",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row,i) => (
                    <tr key={i} style={{ borderBottom:"1px solid var(--border)" }}>
                      <td style={{ padding:"14px 20px", color:"var(--secondary)", fontSize:14 }}>{row.feature}</td>
                      <td style={{ padding:"14px 20px", textAlign:"center", background:"rgba(32,201,151,.03)" }}><span className="check">✓</span></td>
                      <td style={{ padding:"14px 20px", textAlign:"center" }}><span className={row.leetcode?"check":"cross"}>{row.leetcode?"✓":"✗"}</span></td>
                      <td style={{ padding:"14px 20px", textAlign:"center" }}><span className={row.gfg?"check":"cross"}>{row.gfg?"✓":"✗"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeSection>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────────────── */}
      <section className="section" id="pricing" style={{ background:"#070707", borderTop:"1px solid var(--border)" }}>
        <div className="container">
          <FadeSection>
            <div className="section-head">
              <div className="pill" style={{ marginBottom:20 }}>Pricing</div>
              <h2 style={{ fontWeight:800, fontSize:"clamp(28px,4vw,46px)", color:"#fff", letterSpacing:"-.035em" }}>
                Simple,{" "}
                <em style={{ fontStyle:"italic", fontWeight:400, color:"var(--muted)" }}>honest</em>
                {" "}pricing
              </h2>
              <p style={{ color:"var(--secondary)", fontSize:15, lineHeight:1.8, maxWidth:420, margin:"14px auto 0" }}>
                Start free. Upgrade when you need more firepower for placement season.
              </p>
            </div>
          </FadeSection>
          <div className="grid-3-plans" style={{ maxWidth:960, margin:"0 auto" }}>
            {PLANS.map((plan,i) => (
              <FadeSection key={i} delay={i*0.1}>
                <div className={`plan-card${plan.highlight?" highlight":""}`} style={{ position:"relative" }}>
                  {plan.highlight && (
                    <div style={{ position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)" }}>
                      <span className="pill" style={{ fontSize:9, padding:"4px 12px" }}>Most Popular</span>
                    </div>
                  )}
                  <div style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:"var(--muted)", letterSpacing:".16em", textTransform:"uppercase", marginBottom:16 }}>{plan.name}</div>
                  <div style={{ display:"flex", alignItems:"baseline", gap:6, marginBottom:8 }}>
                    <span style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight:800, fontSize:38, color:"#fff", letterSpacing:"-.04em" }}>{plan.price}</span>
                    <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"var(--muted)" }}>{plan.period}</span>
                  </div>
                  <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"var(--secondary)", marginBottom:24, lineHeight:1.7 }}>{plan.desc}</p>
                  <ul style={{ listStyle:"none", display:"flex", flexDirection:"column", gap:10, marginBottom:28 }}>
                    {plan.features.map((f,j) => (
                      <li key={j} style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                        <span style={{ color:"var(--accent)", fontSize:14, marginTop:1 }}>✓</span>
                        <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"var(--secondary)", lineHeight:1.6 }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button className={plan.highlight?"btn-primary":"btn-ghost"} style={{ width:"100%", justifyContent:"center" }} onClick={goToSignIn}>
                    {plan.cta}
                  </button>
                </div>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
      <section className="section" id="testimonials">
        <div className="container">
          <FadeSection>
            <div className="section-head">
              <div className="pill" style={{ marginBottom:20 }}>Testimonials</div>
              <h2 style={{ fontWeight:800, fontSize:"clamp(28px,4vw,46px)", color:"#fff", letterSpacing:"-.035em" }}>
                Students who{" "}
                <span style={{ background:"linear-gradient(90deg,#007BFF,#20c997)", WebkitBackgroundClip:"text", color:"transparent" }}>got placed</span>
              </h2>
            </div>
          </FadeSection>
          <div className="grid-2-testi">
            {TESTIMONIALS.map((t,i) => (
              <FadeSection key={i} delay={i*0.07}>
                <div className="testi-card">
                  <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:"var(--secondary)", lineHeight:1.78, marginBottom:20 }}>
                    "{t.text}"
                  </p>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div className="avatar">{t.avatar}</div>
                    <div>
                      <div style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:500, fontSize:14, color:"#fff" }}>{t.name}</div>
                      <div style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:"var(--muted)", letterSpacing:".1em" }}>{t.batch}</div>
                    </div>
                  </div>
                </div>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="section" id="faq" style={{ background:"#070707", borderTop:"1px solid var(--border)" }}>
        <div className="container" style={{ maxWidth:720 }}>
          <FadeSection>
            <div className="section-head">
              <div className="pill" style={{ marginBottom:20 }}>FAQ</div>
              <h2 style={{ fontWeight:800, fontSize:"clamp(28px,4vw,46px)", color:"#fff", letterSpacing:"-.035em" }}>
                Common questions
              </h2>
            </div>
          </FadeSection>
          <div>
            {FAQS.map((faq,i) => (
              <div key={i} className="faq-item">
                <button className="faq-q" onClick={() => setOpenFaq(openFaq===i?null:i)}>
                  <span>{faq.q}</span>
                  <span style={{ color:"var(--accent)", fontSize:18, flexShrink:0, transition:"transform .22s", transform: openFaq===i?"rotate(45deg)":"rotate(0)" }}>+</span>
                </button>
                {openFaq===i && (
                  <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:"var(--secondary)", lineHeight:1.8, paddingBottom:20 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────────────── */}
      <section className="section" style={{ position:"relative", overflow:"hidden", textAlign:"center" }}>
        <div className="dot-grid" style={{ position:"absolute", inset:0, zIndex:0 }}/>
        <div className="glow" style={{ width:600, height:400, background:"#20c997", top:"50%", left:"50%", transform:"translate(-50%,-50%)", opacity:.06 }}/>
        <div style={{ position:"relative", zIndex:1, maxWidth:600, margin:"0 auto" }}>
          <h2 style={{ fontWeight:800, fontSize:"clamp(30px,5vw,52px)", color:"#fff", letterSpacing:"-.04em", marginBottom:16 }}>
            Ready to crack<br/>
            <span style={{ background:"linear-gradient(90deg,#007BFF,#20c997)", WebkitBackgroundClip:"text", color:"transparent" }}>placement season?</span>
          </h2>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:16, color:"var(--secondary)", lineHeight:1.8, marginBottom:32 }}>
            Join 1,000+ students who use Codify to prepare smarter. It's free to start.
          </p>
          <button className="btn-primary" style={{ fontSize:15, padding:"16px 36px" }} onClick={goToSignIn}>
            Get Started Free →
          </button>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer style={{ background:"#000", borderTop:"1px solid var(--border)", padding:"48px clamp(20px,5vw,72px) 32px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          {/* Accent line */}
          <div style={{ height:1, background:"linear-gradient(90deg,transparent,var(--accent),transparent)", marginBottom:48, opacity:.4 }}/>
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:40, marginBottom:48 }}>
            <div>
              <span style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight:800, fontSize:20, background:"linear-gradient(to right,#007BFF,#20c997)", WebkitBackgroundClip:"text", color:"transparent", letterSpacing:"-.03em" }}>Codify</span>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"var(--muted)", lineHeight:1.8, marginTop:12, maxWidth:240 }}>
                Placement prep platform built for engineering students. Real questions, real intel, real results.
              </p>
            </div>
            {[
              { heading:"Product", links:["Features","How It Works","Pricing","FAQ"] },
              { heading:"Platform", links:["PataKaro","IntelliCode","CodeCast","FTE Prep"] },
              { heading:"Connect", links:["Instagram","LinkedIn","Discord","Contact"] },
            ].map(col => (
              <div key={col.heading}>
                <div style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:"var(--accent)", letterSpacing:".16em", textTransform:"uppercase", marginBottom:16 }}>{col.heading}</div>
                <ul style={{ listStyle:"none", display:"flex", flexDirection:"column", gap:10 }}>
                  {col.links.map(l => (
                    <li key={l}>
                      <button style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"var(--muted)", background:"none", border:"none", cursor:"pointer", padding:0, transition:"color .2s" }}
                        onMouseEnter={e=>e.target.style.color="#fff"} onMouseLeave={e=>e.target.style.color="var(--muted)"}
                        onClick={goToSignIn}>{l}</button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ borderTop:"1px solid var(--border)", paddingTop:24, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
            <span style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:"var(--muted)", letterSpacing:".1em" }}>© 2026 CODIFY · ALL RIGHTS RESERVED</span>
            <span style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:"var(--muted)", letterSpacing:".1em" }}>BUILT FOR NSUT & DTU STUDENTS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ── FadeSection wrapper ────────────────────────────────────────────────────
function FadeSection({ children, delay = 0 }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : "translateY(24px)",
      transition: `opacity .55s ease ${delay}s, transform .55s ease ${delay}s`,
    }}>
      {children}
    </div>
  );
}