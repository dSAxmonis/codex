// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import {
//   Button, Typography, Box, Tabs, Tab, TextField, CircularProgress,
//   Accordion, AccordionSummary, AccordionDetails, IconButton, MenuItem,
//   Select, useMediaQuery, Dialog, DialogTitle, DialogContent, Drawer, Modal, Card,
// } from '@mui/material';
// import { useTheme } from '@mui/material/styles';
// import { useParams, useNavigate } from 'react-router-dom';
// import {
//   CheckCircle, Cancel, ExpandMore, PlayArrow,
//   Close as CloseIcon, Visibility as VisibilityIcon,
//   VisibilityOff as VisibilityOffIcon,
//   ArrowBackIos as ArrowBackIosIcon,
//   ArrowForwardIos as ArrowForwardIosIcon,
//   Menu as MenuIcon,
// } from '@mui/icons-material';
// import MonacoEditor from '@monaco-editor/react';
// import debounce from 'lodash.debounce';
// import './Upsolve.css';
// import questions from '../data/question.json';
// import Footer from './Footer';
// import Header from './Header';
// import Loader2 from './Loader2';
// import Button1 from './Button1';
// import Tick from '../Utils/Tick';
// import HowTouseModal from '../Utils/HowtouseModal';
// import HowTouseModal1 from '../Utils/HowtouseModal1';
// import Premium from './Premium';
// import Add from './Add';
// import { useAuth } from '@clerk/clerk-react';
// import api from '../Utils/api';

// const API = process.env.REACT_APP_API_URL || 'https://codex-backend-psi.vercel.app';

// const boilerplate = {
//   cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}`,
//   python: `def solution():\n    pass\n\nif __name__ == "__main__":\n    solution()`,
//   java: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Your code here\n    }\n}`,
// };

// const monacoLang = { cpp: 'cpp', python: 'python', java: 'java' };
// const normalise = (s = '') => s.trim().replace(/\r\n/g, '\n').replace(/\s+/g, ' ').trim();

// const Upsolve = () => {
//   const { id }       = useParams();
//   const navigate     = useNavigate();
//   const { getToken } = useAuth();
//   const theme        = useTheme();
//   const isMobile     = useMediaQuery(theme.breakpoints.down('sm'));

//   // ── Find question (no early return yet!) ──────────────────────────────────
//   const selectedQuestion = questions.find(q => q.id === parseInt(id));

//   // ── ALL useState — before any return ─────────────────────────────────────
//   const [code,          setCode]          = useState(boilerplate.cpp);
//   const [language,      setLanguage]      = useState('cpp');
//   const [testCases,     setTestCases]     = useState(() =>
//     (selectedQuestion?.testCases || []).map(tc => ({ ...tc, actualOutput: '', tle: false }))
//   );
//   const [activeTestCase, setActiveTestCase] = useState(0);
//   const [testResults,   setTestResults]   = useState([]);
//   const [extraTestCases, setExtraTestCases] = useState(() =>
//     (selectedQuestion?.extraTestCases || []).map(tc => ({ ...tc, actualOutput: '', tle: false }))
//   );
//   const [loading,       setLoading]       = useState(false);
//   const [extraLoading,  setExtraLoading]  = useState(false);
//   const [runningAll,    setRunningAll]    = useState(false);
//   const [error,         setError]         = useState('');
//   const [solved,        setSolved]        = useState(false);
//   const [isFocusMode,   setIsFocusMode]   = useState(false);
//   const [open,          setOpen]          = useState(false);
//   const [isModalOpen,   setIsModalOpen]   = useState(false);
//   const [isDrawerOpen,  setIsDrawerOpen]  = useState(false);
//   const [submitModal,   setSubmitModal]   = useState(false);
//   const [submitResults, setSubmitResults] = useState([]);
//   const [submitPassed,  setSubmitPassed]  = useState(0);
//   const [isPremium,     setIsPremium]     = useState(false);
//   const [showTopics,    setShowTopics]    = useState(false);
//   const [solutionIndex, setSolutionIndex] = useState(0);
//   const [copied,        setCopied]        = useState(false);
//   const [isLoaded,      setIsLoaded]      = useState(false);
//   const [isLOADING,     SetIsLOADING]    = useState(true);
//   const [aiEnabled,     setAiEnabled]     = useState(false);
//   const [editorTheme,   setEditorTheme]   = useState('vs-dark');
//   const [fontSize,      setFontSize]      = useState(14);
//   const [leftWidth,     setLeftWidth]     = useState(42);  // percentage
//   const [isDragging,    setIsDragging]    = useState(false);

//   // ── ALL useRef — before any return ───────────────────────────────────────
//   const editorRef    = useRef(null);
//   const monacoRef    = useRef(null);
//   const dragRef      = useRef(null);
//   const containerRef = useRef(null);

//   // ── ALL useEffect — before any return ────────────────────────────────────
//   useEffect(() => {
//     if (!selectedQuestion) return;
//     const savedCodes = JSON.parse(localStorage.getItem('savedCodes') || '{}');
//     const savedLang  = localStorage.getItem('savedLanguage') || 'cpp';
//     setLanguage(savedLang);
//     setCode(savedCodes[selectedQuestion.id] || boilerplate[savedLang] || boilerplate.cpp);
//     setIsLoaded(true);
//     SetIsLOADING(false);
//   }, [selectedQuestion?.id]);

//   useEffect(() => {
//     if (!isLoaded || !selectedQuestion) return;
//     const savedCodes = JSON.parse(localStorage.getItem('savedCodes') || '{}');
//     savedCodes[selectedQuestion.id] = code;
//     localStorage.setItem('savedCodes', JSON.stringify(savedCodes));
//     localStorage.setItem('savedLanguage', language);
//   }, [code, language, selectedQuestion?.id, isLoaded]);

//   useEffect(() => {
//     if (!selectedQuestion) return;
//     const checkSolved = async () => {
//       try {
//         const token = await getToken();
//         if (!token) return;
//         const data = await api.progress.get(token);
//         const already = (data.solved || []).some(p => {
//           const qid = p.questionId?._id || p.questionId;
//           return String(qid) === String(selectedQuestion.id) ||
//                  (p.questionId?.name === selectedQuestion.name);
//         });
//         if (already) setSolved(true);
//       } catch {}
//     };
//     checkSolved();
//   }, [selectedQuestion?.id]);

//   useEffect(() => {
//     setTestResults(prev => {
//       const next = Array(testCases.length).fill(null);
//       prev.forEach((v, i) => { if (i < next.length) next[i] = v; });
//       return next;
//     });
//   }, [testCases.length]);

//   // ── Resizable panel drag handler ────────────────────────────────────────
//   useEffect(() => {
//     const handleMouseMove = (e) => {
//       if (!isDragging || !containerRef.current) return;
//       const rect = containerRef.current.getBoundingClientRect();
//       const newWidth = ((e.clientX - rect.left) / rect.width) * 100;
//       setLeftWidth(Math.min(Math.max(newWidth, 25), 65));
//     };
//     const handleMouseUp = () => setIsDragging(false);
//     if (isDragging) {
//       document.addEventListener('mousemove', handleMouseMove);
//       document.addEventListener('mouseup', handleMouseUp);
//     }
//     return () => {
//       document.removeEventListener('mousemove', handleMouseMove);
//       document.removeEventListener('mouseup', handleMouseUp);
//     };
//   }, [isDragging]);

//   // ── ALL useCallback — before any return ──────────────────────────────────
//   const generateAI = useCallback(
//     debounce(async (currentCode) => {
//       if (!aiEnabled) return;
//       try {
//         const res = await fetch(
//           'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyAL0n5l4b8ih9WBFELTt9n0Ewro2DlMsDY',
//           {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ contents: [{ parts: [{ text: `Complete this ${language} code without any explanation or markdown: ${currentCode}` }] }] }),
//           }
//         );
//         if (!res.ok) return;
//         const data = await res.json();
//         const gen  = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
//         if (gen && editorRef.current) {
//           editorRef.current.setValue(gen);
//           setCode(gen);
//         }
//       } catch {}
//     }, 800),
//     [aiEnabled, language]
//   );

//   // ── GUARD — after ALL hooks ───────────────────────────────────────────────
//   if (!selectedQuestion) {
//     return (
//       <div style={{ background: '#080B0F', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
//         <Header />
//         <div style={{ color: '#fff', fontFamily: 'DM Sans', fontSize: 20, marginTop: 80 }}>Question not found.</div>
//         <button onClick={() => navigate('/intellicode')} style={{ padding: '10px 20px', background: 'rgba(32,201,151,0.1)', border: '1px solid rgba(32,201,151,0.25)', borderRadius: 8, color: '#20c997', cursor: 'pointer', fontFamily: 'DM Sans' }}>← Back to IntelliCode</button>
//       </div>
//     );
//   }

