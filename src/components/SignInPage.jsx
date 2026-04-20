// import React from "react";
// import { SignIn } from "@clerk/clerk-react";

// const SignInPage = () => {
//   return (
//     <div style={{ display: "flex", minHeight: "100vh", background: "#0A0A0A", fontFamily: "'DM Sans', sans-serif" }}>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..60,700;12..60,800&family=DM+Sans:wght@300;400;500&family=Space+Mono:wght@400;700&display=swap');

//         :root {
//           --accent: #20c997;
//           --accent-dim: rgba(32,201,151,0.09);
//           --accent-border: rgba(32,201,151,0.2);
//           --border: rgba(255,255,255,0.07);
//           --muted: #6A6A6A;
//           --secondary: #8C8C8C;
//         }

//         @keyframes breathe {
//           0%,100% { transform:scale(1);    opacity:.06; }
//           50%      { transform:scale(1.12); opacity:.10; }
//         }
//         @keyframes fadeUp {
//           from { opacity:0; transform:translateY(20px); }
//           to   { opacity:1; transform:translateY(0);    }
//         }
//         @keyframes blink {
//           0%,100% { opacity:1;  }
//           50%      { opacity:.2; }
//         }

//         .dot-grid {
//           background-image: radial-gradient(circle, rgba(255,255,255,0.11) 1px, transparent 1px);
//           background-size: 28px 28px;
//           mask-image: radial-gradient(ellipse 80% 80% at 40% 50%, black 30%, transparent 100%);
//           -webkit-mask-image: radial-gradient(ellipse 80% 80% at 40% 50%, black 30%, transparent 100%);
//         }

//         .glow {
//           position: absolute; border-radius: 50%;
//           filter: blur(90px); pointer-events: none;
//           animation: breathe 7s ease-in-out infinite;
//         }

//         .left-content {
//           animation: fadeUp .7s ease both;
//         }

//         .tag {
//           display: inline-flex; align-items: center; gap: 7px;
//           font-family: 'Space Mono', monospace; font-size: 10px;
//           color: var(--accent); background: var(--accent-dim);
//           border: 1px solid var(--accent-border);
//           border-radius: 100px; padding: 5px 14px;
//           letter-spacing: .15em; text-transform: uppercase;
//           margin-bottom: 28px;
//         }

//         .feature-item {
//           display: flex; align-items: flex-start; gap: 14px;
//           padding: 14px 0;
//           border-bottom: 1px solid rgba(255,255,255,0.06);
//           transition: all .2s;
//         }
//         .feature-item:last-child { border-bottom: none; }

//         /* Override Clerk card styles */
//         .cl-card {
//           background: #141414 !important;
//           border: 1px solid rgba(255,255,255,0.08) !important;
//           border-radius: 16px !important;
//           box-shadow: 0 32px 64px rgba(0,0,0,.6) !important;
//         }
//         .cl-headerTitle { color: #fff !important; font-family: 'Bricolage Grotesque', sans-serif !important; }
//         .cl-headerSubtitle { color: #8C8C8C !important; }
//         .cl-formFieldLabel { color: #8C8C8C !important; font-family: 'DM Sans', sans-serif !important; }
//         .cl-formFieldInput {
//           background: #0A0A0A !important;
//           border: 1px solid rgba(255,255,255,0.1) !important;
//           color: #fff !important;
//           border-radius: 8px !important;
//         }
//         .cl-formFieldInput:focus { border-color: var(--accent) !important; }
//         .cl-formButtonPrimary {
//           background: var(--accent) !important;
//           color: #000 !important;
//           font-weight: 600 !important;
//           border-radius: 8px !important;
//           transition: all .22s !important;
//         }
//         .cl-formButtonPrimary:hover { opacity:.88 !important; transform: translateY(-2px) !important; }
//         .cl-footerActionLink { color: var(--accent) !important; }
//         .cl-dividerLine { background: rgba(255,255,255,0.08) !important; }
//         .cl-dividerText { color: #6A6A6A !important; }
//         .cl-socialButtonsBlockButton {
//           background: #1a1a1a !important;
//           border: 1px solid rgba(255,255,255,0.09) !important;
//           color: #fff !important;
//           border-radius: 8px !important;
//         }
//         .cl-socialButtonsBlockButton:hover { border-color: var(--accent-border) !important; }
//         .cl-internal-b3fm6y { background: #141414 !important; }
//         .cl-footer { background: #141414 !important; }
//         .cl-footerPages { background: #141414 !important; }

//         @media (max-width: 860px) {
//           .left-panel { display: none !important; }
//           .right-panel { width: 100% !important; }
//         }
//       `}</style>

