import React, { useState, useEffect } from "react";
import { useUser, SignOutButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

const T = (extra = {}) => ({
  transition: "all .22s cubic-bezier(.4,0,.2,1)",
  ...extra,
});

function Header() {
  const { user } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const name = user?.fullName || "User";
  const initials = name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Home", to: "/home" },
    { label: "PataKaro", to: "/patakaro" },
    { label: "IntelliCode", to: "/intellicode" },
    { label: "FTE", to: "/fte" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;700&family=DM+Sans:wght@300;400;500&family=Space+Mono:wght@400;700&display=swap');

        :root {
          --accent: #20c997;
          --accent-dim: rgba(32,201,151,0.10);
          --accent-border: rgba(32,201,151,0.22);
          --bg: #0D0D0D;
          --surface: #161616;
          --border: rgba(255,255,255,0.07);
          --text-muted: #6A6A6A;
          --text-secondary: #8C8C8C;
        }

        .nav-link {
          position: relative;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 400;
          color: var(--text-secondary);
          text-decoration: none;
          padding: 6px 0;
          letter-spacing: .01em;
          transition: all .22s cubic-bezier(.4,0,.2,1);
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0;
          width: 100%; height: 1.5px;
          background: var(--accent);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform .22s cubic-bezier(.4,0,.2,1);
        }
        .nav-link:hover { color: #fff; }
        .nav-link:hover::after { transform: scaleX(1); }
        .nav-link.active { color: var(--accent); }
        .nav-link.active::after { transform: scaleX(1); }

        .avatar-btn {
          width: 36px; height: 36px;
          border-radius: 50%;
          background: var(--accent-dim);
          border: 1.5px solid var(--accent-border);
          color: var(--accent);
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all .22s cubic-bezier(.4,0,.2,1);
        }
        .avatar-btn:hover {
          background: var(--accent);
          color: #000;
          border-color: var(--accent);
          transform: scale(1.08);
        }

        .dropdown {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          min-width: 160px;
          overflow: hidden;
          box-shadow: 0 24px 48px rgba(0,0,0,.6);
          z-index: 200;
        }
        .dropdown-item {
          display: block;
          width: 100%;
          padding: 11px 16px;
          text-align: left;
          background: none;
          border: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all .22s cubic-bezier(.4,0,.2,1);
        }
        .dropdown-item:hover { background: var(--accent-dim); color: #fff; }
        .dropdown-name {
          padding: 11px 16px;
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          color: var(--accent);
          border-bottom: 1px solid var(--border);
          letter-spacing: .1em;
          text-transform: uppercase;
        }

        .mobile-overlay {
          position: fixed; inset: 0;
          background: rgba(13,13,13,.97);
          z-index: 150;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 32px;
        }
        .mobile-nav-link {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: clamp(28px, 6vw, 40px);
          font-weight: 700;
          color: #fff;
          text-decoration: none;
          letter-spacing: -.02em;
          transition: all .22s cubic-bezier(.4,0,.2,1);
        }
        .mobile-nav-link:hover { color: var(--accent); }

        .ham-bar {
          display: block; width: 22px; height: 1.5px;
          background: #fff;
          transition: all .22s cubic-bezier(.4,0,.2,1);
        }
        .ham-open .bar1 { transform: translateY(5px) rotate(45deg); }
        .ham-open .bar2 { opacity: 0; }
        .ham-open .bar3 { transform: translateY(-5px) rotate(-45deg); }
      `}</style>

      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        background: scrolled ? "rgba(13,13,13,.92)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
        transition: "all .3s cubic-bezier(.4,0,.2,1)",
      }}>
        <div style={{
          maxWidth: 1200, margin: "0 auto",
          padding: "0 clamp(20px, 4vw, 48px)",
          height: 64,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          {/* Logo */}
          <Link to="/home" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontWeight: 800, fontSize: 20,
              background: "linear-gradient(to right, #007BFF, #20c997)",
              WebkitBackgroundClip: "text", color: "transparent",
              letterSpacing: "-.03em",
            }}>Codify</span>
            <span style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 9, color: "var(--accent)",
              background: "var(--accent-dim)",
              border: "1px solid var(--accent-border)",
              borderRadius: 4, padding: "2px 6px",
              letterSpacing: ".12em", textTransform: "uppercase",
            }}>BETA</span>
          </Link>

          {/* Desktop Nav */}
          <nav style={{ display: "flex", alignItems: "center", gap: 32 }} className="desktop-nav">
            {navLinks.map(({ label, to }) => (
              <Link key={label} to={to} className="nav-link">{label}</Link>
            ))}
          </nav>

          {/* Right — Avatar + Hamburger */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ position: "relative" }}>
              <button className="avatar-btn" onClick={() => setDropOpen(!dropOpen)}>
                {initials}
              </button>
              {dropOpen && (
                <div className="dropdown">
                  <div className="dropdown-name">{name}</div>
                  <Link to="/user_profile" className="dropdown-item" style={{ display: "block", textDecoration: "none" }}
                    onClick={() => setDropOpen(false)}>Profile</Link>
                  <SignOutButton>
                    <button className="dropdown-item" style={{ color: "#ff6b6b" }}>Sign Out</button>
                  </SignOutButton>
                </div>
              )}
            </div>

            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 4,
                display: "flex", flexDirection: "column", gap: 4 }}
              className={menuOpen ? "ham-open" : ""}
            >
              <span className="ham-bar bar1" />
              <span className="ham-bar bar2" />
              <span className="ham-bar bar3" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Overlay */}
      {menuOpen && (
        <div className="mobile-overlay">
          <button onClick={() => setMenuOpen(false)}
            style={{ position: "absolute", top: 20, right: 24, background: "none", border: "none",
              cursor: "pointer", color: "#fff", fontSize: 24 }}>✕</button>
          {navLinks.map(({ label, to }) => (
            <Link key={label} to={to} className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
              {label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

export default Header;