//   // ── Helper functions (regular functions, not hooks, so fine after guard) ──
//   const executeCode = async (input, timeoutMs = 10000) => {
//     const controller = new AbortController();
//     const timer      = setTimeout(() => controller.abort(), timeoutMs);
//     try {
//       const res = await fetch(`${API}/api/execute`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ code, language, input }),
//         signal: controller.signal,
//       });
//       clearTimeout(timer);
//       const data = await res.json();
//       return data;
//     } catch (err) {
//       clearTimeout(timer);
//       if (err.name === 'AbortError') return { error: 'Time Limit Exceeded' };
//       return { error: err.message || 'Network error' };
//     }
//   };

//   const saveSubmission = async (verdict, output = '') => {
//     try {
//       const token = await getToken();
//       if (!token) return;
//       await api.submissions.create(token, {
//         questionId: selectedQuestion._id || String(selectedQuestion.id),
//         language, code, verdict, output,
//       });
//     } catch {}
//   };

//   const markSolved = async () => {
//     try {
//       const token = await getToken();
//       if (!token) return;
//       await api.progress.mark(token, selectedQuestion._id || String(selectedQuestion.id));
//       setSolved(true);
//     } catch {}
//   };

//   const handleRunCode = async (index, caseSet = 'main') => {
//     setError('');
//     const cases = caseSet === 'extra' ? extraTestCases : testCases;
//     caseSet === 'extra' ? setExtraLoading(true) : setLoading(true);
//     const result = await executeCode(cases[index].input);
//     if (result.error) {
//       setError(result.error);
//       const verdict = result.error === 'Time Limit Exceeded' ? 'TLE' : 'CE';
//       if (caseSet === 'main') {
//         const updated = [...testCases];
//         updated[index] = { ...updated[index], tle: verdict === 'TLE', actualOutput: '' };
//         setTestCases(updated);
//       } else {
//         const updated = [...extraTestCases];
//         updated[index] = { ...updated[index], tle: verdict === 'TLE', actualOutput: '' };
//         setExtraTestCases(updated);
//       }
//       await saveSubmission(verdict, result.error);
//     } else {
//       const actualOutput = (result.output || '').trim();
//       const passed       = normalise(actualOutput) === normalise(cases[index].output || '');
//       if (caseSet === 'main') {
//         const updated = [...testCases];
//         updated[index] = { ...updated[index], actualOutput, tle: false };
//         setTestCases(updated);
//         const results = [...testResults];
//         results[index] = passed;
//         setTestResults(results);
//       } else {
//         const updated = [...extraTestCases];
//         updated[index] = { ...updated[index], actualOutput, tle: false };
//         setExtraTestCases(updated);
//       }
//       setError('');
//       await saveSubmission(passed ? 'AC' : 'WA', actualOutput);
//       if (passed && !solved) await markSolved();
//     }
//     caseSet === 'extra' ? setExtraLoading(false) : setLoading(false);
//   };

//   const handleSubmit = async () => {
//     setSubmitModal(true);
//     setSubmitResults([]);
//     setSubmitPassed(0);
//     setRunningAll(true);
//     const allCases = testCases;
//     const results  = [];
//     let passed     = 0;
//     for (let i = 0; i < allCases.length; i++) {
//       const result = await executeCode(allCases[i].input);
//       let status   = 'WA';
//       if (result.error) {
//         status = result.error === 'Time Limit Exceeded' ? 'TLE' : 'CE';
//       } else {
//         const actual   = (result.output || '').trim();
//         const expected = (allCases[i].output || '').trim();
//         if (normalise(actual) === normalise(expected)) { status = 'AC'; passed++; }
//       }
//       results.push({ status, input: allCases[i].input, expected: allCases[i].output, actual: result.output || result.error || '' });
//       setSubmitResults([...results]);
//       setSubmitPassed(passed);
//     }
//     const allPassed = passed === allCases.length;
//     await saveSubmission(allPassed ? 'AC' : 'WA', `${passed}/${allCases.length} passed`);
//     if (allPassed && !solved) await markSolved();
//     setRunningAll(false);
//   };

//   const handleSaveCode = () => {
//     const ext      = language === 'python' ? 'py' : language === 'java' ? 'java' : 'cpp';
//     const fileName = `${selectedQuestion.name.trim().replace(/\s+/g, '_')}.${ext}`;
//     const blob     = new Blob([code], { type: 'text/plain' });
//     const url      = URL.createObjectURL(blob);
//     const a        = document.createElement('a');
//     a.href = url; a.download = fileName;
//     document.body.appendChild(a); a.click();
//     document.body.removeChild(a);
//     URL.revokeObjectURL(url);
//   };

//   const handleLanguageChange = (e) => {
//     const lang = e.target.value;
//     if (window.confirm(`Changing language to ${lang.toUpperCase()} will clear your current code. Continue?`)) {
//       setLanguage(lang);
//       setCode(boilerplate[lang]);
//       if (editorRef.current) editorRef.current.setValue(boilerplate[lang]);
//     }
//   };

//   const addTestCase = () => {
//     setTestCases(prev => [...prev, { input: '', output: '', actualOutput: '', tle: false }]);
//     setActiveTestCase(testCases.length);
//   };

//   const deleteLastTestCase = () => {
//     if (testCases.length === 1) { alert('Cannot delete the last test case.'); return; }
//     setTestCases(prev => prev.slice(0, -1));
//     setActiveTestCase(prev => Math.min(prev, testCases.length - 2));
//   };

//   const updateTestCase = (index, field, value) => {
//     setTestCases(prev => {
//       const updated = [...prev];
//       updated[index] = { ...updated[index], [field]: value };
//       return updated;
//     });
//   };

//   const handleEditorMount = (editor, monaco) => {
//     editorRef.current = editor;
//     monacoRef.current = monaco;
//   };

//   const insertText = (symbol) => {
//     if (!editorRef.current || !monacoRef.current) return;
//     const editor   = editorRef.current;
//     const monaco   = monacoRef.current;
//     const position = editor.getPosition();
//     const range    = new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column);
//     editor.executeEdits('', [{ range, text: symbol, forceMoveMarkers: true }]);
//     editor.setPosition({ lineNumber: position.lineNumber, column: position.column + symbol.length });
//     editor.focus();
//   };

//   const handleEditorChangeWithAI = (value, event) => {
//     setCode(value || '');
//     if (aiEnabled && event?.changes?.[0]?.text === ';') generateAI(value);
//   };

//   const handleClickOpen = () => {
//     setOpen(true);
//     document.getElementById('main-content')?.classList.add('blur-sm');
//   };
//   const handleClose = () => {
//     setOpen(false);
//     document.getElementById('main-content')?.classList.remove('blur-sm');
//   };

//   //const solutions = selectedQuestion.solution || [];

//   // ── JSX — unchanged from your original ───────────────────────────────────
//   const editorBg = editorTheme === 'vs-dark' ? '#1e1e1e' : '#ffffff';
//   const panelBg  = editorTheme === 'vs-dark' ? '#0D1117' : '#f8f9fa';
//   const borderC  = editorTheme === 'vs-dark' ? 'rgba(255,255,255,0.08)' : '#e0e0e0';
//   const textC    = editorTheme === 'vs-dark' ? '#ccc' : '#333';
//   const solutions = selectedQuestion.solution || [];

//   return (
//     <>
//       <style>{`
//         .upsolve-root { font-family: 'DM Sans', sans-serif; }
//         .upsolve-root * { box-sizing: border-box; }
//         .panel-divider { width: 4px; background: ${borderC}; cursor: col-resize; flex-shrink: 0; transition: background .2s; position: relative; }
//         .panel-divider:hover, .panel-divider.dragging { background: #20c997; }
//         .panel-divider::after { content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 2px; height: 40px; background: rgba(255,255,255,0.2); border-radius: 2px; }
//         .tc-tab { padding: 6px 14px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; border: none; transition: all .15s; }
//         .tc-tab.active { background: rgba(32,201,151,0.15); color: #20c997; }
//         .tc-tab:not(.active) { background: transparent; color: #6A6A6A; }
//         .tc-tab:not(.active):hover { background: rgba(255,255,255,0.05); color: #ccc; }
//         .run-btn { background: #20c997; color: #000; border: none; border-radius: 8px; padding: 8px 20px; font-weight: 700; cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 6px; transition: opacity .2s; }
//         .run-btn:hover { opacity: .85; }
//         .run-btn:disabled { opacity: .5; cursor: not-allowed; }
//         .submit-btn { background: linear-gradient(135deg,#16a34a,#20c997); color: #fff; border: none; border-radius: 8px; padding: 8px 24px; font-weight: 700; cursor: pointer; font-size: 14px; transition: opacity .2s; }
//         .submit-btn:hover { opacity: .85; }
//         .submit-btn:disabled { opacity: .5; cursor: not-allowed; }
//         .toolbar-btn { background: rgba(255,255,255,0.06); border: 1px solid ${borderC}; border-radius: 6px; padding: 5px 10px; color: ${textC}; cursor: pointer; font-size: 12px; font-weight: 600; transition: all .15s; }
//         .toolbar-btn:hover { border-color: #20c997; color: #20c997; }
//         .toolbar-btn.active { border-color: #20c997; color: #20c997; background: rgba(32,201,151,0.1); }
//         .sym-btn { background: rgba(255,255,255,0.05); border: 1px solid ${borderC}; border-radius: 4px; padding: 3px 8px; color: #8C8C8C; cursor: pointer; font-family: 'Space Mono', monospace; font-size: 11px; transition: all .15s; }
//         .sym-btn:hover { border-color: #20c997; color: #20c997; background: rgba(32,201,151,0.08); }
//       `}</style>