//       {/* ── Left Panel ──────────────────────────────────────────────────── */}
//       <div className="left-panel" style={{
//         flex: 1, position: "relative", overflow: "hidden",
//         display: "flex", flexDirection: "column",
//         justifyContent: "center", padding: "60px clamp(40px,6vw,80px)",
//         borderRight: "1px solid rgba(255,255,255,0.06)",
//       }}>
//         {/* Dot grid */}
//         <div className="dot-grid" style={{ position: "absolute", inset: 0, zIndex: 0 }} />

//         {/* Glow blobs */}
//         <div className="glow" style={{ width: 500, height: 500, background: "#20c997", top: "10%", left: "20%", opacity: .06 }} />
//         <div className="glow" style={{ width: 350, height: 350, background: "#007BFF", bottom: "10%", right: "10%", opacity: .05, animationDelay: "3s" }} />

//         <div className="left-content" style={{ position: "relative", zIndex: 1, maxWidth: 440 }}>
//           {/* Logo */}
//           <div style={{ marginBottom: 48, display: "flex", alignItems: "center", gap: 8 }}>
//             <span style={{
//               fontFamily: "'Bricolage Grotesque', sans-serif",
//               fontWeight: 800, fontSize: 22,
//               background: "linear-gradient(to right, #007BFF, #20c997)",
//               WebkitBackgroundClip: "text", color: "transparent",
//               letterSpacing: "-.03em",
//             }}>Codify</span>
//             <span style={{
//               fontFamily: "'Space Mono', monospace", fontSize: 8,
//               color: "var(--accent)", background: "var(--accent-dim)",
//               border: "1px solid var(--accent-border)",
//               borderRadius: 4, padding: "2px 7px",
//               letterSpacing: ".12em", textTransform: "uppercase",
//             }}>BETA</span>
//           </div>

//           {/* Badge */}
//           <div className="tag">
//             <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", animation: "blink 2s ease infinite" }} />
//             Placement Season 2026
//           </div>

//           {/* Headline */}
//           <h1 style={{
//             fontFamily: "'Bricolage Grotesque', sans-serif",
//             fontWeight: 800, fontSize: "clamp(32px,4vw,48px)",
//             letterSpacing: "-.04em", lineHeight: 1.08,
//             color: "#fff", marginBottom: 16,
//           }}>
//             Crack Every OA.<br />
//             <span style={{
//               background: "linear-gradient(90deg,#007BFF,#20c997)",
//               WebkitBackgroundClip: "text", color: "transparent",
//             }}>Land Every Offer.</span>
//           </h1>

//           <p style={{
//             fontFamily: "'DM Sans', sans-serif",
//             fontSize: 15, fontWeight: 300,
//             color: "#8C8C8C", lineHeight: 1.82,
//             marginBottom: 40,
//           }}>
//             OA archives, company intel, AI-powered coding practice — built for NSUT & DTU students.
//           </p>

//           {/* Feature list */}
//           <div>
//             {[
//               { icon: "📁", title: "PataKaro", desc: "Real OA questions & company intel" },
//               { icon: "⚡", title: "IntelliCode", desc: "AI-powered coding practice" },
//               { icon: "🔗", title: "CodeCast", desc: "Real-time collaborative sessions" },
//             ].map((f) => (
//               <div className="feature-item" key={f.title}>
//                 <span style={{ fontSize: 20, marginTop: 1 }}>{f.icon}</span>
//                 <div>
//                   <div style={{
//                     fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
//                     fontSize: 14, color: "#fff", marginBottom: 2,
//                   }}>{f.title}</div>
//                   <div style={{
//                     fontFamily: "'DM Sans', sans-serif",
//                     fontSize: 13, color: "var(--muted)",
//                   }}>{f.desc}</div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Stats */}
//           <div style={{
//             display: "flex", gap: 32, marginTop: 36,
//             paddingTop: 28, borderTop: "1px solid rgba(255,255,255,0.07)",
//           }}>
//             {[["500+", "Questions"], ["50+", "Companies"], ["1K+", "Students"]].map(([v, l]) => (
//               <div key={l}>
//                 <div style={{
//                   fontFamily: "'Bricolage Grotesque', sans-serif",
//                   fontWeight: 800, fontSize: 22, color: "#fff", letterSpacing: "-.03em",
//                 }}>{v}</div>
//                 <div style={{
//                   fontFamily: "'Space Mono', monospace", fontSize: 9,
//                   color: "var(--muted)", letterSpacing: ".14em", textTransform: "uppercase", marginTop: 2,
//                 }}>{l}</div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* ── Right Panel ─────────────────────────────────────────────────── */}
//       <div className="right-panel" style={{
//         width: 480, flexShrink: 0,
//         display: "flex", flexDirection: "column",
//         justifyContent: "center", alignItems: "center",
//         padding: "40px 32px",
//         background: "#0D0D0D",
//       }}>
//         <SignIn
//           routing="path"
//           path="/sign-in"
//           appearance={{
//             variables: {
//               colorBackground: "#141414",
//               colorText: "#ffffff",
//               colorTextSecondary: "#8C8C8C",
//               colorPrimary: "#20c997",
//               colorInputBackground: "#0A0A0A",
//               colorInputText: "#ffffff",
//               borderRadius: "8px",
//               fontFamily: "'DM Sans', sans-serif",
//             },
//             elements: {
//               card: "cl-card",
//               formButtonPrimary: "cl-formButtonPrimary",
//               formFieldInput: "cl-formFieldInput",
//               socialButtonsBlockButton: "cl-socialButtonsBlockButton",
//             },
//           }}
//         />
//       </div>
//     </div>
//   );
// };

