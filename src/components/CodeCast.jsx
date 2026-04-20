// /**
//  * CodeCast.jsx — Live 1v1 coding battle room
//  *
//  * Flow:
//  *   Lobby → Create room (pick question) OR paste roomId to join
//  *   Waiting room → opponent joins → Battle starts (Monaco + timer + live chat)
//  *   Both submit → Winner announced
//  */

// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import MonacoEditor from '@monaco-editor/react';
// import { io } from 'socket.io-client';
// import { useAuth, useUser } from '@clerk/clerk-react';
// import { CircularProgress } from '@mui/material';
// import Header from './Header';
// import Footer from './Footer';
// import questions from '../data/question.json';

// const API = process.env.REACT_APP_API_URL || 'http://localhost:8000';
// const WS = process.env.REACT_APP_WS_URL || 'http://localhost:8000';

// const BOILERPLATE = {
//   cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}',
//   python: 'def solution():\n    pass\n\nif __name__ == "__main__":\n    solution()',
//   java: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}',
// };

// const LANG_LABELS = { cpp: 'C++', python: 'Python', java: 'Java' };

// function formatTime(ms) {
//   const s = Math.floor(ms / 1000);
//   const m = Math.floor(s / 60);
//   return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
// }

// export default function CodeCast() {
//   const { getToken } = useAuth();
//   const { user } = useUser();
//   const displayName = user?.firstName || user?.fullName?.split(' ')[0] || 'Player';

//   // View state
//   const [view, setView] = useState('lobby');
//   const [roomId, setRoomId] = useState('');
//   const [joinInput, setJoinInput] = useState('');
//   const [role, setRole] = useState(null);
//   const [roomData, setRoomData] = useState(null);
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   // Battle state
//   const [selectedQ, setSelectedQ] = useState(questions[0]);
//   const [language, setLanguage] = useState('cpp');
//   const [myCode, setMyCode] = useState(BOILERPLATE.cpp);
//   const [opponentCode, setOpponentCode] = useState('');
//   const [opponentLang, setOpponentLang] = useState('cpp');
//   const [showOpponent, setShowOpponent] = useState(false);

//   // Timer
//   const [elapsed, setElapsed] = useState(0);
//   const timerRef = useRef(null);
//   const startTimeRef = useRef(null);

//   // Test results
//   const [running, setRunning] = useState(false);
//   const [testResults, setTestResults] = useState([]);
//   const [submitted, setSubmitted] = useState(false);
//   const [myResult, setMyResult] = useState(null);

//   // Battle result
//   const [battleResult, setBattleResult] = useState(null);

//   // Chat
//   const [chatMessages, setChatMessages] = useState(() => {
//     try {
//       const saved = sessionStorage.getItem('cc_chat');
//       return saved ? JSON.parse(saved) : [];
//     } catch { return []; }
//   });
//   const [chatInput, setChatInput] = useState('');
//   const chatEndRef = useRef(null);

//   // Opponent status
//   const [opponentJoined, setOpponentJoined] = useState(false);
//   const [opponentSubmitted, setOpponentSubmitted] = useState(false);
//   const [opponentLeft, setOpponentLeft] = useState(false);
//   const [opponentReconnecting, setOpponentReconnecting] = useState(false);
//   const reconnectTimerRef = useRef(null);

//   // Socket
//   const socketRef = useRef(null);

//   const connectSocket = useCallback(() => {
//     return new Promise((resolve, reject) => {
//       if (socketRef.current?.connected) return resolve(socketRef.current);
//       socketRef.current = io(`${WS}/codecast`, {
//         transports: ['polling', 'websocket'],
//         reconnectionAttempts: 5,
//       });
//       const s = socketRef.current;
//       s.once('connect', () => resolve(s));
//       s.once('connect_error', (err) => reject(err));

//       s.on('room-joined', ({ role: r, room }) => {
//         setRole(r);
//         setRoomData(room);
//         if (room.status === 'active') {
//           startBattle(room);
//         } else {
//           setView('waiting');
//         }
//       });

//       s.on('opponent-joined', ({ displayName: n }) => {
//         if (reconnectTimerRef.current) {
//           clearTimeout(reconnectTimerRef.current);
//           reconnectTimerRef.current = null;
//           setOpponentReconnecting(false);
//           setOpponentLeft(false);
//           // Remove the disconnect system messages from chat
//           setChatMessages(prev => prev.filter(m =>
//             !(m.displayName === '🤖 System' && m.message.includes('disconnected'))
//           ));
//           addChat('🤖 System', 'Opponent reconnected');
//         } else {
//           setOpponentJoined(true);
//           addChat('🤖 System', n ? `${n} joined the room` : 'Opponent joined');
//         }
//       });

//       s.on('battle-start', ({ room }) => {
//         startBattle(room);
//       });

//       s.on('opponent-code', ({ code, language: lang }) => {
//         setOpponentCode(code);
//         setOpponentLang(lang);
//       });

//       s.on('player-submitted', ({ role: r, result }) => {
//         if (r !== role) {
//           setOpponentSubmitted(true);
//           addChat('🤖 System', `Opponent submitted — ${result.passed}/${result.total} passed`);
//         }
//       });

//       s.on('battle-end', (result) => {
//         setBattleResult(result);
//         stopTimer();
//         setView('result');
//         sessionStorage.removeItem('cc_roomId');
//         sessionStorage.removeItem('cc_userId');
//         sessionStorage.removeItem('cc_displayName');
//         sessionStorage.removeItem('cc_startedAt');
//         sessionStorage.removeItem('cc_chat');
//       });

//       s.on('chat', ({ displayName: n, message, ts }) => {
//         setChatMessages(prev => [...prev, { displayName: n, message, ts }]);
//       });

//       s.on('opponent-left', () => {
//         setOpponentReconnecting(true);
//         addChat('🤖 System', 'Opponent disconnected — waiting for reconnect...');
//         reconnectTimerRef.current = setTimeout(() => {
//           setOpponentLeft(true);
//           setOpponentReconnecting(false);
//           addChat('🤖 System', 'Opponent left the battle');
//         }, 10000);
//       });



//       s.on('error', ({ message: m }) => setError(m));
//     }); // end Promise
//   }, [WS, role]);

//   function addChat(name, msg) {
//     setChatMessages(prev => [...prev, { displayName: name, message: msg, ts: Date.now() }]);
//   }

//   function startTimer(startedAt = null) {
//     const t = startedAt || Date.now();
//     startTimeRef.current = t;
//     sessionStorage.setItem('cc_startedAt', String(t));
//     timerRef.current = setInterval(() => {
//       setElapsed(Date.now() - startTimeRef.current);
//     }, 1000);
//   }

//   function stopTimer() {
//     if (timerRef.current) clearInterval(timerRef.current);
//   }

//   function startBattle(room) {
//     const q = questions.find(q => String(q.id) === String(room.questionId)) || questions[0];
//     setSelectedQ(q);
//     setLanguage(room.language || 'cpp');
//     setMyCode(BOILERPLATE[room.language || 'cpp']);
//     setOpponentJoined(true);
//     // Use saved start time if refreshed mid-battle
//     const savedStart = sessionStorage.getItem('cc_startedAt');
//     const startedAt = room.startedAt || (savedStart ? parseInt(savedStart) : null);
//     startTimer(startedAt);
//     setView('battle');
//   }

//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//     if (chatMessages.length > 0) {
//       try {
//         sessionStorage.setItem('cc_chat', JSON.stringify(chatMessages.slice(-100)));
//       } catch {}
//     }
//   }, [chatMessages]);

//   useEffect(() => () => {
//     socketRef.current?.disconnect();
//     stopTimer();
//   }, []);

//   // Disable swipe navigation during battle
//   useEffect(() => {
//     if (view === 'battle') {
//       document.body.style.overscrollBehaviorX = 'none';
//       document.body.style.touchAction = 'pan-y';
//     } else {
//       document.body.style.overscrollBehaviorX = '';
//       document.body.style.touchAction = '';
//     }
//     return () => {
//       document.body.style.overscrollBehaviorX = '';
//       document.body.style.touchAction = '';
//     };
//   }, [view]);