//       <div className="upsolve-root" style={{ background: editorTheme === 'vs-dark' ? '#080B0F' : '#f0f2f5', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
//         <Header />
//         <HowTouseModal1 isModalOpen={isModalOpen} closeModal={() => setIsModalOpen(false)} />

//         {isLOADING ? (
//           <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 /></div>
//         ) : (
//           <div ref={containerRef} style={{ display: 'flex', flex: 1, height: 'calc(100vh - 64px)', overflow: 'hidden', userSelect: isDragging ? 'none' : 'auto' }}>

//             {/* ── LEFT PANEL: Problem Description ───────────────────────── */}
//             <div style={{ width: `${leftWidth}%`, minWidth: 280, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: panelBg, borderRight: `1px solid ${borderC}` }}>
//               {/* Problem header */}
//               <div style={{ padding: '16px 20px', borderBottom: `1px solid ${borderC}`, flexShrink: 0 }}>
//                 <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 18, fontWeight: 800, margin: '0 0 8px', background: 'linear-gradient(to right, #007BFF, #20c997)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
//                   {selectedQuestion.name}
//                 </h2>
//                 <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
//                   <span style={{ padding: '2px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700,
//                     color: selectedQuestion.difficulty === 'Easy' ? '#20c997' : selectedQuestion.difficulty === 'Hard' ? '#ef4444' : '#f59e0b',
//                     background: selectedQuestion.difficulty === 'Easy' ? 'rgba(32,201,151,0.1)' : selectedQuestion.difficulty === 'Hard' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)' }}>
//                     {selectedQuestion.difficulty}
//                   </span>
//                   <span style={{ padding: '2px 10px', borderRadius: 6, fontSize: 12, background: 'rgba(0,123,255,0.1)', color: '#007BFF' }}>★ {selectedQuestion.rating}</span>
//                   {solved && <span style={{ padding: '2px 10px', borderRadius: 6, fontSize: 12, background: 'rgba(32,201,151,0.1)', color: '#20c997', fontWeight: 700 }}>✓ Solved</span>}
//                 </div>
//                 <div style={{ marginTop: 8, fontSize: 13, color: textC, display: 'flex', alignItems: 'center', gap: 6 }}>
//                   <span style={{ color: '#6A6A6A' }}>Topics:</span>
//                   {showTopics ? selectedQuestion.topics?.join(', ') : '••••••'}
//                   <button onClick={() => setShowTopics(!showTopics)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6A6A6A', fontSize: 12, padding: 2 }}>
//                     {showTopics ? '👁' : '🔒'}
//                   </button>
//                 </div>
//                 <div style={{ fontSize: 13, color: '#6A6A6A', marginTop: 4 }}>
//                   <span style={{ color: '#6A6A6A' }}>Company: </span><span style={{ color: textC }}>{selectedQuestion.company}</span>
//                 </div>
//               </div>

//               {/* Problem content - scrollable */}
//               <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
//                 {[
//                   { title: 'Description',          content: selectedQuestion.question_description },
//                   { title: 'Function Description', content: selectedQuestion.function_description },
//                   { title: 'Input Format',         content: selectedQuestion.input_format },
//                   { title: 'Output Format',        content: selectedQuestion.output_format },
//                   { title: 'Constraints',          content: selectedQuestion.constraints },
//                 ].filter(s => s.content).map((s, i) => (
//                   <div key={i} style={{ marginBottom: 16 }}>
//                     <div style={{ fontSize: 13, fontWeight: 700, color: '#20c997', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' }}>{s.title}</div>
//                     <div style={{ fontSize: 14, color: textC, whiteSpace: 'pre-line', lineHeight: 1.7 }}>{s.content}</div>
//                   </div>
//                 ))}

//                 {selectedQuestion.examples?.length > 0 && (
//                   <div style={{ marginBottom: 16 }}>
//                     <div style={{ fontSize: 13, fontWeight: 700, color: '#20c997', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.06em' }}>Examples</div>
//                     {selectedQuestion.examples.map((ex, i) => (
//                       <div key={i} style={{ background: editorTheme === 'vs-dark' ? '#161B22' : '#fff', border: `1px solid ${borderC}`, borderRadius: 8, padding: 12, marginBottom: 8, fontFamily: "'Space Mono', monospace", fontSize: 12 }}>
//                         <div style={{ color: '#6A6A6A', marginBottom: 4 }}><span style={{ color: '#20c997' }}>Input:</span> <span style={{ color: textC }}>{ex.input}</span></div>
//                         <div style={{ color: '#6A6A6A' }}><span style={{ color: '#20c997' }}>Output:</span> <span style={{ color: textC }}>{ex.output}</span></div>
//                         {ex.explanation && <div style={{ color: '#6A6A6A', marginTop: 4, fontSize: 11 }}>{ex.explanation}</div>}
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               {/* Solution button at bottom */}
//               {solutions.length > 0 && (
//                 <div style={{ padding: '12px 20px', borderTop: `1px solid ${borderC}`, flexShrink: 0 }}>
//                   <button className="toolbar-btn" style={{ width: '100%', textAlign: 'center', padding: '8px' }} onClick={handleClickOpen}>
//                     💡 View Solution
//                   </button>
//                 </div>
//               )}
//             </div>

//             {/* ── DIVIDER ────────────────────────────────────────────────── */}
//             <div
//               className={`panel-divider${isDragging ? ' dragging' : ''}`}
//               onMouseDown={() => setIsDragging(true)}
//             />

//             {/* ── RIGHT PANEL: Editor + Test Cases ──────────────────────── */}
//             <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: editorTheme === 'vs-dark' ? '#0D1117' : '#fff' }}>

//               {/* Editor Toolbar */}
//               <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderBottom: `1px solid ${borderC}`, flexShrink: 0, flexWrap: 'wrap' }}>
//                 {/* Language selector */}
//                 <select
//                   value={language}
//                   onChange={handleLanguageChange}
//                   style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${borderC}`, borderRadius: 6, padding: '4px 10px', color: textC, fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
//                   <option value="cpp">C++</option>
//                   <option value="python">Python</option>
//                   <option value="java">Java</option>
//                 </select>

//                 {/* Font size */}
//                 <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
//                   <button className="toolbar-btn" onClick={() => setFontSize(f => Math.max(10, f-1))} style={{ padding: '4px 8px' }}>A-</button>
//                   <span style={{ fontSize: 12, color: textC, minWidth: 24, textAlign: 'center' }}>{fontSize}</span>
//                   <button className="toolbar-btn" onClick={() => setFontSize(f => Math.min(24, f+1))} style={{ padding: '4px 8px' }}>A+</button>
//                 </div>

//                 {/* Theme toggle */}
//                 <button
//                   className={`toolbar-btn ${editorTheme === 'vs-dark' ? 'active' : ''}`}
//                   onClick={() => setEditorTheme(t => t === 'vs-dark' ? 'vs-light' : 'vs-dark')}>
//                   {editorTheme === 'vs-dark' ? '🌙 Dark' : '☀️ Light'}
//                 </button>

//                 {/* Focus mode */}
//                 <button className="toolbar-btn" onClick={() => setIsFocusMode(f => !f)}>
//                   {isFocusMode ? '⊡ Exit Focus' : '⊞ Focus'}
//                 </button>

//                 {/* How to use */}
//                 <button className="toolbar-btn" onClick={() => setIsModalOpen(true)}>? How to Use</button>

//                 {/* Save code */}
//                 <button className="toolbar-btn active" onClick={handleSaveCode} style={{ marginLeft: 'auto' }}>
//                   💾 Save
//                 </button>

//                 {/* AI toggle */}
//                 <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: textC }}>
//                   <span>AI</span>
//                   <div
//                     onClick={() => setAiEnabled(p => !p)}
//                     style={{ width: 36, height: 20, borderRadius: 10, background: aiEnabled ? '#20c997' : '#444', cursor: 'pointer', position: 'relative', transition: 'background .2s' }}>
//                     <div style={{ position: 'absolute', top: 2, left: aiEnabled ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left .2s' }} />
//                   </div>
//                 </div>
//               </div>

//               {/* Symbol shortcuts */}
//               <div style={{ display: 'flex', gap: 4, padding: '6px 14px', borderBottom: `1px solid ${borderC}`, flexShrink: 0, flexWrap: 'wrap', background: editorTheme === 'vs-dark' ? '#080B0F' : '#f5f5f5' }}>
//                 {['{}', '()', '[]', 'if', 'else', 'for', 'while', '<int>', 'vector', 'cin', 'cout', '<<', '>>', ';'].map((sym, i) => (
//                   <button key={i} className="sym-btn" onClick={() => insertText(sym)}>{sym}</button>
//                 ))}
//               </div>