// export default SignInPage;


import React from "react";
import { SignIn } from "@clerk/clerk-react";

const SignInPage = () => {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0A0A0A", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..60,700;12..60,800&family=DM+Sans:wght@300;400;500&family=Space+Mono:wght@400;700&display=swap');

        :root {
          --accent: #20c997;
          --accent-dim: rgba(32,201,151,0.09);
          --accent-border: rgba(32,201,151,0.2);
          --border: rgba(255,255,255,0.07);
          --muted: #6A6A6A;
          --secondary: #8C8C8C;
        }

        @keyframes breathe {
          0%,100% { transform:scale(1);    opacity:.06; }
          50%      { transform:scale(1.12); opacity:.10; }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0);    }
        }
        @keyframes blink {
          0%,100% { opacity:1;  }
          50%      { opacity:.2; }
        }

        .dot-grid {
          background-image: radial-gradient(circle, rgba(255,255,255,0.11) 1px, transparent 1px);
          background-size: 28px 28px;
          mask-image: radial-gradient(ellipse 80% 80% at 40% 50%, black 30%, transparent 100%);
          -webkit-mask-image: radial-gradient(ellipse 80% 80% at 40% 50%, black 30%, transparent 100%);
        }

        .glow {
          position: absolute; border-radius: 50%;
          filter: blur(90px); pointer-events: none;
          animation: breathe 7s ease-in-out infinite;
        }

        .left-content {
          animation: fadeUp .7s ease both;
        }

        .tag {
          display: inline-flex; align-items: center; gap: 7px;
          font-family: 'Space Mono', monospace; font-size: 10px;
          color: var(--accent); background: var(--accent-dim);
          border: 1px solid var(--accent-border);
          border-radius: 100px; padding: 5px 14px;
          letter-spacing: .15em; text-transform: uppercase;
          margin-bottom: 28px;
        }

        .feature-item {
          display: flex; align-items: flex-start; gap: 14px;
          padding: 14px 0;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          transition: all .2s;
        }
        .feature-item:last-child { border-bottom: none; }

        /* Override Clerk card styles */
        .cl-card {
          background: #141414 !important;
          border: 1px solid rgba(255,255,255,0.08) !important;
          border-radius: 16px !important;
          box-shadow: 0 32px 64px rgba(0,0,0,.6) !important;
        }
        .cl-headerTitle { color: #fff !important; font-family: 'Bricolage Grotesque', sans-serif !important; }
        .cl-headerSubtitle { color: #8C8C8C !important; }
        .cl-formFieldLabel { color: #8C8C8C !important; font-family: 'DM Sans', sans-serif !important; }
        .cl-formFieldInput {
          background: #0A0A0A !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          color: #fff !important;
          border-radius: 8px !important;
        }
        .cl-formFieldInput:focus { border-color: var(--accent) !important; }
        .cl-formButtonPrimary {
          background: var(--accent) !important;
          color: #000 !important;
          font-weight: 600 !important;
          border-radius: 8px !important;
          transition: all .22s !important;
        }
        .cl-formButtonPrimary:hover { opacity:.88 !important; transform: translateY(-2px) !important; }
        .cl-footerActionLink { color: var(--accent) !important; }
        .cl-dividerLine { background: rgba(255,255,255,0.08) !important; }
        .cl-dividerText { color: #6A6A6A !important; }
        .cl-socialButtonsBlockButton {
          background: #1a1a1a !important;
          border: 1px solid rgba(255,255,255,0.09) !important;
          color: #fff !important;
          border-radius: 8px !important;
        }
        .cl-socialButtonsBlockButton:hover { border-color: var(--accent-border) !important; }
        .cl-internal-b3fm6y { background: #141414 !important; }
        .cl-footer { background: #141414 !important; }
        .cl-footerPages { background: #141414 !important; }

        @media (max-width: 860px) {
          .left-panel { display: none !important; }
          .right-panel { width: 100% !important; }
        }
      `}</style>

      {/* ── Left Panel ──────────────────────────────────────────────────── */}
      <div className="left-panel" style={{
        flex: 1, position: "relative", overflow: "hidden",
        display: "flex", flexDirection: "column",
        justifyContent: "center", padding: "60px clamp(40px,6vw,80px)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}>
        {/* Dot grid */}
        <div className="dot-grid" style={{ position: "absolute", inset: 0, zIndex: 0 }} />

        {/* Glow blobs */}
        <div className="glow" style={{ width: 500, height: 500, background: "#20c997", top: "10%", left: "20%", opacity: .06 }} />
        <div className="glow" style={{ width: 350, height: 350, background: "#007BFF", bottom: "10%", right: "10%", opacity: .05, animationDelay: "3s" }} />

        <div className="left-content" style={{ position: "relative", zIndex: 1, maxWidth: 440 }}>
          {/* Logo */}
          <div style={{ marginBottom: 48, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontWeight: 800, fontSize: 22,
              background: "linear-gradient(to right, #007BFF, #20c997)",
              WebkitBackgroundClip: "text", color: "transparent",
              letterSpacing: "-.03em",
            }}>Codify</span>
            <span style={{
              fontFamily: "'Space Mono', monospace", fontSize: 8,
              color: "var(--accent)", background: "var(--accent-dim)",
              border: "1px solid var(--accent-border)",
              borderRadius: 4, padding: "2px 7px",
              letterSpacing: ".12em", textTransform: "uppercase",
            }}>BETA</span>
          </div>

          {/* Badge */}
          <div className="tag">
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", animation: "blink 2s ease infinite" }} />
            Placement Season 2026
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 800, fontSize: "clamp(32px,4vw,48px)",
            letterSpacing: "-.04em", lineHeight: 1.08,
            color: "#fff", marginBottom: 16,
          }}>
            Crack Every OA.<br />
            <span style={{
              background: "linear-gradient(90deg,#007BFF,#20c997)",
              WebkitBackgroundClip: "text", color: "transparent",
            }}>Land Every Offer.</span>
          </h1>

          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 15, fontWeight: 300,
            color: "#8C8C8C", lineHeight: 1.82,
            marginBottom: 40,
          }}>
            OA archives, company intel, AI-powered coding practice — built for NSUT & DTU students.
          </p>

          {/* Feature list */}
          <div>
            {[
              { icon: "📁", title: "PataKaro", desc: "Real OA questions & company intel" },
              { icon: "⚡", title: "IntelliCode", desc: "AI-powered coding practice" },
              { icon: "🔗", title: "CodeCast", desc: "Real-time collaborative sessions" },
            ].map((f) => (
              <div className="feature-item" key={f.title}>
                <span style={{ fontSize: 20, marginTop: 1 }}>{f.icon}</span>
                <div>
                  <div style={{
                    fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
                    fontSize: 14, color: "#fff", marginBottom: 2,
                  }}>{f.title}</div>
                  <div style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 13, color: "var(--muted)",
                  }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div style={{
            display: "flex", gap: 32, marginTop: 36,
            paddingTop: 28, borderTop: "1px solid rgba(255,255,255,0.07)",
          }}>
            {[["500+", "Questions"], ["50+", "Companies"], ["1K+", "Students"]].map(([v, l]) => (
              <div key={l}>
                <div style={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontWeight: 800, fontSize: 22, color: "#fff", letterSpacing: "-.03em",
                }}>{v}</div>
                <div style={{
                  fontFamily: "'Space Mono', monospace", fontSize: 9,
                  color: "var(--muted)", letterSpacing: ".14em", textTransform: "uppercase", marginTop: 2,
                }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel ─────────────────────────────────────────────────── */}
      <div className="right-panel" style={{
        flex: 1, flexShrink: 0,
        display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "center",
        padding: "40px 32px",
        background: "#0D0D0D",
        minWidth: 0,
      }}>
        <SignIn
          routing="path"
          path="/sign-in"
          appearance={{
            variables: {
              colorBackground: "#141414",
              colorText: "#ffffff",
              colorTextSecondary: "#8C8C8C",
              colorPrimary: "#20c997",
              colorInputBackground: "#0A0A0A",
              colorInputText: "#ffffff",
              borderRadius: "8px",
              fontFamily: "'DM Sans', sans-serif",
            },
            elements: {
              card: "cl-card",
              formButtonPrimary: "cl-formButtonPrimary",
              formFieldInput: "cl-formFieldInput",
              socialButtonsBlockButton: "cl-socialButtonsBlockButton",
            },
          }}
        />
      </div>
    </div>
  );
};

export default SignInPage;
