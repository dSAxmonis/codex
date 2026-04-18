/**
 * CodeCast.jsx — Live 1v1 coding battle room
 *
 * Flow:
 *   Lobby → Create room (pick question) OR paste roomId to join
 *   Waiting room → opponent joins → Battle starts (Monaco + timer + live chat)
 *   Both submit → Winner announced
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { io } from 'socket.io-client';
import { useAuth, useUser } from '@clerk/clerk-react';
import { CircularProgress } from '@mui/material';
import Header from './Header';
import Footer from './Footer';
import questions from '../data/question.json';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const WS = process.env.REACT_APP_WS_URL || 'http://localhost:8000';

const BOILERPLATE = {
  cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}',
  python: 'def solution():\n    pass\n\nif __name__ == "__main__":\n    solution()',
  java: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}',
};

const LANG_LABELS = { cpp: 'C++', python: 'Python', java: 'Java' };

function formatTime(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export default function CodeCast() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const displayName = user?.firstName || user?.fullName?.split(' ')[0] || 'Player';

  // View state
  const [view, setView] = useState('lobby');
  const [roomId, setRoomId] = useState('');
  const [joinInput, setJoinInput] = useState('');
  const [role, setRole] = useState(null);
  const [roomData, setRoomData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Battle state
  const [selectedQ, setSelectedQ] = useState(questions[0]);
  const [language, setLanguage] = useState('cpp');
  const [myCode, setMyCode] = useState(BOILERPLATE.cpp);
  const [opponentCode, setOpponentCode] = useState('');
  const [opponentLang, setOpponentLang] = useState('cpp');
  const [showOpponent, setShowOpponent] = useState(false);

  // Timer
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  // Test results
  const [running, setRunning] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [myResult, setMyResult] = useState(null);

  // Battle result
  const [battleResult, setBattleResult] = useState(null);

  // Chat
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef(null);

  // Opponent status
  const [opponentJoined, setOpponentJoined] = useState(false);
  const [opponentSubmitted, setOpponentSubmitted] = useState(false);
  const [opponentLeft, setOpponentLeft] = useState(false);

  // Socket
  const socketRef = useRef(null);

  const connectSocket = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (socketRef.current?.connected) return resolve(socketRef.current);
      socketRef.current = io(`${WS}/codecast`, {
        transports: ['polling', 'websocket'],
        reconnectionAttempts: 5,
      });

      const s = socketRef.current;
      s.once('connect', () => resolve(s));
      s.once('connect_error', (err) => reject(err));

    s.on('room-joined', ({ role: r, room }) => {
      setRole(r);
      setRoomData(room);
      if (room.status === 'active') {
        startBattle(room);
      } else {
        setView('waiting');
      }
    });

    s.on('opponent-joined', ({ displayName: n }) => {
      setOpponentJoined(true);
      addChat('🤖 System', `${n} joined the room`);
    });

    s.on('battle-start', ({ room }) => {
      startBattle(room);
    });

    s.on('opponent-code', ({ code, language: lang }) => {
      setOpponentCode(code);
      setOpponentLang(lang);
    });

    s.on('player-submitted', ({ role: r, result }) => {
      if (r !== role) {
        setOpponentSubmitted(true);
        addChat('🤖 System', `Opponent submitted — ${result.passed}/${result.total} passed`);
      }
    });

    s.on('battle-end', (result) => {
      setBattleResult(result);
      stopTimer();
      setView('result');
    });

    s.on('chat', ({ displayName: n, message, ts }) => {
      setChatMessages(prev => [...prev, { displayName: n, message, ts }]);
    });

    s.on('opponent-left', () => {
      setOpponentLeft(true);
      addChat('🤖 System', 'Opponent disconnected');
    });

      s.on('error', ({ message: m }) => setError(m));
    }); // end Promise
  }, [WS, role]);

  function addChat(name, msg) {
    setChatMessages(prev => [...prev, { displayName: name, message: msg, ts: Date.now() }]);
  }

  function startTimer() {
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setElapsed(Date.now() - startTimeRef.current);
    }, 1000);
  }

  function stopTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function startBattle(room) {
    const q = questions.find(q => String(q.id) === String(room.questionId)) || questions[0];
    setSelectedQ(q);
    setLanguage(room.language || 'cpp');
    setMyCode(BOILERPLATE[room.language || 'cpp']);
    setOpponentJoined(true);
    startTimer();
    setView('battle');
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => () => {
    socketRef.current?.disconnect();
    stopTimer();
  }, []);

  async function handleCreate() {
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/codecast/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: selectedQ.id, language, userId: user.id }),
      });

      if (!res.ok) {
        const txt = await res.text();
        let msg = `Server error (${res.status})`;
        try { msg = JSON.parse(txt).error || msg; } catch {}
        throw new Error(msg);
      }

      const { roomId: rid } = await res.json();
      setRoomId(rid);
      await connectSocket();
      socketRef.current.emit('join-room', { roomId: rid, userId: user.id, displayName });
    } catch (e) {
      setError(e.message);
      console.error('Create room error:', e);
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    const rid = joinInput.trim().toUpperCase();
    if (!rid) {
      setError('Enter a room code');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await connectSocket();
      socketRef.current.emit('join-room', { roomId: rid, userId: user.id, displayName });
      setRoomId(rid);
    } catch(e) {
      setError('Could not connect to server. Try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleCodeChange(val) {
    setMyCode(val);
    socketRef.current?.emit('code-change', { roomId, code: val, language });
  }

  function handleLangChange(lang) {
    setLanguage(lang);
    setMyCode(BOILERPLATE[lang]);
    socketRef.current?.emit('code-change', { roomId, code: BOILERPLATE[lang], language: lang });
  }

  async function handleRun() {
    if (!selectedQ || !selectedQ.testCases) return;
    setRunning(true);
    setTestResults([]);
    const results = [];

    for (const tc of selectedQ.testCases) {
      try {
        const res = await fetch(`${API}/api/execute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: myCode, language, input: tc.input }),
        });
        const data = await res.json();
        const actual = (data.output || '').trim();
        results.push({ input: tc.input, expected: tc.output, actual, passed: actual === tc.output.trim() });
      } catch (e) {
        console.error('Test error:', e);
        results.push({ input: tc.input, expected: tc.output, actual: 'Error', passed: false });
      }
    }

    setTestResults(results);
    setRunning(false);
    return results;
  }

  async function handleSubmit() {
    if (submitted) return;
    const results = await handleRun();
    if (!results) return;
    const passed = results.filter(r => r.passed).length;
    const total = results.length;
    const verdict = passed === total ? 'Accepted' : 'Wrong Answer';
    const result = { passed, total, verdict, timeMs: elapsed };
    setMyResult(result);
    setSubmitted(true);
    socketRef.current?.emit('submit', { roomId, result });
  }

  function sendChat(e) {
    e.preventDefault();
    if (!chatInput.trim()) return;
    socketRef.current?.emit('chat', { roomId, message: chatInput, displayName });
    setChatInput('');
  }

  const S = {
    page: { background: '#080B0F', minHeight: '100vh', color: '#fff', fontFamily: "'DM Sans', sans-serif" },
    card: { background: '#111418', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 32 },
    label: { fontSize: 11, color: '#6A6A6A', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8 },
    input: { background: '#1A1D22', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff', padding: '10px 16px', fontSize: 14, width: '100%', outline: 'none', fontFamily: 'inherit' },
    btnPrimary: { background: 'linear-gradient(135deg,#20c997,#0891b2)', border: 'none', borderRadius: 10, color: '#000', fontWeight: 700, padding: '12px 28px', cursor: 'pointer', fontSize: 14, transition: 'opacity .2s' },
    btnGhost: { background: 'transparent', border: '1px solid rgba(32,201,151,0.3)', borderRadius: 10, color: '#20c997', fontWeight: 600, padding: '11px 24px', cursor: 'pointer', fontSize: 14, transition: 'all .2s' },
    btnRed: { background: 'linear-gradient(135deg,#ef4444,#dc2626)', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, padding: '12px 28px', cursor: 'pointer', fontSize: 14 },
    tag: (color) => ({ background: `${color}18`, border: `1px solid ${color}40`, color, borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 700 }),
  };

  // VIEW: LOBBY
  if (view === 'lobby') return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700;800&family=DM+Sans:wght@300;400;500&family=Space+Mono&display=swap');
        select option { background: #1A1D22; }
      `}</style>
      <Header />
      <div style={{ ...S.page, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 56, maxWidth: 600 }}>
          <div style={{ ...S.tag('#f59e0b'), display: 'inline-block', marginBottom: 16 }}>⚔️ LIVE 1v1 BATTLE</div>
          <h1 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 'clamp(36px,6vw,56px)', fontWeight: 800, margin: '0 0 16px', lineHeight: 1.1 }}>
            Code<span style={{ background: 'linear-gradient(135deg,#20c997,#0891b2)', WebkitBackgroundClip: 'text', color: 'transparent' }}>Cast</span>
          </h1>
          <p style={{ color: '#6A6A6A', fontSize: 16, lineHeight: 1.7 }}>
            Challenge a friend to a real-time coding battle. Pick a question, share the room code, and may the best coder win.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 24, width: '100%', maxWidth: 780 }}>
          <div style={S.card}>
            <h2 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Create a Room</h2>
            <div style={{ marginBottom: 20 }}>
              <div style={S.label}>Question</div>
              <select
                style={{ ...S.input, cursor: 'pointer' }}
                value={selectedQ.id}
                onChange={e => setSelectedQ(questions.find(q => q.id === +e.target.value))}
              >
                {questions.map(q => (
                  <option key={q.id} value={q.id}>{q.name} ({q.difficulty})</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 28 }}>
              <div style={S.label}>Language</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {Object.entries(LANG_LABELS).map(([k, v]) => (
                  <button key={k} onClick={() => setLanguage(k)}
                    style={{ ...language === k ? S.btnPrimary : S.btnGhost, flex: 1, padding: '10px 8px', fontSize: 13 }}>
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {error && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 12 }}>{error}</p>}
            <button style={{ ...S.btnPrimary, width: '100%' }} onClick={handleCreate} disabled={loading}>
              {loading ? <CircularProgress size={16} style={{ color: '#000' }} /> : '⚔️ Create Battle Room'}
            </button>
          </div>

          <div style={S.card}>
            <h2 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Join a Room</h2>
            <div style={{ marginBottom: 28 }}>
              <div style={S.label}>Room Code</div>
              <input
                style={{ ...S.input, letterSpacing: '.15em', textTransform: 'uppercase', fontSize: 18, textAlign: 'center' }}
                placeholder="A3F9B2C1"
                value={joinInput}
                onChange={e => setJoinInput(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && handleJoin()}
                maxLength={8}
              />
            </div>
            {error && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 12 }}>{error}</p>}
            <button style={{ ...S.btnGhost, width: '100%' }} onClick={handleJoin} disabled={loading}>
              {loading ? <CircularProgress size={16} style={{ color: '#20c997' }} /> : '🔗 Join Battle Room'}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16, marginTop: 48, flexWrap: 'wrap', justifyContent: 'center' }}>
          {['⚡ Real-time code sync', '💬 Live chat', '⏱ Battle timer', '🏆 Instant winner verdict'].map(f => (
            <span key={f} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '8px 18px', fontSize: 13, color: '#8C8C8C' }}>{f}</span>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );

  // VIEW: WAITING ROOM
  if (view === 'waiting') return (
    <>
      <Header />
      <div style={{ ...S.page, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: 32, padding: 24 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
          <h2 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Waiting for opponent…</h2>
          <p style={{ color: '#6A6A6A' }}>Share this code with your opponent</p>
        </div>

        <div style={{ background: '#111418', border: '2px solid rgba(32,201,151,0.3)', borderRadius: 16, padding: '24px 48px', textAlign: 'center' }}>
          <div style={S.label}>Room Code</div>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 42, fontWeight: 700, color: '#20c997', letterSpacing: '.2em' }}>{roomId}</div>
          <button
            style={{ ...S.btnGhost, marginTop: 16, fontSize: 12 }}
            onClick={() => { navigator.clipboard.writeText(roomId); }}>
            📋 Copy Code
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#6A6A6A' }}>
          <CircularProgress size={16} style={{ color: '#20c997' }} />
          <span style={{ fontSize: 14 }}>Waiting for player 2…</span>
        </div>

        <button style={{ ...S.btnGhost }} onClick={() => { socketRef.current?.disconnect(); setView('lobby'); }}>
          ← Back to Lobby
        </button>
      </div>
      <Footer />
    </>
  );

  // VIEW: BATTLE
  if (view === 'battle') return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700;800&family=DM+Sans:wght@300;400;500&family=Space+Mono&display=swap');
        .cc-scroll::-webkit-scrollbar { width: 4px; }
        .cc-scroll::-webkit-scrollbar-track { background: transparent; }
        .cc-scroll::-webkit-scrollbar-thumb { background: #2a2d34; border-radius: 4px; }
        select option { background: #1A1D22; }
      `}</style>
      <div style={S.page}>
        <div style={{ background: '#0D0F14', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: 16, background: 'linear-gradient(135deg,#20c997,#0891b2)', WebkitBackgroundClip: 'text', color: 'transparent' }}>CodeCast</span>
            <span style={S.tag('#f59e0b')}>⚔️ LIVE</span>
            <span style={{ ...S.tag('#6A6A6A'), fontFamily: "'Space Mono',monospace", letterSpacing: '.1em' }}>{roomId}</span>
          </div>

          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 20, fontWeight: 700, color: elapsed > 30 * 60 * 1000 ? '#ef4444' : '#20c997' }}>
            ⏱ {formatTime(elapsed)}
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={S.tag('#20c997')}>You ({role})</span>
            {opponentLeft
              ? <span style={S.tag('#ef4444')}>Opponent left</span>
              : opponentSubmitted
                ? <span style={S.tag('#f59e0b')}>Opponent submitted</span>
                : opponentJoined
                  ? <span style={S.tag('#6A6A6A')}>Opponent coding…</span>
                  : <span style={S.tag('#6A6A6A')}>Waiting…</span>
            }
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr 260px', height: 'calc(100vh - 56px)' }}>
          <div style={{ borderRight: '1px solid rgba(255,255,255,0.06)', overflowY: 'auto', padding: '20px 20px' }} className="cc-scroll">
            <div style={{ marginBottom: 12 }}>
              <span style={S.tag(selectedQ.difficulty === 'Easy' ? '#20c997' : selectedQ.difficulty === 'Medium' ? '#f59e0b' : '#ef4444')}>{selectedQ.difficulty}</span>
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 12, lineHeight: 1.4 }}>{selectedQ.name}</h3>
            <p style={{ fontSize: 13, color: '#8C8C8C', lineHeight: 1.7, marginBottom: 16 }}>{selectedQ.question_description}</p>

            {selectedQ.examples?.map((ex, i) => (
              <div key={i} style={{ background: '#1A1D22', borderRadius: 8, padding: 12, marginBottom: 8 }}>
                <div style={{ fontSize: 11, color: '#6A6A6A', marginBottom: 4 }}>Example {i + 1}</div>
                <div style={{ fontSize: 12, color: '#ccc', fontFamily: "'Space Mono',monospace" }}>
                  <div><span style={{ color: '#6A6A6A' }}>In:</span> {ex.input}</div>
                  <div><span style={{ color: '#6A6A6A' }}>Out:</span> {ex.output}</div>
                </div>
              </div>
            ))}

            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button
                onClick={() => setShowOpponent(p => !p)}
                style={{ ...S.btnGhost, width: '100%', fontSize: 12, padding: '8px 12px' }}>
                {showOpponent ? '🙈 Hide Opponent Code' : '👁 Peek Opponent Code'}
              </button>
              {showOpponent && opponentCode && (
                <div style={{ marginTop: 12, background: '#0f1117', borderRadius: 8, overflow: 'hidden' }}>
                  <div style={{ padding: '6px 12px', background: '#1a1d22', fontSize: 11, color: '#6A6A6A' }}>Opponent ({LANG_LABELS[opponentLang]})</div>
                  <pre style={{ padding: 12, fontSize: 11, color: '#8C8C8C', overflowX: 'auto', margin: 0 }}>{opponentCode}</pre>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '10px 16px', background: '#0D0F14', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 8 }}>
              {Object.entries(LANG_LABELS).map(([k, v]) => (
                <button key={k} onClick={() => handleLangChange(k)}
                  style={{ ...language === k ? S.btnPrimary : S.btnGhost, padding: '6px 16px', fontSize: 12 }}>
                  {v}
                </button>
              ))}
              <div style={{ flex: 1 }} />
              <span style={{ fontSize: 12, color: '#6A6A6A' }}>Your editor</span>
            </div>

            <div style={{ flex: 1, minHeight: 0 }}>
              <MonacoEditor
                height="100%"
                language={language === 'cpp' ? 'cpp' : language}
                theme="vs-dark"
                value={myCode}
                onChange={handleCodeChange}
                options={{ fontSize: 13, minimap: { enabled: false }, scrollBeyondLastLine: false, fontFamily: "'Space Mono',monospace" }}
              />
            </div>

            {testResults.length > 0 && (
              <div style={{ background: '#0D0F14', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '12px 16px', maxHeight: 180, overflowY: 'auto' }} className="cc-scroll">
                <div style={{ fontSize: 12, color: '#6A6A6A', marginBottom: 8 }}>
                  Test Results — {testResults.filter(r => r.passed).length}/{testResults.length} passed
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {testResults.map((r, i) => (
                    <div key={i} style={{ background: r.passed ? '#052e1c' : '#2d0a0a', border: `1px solid ${r.passed ? '#20c99740' : '#ef444440'}`, borderRadius: 8, padding: '8px 12px', fontSize: 12, minWidth: 100 }}>
                      <div style={{ color: r.passed ? '#20c997' : '#ef4444', fontWeight: 700, marginBottom: 4 }}>
                        {r.passed ? '✓' : '✗'} TC {i + 1}
                      </div>
                      <div style={{ color: '#6A6A6A', fontSize: 11, fontFamily: "'Space Mono',monospace" }}>
                        Got: {r.actual?.slice(0, 20)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ padding: '12px 16px', background: '#0D0F14', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 10 }}>
              <button onClick={handleRun} disabled={running} style={{ ...S.btnGhost, flex: 1 }}>
                {running ? <><CircularProgress size={12} style={{ color: '#20c997' }} /> Running…</> : '▶ Run Tests'}
              </button>
              <button onClick={handleSubmit} disabled={submitted || running} style={{ ...S.btnPrimary, flex: 2, opacity: submitted ? 0.5 : 1 }}>
                {submitted ? '✓ Submitted' : '🚀 Submit'}
              </button>
            </div>
          </div>

          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 13, fontWeight: 600 }}>
              💬 Battle Chat
            </div>

            <div className="cc-scroll" style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {chatMessages.length === 0 && (
                <div style={{ textAlign: 'center', color: '#3a3d44', fontSize: 13, marginTop: 24 }}>No messages yet</div>
              )}
              {chatMessages.map((m, i) => (
                <div key={i}>
                  <div style={{ fontSize: 11, color: '#6A6A6A', marginBottom: 2 }}>{m.displayName}</div>
                  <div style={{ background: '#1A1D22', borderRadius: 8, padding: '8px 10px', fontSize: 13, color: '#ccc', lineHeight: 1.5 }}>
                    {m.message}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={sendChat} style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 8 }}>
              <input
                style={{ ...S.input, flex: 1, padding: '8px 12px', fontSize: 12 }}
                placeholder="Say something…"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                maxLength={300}
              />
              <button type="submit" style={{ ...S.btnPrimary, padding: '8px 14px', fontSize: 13 }}>→</button>
            </form>
          </div>
        </div>
      </div>
    </>
  );

  // VIEW: RESULT
  if (view === 'result') {
    const isWinner =
      (role === 'host' && battleResult?.winner === 'host') ||
      (role === 'guest' && battleResult?.winner === 'guest');
    const isDraw = battleResult?.winner === 'draw';
    const myRes = role === 'host' ? battleResult?.hostResult : battleResult?.guestResult;
    const oppRes = role === 'host' ? battleResult?.guestResult : battleResult?.hostResult;

    return (
      <>
        <Header />
        <div style={{ ...S.page, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: 24, gap: 32 }}>
          <div style={{ fontSize: 72 }}>{isDraw ? '🤝' : isWinner ? '🏆' : '😅'}</div>
          <h1 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 40, fontWeight: 800, textAlign: 'center' }}>
            {isDraw ? "It's a Draw!" : isWinner ? 'You Won! 🎉' : 'Better Luck Next Time!'}
          </h1>

          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { label: 'You', result: myRes, highlight: isWinner },
              { label: 'Opponent', result: oppRes, highlight: !isWinner && !isDraw },
            ].map(({ label, result, highlight }) => (
              <div key={label} style={{ ...S.card, minWidth: 200, textAlign: 'center', border: highlight ? '1px solid rgba(32,201,151,0.4)' : undefined }}>
                <div style={S.label}>{label}</div>
                <div style={{ fontSize: 36, fontWeight: 800, color: highlight ? '#20c997' : '#fff', fontFamily: "'Space Mono',monospace" }}>
                  {result?.passed ?? '—'}/{result?.total ?? '—'}
                </div>
                <div style={{ fontSize: 12, color: '#6A6A6A', marginTop: 4 }}>{result?.verdict || 'Pending'}</div>
                <div style={{ fontSize: 12, color: '#6A6A6A' }}>{result?.timeMs ? formatTime(result.timeMs) : ''}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <button style={S.btnPrimary} onClick={() => { socketRef.current?.disconnect(); setView('lobby'); setBattleResult(null); setSubmitted(false); setTestResults([]); }}>
              ⚔️ Battle Again
            </button>
            <button style={S.btnGhost} onClick={() => window.location.href = '/intellicode'}>
              Practice Solo →
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return null;
}
/**
 * CodeCast.jsx — Live 1v1 coding battle room
 *
 * Flow:
 *   Lobby → Create room (pick question) OR paste roomId to join
 *   Waiting room → opponent joins → Battle starts (Monaco + timer + live chat)
 *   Both submit → Winner announced
 */