//               {/* Monaco Editor */}
//               <div style={{ flex: 1, overflow: 'hidden', minHeight: 200 }}>
//                 {!isLoaded ? (
//                   <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: editorBg }}>
//                     <CircularProgress sx={{ color: '#20c997' }} />
//                   </div>
//                 ) : (
//                   <MonacoEditor
//                     height="100%"
//                     language={monacoLang[language]}
//                     theme={editorTheme}
//                     value={code}
//                     onChange={handleEditorChangeWithAI}
//                     onMount={handleEditorMount}
//                     options={{
//                       fontFamily: 'JetBrains Mono, Fira Code, Courier New, monospace',
//                       fontSize: fontSize,
//                       minimap: { enabled: false },
//                       scrollBeyondLastLine: false,
//                       automaticLayout: true,
//                       lineNumbers: 'on',
//                       renderLineHighlight: 'line',
//                       cursorBlinking: 'smooth',
//                       smoothScrolling: true,
//                       padding: { top: 12 },
//                       folding: true,
//                       wordWrap: 'off',
//                       tabSize: 2,
//                     }}
//                   />
//                 )}
//               </div>

//               {/* Test cases panel */}
//               <div style={{ borderTop: `1px solid ${borderC}`, flexShrink: 0, background: panelBg, maxHeight: 280, overflow: 'auto' }}>
//                 {/* TC header */}
//                 <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderBottom: `1px solid ${borderC}`, flexWrap: 'wrap' }}>
//                   <div style={{ display: 'flex', gap: 4, flex: 1, flexWrap: 'wrap' }}>
//                     {testCases.map((_, i) => (
//                       <button
//                         key={i}
//                         className={`tc-tab${activeTestCase === i ? ' active' : ''}`}
//                         onClick={() => setActiveTestCase(i)}>
//                         {testResults[i] === true && '✅ '}
//                         {testResults[i] === false && '❌ '}
//                         Case {i+1}
//                       </button>
//                     ))}
//                     <button className="tc-tab" onClick={addTestCase} style={{ color: '#20c997' }}>+ Add</button>
//                     <button className="tc-tab" onClick={deleteLastTestCase} style={{ color: '#ef4444' }}>✕ Del</button>
//                   </div>

//                   {/* Run + Submit */}
//                   <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
//                     <button className="run-btn" onClick={() => handleRunCode(activeTestCase, 'main')} disabled={loading}>
//                       {loading ? <CircularProgress size={16} color="inherit" /> : '▶ Run'}
//                     </button>
//                     <button className="submit-btn" onClick={handleSubmit} disabled={runningAll}>
//                       {runningAll ? <CircularProgress size={16} color="inherit" /> : '🚀 Submit'}
//                     </button>
//                   </div>
//                 </div>

//                 {/* TC content */}
//                 {testCases[activeTestCase] && (
//                   <div style={{ padding: '12px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
//                     {[
//                       { label: 'Input', value: testCases[activeTestCase].input, editable: true, field: 'input' },
//                       { label: 'Expected Output', value: testCases[activeTestCase].output || '', editable: true, field: 'output' },
//                       { label: 'Your Output', value: testCases[activeTestCase].tle ? '⏱ TLE' : (testCases[activeTestCase].actualOutput || '—'), editable: false, field: null },
//                     ].map((col, ci) => (
//                       <div key={ci}>
//                         <div style={{ fontSize: 11, color: '#6A6A6A', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.06em' }}>{col.label}</div>
//                         <textarea
//                           rows={3}
//                           readOnly={!col.editable}
//                           value={col.value}
//                           onChange={col.editable ? e => updateTestCase(activeTestCase, col.field, e.target.value) : undefined}
//                           style={{
//                             width: '100%', background: editorTheme === 'vs-dark' ? '#161B22' : '#fff',
//                             border: `1px solid ${borderC}`, borderRadius: 6, padding: '6px 8px',
//                             color: col.field === null && testCases[activeTestCase].actualOutput && !testCases[activeTestCase].tle
//                               ? (normalise(testCases[activeTestCase].actualOutput) === normalise(testCases[activeTestCase].output) ? '#20c997' : '#ef4444')
//                               : textC,
//                             fontFamily: "'Space Mono', monospace", fontSize: 12, resize: 'none', outline: 'none',
//                           }}
//                         />
//                         {col.field === null && testCases[activeTestCase].actualOutput && !testCases[activeTestCase].tle && (
//                           <div style={{ fontSize: 11, fontWeight: 700, marginTop: 2,
//                             color: normalise(testCases[activeTestCase].actualOutput) === normalise(testCases[activeTestCase].output) ? '#20c997' : '#ef4444' }}>
//                             {normalise(testCases[activeTestCase].actualOutput) === normalise(testCases[activeTestCase].output) ? '✅ Correct' : '❌ Wrong'}
//                           </div>
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                 )}

//                 {error && (
//                   <div style={{ margin: '0 14px 12px', padding: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, color: '#ef4444', fontFamily: "'Space Mono', monospace", fontSize: 12, whiteSpace: 'pre-wrap' }}>
//                     {error}
//                   </div>
//                 )}

//                 <div style={{ padding: '4px 14px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
//                   <Tick />
//                   <span style={{ fontSize: 11, color: '#6A6A6A' }}>Code auto-saved locally</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Solution Dialog */}
//         <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth PaperProps={{ style: { background: '#0D1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16 } }}>
//           <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
//             <span>💡 Accepted Solution</span>
//             <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
//               <IconButton onClick={() => setSolutionIndex(i => Math.max(0, i-1))} disabled={solutionIndex === 0} sx={{ color: '#fff' }}><ArrowBackIosIcon fontSize="small" /></IconButton>
//               <Typography variant="caption" sx={{ color: '#6A6A6A' }}>{solutionIndex + 1} / {solutions.length}</Typography>
//               <IconButton onClick={() => setSolutionIndex(i => Math.min(solutions.length-1, i+1))} disabled={solutionIndex >= solutions.length-1} sx={{ color: '#fff' }}><ArrowForwardIosIcon fontSize="small" /></IconButton>
//               <Button size="small" variant="outlined" color="error" onClick={handleClose}>Close</Button>
//             </Box>
//           </DialogTitle>
//           <DialogContent>
//             <Box sx={{ position: 'relative' }}>
//               <Button size="small" variant="outlined" sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1, color: '#20c997', borderColor: '#20c997' }}
//                 onClick={() => { navigator.clipboard.writeText(solutions[solutionIndex] || ''); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
//                 {copied ? '✓ Copied' : 'Copy'}
//               </Button>
//               <Box sx={{ background: '#1e1e1e', borderRadius: 2, p: 2, maxHeight: 420, overflowY: 'auto', fontFamily: 'monospace', fontSize: 13, color: '#d4d4d4', whiteSpace: 'pre-wrap', mt: 1 }}>
//                 {solutions[solutionIndex] || 'No solution available.'}
//               </Box>
//             </Box>
//             <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
//               <Button variant="contained" size="small" sx={{ background: 'rgba(32,201,151,0.2)', color: '#20c997' }} onMouseEnter={e => e.target.textContent = selectedQuestion.time_complexity || 'N/A'} onMouseLeave={e => e.target.textContent = 'TC'}>TC</Button>
//               <Button variant="contained" size="small" sx={{ background: 'rgba(0,123,255,0.2)', color: '#007BFF' }} onMouseEnter={e => e.target.textContent = selectedQuestion.space_complexity || 'N/A'} onMouseLeave={e => e.target.textContent = 'SC'}>SC</Button>
//             </Box>
//           </DialogContent>
//         </Dialog>