//   // Rejoin room on refresh if session exists
//   useEffect(() => {
//     const savedRoomId = sessionStorage.getItem('cc_roomId');
//     const savedUserId = sessionStorage.getItem('cc_userId');
//     const savedName   = sessionStorage.getItem('cc_displayName');
//     if (savedRoomId && savedUserId && user?.id === savedUserId) {
//       setRoomId(savedRoomId);
//       connectSocket().then((s) => {
//         s.emit('join-room', { roomId: savedRoomId, userId: savedUserId, displayName: savedName });
//       }).catch(() => {
//         sessionStorage.removeItem('cc_roomId');
//         sessionStorage.removeItem('cc_userId');
//         sessionStorage.removeItem('cc_displayName');
//         sessionStorage.removeItem('cc_startedAt');
//         sessionStorage.removeItem('cc_chat');
//       });
//     }
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [user?.id]);

//   async function handleCreate() {
//     setError('');
//     setLoading(true);
//     try {
//       const res = await fetch(`${API}/api/codecast/rooms`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ questionId: selectedQ.id, language, userId: user.id }),
//       });
//       if (!res.ok) {
//         const txt = await res.text();
//         let msg = `Server error (${res.status})`;
//         try { msg = JSON.parse(txt).error || msg; } catch {}
//         throw new Error(msg);
//       }
//       const { roomId: rid } = await res.json();
//       setRoomId(rid);
//       sessionStorage.setItem('cc_roomId', rid);
//       sessionStorage.setItem('cc_userId', user.id);
//       sessionStorage.setItem('cc_displayName', displayName);
//       await connectSocket();
//       socketRef.current.emit('join-room', { roomId: rid, userId: user.id, displayName });
//     } catch (e) {
//       setError(e.message);
//       console.error('Create room error:', e);
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function handleJoin() {
//     const rid = joinInput.trim().toUpperCase();
//     if (!rid) {
//       setError('Enter a room code');
//       return;
//     }
//     setError('');
//     setLoading(true);
//     try {
//       sessionStorage.setItem('cc_roomId', rid);
//       sessionStorage.setItem('cc_userId', user.id);
//       sessionStorage.setItem('cc_displayName', displayName);
//       await connectSocket();
//       socketRef.current.emit('join-room', { roomId: rid, userId: user.id, displayName });
//       setRoomId(rid);
//     } catch(e) {
//       setError('Could not connect to server. Try again.');
//     } finally {
//       setLoading(false);
//     }
//   }

//   function handleCodeChange(val) {
//     setMyCode(val);
//     socketRef.current?.emit('code-change', { roomId, code: val, language });
//   }

//   function handleLangChange(lang) {
//     setLanguage(lang);
//     setMyCode(BOILERPLATE[lang]);
//     socketRef.current?.emit('code-change', { roomId, code: BOILERPLATE[lang], language: lang });
//   }

//   async function handleRun() {
//     if (!selectedQ || !selectedQ.testCases) return;
//     setRunning(true);
//     setTestResults([]);
//     const results = [];

//     for (const tc of selectedQ.testCases) {
//       try {
//         const res = await fetch(`${API}/api/execute`, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ code: myCode, language, input: tc.input }),
//         });
//         const data = await res.json();
//         const actual = (data.output || '').trim();
//         results.push({ input: tc.input, expected: tc.output, actual, passed: actual === tc.output.trim() });
//       } catch (e) {
//         console.error('Test error:', e);
//         results.push({ input: tc.input, expected: tc.output, actual: 'Error', passed: false });
//       }
//     }

//     setTestResults(results);
//     setRunning(false);
//     return results;
//   }

//   async function handleSubmit() {
//     if (submitted) return;
//     const results = await handleRun();
//     if (!results) return;
//     const passed = results.filter(r => r.passed).length;
//     const total = results.length;
//     const verdict = passed === total ? 'Accepted' : 'Wrong Answer';
//     const result = { passed, total, verdict, timeMs: elapsed };
//     setMyResult(result);
//     setSubmitted(true);
//     socketRef.current?.emit('submit', { roomId, result });
//   }

//   function sendChat(e) {
//     e.preventDefault();
//     if (!chatInput.trim()) return;
//     socketRef.current?.emit('chat', { roomId, message: chatInput, displayName });
//     setChatInput('');
//   }

//   const S = {
//     page: { background: '#080B0F', minHeight: '100vh', color: '#fff', fontFamily: "'DM Sans', sans-serif" },
//     card: { background: '#111418', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 32 },
//     label: { fontSize: 11, color: '#6A6A6A', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8 },
//     input: { background: '#1A1D22', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff', padding: '10px 16px', fontSize: 14, width: '100%', outline: 'none', fontFamily: 'inherit' },
//     btnPrimary: { background: 'linear-gradient(135deg,#20c997,#0891b2)', border: 'none', borderRadius: 10, color: '#000', fontWeight: 700, padding: '12px 28px', cursor: 'pointer', fontSize: 14, transition: 'opacity .2s' },
//     btnGhost: { background: 'transparent', border: '1px solid rgba(32,201,151,0.3)', borderRadius: 10, color: '#20c997', fontWeight: 600, padding: '11px 24px', cursor: 'pointer', fontSize: 14, transition: 'all .2s' },
//     btnRed: { background: 'linear-gradient(135deg,#ef4444,#dc2626)', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, padding: '12px 28px', cursor: 'pointer', fontSize: 14 },
//     tag: (color) => ({ background: `${color}18`, border: `1px solid ${color}40`, color, borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 700 }),
//   };

//   // VIEW: LOBBY
//   if (view === 'lobby') return (
//     <>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700;800&family=DM+Sans:wght@300;400;500&family=Space+Mono&display=swap');
//         select option { background: #1A1D22; }
//       `}</style>
//       <Header />
//       <div style={{ ...S.page, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 24px' }}>
//         <div style={{ textAlign: 'center', marginBottom: 56, maxWidth: 600 }}>
//           <div style={{ ...S.tag('#f59e0b'), display: 'inline-block', marginBottom: 16 }}>⚔️ LIVE 1v1 BATTLE</div>
//           <h1 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 'clamp(36px,6vw,56px)', fontWeight: 800, margin: '0 0 16px', lineHeight: 1.1 }}>
//             Code<span style={{ background: 'linear-gradient(135deg,#20c997,#0891b2)', WebkitBackgroundClip: 'text', color: 'transparent' }}>Cast</span>
//           </h1>
//           <p style={{ color: '#6A6A6A', fontSize: 16, lineHeight: 1.7 }}>
//             Challenge a friend to a real-time coding battle. Pick a question, share the room code, and may the best coder win.
//           </p>
//         </div>

//         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 24, width: '100%', maxWidth: 780 }}>
//           <div style={S.card}>
//             <h2 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Create a Room</h2>
//             <div style={{ marginBottom: 20 }}>
//               <div style={S.label}>Question</div>
//               <select
//                 style={{ ...S.input, cursor: 'pointer' }}
//                 value={selectedQ.id}
//                 onChange={e => setSelectedQ(questions.find(q => q.id === +e.target.value))}
//               >
//                 {questions.map(q => (
//                   <option key={q.id} value={q.id}>{q.name} ({q.difficulty})</option>
//                 ))}
//               </select>
//             </div>

//             <div style={{ marginBottom: 28 }}>
//               <div style={S.label}>Language</div>
//               <div style={{ display: 'flex', gap: 8 }}>
//                 {Object.entries(LANG_LABELS).map(([k, v]) => (
//                   <button key={k} onClick={() => setLanguage(k)}
//                     style={{ ...language === k ? S.btnPrimary : S.btnGhost, flex: 1, padding: '10px 8px', fontSize: 13 }}>
//                     {v}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {error && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 12 }}>{error}</p>}
//             <button style={{ ...S.btnPrimary, width: '100%' }} onClick={handleCreate} disabled={loading}>
//               {loading ? <CircularProgress size={16} style={{ color: '#000' }} /> : '⚔️ Create Battle Room'}
//             </button>
//           </div>

//           <div style={S.card}>
//             <h2 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Join a Room</h2>
//             <div style={{ marginBottom: 28 }}>
//               <div style={S.label}>Room Code</div>
//               <input
//                 style={{ ...S.input, letterSpacing: '.15em', textTransform: 'uppercase', fontSize: 18, textAlign: 'center' }}
//                 placeholder="A3F9B2C1"
//                 value={joinInput}
//                 onChange={e => setJoinInput(e.target.value.toUpperCase())}
//                 onKeyDown={e => e.key === 'Enter' && handleJoin()}
//                 maxLength={8}
//               />
//             </div>
//             {error && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 12 }}>{error}</p>}
//             <button style={{ ...S.btnGhost, width: '100%' }} onClick={handleJoin} disabled={loading}>
//               {loading ? <CircularProgress size={16} style={{ color: '#20c997' }} /> : '🔗 Join Battle Room'}
//             </button>
//           </div>
//         </div>

//         <div style={{ display: 'flex', gap: 16, marginTop: 48, flexWrap: 'wrap', justifyContent: 'center' }}>
//           {['⚡ Real-time code sync', '💬 Live chat', '⏱ Battle timer', '🏆 Instant winner verdict'].map(f => (
//             <span key={f} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '8px 18px', fontSize: 13, color: '#8C8C8C' }}>{f}</span>
//           ))}
//         </div>
//       </div>
//       <Footer />
//     </>
//   );

//   // VIEW: WAITING ROOM
//   if (view === 'waiting') return (
//     <>
//       <Header />
//       <div style={{ ...S.page, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: 32, padding: 24 }}>
//         <div style={{ textAlign: 'center' }}>
//           <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
//           <h2 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Waiting for opponent…</h2>
//           <p style={{ color: '#6A6A6A' }}>Share this code with your opponent</p>
//         </div>

//         <div style={{ background: '#111418', border: '2px solid rgba(32,201,151,0.3)', borderRadius: 16, padding: '24px 48px', textAlign: 'center' }}>
//           <div style={S.label}>Room Code</div>
//           <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 42, fontWeight: 700, color: '#20c997', letterSpacing: '.2em' }}>{roomId}</div>
//           <button
//             style={{ ...S.btnGhost, marginTop: 16, fontSize: 12 }}
//             onClick={() => { navigator.clipboard.writeText(roomId); }}>
//             📋 Copy Code
//           </button>
//         </div>

//         <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#6A6A6A' }}>
//           <CircularProgress size={16} style={{ color: '#20c997' }} />
//           <span style={{ fontSize: 14 }}>Waiting for player 2…</span>
//         </div>

//         <button style={{ ...S.btnGhost }} onClick={() => { socketRef.current?.disconnect(); setView('lobby'); }}>
//           ← Back to Lobby
//         </button>
//       </div>
//       <Footer />
//     </>
//   );

//   // VIEW: BATTLE
//   if (view === 'battle') return (
//     <>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700;800&family=DM+Sans:wght@300;400;500&family=Space+Mono&display=swap');
//         .cc-scroll::-webkit-scrollbar { width: 4px; }
//         .cc-scroll::-webkit-scrollbar-track { background: transparent; }
//         .cc-scroll::-webkit-scrollbar-thumb { background: #2a2d34; border-radius: 4px; }
//         select option { background: #1A1D22; }
//       `}</style>
//       <div style={S.page}>
//         <div style={{ background: '#0D0F14', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
//             <span style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: 16, background: 'linear-gradient(135deg,#20c997,#0891b2)', WebkitBackgroundClip: 'text', color: 'transparent' }}>CodeCast</span>
//             <span style={S.tag('#f59e0b')}>⚔️ LIVE</span>
//             <span style={{ ...S.tag('#6A6A6A'), fontFamily: "'Space Mono',monospace", letterSpacing: '.1em' }}>{roomId}</span>
//           </div>

//           <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 20, fontWeight: 700, color: elapsed > 30 * 60 * 1000 ? '#ef4444' : '#20c997' }}>
//             ⏱ {formatTime(elapsed)}
//           </div>

//           <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
//             <span style={S.tag('#20c997')}>You ({role})</span>
//             {opponentLeft
//               ? <span style={S.tag('#ef4444')}>Opponent left</span>
//               : opponentReconnecting
//                 ? <span style={S.tag('#f59e0b')}>Reconnecting…</span>
//                 : opponentSubmitted
//                   ? <span style={S.tag('#f59e0b')}>Opponent submitted</span>
//                   : opponentJoined
//                     ? <span style={S.tag('#6A6A6A')}>Opponent coding…</span>
//                     : <span style={S.tag('#6A6A6A')}>Waiting…</span>
//             }
//           </div>
//         </div>

//         <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr 260px', height: 'calc(100vh - 56px)' }}>
//           <div style={{ borderRight: '1px solid rgba(255,255,255,0.06)', overflowY: 'auto', padding: '20px 20px' }} className="cc-scroll">
//             <div style={{ marginBottom: 12 }}>
//               <span style={S.tag(selectedQ.difficulty === 'Easy' ? '#20c997' : selectedQ.difficulty === 'Medium' ? '#f59e0b' : '#ef4444')}>{selectedQ.difficulty}</span>
//             </div>
//             <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 12, lineHeight: 1.4 }}>{selectedQ.name}</h3>
//             <p style={{ fontSize: 13, color: '#8C8C8C', lineHeight: 1.7, marginBottom: 16 }}>{selectedQ.question_description}</p>

//             {selectedQ.examples?.map((ex, i) => (
//               <div key={i} style={{ background: '#1A1D22', borderRadius: 8, padding: 12, marginBottom: 8 }}>
//                 <div style={{ fontSize: 11, color: '#6A6A6A', marginBottom: 4 }}>Example {i + 1}</div>
//                 <div style={{ fontSize: 12, color: '#ccc', fontFamily: "'Space Mono',monospace" }}>
//                   <div><span style={{ color: '#6A6A6A' }}>In:</span> {ex.input}</div>
//                   <div><span style={{ color: '#6A6A6A' }}>Out:</span> {ex.output}</div>
//                 </div>
//               </div>
//             ))}

//             <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
//               <button
//                 onClick={() => setShowOpponent(p => !p)}
//                 style={{ ...S.btnGhost, width: '100%', fontSize: 12, padding: '8px 12px' }}>
//                 {showOpponent ? '🙈 Hide Opponent Code' : '👁 Peek Opponent Code'}
//               </button>
//               {showOpponent && opponentCode && (
//                 <div style={{ marginTop: 12, background: '#0f1117', borderRadius: 8, overflow: 'hidden' }}>
//                   <div style={{ padding: '6px 12px', background: '#1a1d22', fontSize: 11, color: '#6A6A6A' }}>Opponent ({LANG_LABELS[opponentLang]})</div>
//                   <pre style={{ padding: 12, fontSize: 11, color: '#8C8C8C', overflowX: 'auto', margin: 0 }}>{opponentCode}</pre>
//                 </div>
//               )}
//             </div>
//           </div>

//           <div style={{ display: 'flex', flexDirection: 'column' }}>
//             <div style={{ padding: '10px 16px', background: '#0D0F14', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 8 }}>
//               {Object.entries(LANG_LABELS).map(([k, v]) => (
//                 <button key={k} onClick={() => handleLangChange(k)}
//                   style={{ ...language === k ? S.btnPrimary : S.btnGhost, padding: '6px 16px', fontSize: 12 }}>
//                   {v}
//                 </button>
//               ))}
//               <div style={{ flex: 1 }} />
//               <span style={{ fontSize: 12, color: '#6A6A6A' }}>Your editor</span>
//             </div>

//             <div style={{ flex: 1, minHeight: 0 }}>
//               <MonacoEditor
//                 height="100%"
//                 language={language === 'cpp' ? 'cpp' : language}
//                 theme="vs-dark"
//                 value={myCode}
//                 onChange={handleCodeChange}
//                 options={{ fontSize: 13, minimap: { enabled: false }, scrollBeyondLastLine: false, fontFamily: "'Space Mono',monospace" }}
//               />
//             </div>

//             {testResults.length > 0 && (
//               <div style={{ background: '#0D0F14', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '12px 16px', maxHeight: 180, overflowY: 'auto' }} className="cc-scroll">
//                 <div style={{ fontSize: 12, color: '#6A6A6A', marginBottom: 8 }}>
//                   Test Results — {testResults.filter(r => r.passed).length}/{testResults.length} passed
//                 </div>
//                 <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
//                   {testResults.map((r, i) => (
//                     <div key={i} style={{ background: r.passed ? '#052e1c' : '#2d0a0a', border: `1px solid ${r.passed ? '#20c99740' : '#ef444440'}`, borderRadius: 8, padding: '8px 12px', fontSize: 12, minWidth: 100 }}>
//                       <div style={{ color: r.passed ? '#20c997' : '#ef4444', fontWeight: 700, marginBottom: 4 }}>
//                         {r.passed ? '✓' : '✗'} TC {i + 1}
//                       </div>
//                       <div style={{ color: '#6A6A6A', fontSize: 11, fontFamily: "'Space Mono',monospace" }}>
//                         Got: {r.actual?.slice(0, 20)}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             <div style={{ padding: '12px 16px', background: '#0D0F14', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 10 }}>
//               <button onClick={handleRun} disabled={running} style={{ ...S.btnGhost, flex: 1 }}>
//                 {running ? <><CircularProgress size={12} style={{ color: '#20c997' }} /> Running…</> : '▶ Run Tests'}
//               </button>
//               <button onClick={handleSubmit} disabled={submitted || running} style={{ ...S.btnPrimary, flex: 2, opacity: submitted ? 0.5 : 1 }}>
//                 {submitted ? '✓ Submitted' : '🚀 Submit'}
//               </button>
//             </div>
//           </div>

//           <div style={{ borderLeft: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column' }}>
//             <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 13, fontWeight: 600 }}>
//               💬 Battle Chat
//             </div>

//             <div className="cc-scroll" style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
//               {chatMessages.length === 0 && (
//                 <div style={{ textAlign: 'center', color: '#3a3d44', fontSize: 13, marginTop: 24 }}>No messages yet</div>
//               )}
//               {chatMessages.map((m, i) => (
//                 <div key={i}>
//                   <div style={{ fontSize: 11, color: '#6A6A6A', marginBottom: 2 }}>{m.displayName}</div>
//                   <div style={{ background: '#1A1D22', borderRadius: 8, padding: '8px 10px', fontSize: 13, color: '#ccc', lineHeight: 1.5 }}>
//                     {m.message}
//                   </div>
//                 </div>
//               ))}
//               <div ref={chatEndRef} />
//             </div>

//             <form onSubmit={sendChat} style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 8 }}>
//               <input
//                 style={{ ...S.input, flex: 1, padding: '8px 12px', fontSize: 12 }}
//                 placeholder="Say something…"
//                 value={chatInput}
//                 onChange={e => setChatInput(e.target.value)}
//                 maxLength={300}
//               />
//               <button type="submit" style={{ ...S.btnPrimary, padding: '8px 14px', fontSize: 13 }}>→</button>
//             </form>
//           </div>
//         </div>
//       </div>
//     </>
//   );

//   // VIEW: RESULT
//   if (view === 'result') {
//     const isWinner =
//       (role === 'host' && battleResult?.winner === 'host') ||
//       (role === 'guest' && battleResult?.winner === 'guest');
//     const isDraw = battleResult?.winner === 'draw';
//     const myRes = role === 'host' ? battleResult?.hostResult : battleResult?.guestResult;
//     const oppRes = role === 'host' ? battleResult?.guestResult : battleResult?.hostResult;

//     return (
//       <>
//         <Header />
//         <div style={{ ...S.page, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: 24, gap: 32 }}>
//           <div style={{ fontSize: 72 }}>{isDraw ? '🤝' : isWinner ? '🏆' : '😅'}</div>
//           <h1 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 40, fontWeight: 800, textAlign: 'center' }}>
//             {isDraw ? "It's a Draw!" : isWinner ? 'You Won! 🎉' : 'Better Luck Next Time!'}
//           </h1>

//           <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
//             {[
//               { label: 'You', result: myRes, highlight: isWinner },
//               { label: 'Opponent', result: oppRes, highlight: !isWinner && !isDraw },
//             ].map(({ label, result, highlight }) => (
//               <div key={label} style={{ ...S.card, minWidth: 200, textAlign: 'center', border: highlight ? '1px solid rgba(32,201,151,0.4)' : undefined }}>
//                 <div style={S.label}>{label}</div>
//                 <div style={{ fontSize: 36, fontWeight: 800, color: highlight ? '#20c997' : '#fff', fontFamily: "'Space Mono',monospace" }}>
//                   {result?.passed ?? '—'}/{result?.total ?? '—'}
//                 </div>
//                 <div style={{ fontSize: 12, color: '#6A6A6A', marginTop: 4 }}>{result?.verdict || 'Pending'}</div>
//                 <div style={{ fontSize: 12, color: '#6A6A6A' }}>{result?.timeMs ? formatTime(result.timeMs) : ''}</div>
//               </div>
//             ))}
//           </div>

//           <div style={{ display: 'flex', gap: 16 }}>
//             <button style={S.btnPrimary} onClick={() => { socketRef.current?.disconnect(); setView('lobby'); setBattleResult(null); setSubmitted(false); setTestResults([]); }}>
//               ⚔️ Battle Again
//             </button>
//             <button style={S.btnGhost} onClick={() => window.location.href = '/intellicode'}>
//               Practice Solo →
//             </button>
//           </div>
//         </div>
//         <Footer />
//       </>
//     );
//   }

//   return null;
// }
// /**
//  * CodeCast.jsx — Live 1v1 coding battle room
//  *
//  * Flow:
//  *   Lobby → Create room (pick question) OR paste roomId to join
//  *   Waiting room → opponent joins → Battle starts (Monaco + timer + live chat)
//  *   Both submit → Winner announced
//  */


import React, { useState, useEffect, useRef, useCallback } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { io } from 'socket.io-client';
import { useAuth, useUser } from '@clerk/clerk-react';
import { CircularProgress } from '@mui/material';
import Header from './Header';
import questions from '../data/question.json';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const WS  = process.env.REACT_APP_WS_URL  || 'http://localhost:8000';

const BOILERPLATE = {
  cpp:    '#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Your code here\n    return 0;\n}',
  python: 'import sys\ninput = sys.stdin.readline\n\ndef solve():\n    pass\n\nsolve()',
  java:   'import java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        // Your code here\n    }\n}',
};

const LANG_LABELS = { cpp: 'C++', python: 'Python', java: 'Java' };

function formatTime(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
}

const C = {
  bg:      '#080B0F',
  surface: '#0D1117',
  card:    '#111418',
  border:  'rgba(255,255,255,0.07)',
  text:    '#FAFAFA',
  muted:   '#6A6A6A',
  accent:  '#20c997',
};

export default function CodeCast() {
  const { getToken } = useAuth();
  const { user }     = useUser();
  const displayName  = user?.firstName || user?.fullName?.split(' ')[0] || 'Player';

  const [view,       setView]       = useState('lobby');
  const [roomId,     setRoomId]     = useState('');
  const [joinInput,  setJoinInput]  = useState('');
  const [role,       setRole]       = useState(null);
  const [roomData,   setRoomData]   = useState(null);
  const [error,      setError]      = useState('');
  const [loading,    setLoading]    = useState(false);
  const [selectedQ,  setSelectedQ]  = useState(questions[0]);
  const [language,   setLanguage]   = useState('cpp');
  const [myCode,     setMyCode]     = useState(BOILERPLATE.cpp);
  const [opponentCode, setOpponentCode] = useState('');
  const [opponentLang, setOpponentLang] = useState('cpp');
  const [showOpponent, setShowOpponent] = useState(false);
  const [elapsed,    setElapsed]    = useState(0);
  const timerRef     = useRef(null);
  const startTimeRef = useRef(null);
  const [running,    setRunning]    = useState(false);
  const [testResults,setTestResults]= useState([]);
  const [submitted,  setSubmitted]  = useState(false);
  const [myResult,   setMyResult]   = useState(null);
  const [battleResult,setBattleResult]=useState(null);
  const [chatMessages,setChatMessages]=useState(()=>{try{const s=sessionStorage.getItem('cc_chat');return s?JSON.parse(s):[]}catch{return[]}});
  const [chatInput,  setChatInput]  = useState('');
  const chatEndRef   = useRef(null);
  const [opponentJoined,setOpponentJoined]=useState(false);
  const [opponentSubmitted,setOpponentSubmitted]=useState(false);
  const [opponentLeft,setOpponentLeft]=useState(false);
  const [opponentReconnecting,setOpponentReconnecting]=useState(false);
  const reconnectTimerRef = useRef(null);
  const socketRef    = useRef(null);

  // Persist chat
  useEffect(()=>{
    chatEndRef.current?.scrollIntoView({behavior:'smooth'});
    if(chatMessages.length>0){try{sessionStorage.setItem('cc_chat',JSON.stringify(chatMessages.slice(-100)));}catch{}}
  },[chatMessages]);

  // Disable swipe in battle
  useEffect(()=>{
    if(view==='battle'){document.body.style.overscrollBehaviorX='none';document.body.style.touchAction='pan-y';}
    else{document.body.style.overscrollBehaviorX='';document.body.style.touchAction='';}
    return()=>{document.body.style.overscrollBehaviorX='';document.body.style.touchAction='';};
  },[view]);

  // Cleanup
  useEffect(()=>()=>{socketRef.current?.disconnect();stopTimer();},[]);

  // Rejoin on refresh
  useEffect(()=>{
    const sid=sessionStorage.getItem('cc_roomId');
    const suid=sessionStorage.getItem('cc_userId');
    const sname=sessionStorage.getItem('cc_displayName');
    if(sid&&suid&&user?.id===suid){
      setRoomId(sid);
      connectSocket().then(s=>s.emit('join-room',{roomId:sid,userId:suid,displayName:sname})).catch(()=>{
        ['cc_roomId','cc_userId','cc_displayName','cc_startedAt','cc_chat'].forEach(k=>sessionStorage.removeItem(k));
      });
    }
  },[user?.id]);

  const connectSocket = useCallback(()=>{
    return new Promise((resolve,reject)=>{
      if(socketRef.current?.connected)return resolve(socketRef.current);
      socketRef.current=io(`${WS}/codecast`,{transports:['polling','websocket'],reconnectionAttempts:5});
      const s=socketRef.current;
      s.once('connect',()=>resolve(s));
      s.once('connect_error',err=>reject(err));

      s.on('room-joined',({role:r,room})=>{
        setRole(r);setRoomData(room);
        if(room.status==='active')startBattle(room);
        else setView('waiting');
      });

      s.on('opponent-joined',({displayName:n})=>{
        if(reconnectTimerRef.current){
          clearTimeout(reconnectTimerRef.current);reconnectTimerRef.current=null;
          setOpponentReconnecting(false);setOpponentLeft(false);
          setChatMessages(prev=>prev.filter(m=>!(m.displayName==='🤖 System'&&m.message.includes('disconnected'))));
          addChat('🤖 System','Opponent reconnected');
        }else{setOpponentJoined(true);addChat('🤖 System',n?`${n} joined the room`:'Opponent joined');}
      });

      s.on('battle-start',({room})=>startBattle(room));

      s.on('opponent-code',({code,language:lang})=>{setOpponentCode(code);setOpponentLang(lang);});

      s.on('player-submitted',({role:r,result})=>{
        if(r!==role){setOpponentSubmitted(true);addChat('🤖 System',`Opponent submitted — ${result.passed}/${result.total} passed`);}
      });

      s.on('battle-end',result=>{
        setBattleResult(result);stopTimer();setView('result');
        ['cc_roomId','cc_userId','cc_displayName','cc_startedAt','cc_chat'].forEach(k=>sessionStorage.removeItem(k));
      });

      s.on('chat',({displayName:n,message,ts})=>setChatMessages(prev=>[...prev,{displayName:n,message,ts}]));

      s.on('opponent-left',()=>{
        setOpponentReconnecting(true);
        addChat('🤖 System','Opponent disconnected — waiting for reconnect...');
        reconnectTimerRef.current=setTimeout(()=>{
          setOpponentLeft(true);setOpponentReconnecting(false);addChat('🤖 System','Opponent left the battle');
        },10000);
      });

      s.on('error',({message:m})=>setError(m));
    });
  },[WS,role]);

  function addChat(name,msg){setChatMessages(prev=>[...prev,{displayName:name,message:msg,ts:Date.now()}]);}

  function startTimer(startedAt=null){
    const t=startedAt||Date.now();
    startTimeRef.current=t;
    sessionStorage.setItem('cc_startedAt',String(t));
    timerRef.current=setInterval(()=>setElapsed(Date.now()-startTimeRef.current),1000);
  }

  function stopTimer(){if(timerRef.current)clearInterval(timerRef.current);}

  function startBattle(room){
    const q=questions.find(q=>String(q.id)===String(room.questionId))||questions[0];
    setSelectedQ(q);setLanguage(room.language||'cpp');setMyCode(BOILERPLATE[room.language||'cpp']);
    setOpponentJoined(true);
    const savedStart=sessionStorage.getItem('cc_startedAt');
    const startedAt=room.startedAt||(savedStart?parseInt(savedStart):null);
    startTimer(startedAt);setView('battle');
  }

  async function handleCreate(){
    setError('');setLoading(true);
    try{
      const res=await fetch(`${API}/api/codecast/rooms`,{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({questionId:selectedQ.id,language,userId:user.id}),
      });
      if(!res.ok){const txt=await res.text();let msg=`Server error (${res.status})`;try{msg=JSON.parse(txt).error||msg;}catch{}throw new Error(msg);}
      const{roomId:rid}=await res.json();
      setRoomId(rid);
      sessionStorage.setItem('cc_roomId',rid);sessionStorage.setItem('cc_userId',user.id);sessionStorage.setItem('cc_displayName',displayName);
      await connectSocket();
      socketRef.current.emit('join-room',{roomId:rid,userId:user.id,displayName});
    }catch(e){setError(e.message);}
    finally{setLoading(false);}
  }

  async function handleJoin(){
    const rid=joinInput.trim().toUpperCase();
    if(!rid){setError('Enter a room code');return;}
    setError('');setLoading(true);
    try{
      sessionStorage.setItem('cc_roomId',rid);sessionStorage.setItem('cc_userId',user.id);sessionStorage.setItem('cc_displayName',displayName);
      await connectSocket();
      socketRef.current.emit('join-room',{roomId:rid,userId:user.id,displayName});
      setRoomId(rid);
    }catch(e){setError('Could not connect to server. Try again.');}
    finally{setLoading(false);}
  }

  function handleCodeChange(val){setMyCode(val);socketRef.current?.emit('code-change',{roomId,code:val,language});}

  function handleLangChange(lang){
    setLanguage(lang);setMyCode(BOILERPLATE[lang]);
    socketRef.current?.emit('code-change',{roomId,code:BOILERPLATE[lang],language:lang});
  }

  async function handleRun(){
    if(!selectedQ?.testCases)return;
    setRunning(true);setTestResults([]);
    const results=[];
    for(const tc of selectedQ.testCases){
      try{
        const res=await fetch(`${API}/api/execute`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code:myCode,language,input:tc.input})});
        const data=await res.json();
        const actual=(data.output||'').trim();
        results.push({input:tc.input,expected:tc.output,actual,passed:actual===tc.output.trim()});
      }catch{results.push({input:tc.input,expected:tc.output,actual:'Error',passed:false});}
    }
    setTestResults(results);setRunning(false);return results;
  }

  async function handleSubmit(){
    if(submitted)return;
    const results=await handleRun();
    if(!results)return;
    const passed=results.filter(r=>r.passed).length;
    const total=results.length;
    const result={passed,total,verdict:passed===total?'Accepted':'Wrong Answer',timeMs:elapsed};
    setMyResult(result);setSubmitted(true);
    socketRef.current?.emit('submit',{roomId,result});
  }

  function sendChat(e){
    e.preventDefault();if(!chatInput.trim())return;
    socketRef.current?.emit('chat',{roomId,message:chatInput,displayName});setChatInput('');
  }

  // ─── Styles ───────────────────────────────────────────────────────────────
  const globalCss = `
    @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..60,700;12..60,800&family=DM+Sans:wght@300;400;500&family=Space+Mono:wght@400;700&display=swap');
    *{box-sizing:border-box;}
    body{margin:0;background:#080B0F;}
    ::-webkit-scrollbar{width:4px;height:4px}
    ::-webkit-scrollbar-thumb{background:rgba(32,201,151,0.2);border-radius:4px}
    @keyframes pulse-ring{0%,100%{transform:scale(1);opacity:.5}50%{transform:scale(1.3);opacity:.2}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
    .cc-inp{background:#1A1D22;border:1px solid rgba(255,255,255,0.1);border-radius:10px;color:#fff;padding:12px 16px;font-size:14px;width:100%;outline:none;font-family:'DM Sans',sans-serif;transition:border-color .2s}
    .cc-inp:focus{border-color:#20c997}
    .cc-inp::placeholder{color:#6A6A6A}
    .btn-primary{background:linear-gradient(135deg,#20c997,#0891b2);border:none;border-radius:10px;color:#000;font-weight:700;padding:12px 28px;cursor:pointer;font-size:14px;transition:all .2s;font-family:'DM Sans',sans-serif}
    .btn-primary:hover{opacity:.88;transform:translateY(-1px)}
    .btn-primary:disabled{opacity:.45;cursor:not-allowed;transform:none}
    .btn-ghost{background:transparent;border:1px solid rgba(32,201,151,0.3);border-radius:10px;color:#20c997;font-weight:600;padding:11px 24px;cursor:pointer;font-size:14px;transition:all .2s;font-family:'DM Sans',sans-serif}
    .btn-ghost:hover{background:rgba(32,201,151,0.08);border-color:rgba(32,201,151,0.5)}
    .btn-ghost:disabled{opacity:.45;cursor:not-allowed}
    .lang-btn{padding:6px 18px;border-radius:8px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.03);color:#8C8C8C;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;transition:all .18s}
    .lang-btn.active{background:rgba(32,201,151,0.15);border-color:#20c997;color:#20c997;font-weight:700}
    .lang-btn:hover:not(.active){border-color:rgba(255,255,255,0.2);color:#ccc}
    .lobby-card{background:#0D1117;border:1px solid rgba(255,255,255,0.07);border-radius:20px;padding:32px;position:relative;overflow:hidden;transition:border-color .2s}
    .lobby-card:hover{border-color:rgba(32,201,151,0.2)}
    select option{background:#1A1D22}
    .chat-msg-sys{font-style:italic;color:#4A4D54;font-size:12px;text-align:center;padding:4px 0}
    .tc-result{padding:10px 14px;border-radius:8px;font-size:12px;font-family:'Space Mono',monospace}
  `;

  // ─── LOBBY VIEW ───────────────────────────────────────────────────────────
  if (view === 'lobby') return (
    <div style={{background:C.bg,minHeight:'100vh',color:C.text,fontFamily:"'DM Sans',sans-serif"}}>
      <style>{globalCss}</style>
      <Header />

      <div style={{maxWidth:960,margin:'0 auto',padding:'48px 24px 80px',display:'flex',flexDirection:'column',alignItems:'center'}}>

        {/* Hero */}
        <div style={{textAlign:'center',marginBottom:56,animation:'fadeUp .6s ease both'}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(245,158,11,0.1)',border:'1px solid rgba(245,158,11,0.25)',borderRadius:100,padding:'5px 14px',marginBottom:20}}>
            <span style={{width:6,height:6,borderRadius:'50%',background:'#f59e0b',animation:'pulse-ring 2s ease infinite'}} />
            <span style={{fontSize:10,fontWeight:700,color:'#f59e0b',letterSpacing:'.14em',textTransform:'uppercase'}}>Live 1v1 Battle</span>
          </div>
          <h1 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontWeight:800,fontSize:'clamp(36px,6vw,60px)',letterSpacing:'-.04em',lineHeight:1.08,margin:'0 0 16px'}}>
            Code<span style={{background:'linear-gradient(135deg,#20c997,#0891b2)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Cast</span>
          </h1>
          <p style={{fontSize:16,color:'#8C8C8C',lineHeight:1.7,maxWidth:480,margin:'0 auto'}}>
            Challenge a friend to a real-time coding battle. Pick a question, share the room code, and may the best coder win.
          </p>
        </div>

        {/* Cards */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,width:'100%',maxWidth:860,animation:'fadeUp .6s ease .1s both'}}>

          {/* Create */}
          <div className="lobby-card">
            <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,#20c997,#0891b2)',borderRadius:'20px 20px 0 0'}} />
            <h2 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontWeight:800,fontSize:20,marginBottom:24,letterSpacing:'-.02em'}}>⚔️ Create a Room</h2>

            <div style={{marginBottom:16}}>
              <div style={{fontSize:10,color:C.muted,letterSpacing:'.1em',textTransform:'uppercase',marginBottom:8}}>Question</div>
              <select className="cc-inp" value={selectedQ.id} onChange={e=>setSelectedQ(questions.find(q=>String(q.id)===e.target.value))} style={{cursor:'pointer'}}>
                {questions.map(q=><option key={q.id} value={q.id}>{q.name} ({q.difficulty})</option>)}
              </select>
            </div>

            <div style={{marginBottom:24}}>
              <div style={{fontSize:10,color:C.muted,letterSpacing:'.1em',textTransform:'uppercase',marginBottom:10}}>Language</div>
              <div style={{display:'flex',gap:8}}>
                {Object.entries(LANG_LABELS).map(([k,v])=>(
                  <button key={k} className={`lang-btn ${language===k?'active':''}`} onClick={()=>setLanguage(k)} style={{flex:1}}>{v}</button>
                ))}
              </div>
            </div>

            {error&&<div style={{marginBottom:16,padding:'10px 14px',background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:8,color:'#f87171',fontSize:13}}>{error}</div>}

            <button className="btn-primary" style={{width:'100%'}} onClick={handleCreate} disabled={loading}>
              {loading?<><CircularProgress size={14} style={{color:'#000',verticalAlign:'middle',marginRight:8}}/>Creating…</>:'⚔️ Create Battle Room'}
            </button>
          </div>

          {/* Join */}
          <div className="lobby-card">
            <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,#007BFF,#0891b2)',borderRadius:'20px 20px 0 0'}} />
            <h2 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontWeight:800,fontSize:20,marginBottom:24,letterSpacing:'-.02em'}}>🔗 Join a Room</h2>

            <div style={{marginBottom:24}}>
              <div style={{fontSize:10,color:C.muted,letterSpacing:'.1em',textTransform:'uppercase',marginBottom:8}}>Room Code</div>
              <input className="cc-inp" placeholder="Enter 8-digit code…" value={joinInput} onChange={e=>setJoinInput(e.target.value.toUpperCase())}
                onKeyDown={e=>e.key==='Enter'&&handleJoin()}
                style={{letterSpacing:'.15em',textTransform:'uppercase',fontSize:18,textAlign:'center'}} />
            </div>

            <div style={{marginBottom:24,padding:'16px',background:'rgba(0,123,255,0.05)',border:'1px solid rgba(0,123,255,0.1)',borderRadius:12}}>
              <div style={{fontSize:12,color:'#60a5fa',marginBottom:8,fontWeight:600}}>How it works</div>
              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                {['Pick a question & create a room','Share the 8-letter code with your opponent','Code simultaneously — best score wins'].map((s,i)=>(
                  <div key={i} style={{display:'flex',gap:10,alignItems:'flex-start'}}>
                    <span style={{fontSize:11,color:'#20c997',fontFamily:"'Space Mono',monospace",flexShrink:0,marginTop:1}}>0{i+1}</span>
                    <span style={{fontSize:13,color:'#8C8C8C',lineHeight:1.5}}>{s}</span>
                  </div>
                ))}
              </div>
            </div>

            <button className="btn-ghost" style={{width:'100%'}} onClick={handleJoin} disabled={loading}>
              {loading?<CircularProgress size={14} style={{color:'#20c997',verticalAlign:'middle'}}/>:'🔗 Join Battle Room'}
            </button>
          </div>
        </div>

        {/* Features strip */}
        <div style={{display:'flex',gap:24,marginTop:40,flexWrap:'wrap',justifyContent:'center',animation:'fadeUp .6s ease .2s both'}}>
          {[['⚡','Real-time code sync'],['💬','Live battle chat'],['⏱','Battle timer'],['🏆','Instant winner verdict']].map(([ico,label])=>(
            <div key={label} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 16px',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:100,fontSize:12,color:'#8C8C8C'}}>
              <span>{ico}</span><span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ─── WAITING VIEW ─────────────────────────────────────────────────────────
  if (view === 'waiting') return (
    <div style={{background:C.bg,minHeight:'100vh',color:C.text,fontFamily:"'DM Sans',sans-serif",display:'flex',flexDirection:'column'}}>
      <style>{globalCss}</style>
      <Header />
      <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:32,padding:24}}>
        <div style={{textAlign:'center'}}>
          <div style={{width:80,height:80,borderRadius:'50%',border:'3px solid #20c997',borderTopColor:'transparent',animation:'spin 1s linear infinite',margin:'0 auto 24px'}} />
          <h2 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontWeight:800,fontSize:28,marginBottom:8}}>Waiting for opponent…</h2>
          <p style={{color:C.muted,fontSize:15}}>Share your room code to start the battle</p>
        </div>

        <div style={{background:C.surface,border:'1px solid rgba(32,201,151,0.2)',borderRadius:16,padding:'24px 40px',textAlign:'center'}}>
          <div style={{fontSize:11,color:C.muted,letterSpacing:'.1em',textTransform:'uppercase',marginBottom:10}}>Room Code</div>
          <div style={{fontFamily:"'Space Mono',monospace",fontSize:32,fontWeight:700,letterSpacing:'.2em',color:'#20c997'}}>{roomId}</div>
          <button onClick={()=>{navigator.clipboard.writeText(roomId)}} style={{marginTop:12,background:'rgba(32,201,151,0.1)',border:'1px solid rgba(32,201,151,0.2)',borderRadius:8,padding:'6px 16px',color:'#20c997',cursor:'pointer',fontSize:12,fontFamily:"'DM Sans',sans-serif"}}>
            📋 Copy Code
          </button>
        </div>

        <button className="btn-ghost" onClick={()=>{socketRef.current?.disconnect();['cc_roomId','cc_userId','cc_displayName','cc_startedAt','cc_chat'].forEach(k=>sessionStorage.removeItem(k));setView('lobby');}}>
          ← Leave Room
        </button>
      </div>
    </div>
  );

  // ─── BATTLE VIEW ─────────────────────────────────────────────────────────
  if (view === 'battle') return (
    <div style={{background:C.bg,height:'100vh',display:'flex',flexDirection:'column',color:C.text,fontFamily:"'DM Sans',sans-serif",overflow:'hidden'}}>
      <style>{globalCss}</style>

      {/* Battle navbar */}
      <div style={{height:52,background:'#0D1117',borderBottom:'1px solid rgba(255,255,255,0.06)',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 20px',flexShrink:0,zIndex:50}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <span style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontWeight:800,fontSize:16,background:'linear-gradient(135deg,#20c997,#0891b2)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>CodeCast</span>
          <span style={{background:'rgba(245,158,11,0.12)',border:'1px solid rgba(245,158,11,0.3)',color:'#f59e0b',borderRadius:5,padding:'2px 8px',fontSize:10,fontWeight:700,letterSpacing:'.1em'}}>⚔️ LIVE</span>
          <span style={{fontFamily:"'Space Mono',monospace",fontSize:11,color:C.muted,letterSpacing:'.12em'}}>{roomId}</span>
        </div>

        <div style={{fontFamily:"'Space Mono',monospace",fontSize:18,fontWeight:700,color:elapsed>30*60*1000?'#ef4444':'#20c997',letterSpacing:'.05em'}}>
          {formatTime(elapsed)}
        </div>

        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <span style={{background:'rgba(32,201,151,0.1)',border:'1px solid rgba(32,201,151,0.25)',color:'#20c997',borderRadius:6,padding:'3px 10px',fontSize:11,fontWeight:700}}>You ({role})</span>
          {opponentLeft
            ? <span style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.25)',color:'#ef4444',borderRadius:6,padding:'3px 10px',fontSize:11,fontWeight:700}}>Opponent left</span>
            : opponentReconnecting
              ? <span style={{background:'rgba(245,158,11,0.1)',border:'1px solid rgba(245,158,11,0.25)',color:'#f59e0b',borderRadius:6,padding:'3px 10px',fontSize:11,fontWeight:700}}>Reconnecting…</span>
              : opponentSubmitted
                ? <span style={{background:'rgba(245,158,11,0.1)',border:'1px solid rgba(245,158,11,0.25)',color:'#f59e0b',borderRadius:6,padding:'3px 10px',fontSize:11,fontWeight:700}}>Opponent submitted</span>
                : opponentJoined
                  ? <span style={{background:'rgba(106,106,106,0.1)',border:'1px solid rgba(106,106,106,0.2)',color:'#8C8C8C',borderRadius:6,padding:'3px 10px',fontSize:11}}>Opponent coding…</span>
                  : <span style={{background:'rgba(106,106,106,0.1)',border:'1px solid rgba(106,106,106,0.2)',color:'#8C8C8C',borderRadius:6,padding:'3px 10px',fontSize:11}}>Waiting…</span>}
        </div>
      </div>

      {/* 3-panel layout */}
      <div style={{flex:1,display:'grid',gridTemplateColumns:'300px 1fr 240px',minHeight:0,overflow:'hidden'}}>

        {/* LEFT: Problem */}
        <div style={{borderRight:'1px solid rgba(255,255,255,0.06)',overflowY:'auto',display:'flex',flexDirection:'column'}}>
          <div style={{padding:'16px 18px',borderBottom:'1px solid rgba(255,255,255,0.05)',flexShrink:0}}>
            <span style={{
              display:'inline-block',padding:'2px 10px',borderRadius:5,fontSize:10,fontWeight:700,letterSpacing:'.08em',marginBottom:10,
              color:selectedQ.difficulty==='Easy'?'#4ade80':selectedQ.difficulty==='Hard'?'#f87171':'#fbbf24',
              background:selectedQ.difficulty==='Easy'?'rgba(74,222,128,0.1)':selectedQ.difficulty==='Hard'?'rgba(248,113,113,0.1)':'rgba(251,191,36,0.1)',
            }}>{selectedQ.difficulty}</span>
            <h3 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontWeight:700,fontSize:16,lineHeight:1.4,marginBottom:6}}>{selectedQ.name}</h3>
            <div style={{fontSize:11,color:C.muted}}>🏢 {selectedQ.company}</div>
          </div>

          <div style={{padding:'16px 18px',flex:1,overflowY:'auto'}}>
            <p style={{fontSize:13,color:'#ccc',lineHeight:1.75,marginBottom:16,whiteSpace:'pre-line'}}>{selectedQ.question_description}</p>

            {selectedQ.examples?.map((ex,i)=>(
              <div key={i} style={{background:'#1A1D22',borderRadius:8,padding:'10px 12px',marginBottom:8,fontFamily:"'Space Mono',monospace",fontSize:11}}>
                <div style={{color:C.muted,fontSize:10,marginBottom:4}}>Example {i+1}</div>
                <div style={{color:'#ccc'}}><span style={{color:C.muted}}>In: </span>{ex.input}</div>
                <div style={{color:'#ccc'}}><span style={{color:C.muted}}>Out: </span>{ex.output}</div>
              </div>
            ))}

            {selectedQ.constraints&&(
              <div style={{marginTop:12,padding:'10px 12px',background:'rgba(255,255,255,0.02)',borderRadius:8,fontSize:12,color:C.muted,lineHeight:1.6}}>
                <div style={{fontSize:10,letterSpacing:'.1em',textTransform:'uppercase',marginBottom:6,color:'#6A6A6A'}}>Constraints</div>
                {selectedQ.constraints}
              </div>
            )}

            {/* Peek opponent */}
            <div style={{marginTop:16,paddingTop:16,borderTop:'1px solid rgba(255,255,255,0.05)'}}>
              <button className="btn-ghost" style={{width:'100%',fontSize:12,padding:'8px 12px'}} onClick={()=>setShowOpponent(p=>!p)}>
                {showOpponent?'🙈 Hide Opponent Code':'👁 Peek Opponent'}
              </button>
              {showOpponent&&opponentCode&&(
                <div style={{marginTop:10,background:'#0f1117',borderRadius:8,overflow:'hidden'}}>
                  <div style={{padding:'5px 10px',background:'#1a1d22',fontSize:10,color:C.muted}}>{LANG_LABELS[opponentLang]}</div>
                  <pre style={{padding:'10px 12px',fontSize:11,color:'#8C8C8C',overflow:'auto',margin:0,maxHeight:200}}>{opponentCode}</pre>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MIDDLE: Editor */}
        <div style={{display:'flex',flexDirection:'column',minHeight:0}}>
          {/* Editor toolbar */}
          <div style={{padding:'8px 14px',background:'#0D1117',borderBottom:'1px solid rgba(255,255,255,0.06)',display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
            {Object.entries(LANG_LABELS).map(([k,v])=>(
              <button key={k} className={`lang-btn ${language===k?'active':''}`} onClick={()=>handleLangChange(k)}>{v}</button>
            ))}
            <div style={{flex:1}} />
            <span style={{fontSize:11,color:C.muted,fontFamily:"'Space Mono',monospace"}}>Your editor</span>
          </div>

          {/* Monaco editor - takes all remaining height */}
          <div style={{flex:1,minHeight:0}}>
            <MonacoEditor
              height="100%"
              language={language==='cpp'?'cpp':language}
              theme="vs-dark"
              value={myCode}
              onChange={handleCodeChange}
              options={{
                fontSize:14,minimap:{enabled:false},scrollBeyondLastLine:false,
                fontFamily:"'Space Mono',monospace",lineNumbers:'on',
                renderLineHighlight:'line',cursorBlinking:'smooth',
                smoothScrolling:true,padding:{top:12},tabSize:2,
                automaticLayout:true,
              }}
            />
          </div>

          {/* Test results (only when available, compact) */}
          {testResults.length>0&&(
            <div style={{background:'#0D1117',borderTop:'1px solid rgba(255,255,255,0.06)',padding:'10px 14px',maxHeight:160,overflowY:'auto',flexShrink:0}}>
              <div style={{fontSize:11,color:C.muted,marginBottom:8,display:'flex',justifyContent:'space-between'}}>
                <span>Test Results</span>
                <span style={{color:testResults.filter(r=>r.passed).length===testResults.length?'#20c997':'#f87171',fontWeight:700}}>
                  {testResults.filter(r=>r.passed).length}/{testResults.length} passed
                </span>
              </div>
              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                {testResults.map((r,i)=>(
                  <div key={i} className="tc-result" style={{background:r.passed?'rgba(32,201,151,0.08)':'rgba(239,68,68,0.08)',border:`1px solid ${r.passed?'rgba(32,201,151,0.25)':'rgba(239,68,68,0.25)'}`,color:r.passed?'#20c997':'#f87171'}}>
                    {r.passed?'✓':'✗'} TC{i+1}
                    {!r.passed&&<div style={{fontSize:10,color:'#8C8C8C',marginTop:2,fontFamily:"'Space Mono',monospace"}}>Got: {String(r.actual).slice(0,15)}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Run + Submit bar */}
          <div style={{padding:'10px 14px',background:'#0D1117',borderTop:'1px solid rgba(255,255,255,0.06)',display:'flex',gap:10,flexShrink:0}}>
            <button className="btn-ghost" style={{flex:1}} onClick={handleRun} disabled={running||submitted}>
              {running?<><CircularProgress size={12} style={{color:'#20c997',verticalAlign:'middle',marginRight:6}}/>Running…</>:'▶ Run Tests'}
            </button>
            <button className="btn-primary" style={{flex:2,opacity:submitted?.5:1}} onClick={handleSubmit} disabled={submitted||running}>
              {submitted?'✓ Submitted':'🚀 Submit'}
            </button>
          </div>
        </div>

        {/* RIGHT: Chat */}
        <div style={{borderLeft:'1px solid rgba(255,255,255,0.06)',display:'flex',flexDirection:'column',minHeight:0}}>
          <div style={{padding:'14px 16px',borderBottom:'1px solid rgba(255,255,255,0.06)',fontWeight:600,fontSize:13,flexShrink:0}}>
            💬 Battle Chat
          </div>

          <div style={{flex:1,overflowY:'auto',padding:'12px 14px',display:'flex',flexDirection:'column',gap:8}}>
            {chatMessages.length===0&&<div style={{textAlign:'center',color:'#2a2d34',fontSize:13,marginTop:24}}>No messages yet</div>}
            {chatMessages.map((m,i)=>(
              <div key={i}>
                {m.displayName==='🤖 System'
                  ? <div className="chat-msg-sys">{m.message}</div>
                  : <>
                      <div style={{fontSize:10,color:C.muted,marginBottom:3}}>{m.displayName}</div>
                      <div style={{background:'#1A1D22',borderRadius:8,padding:'7px 10px',fontSize:13,color:'#ccc',lineHeight:1.5}}>{m.message}</div>
                    </>}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={sendChat} style={{padding:'10px 12px',borderTop:'1px solid rgba(255,255,255,0.06)',display:'flex',gap:8,flexShrink:0}}>
            <input className="cc-inp" style={{flex:1,padding:'8px 12px',fontSize:12}} placeholder="Message…" value={chatInput} onChange={e=>setChatInput(e.target.value)} maxLength={300} />
            <button type="submit" className="btn-primary" style={{padding:'8px 14px',fontSize:14}}>→</button>
          </form>
        </div>
      </div>
    </div>
  );

  // ─── RESULT VIEW ──────────────────────────────────────────────────────────
  if (view === 'result') {
    const isWinner=(role==='host'&&battleResult?.winner==='host')||(role==='guest'&&battleResult?.winner==='guest');
    const isDraw=battleResult?.winner==='draw';
    const myRes=role==='host'?battleResult?.hostResult:battleResult?.guestResult;
    const oppRes=role==='host'?battleResult?.guestResult:battleResult?.hostResult;

    return (
      <div style={{background:C.bg,minHeight:'100vh',color:C.text,fontFamily:"'DM Sans',sans-serif",display:'flex',flexDirection:'column'}}>
        <style>{globalCss}</style>
        <Header />
        <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:24,gap:32}}>
          <div style={{textAlign:'center',animation:'fadeUp .6s ease both'}}>
            <div style={{fontSize:64,marginBottom:16}}>{isDraw?'🤝':isWinner?'🏆':'💪'}</div>
            <h1 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontWeight:800,fontSize:'clamp(32px,5vw,52px)',letterSpacing:'-.04em',marginBottom:8,
              background:isDraw?'linear-gradient(135deg,#f59e0b,#fbbf24)':isWinner?'linear-gradient(135deg,#20c997,#0891b2)':'linear-gradient(135deg,#6A6A6A,#8C8C8C)',
              WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
              {isDraw?'Draw!':isWinner?'You Won!':'You Lost'}
            </h1>
            <p style={{color:C.muted,fontSize:15}}>{isDraw?'Both players performed equally':`Battle duration: ${formatTime(myRes?.timeMs||0)}`}</p>
          </div>

          <div style={{display:'flex',gap:16,flexWrap:'wrap',justifyContent:'center',animation:'fadeUp .6s ease .1s both'}}>
            {[
              {label:'Your Score',val:`${myRes?.passed||0}/${myRes?.total||0}`,color:'#20c997',highlight:true},
              {label:'Verdict',val:myRes?.verdict||'—',color:myRes?.verdict==='Accepted'?'#20c997':'#f87171',highlight:false},
              {label:"Opponent's Score",val:`${oppRes?.passed||0}/${oppRes?.total||0}`,color:'#8C8C8C',highlight:false},
            ].map(({label,val,color,highlight})=>(
              <div key={label} style={{background:C.surface,border:`1px solid ${highlight?'rgba(32,201,151,0.3)':'rgba(255,255,255,0.07)'}`,borderRadius:16,padding:'20px 32px',textAlign:'center',minWidth:180}}>
                <div style={{fontSize:10,color:C.muted,letterSpacing:'.1em',textTransform:'uppercase',marginBottom:8}}>{label}</div>
                <div style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontWeight:800,fontSize:28,color}}>{val}</div>
              </div>
            ))}
          </div>

          <div style={{display:'flex',gap:12,animation:'fadeUp .6s ease .2s both'}}>
            <button className="btn-primary" onClick={()=>{socketRef.current?.disconnect();setView('lobby');setBattleResult(null);setSubmitted(false);setTestResults([]);setElapsed(0);setChatMessages([]);}}>
              ⚔️ New Battle
            </button>
            <button className="btn-ghost" onClick={()=>window.location.href='/intellicode'}>
              📚 IntelliCode
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}