//         {/* Submit Modal */}
//         <Modal open={submitModal} onClose={() => !runningAll && setSubmitModal(false)}>
//           <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '90%', maxWidth: 600, background: '#0D1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, p: 3, maxHeight: '80vh', overflowY: 'auto', boxShadow: 24 }}>
//             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
//               <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff', fontFamily: "'Bricolage Grotesque', sans-serif" }}>Submission Results</Typography>
//               {!runningAll && <IconButton onClick={() => setSubmitModal(false)} sx={{ color: '#fff' }}><CloseIcon /></IconButton>}
//             </Box>
//             {runningAll && submitResults.length === 0 && (
//               <Box sx={{ textAlign: 'center', py: 4 }}>
//                 <CircularProgress sx={{ color: '#20c997' }} />
//                 <Typography sx={{ mt: 2, color: '#666' }}>Running test cases...</Typography>
//               </Box>
//             )}
//             {submitResults.length > 0 && (
//               <>
//                 <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
//                   {submitResults.map((r, i) => (
//                     <Box key={i} sx={{ px: 2, py: 1, borderRadius: 2, textAlign: 'center', minWidth: 80,
//                       background: r.status === 'AC' ? 'rgba(32,201,151,0.15)' : r.status === 'TLE' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
//                       color: r.status === 'AC' ? '#20c997' : r.status === 'TLE' ? '#f59e0b' : '#ef4444',
//                       fontWeight: 700, fontSize: 13, border: `1px solid ${r.status === 'AC' ? 'rgba(32,201,151,0.3)' : r.status === 'TLE' ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
//                       <div style={{ fontSize: 11, opacity: .7 }}>Case {i+1}</div><div>{r.status}</div>
//                     </Box>
//                   ))}
//                 </Box>
//                 <Typography variant="h5" sx={{ textAlign: 'center', color: submitPassed === testCases.length ? '#20c997' : '#ef4444', fontWeight: 800, mb: 2, fontFamily: "'Bricolage Grotesque', sans-serif" }}>
//                   {submitPassed === testCases.length ? '🎉 All Passed!' : `${submitPassed} / ${testCases.length} Passed`}
//                 </Typography>
//                 {submitResults.map((r, i) => (
//                   <Box key={i} sx={{ mb: 1.5, p: 1.5, border: `1px solid ${r.status === 'AC' ? 'rgba(32,201,151,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: 2, background: r.status === 'AC' ? 'rgba(32,201,151,0.05)' : 'rgba(239,68,68,0.05)' }}>
//                     <Typography variant="body2" sx={{ fontWeight: 700, color: r.status === 'AC' ? '#20c997' : '#ef4444' }}>Case {i+1}: {r.status}</Typography>
//                     <Typography variant="caption" sx={{ fontFamily: 'monospace', display: 'block', color: '#8C8C8C' }}>Input: {r.input}</Typography>
//                     <Typography variant="caption" sx={{ fontFamily: 'monospace', display: 'block', color: '#8C8C8C' }}>Expected: {r.expected}</Typography>
//                     {r.status !== 'AC' && <Typography variant="caption" sx={{ fontFamily: 'monospace', display: 'block', color: '#ef4444' }}>Got: {r.actual}</Typography>}
//                   </Box>
//                 ))}
//                 {solved && submitPassed === testCases.length && (
//                   <Box sx={{ textAlign: 'center', mt: 2, p: 2, background: 'rgba(32,201,151,0.1)', borderRadius: 2, border: '1px solid rgba(32,201,151,0.3)' }}>
//                     <Typography sx={{ color: '#20c997', fontWeight: 700 }}>✓ Marked as Solved in your profile!</Typography>
//                   </Box>
//                 )}
//               </>
//             )}
//           </Box>
//         </Modal>

//         <Footer />
//       </div>
//     </>
//   );
// };



// export default Upsolve;



import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Button, Typography, Box, Tabs, Tab, TextField, CircularProgress,
  Accordion, AccordionSummary, AccordionDetails, IconButton, MenuItem,
  Select, useMediaQuery, Dialog, DialogTitle, DialogContent, Drawer, Modal, Card,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle, Cancel, ExpandMore, PlayArrow,
  Close as CloseIcon, Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ArrowBackIos as ArrowBackIosIcon,
  ArrowForwardIos as ArrowForwardIosIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import MonacoEditor from '@monaco-editor/react';
import debounce from 'lodash.debounce';
import './Upsolve.css';
import questions from '../data/question.json';
import Header from './Header';
import Loader2 from './Loader2';
import Button1 from './Button1';
import Tick from '../Utils/Tick';
import HowTouseModal from '../Utils/HowtouseModal';
import HowTouseModal1 from '../Utils/HowtouseModal1';
import Premium from './Premium';
import Add from './Add';
import { useAuth } from '@clerk/clerk-react';
import api from '../Utils/api';

const API = process.env.REACT_APP_API_URL || 'https://codex-backend-psi.vercel.app';

const boilerplate = {
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}`,
  python: `def solution():\n    pass\n\nif __name__ == "__main__":\n    solution()`,
  java: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Your code here\n    }\n}`,
};

const monacoLang = { cpp: 'cpp', python: 'python', java: 'java' };
const normalise = (s = '') => s.trim().replace(/\r\n/g, '\n').replace(/\s+/g, ' ').trim();

const Upsolve = () => {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { getToken } = useAuth();
  const theme        = useTheme();
  const isMobile     = useMediaQuery(theme.breakpoints.down('sm'));

  // ── Find question (no early return yet!) ──────────────────────────────────
  const selectedQuestion = questions.find(q => q.id === parseInt(id));

  // ── ALL useState — before any return ─────────────────────────────────────
  const [code,          setCode]          = useState(boilerplate.cpp);
  const [language,      setLanguage]      = useState('cpp');
  const [testCases,     setTestCases]     = useState(() =>
    (selectedQuestion?.testCases || []).map(tc => ({ ...tc, actualOutput: '', tle: false }))
  );
  const [activeTestCase, setActiveTestCase] = useState(0);
  const [testResults,   setTestResults]   = useState([]);
  const [extraTestCases, setExtraTestCases] = useState(() =>
    (selectedQuestion?.extraTestCases || []).map(tc => ({ ...tc, actualOutput: '', tle: false }))
  );
  const [loading,       setLoading]       = useState(false);
  const [extraLoading,  setExtraLoading]  = useState(false);
  const [runningAll,    setRunningAll]    = useState(false);
  const [error,         setError]         = useState('');
  const [solved,        setSolved]        = useState(false);
  const [isFocusMode,   setIsFocusMode]   = useState(false);
  const [open,          setOpen]          = useState(false);
  const [isModalOpen,   setIsModalOpen]   = useState(false);
  const [isDrawerOpen,  setIsDrawerOpen]  = useState(false);
  const [submitModal,   setSubmitModal]   = useState(false);
  const [submitResults, setSubmitResults] = useState([]);
  const [submitPassed,  setSubmitPassed]  = useState(0);
  const [isPremium,     setIsPremium]     = useState(false);
  const [showTopics,    setShowTopics]    = useState(false);
  const [solutionIndex, setSolutionIndex] = useState(0);
  const [copied,        setCopied]        = useState(false);
  const [isLoaded,      setIsLoaded]      = useState(false);
  const [isLOADING,     SetIsLOADING]    = useState(true);
  const [aiEnabled,     setAiEnabled]     = useState(false);
  const [editorTheme,   setEditorTheme]   = useState('vs-dark');
  const [fontSize,      setFontSize]      = useState(14);
  const [leftWidth,     setLeftWidth]     = useState(42);  // percentage
  const [isDragging,    setIsDragging]    = useState(false);

  // ── ALL useRef — before any return ───────────────────────────────────────
  const editorRef    = useRef(null);
  const monacoRef    = useRef(null);
  const dragRef      = useRef(null);
  const containerRef = useRef(null);

  // ── ALL useEffect — before any return ────────────────────────────────────
  useEffect(() => {
    if (!selectedQuestion) return;
    const savedCodes = JSON.parse(localStorage.getItem('savedCodes') || '{}');
    const savedLang  = localStorage.getItem('savedLanguage') || 'cpp';
    setLanguage(savedLang);
    setCode(savedCodes[selectedQuestion.id] || boilerplate[savedLang] || boilerplate.cpp);
    setIsLoaded(true);
    SetIsLOADING(false);
  }, [selectedQuestion?.id]);

  useEffect(() => {
    if (!isLoaded || !selectedQuestion) return;
    const savedCodes = JSON.parse(localStorage.getItem('savedCodes') || '{}');
    savedCodes[selectedQuestion.id] = code;
    localStorage.setItem('savedCodes', JSON.stringify(savedCodes));
    localStorage.setItem('savedLanguage', language);
  }, [code, language, selectedQuestion?.id, isLoaded]);

  useEffect(() => {
    if (!selectedQuestion) return;
    const checkSolved = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const data = await api.progress.get(token);
        const already = (data.solved || []).some(p => {
          const qid = p.questionId?._id || p.questionId;
          return String(qid) === String(selectedQuestion.id) ||
                 (p.questionId?.name === selectedQuestion.name);
        });
        if (already) setSolved(true);
      } catch {}
    };
    checkSolved();
  }, [selectedQuestion?.id]);

  useEffect(() => {
    setTestResults(prev => {
      const next = Array(testCases.length).fill(null);
      prev.forEach((v, i) => { if (i < next.length) next[i] = v; });
      return next;
    });
  }, [testCases.length]);

  // ── Resizable panel drag handler ────────────────────────────────────────
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newWidth = ((e.clientX - rect.left) / rect.width) * 100;
      setLeftWidth(Math.min(Math.max(newWidth, 25), 65));
    };
    const handleMouseUp = () => setIsDragging(false);
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // ── ALL useCallback — before any return ──────────────────────────────────
  const generateAI = useCallback(
    debounce(async (currentCode) => {
      if (!aiEnabled) return;
      try {
        const res = await fetch(
          'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyAL0n5l4b8ih9WBFELTt9n0Ewro2DlMsDY',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: `Complete this ${language} code without any explanation or markdown: ${currentCode}` }] }] }),
          }
        );
        if (!res.ok) return;
        const data = await res.json();
        const gen  = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (gen && editorRef.current) {
          editorRef.current.setValue(gen);
          setCode(gen);
        }
      } catch {}
    }, 800),
    [aiEnabled, language]
  );

  // ── GUARD — after ALL hooks ───────────────────────────────────────────────
  if (!selectedQuestion) {
    return (
      <div style={{ background: '#080B0F', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <Header />
        <div style={{ color: '#fff', fontFamily: 'DM Sans', fontSize: 20, marginTop: 80 }}>Question not found.</div>
        <button onClick={() => navigate('/intellicode')} style={{ padding: '10px 20px', background: 'rgba(32,201,151,0.1)', border: '1px solid rgba(32,201,151,0.25)', borderRadius: 8, color: '#20c997', cursor: 'pointer', fontFamily: 'DM Sans' }}>← Back to IntelliCode</button>
      </div>
    );
  }

  // ── Helper functions (regular functions, not hooks, so fine after guard) ──
  const executeCode = async (input, timeoutMs = 10000) => {
    const controller = new AbortController();
    const timer      = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(`${API}/api/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, input }),
        signal: controller.signal,
      });
      clearTimeout(timer);
      const data = await res.json();
      return data;
    } catch (err) {
      clearTimeout(timer);
      if (err.name === 'AbortError') return { error: 'Time Limit Exceeded' };
      return { error: err.message || 'Network error' };
    }
  };

  const saveSubmission = async (verdict, output = '') => {
    try {
      const token = await getToken();
      if (!token) return;
      await api.submissions.create(token, {
        questionId: selectedQuestion._id || String(selectedQuestion.id),
        language, code, verdict, output,
      });
    } catch {}
  };

  const markSolved = async () => {
    try {
      const token = await getToken();
      if (!token) return;
      await api.progress.mark(token, selectedQuestion._id || String(selectedQuestion.id));
      setSolved(true);
    } catch {}
  };

  const handleRunCode = async (index, caseSet = 'main') => {
    setError('');
    const cases = caseSet === 'extra' ? extraTestCases : testCases;
    caseSet === 'extra' ? setExtraLoading(true) : setLoading(true);
    const result = await executeCode(cases[index].input);
    if (result.error) {
      setError(result.error);
      const verdict = result.error === 'Time Limit Exceeded' ? 'TLE' : 'CE';
      if (caseSet === 'main') {
        const updated = [...testCases];
        updated[index] = { ...updated[index], tle: verdict === 'TLE', actualOutput: '' };
        setTestCases(updated);
      } else {
        const updated = [...extraTestCases];
        updated[index] = { ...updated[index], tle: verdict === 'TLE', actualOutput: '' };
        setExtraTestCases(updated);
      }
      await saveSubmission(verdict, result.error);
    } else {
      const actualOutput = (result.output || '').trim();
      const passed       = normalise(actualOutput) === normalise(cases[index].output || '');
      if (caseSet === 'main') {
        const updated = [...testCases];
        updated[index] = { ...updated[index], actualOutput, tle: false };
        setTestCases(updated);
        const results = [...testResults];
        results[index] = passed;
        setTestResults(results);
      } else {
        const updated = [...extraTestCases];
        updated[index] = { ...updated[index], actualOutput, tle: false };
        setExtraTestCases(updated);
      }
      setError('');
      await saveSubmission(passed ? 'AC' : 'WA', actualOutput);
      if (passed && !solved) await markSolved();
    }
    caseSet === 'extra' ? setExtraLoading(false) : setLoading(false);
  };

  const handleSubmit = async () => {
    setSubmitModal(true);
    setSubmitResults([]);
    setSubmitPassed(0);
    setRunningAll(true);
    const allCases = testCases;
    const results  = [];
    let passed     = 0;
    for (let i = 0; i < allCases.length; i++) {
      const result = await executeCode(allCases[i].input);
      let status   = 'WA';
      if (result.error) {
        status = result.error === 'Time Limit Exceeded' ? 'TLE' : 'CE';
      } else {
        const actual   = (result.output || '').trim();
        const expected = (allCases[i].output || '').trim();
        if (normalise(actual) === normalise(expected)) { status = 'AC'; passed++; }
      }
      results.push({ status, input: allCases[i].input, expected: allCases[i].output, actual: result.output || result.error || '' });
      setSubmitResults([...results]);
      setSubmitPassed(passed);
    }
    const allPassed = passed === allCases.length;
    await saveSubmission(allPassed ? 'AC' : 'WA', `${passed}/${allCases.length} passed`);
    if (allPassed && !solved) await markSolved();
    setRunningAll(false);
  };

  const handleSaveCode = () => {
    const ext      = language === 'python' ? 'py' : language === 'java' ? 'java' : 'cpp';
    const fileName = `${selectedQuestion.name.trim().replace(/\s+/g, '_')}.${ext}`;
    const blob     = new Blob([code], { type: 'text/plain' });
    const url      = URL.createObjectURL(blob);
    const a        = document.createElement('a');
    a.href = url; a.download = fileName;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    if (window.confirm(`Changing language to ${lang.toUpperCase()} will clear your current code. Continue?`)) {
      setLanguage(lang);
      setCode(boilerplate[lang]);
      if (editorRef.current) editorRef.current.setValue(boilerplate[lang]);
    }
  };

  const addTestCase = () => {
    setTestCases(prev => [...prev, { input: '', output: '', actualOutput: '', tle: false }]);
    setActiveTestCase(testCases.length);
  };

  const deleteLastTestCase = () => {
    if (testCases.length === 1) { alert('Cannot delete the last test case.'); return; }
    setTestCases(prev => prev.slice(0, -1));
    setActiveTestCase(prev => Math.min(prev, testCases.length - 2));
  };

  const updateTestCase = (index, field, value) => {
    setTestCases(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  const insertText = (symbol) => {
    if (!editorRef.current || !monacoRef.current) return;
    const editor   = editorRef.current;
    const monaco   = monacoRef.current;
    const position = editor.getPosition();
    const range    = new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column);
    editor.executeEdits('', [{ range, text: symbol, forceMoveMarkers: true }]);
    editor.setPosition({ lineNumber: position.lineNumber, column: position.column + symbol.length });
    editor.focus();
  };

  const handleEditorChangeWithAI = (value, event) => {
    setCode(value || '');
    if (aiEnabled && event?.changes?.[0]?.text === ';') generateAI(value);
  };

  const handleClickOpen = () => {
    setOpen(true);
    document.getElementById('main-content')?.classList.add('blur-sm');
  };
  const handleClose = () => {
    setOpen(false);
    document.getElementById('main-content')?.classList.remove('blur-sm');
  };

  const solutions = selectedQuestion.solution || [];

  // ── JSX — unchanged from your original ───────────────────────────────────
  const editorBg = editorTheme === 'vs-dark' ? '#1e1e1e' : '#ffffff';
  const panelBg  = editorTheme === 'vs-dark' ? '#0D1117' : '#f8f9fa';
  const borderC  = editorTheme === 'vs-dark' ? 'rgba(255,255,255,0.08)' : '#e0e0e0';
  const textC    = editorTheme === 'vs-dark' ? '#ccc' : '#333';
  const solutions = selectedQuestion.solution || [];

  return (
    <>
      <style>{`
        html, body { overflow: hidden !important; height: 100% !important; }
        .upsolve-root { font-family: 'DM Sans', sans-serif; }
        .upsolve-root * { box-sizing: border-box; }
        .panel-divider { width: 4px; background: ${borderC}; cursor: col-resize; flex-shrink: 0; transition: background .2s; position: relative; }
        .panel-divider:hover, .panel-divider.dragging { background: #20c997; }
        .panel-divider::after { content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 2px; height: 40px; background: rgba(255,255,255,0.2); border-radius: 2px; }
        .tc-tab { padding: 6px 14px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; border: none; transition: all .15s; }
        .tc-tab.active { background: rgba(32,201,151,0.15); color: #20c997; }
        .tc-tab:not(.active) { background: transparent; color: #6A6A6A; }
        .tc-tab:not(.active):hover { background: rgba(255,255,255,0.05); color: #ccc; }
        .run-btn { background: #20c997; color: #000; border: none; border-radius: 8px; padding: 8px 20px; font-weight: 700; cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 6px; transition: opacity .2s; }
        .run-btn:hover { opacity: .85; }
        .run-btn:disabled { opacity: .5; cursor: not-allowed; }
        .submit-btn { background: linear-gradient(135deg,#16a34a,#20c997); color: #fff; border: none; border-radius: 8px; padding: 8px 24px; font-weight: 700; cursor: pointer; font-size: 14px; transition: opacity .2s; }
        .submit-btn:hover { opacity: .85; }
        .submit-btn:disabled { opacity: .5; cursor: not-allowed; }
        .toolbar-btn { background: rgba(255,255,255,0.06); border: 1px solid ${borderC}; border-radius: 6px; padding: 5px 10px; color: ${textC}; cursor: pointer; font-size: 12px; font-weight: 600; transition: all .15s; }
        .toolbar-btn:hover { border-color: #20c997; color: #20c997; }
        .toolbar-btn.active { border-color: #20c997; color: #20c997; background: rgba(32,201,151,0.1); }
        .sym-btn { background: rgba(255,255,255,0.05); border: 1px solid ${borderC}; border-radius: 4px; padding: 3px 8px; color: #8C8C8C; cursor: pointer; font-family: 'Space Mono', monospace; font-size: 11px; transition: all .15s; }
        .sym-btn:hover { border-color: #20c997; color: #20c997; background: rgba(32,201,151,0.08); }
      `}</style>

      <div className="upsolve-root" style={{ background: editorTheme === 'vs-dark' ? '#080B0F' : '#f0f2f5', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Header />
        <HowTouseModal1 isModalOpen={isModalOpen} closeModal={() => setIsModalOpen(false)} />

        {isLOADING ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 /></div>
        ) : (
          <div ref={containerRef} style={{ display: 'flex', flex: 1, height: 'calc(100vh - 64px)', overflow: 'hidden', userSelect: isDragging ? 'none' : 'auto' }}>

            {/* ── LEFT PANEL: Problem Description ───────────────────────── */}
            <div style={{ width: `${leftWidth}%`, minWidth: 280, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: panelBg, borderRight: `1px solid ${borderC}` }}>
              {/* Problem header */}
              <div style={{ padding: '16px 20px', borderBottom: `1px solid ${borderC}`, flexShrink: 0 }}>
                <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 18, fontWeight: 800, margin: '0 0 8px', background: 'linear-gradient(to right, #007BFF, #20c997)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {selectedQuestion.name}
                </h2>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ padding: '2px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700,
                    color: selectedQuestion.difficulty === 'Easy' ? '#20c997' : selectedQuestion.difficulty === 'Hard' ? '#ef4444' : '#f59e0b',
                    background: selectedQuestion.difficulty === 'Easy' ? 'rgba(32,201,151,0.1)' : selectedQuestion.difficulty === 'Hard' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)' }}>
                    {selectedQuestion.difficulty}
                  </span>
                  <span style={{ padding: '2px 10px', borderRadius: 6, fontSize: 12, background: 'rgba(0,123,255,0.1)', color: '#007BFF' }}>★ {selectedQuestion.rating}</span>
                  {solved && <span style={{ padding: '2px 10px', borderRadius: 6, fontSize: 12, background: 'rgba(32,201,151,0.1)', color: '#20c997', fontWeight: 700 }}>✓ Solved</span>}
                </div>
                <div style={{ marginTop: 8, fontSize: 13, color: textC, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: '#6A6A6A' }}>Topics:</span>
                  {showTopics ? selectedQuestion.topics?.join(', ') : '••••••'}
                  <button onClick={() => setShowTopics(!showTopics)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6A6A6A', fontSize: 12, padding: 2 }}>
                    {showTopics ? '👁' : '🔒'}
                  </button>
                </div>
                <div style={{ fontSize: 13, color: '#6A6A6A', marginTop: 4 }}>
                  <span style={{ color: '#6A6A6A' }}>Company: </span><span style={{ color: textC }}>{selectedQuestion.company}</span>
                </div>
              </div>

              {/* Problem content - scrollable */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
                {[
                  { title: 'Description',          content: selectedQuestion.question_description },
                  { title: 'Function Description', content: selectedQuestion.function_description },
                  { title: 'Input Format',         content: selectedQuestion.input_format },
                  { title: 'Output Format',        content: selectedQuestion.output_format },
                  { title: 'Constraints',          content: selectedQuestion.constraints },
                ].filter(s => s.content).map((s, i) => (
                  <div key={i} style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#20c997', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' }}>{s.title}</div>
                    <div style={{ fontSize: 14, color: textC, whiteSpace: 'pre-line', lineHeight: 1.7 }}>{s.content}</div>
                  </div>
                ))}

                {selectedQuestion.examples?.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#20c997', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.06em' }}>Examples</div>
                    {selectedQuestion.examples.map((ex, i) => (
                      <div key={i} style={{ background: editorTheme === 'vs-dark' ? '#161B22' : '#fff', border: `1px solid ${borderC}`, borderRadius: 8, padding: 12, marginBottom: 8, fontFamily: "'Space Mono', monospace", fontSize: 12 }}>
                        <div style={{ color: '#6A6A6A', marginBottom: 4 }}><span style={{ color: '#20c997' }}>Input:</span> <span style={{ color: textC }}>{ex.input}</span></div>
                        <div style={{ color: '#6A6A6A' }}><span style={{ color: '#20c997' }}>Output:</span> <span style={{ color: textC }}>{ex.output}</span></div>
                        {ex.explanation && <div style={{ color: '#6A6A6A', marginTop: 4, fontSize: 11 }}>{ex.explanation}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Solution button at bottom */}
              {solutions.length > 0 && (
                <div style={{ padding: '12px 20px', borderTop: `1px solid ${borderC}`, flexShrink: 0 }}>
                  <button className="toolbar-btn" style={{ width: '100%', textAlign: 'center', padding: '8px' }} onClick={handleClickOpen}>
                    💡 View Solution
                  </button>
                </div>
              )}
            </div>

            {/* ── DIVIDER ────────────────────────────────────────────────── */}
            <div
              className={`panel-divider${isDragging ? ' dragging' : ''}`}
              onMouseDown={() => setIsDragging(true)}
            />

            {/* ── RIGHT PANEL: Editor + Test Cases ──────────────────────── */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: editorTheme === 'vs-dark' ? '#0D1117' : '#fff' }}>

              {/* Editor Toolbar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderBottom: `1px solid ${borderC}`, flexShrink: 0, flexWrap: 'wrap' }}>
                {/* Language selector */}
                <select
                  value={language}
                  onChange={handleLanguageChange}
                  style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${borderC}`, borderRadius: 6, padding: '4px 10px', color: textC, fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                  <option value="cpp">C++</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                </select>

                {/* Font size */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <button className="toolbar-btn" onClick={() => setFontSize(f => Math.max(10, f-1))} style={{ padding: '4px 8px' }}>A-</button>
                  <span style={{ fontSize: 12, color: textC, minWidth: 24, textAlign: 'center' }}>{fontSize}</span>
                  <button className="toolbar-btn" onClick={() => setFontSize(f => Math.min(24, f+1))} style={{ padding: '4px 8px' }}>A+</button>
                </div>

                {/* Theme toggle */}
                <button
                  className={`toolbar-btn ${editorTheme === 'vs-dark' ? 'active' : ''}`}
                  onClick={() => setEditorTheme(t => t === 'vs-dark' ? 'vs-light' : 'vs-dark')}>
                  {editorTheme === 'vs-dark' ? '🌙 Dark' : '☀️ Light'}
                </button>

                {/* Focus mode */}
                <button className="toolbar-btn" onClick={() => setIsFocusMode(f => !f)}>
                  {isFocusMode ? '⊡ Exit Focus' : '⊞ Focus'}
                </button>

                {/* How to use */}
                <button className="toolbar-btn" onClick={() => setIsModalOpen(true)}>? How to Use</button>

                {/* Save code */}
                <button className="toolbar-btn active" onClick={handleSaveCode} style={{ marginLeft: 'auto' }}>
                  💾 Save
                </button>

                {/* AI toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: textC }}>
                  <span>AI</span>
                  <div
                    onClick={() => setAiEnabled(p => !p)}
                    style={{ width: 36, height: 20, borderRadius: 10, background: aiEnabled ? '#20c997' : '#444', cursor: 'pointer', position: 'relative', transition: 'background .2s' }}>
                    <div style={{ position: 'absolute', top: 2, left: aiEnabled ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left .2s' }} />
                  </div>
                </div>
              </div>

              {/* Symbol shortcuts */}
              <div style={{ display: 'flex', gap: 4, padding: '6px 14px', borderBottom: `1px solid ${borderC}`, flexShrink: 0, flexWrap: 'wrap', background: editorTheme === 'vs-dark' ? '#080B0F' : '#f5f5f5' }}>
                {['{}', '()', '[]', 'if', 'else', 'for', 'while', '<int>', 'vector', 'cin', 'cout', '<<', '>>', ';'].map((sym, i) => (
                  <button key={i} className="sym-btn" onClick={() => insertText(sym)}>{sym}</button>
                ))}
              </div>

              {/* Monaco Editor */}
              <div style={{ flex: 1, overflow: 'hidden', minHeight: 200 }}>
                {!isLoaded ? (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: editorBg }}>
                    <CircularProgress sx={{ color: '#20c997' }} />
                  </div>
                ) : (
                  <MonacoEditor
                    height="100%"
                    language={monacoLang[language]}
                    theme={editorTheme}
                    value={code}
                    onChange={handleEditorChangeWithAI}
                    onMount={handleEditorMount}
                    options={{
                      fontFamily: 'JetBrains Mono, Fira Code, Courier New, monospace',
                      fontSize: fontSize,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      lineNumbers: 'on',
                      renderLineHighlight: 'line',
                      cursorBlinking: 'smooth',
                      smoothScrolling: true,
                      padding: { top: 12 },
                      folding: true,
                      wordWrap: 'off',
                      tabSize: 2,
                    }}
                  />
                )}
              </div>

              {/* Test cases panel */}
              <div style={{ borderTop: `1px solid ${borderC}`, flexShrink: 0, background: panelBg, maxHeight: '32vh', overflow: 'auto' }}>
                {/* TC header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderBottom: `1px solid ${borderC}`, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: 4, flex: 1, flexWrap: 'wrap' }}>
                    {testCases.map((_, i) => (
                      <button
                        key={i}
                        className={`tc-tab${activeTestCase === i ? ' active' : ''}`}
                        onClick={() => setActiveTestCase(i)}>
                        {testResults[i] === true && '✅ '}
                        {testResults[i] === false && '❌ '}
                        Case {i+1}
                      </button>
                    ))}
                    <button className="tc-tab" onClick={addTestCase} style={{ color: '#20c997' }}>+ Add</button>
                    <button className="tc-tab" onClick={deleteLastTestCase} style={{ color: '#ef4444' }}>✕ Del</button>
                  </div>

                  {/* Run + Submit */}
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button className="run-btn" onClick={() => handleRunCode(activeTestCase, 'main')} disabled={loading}>
                      {loading ? <CircularProgress size={16} color="inherit" /> : '▶ Run'}
                    </button>
                    <button className="submit-btn" onClick={handleSubmit} disabled={runningAll}>
                      {runningAll ? <CircularProgress size={16} color="inherit" /> : '🚀 Submit'}
                    </button>
                  </div>
                </div>

                {/* TC content */}
                {testCases[activeTestCase] && (
                  <div style={{ padding: '12px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    {[
                      { label: 'Input', value: testCases[activeTestCase].input, editable: true, field: 'input' },
                      { label: 'Expected Output', value: testCases[activeTestCase].output || '', editable: true, field: 'output' },
                      { label: 'Your Output', value: testCases[activeTestCase].tle ? '⏱ TLE' : (testCases[activeTestCase].actualOutput || '—'), editable: false, field: null },
                    ].map((col, ci) => (
                      <div key={ci}>
                        <div style={{ fontSize: 11, color: '#6A6A6A', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.06em' }}>{col.label}</div>
                        <textarea
                          rows={3}
                          readOnly={!col.editable}
                          value={col.value}
                          onChange={col.editable ? e => updateTestCase(activeTestCase, col.field, e.target.value) : undefined}
                          style={{
                            width: '100%', background: editorTheme === 'vs-dark' ? '#161B22' : '#fff',
                            border: `1px solid ${borderC}`, borderRadius: 6, padding: '6px 8px',
                            color: col.field === null && testCases[activeTestCase].actualOutput && !testCases[activeTestCase].tle
                              ? (normalise(testCases[activeTestCase].actualOutput) === normalise(testCases[activeTestCase].output) ? '#20c997' : '#ef4444')
                              : textC,
                            fontFamily: "'Space Mono', monospace", fontSize: 12, resize: 'none', outline: 'none',
                          }}
                        />
                        {col.field === null && testCases[activeTestCase].actualOutput && !testCases[activeTestCase].tle && (
                          <div style={{ fontSize: 11, fontWeight: 700, marginTop: 2,
                            color: normalise(testCases[activeTestCase].actualOutput) === normalise(testCases[activeTestCase].output) ? '#20c997' : '#ef4444' }}>
                            {normalise(testCases[activeTestCase].actualOutput) === normalise(testCases[activeTestCase].output) ? '✅ Correct' : '❌ Wrong'}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {error && (
                  <div style={{ margin: '0 14px 12px', padding: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, color: '#ef4444', fontFamily: "'Space Mono', monospace", fontSize: 12, whiteSpace: 'pre-wrap' }}>
                    {error}
                  </div>
                )}

                <div style={{ padding: '4px 14px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Tick />
                  <span style={{ fontSize: 11, color: '#6A6A6A' }}>Code auto-saved locally</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Solution Dialog */}
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth PaperProps={{ style: { background: '#0D1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16 } }}>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            <span>💡 Accepted Solution</span>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <IconButton onClick={() => setSolutionIndex(i => Math.max(0, i-1))} disabled={solutionIndex === 0} sx={{ color: '#fff' }}><ArrowBackIosIcon fontSize="small" /></IconButton>
              <Typography variant="caption" sx={{ color: '#6A6A6A' }}>{solutionIndex + 1} / {solutions.length}</Typography>
              <IconButton onClick={() => setSolutionIndex(i => Math.min(solutions.length-1, i+1))} disabled={solutionIndex >= solutions.length-1} sx={{ color: '#fff' }}><ArrowForwardIosIcon fontSize="small" /></IconButton>
              <Button size="small" variant="outlined" color="error" onClick={handleClose}>Close</Button>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ position: 'relative' }}>
              <Button size="small" variant="outlined" sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1, color: '#20c997', borderColor: '#20c997' }}
                onClick={() => { navigator.clipboard.writeText(solutions[solutionIndex] || ''); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
                {copied ? '✓ Copied' : 'Copy'}
              </Button>
              <Box sx={{ background: '#1e1e1e', borderRadius: 2, p: 2, maxHeight: 420, overflowY: 'auto', fontFamily: 'monospace', fontSize: 13, color: '#d4d4d4', whiteSpace: 'pre-wrap', mt: 1 }}>
                {solutions[solutionIndex] || 'No solution available.'}
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button variant="contained" size="small" sx={{ background: 'rgba(32,201,151,0.2)', color: '#20c997' }} onMouseEnter={e => e.target.textContent = selectedQuestion.time_complexity || 'N/A'} onMouseLeave={e => e.target.textContent = 'TC'}>TC</Button>
              <Button variant="contained" size="small" sx={{ background: 'rgba(0,123,255,0.2)', color: '#007BFF' }} onMouseEnter={e => e.target.textContent = selectedQuestion.space_complexity || 'N/A'} onMouseLeave={e => e.target.textContent = 'SC'}>SC</Button>
            </Box>
          </DialogContent>
        </Dialog>

        {/* Submit Modal */}
        <Modal open={submitModal} onClose={() => !runningAll && setSubmitModal(false)}>
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '90%', maxWidth: 600, background: '#0D1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, p: 3, maxHeight: '80vh', overflowY: 'auto', boxShadow: 24 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff', fontFamily: "'Bricolage Grotesque', sans-serif" }}>Submission Results</Typography>
              {!runningAll && <IconButton onClick={() => setSubmitModal(false)} sx={{ color: '#fff' }}><CloseIcon /></IconButton>}
            </Box>
            {runningAll && submitResults.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress sx={{ color: '#20c997' }} />
                <Typography sx={{ mt: 2, color: '#666' }}>Running test cases...</Typography>
              </Box>
            )}
            {submitResults.length > 0 && (
              <>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  {submitResults.map((r, i) => (
                    <Box key={i} sx={{ px: 2, py: 1, borderRadius: 2, textAlign: 'center', minWidth: 80,
                      background: r.status === 'AC' ? 'rgba(32,201,151,0.15)' : r.status === 'TLE' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                      color: r.status === 'AC' ? '#20c997' : r.status === 'TLE' ? '#f59e0b' : '#ef4444',
                      fontWeight: 700, fontSize: 13, border: `1px solid ${r.status === 'AC' ? 'rgba(32,201,151,0.3)' : r.status === 'TLE' ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
                      <div style={{ fontSize: 11, opacity: .7 }}>Case {i+1}</div><div>{r.status}</div>
                    </Box>
                  ))}
                </Box>
                <Typography variant="h5" sx={{ textAlign: 'center', color: submitPassed === testCases.length ? '#20c997' : '#ef4444', fontWeight: 800, mb: 2, fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                  {submitPassed === testCases.length ? '🎉 All Passed!' : `${submitPassed} / ${testCases.length} Passed`}
                </Typography>
                {submitResults.map((r, i) => (
                  <Box key={i} sx={{ mb: 1.5, p: 1.5, border: `1px solid ${r.status === 'AC' ? 'rgba(32,201,151,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: 2, background: r.status === 'AC' ? 'rgba(32,201,151,0.05)' : 'rgba(239,68,68,0.05)' }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: r.status === 'AC' ? '#20c997' : '#ef4444' }}>Case {i+1}: {r.status}</Typography>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', display: 'block', color: '#8C8C8C' }}>Input: {r.input}</Typography>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', display: 'block', color: '#8C8C8C' }}>Expected: {r.expected}</Typography>
                    {r.status !== 'AC' && <Typography variant="caption" sx={{ fontFamily: 'monospace', display: 'block', color: '#ef4444' }}>Got: {r.actual}</Typography>}
                  </Box>
                ))}
                {solved && submitPassed === testCases.length && (
                  <Box sx={{ textAlign: 'center', mt: 2, p: 2, background: 'rgba(32,201,151,0.1)', borderRadius: 2, border: '1px solid rgba(32,201,151,0.3)' }}>
                    <Typography sx={{ color: '#20c997', fontWeight: 700 }}>✓ Marked as Solved in your profile!</Typography>
                  </Box>
                )}
              </>
            )}
          </Box>
        </Modal>

        <Footer />
      </div>
    </>
  );
};



export default Upsolve;