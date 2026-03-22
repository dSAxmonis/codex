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
import Footer from './Footer';
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

// ── Boilerplate code per language ───────────────────────────────────────────
const boilerplate = {
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}`,
  python: `def solution():\n    pass\n\nif __name__ == "__main__":\n    solution()`,
  java: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Your code here\n    }\n}`,
};

// ── Language map for Monaco ──────────────────────────────────────────────────
const monacoLang = { cpp: 'cpp', python: 'python', java: 'java' };

// ── Normalise output for comparison ─────────────────────────────────────────
const normalise = (s = '') => s.trim().replace(/\r\n/g, '\n').replace(/\s+/g, ' ').trim();

const Upsolve = () => {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { getToken } = useAuth();
  const theme        = useTheme();
  const isMobile     = useMediaQuery(theme.breakpoints.down('sm'));

  // ── Find question ──────────────────────────────────────────────────────────
  const selectedQuestion = questions.find(q => q.id === parseInt(id));

  // Guard — invalid question ID
  if (!selectedQuestion) {
    return (
      <div style={{ background: '#080B0F', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <Header />
        <div style={{ color: '#fff', fontFamily: 'DM Sans', fontSize: 20, marginTop: 80 }}>Question not found.</div>
        <button onClick={() => navigate('/intellicode')} style={{ padding: '10px 20px', background: 'rgba(32,201,151,0.1)', border: '1px solid rgba(32,201,151,0.25)', borderRadius: 8, color: '#20c997', cursor: 'pointer', fontFamily: 'DM Sans' }}>← Back to IntelliCode</button>
      </div>
    );
  }

  // ── State ──────────────────────────────────────────────────────────────────
  const [code,           setCode]           = useState(boilerplate.cpp);
  const [language,       setLanguage]       = useState('cpp');
  const [testCases,      setTestCases]      = useState(() =>
    (selectedQuestion.testCases || []).map(tc => ({ ...tc, actualOutput: '', tle: false }))
  );
  const [activeTestCase, setActiveTestCase] = useState(0);
  const [testResults,    setTestResults]    = useState([]);
  const [extraTestCases, setExtraTestCases] = useState(() =>
    (selectedQuestion.extraTestCases || []).map(tc => ({ ...tc, actualOutput: '', tle: false }))
  );
  const [loading,        setLoading]        = useState(false);
  const [extraLoading,   setExtraLoading]   = useState(false);
  const [runningAll,     setRunningAll]     = useState(false);
  const [error,          setError]          = useState('');
  const [solved,         setSolved]         = useState(false);
  const [isFocusMode,    setIsFocusMode]    = useState(false);
  const [open,           setOpen]           = useState(false);          // solution dialog
  const [isModalOpen,    setIsModalOpen]    = useState(false);          // how to use
  const [isDrawerOpen,   setIsDrawerOpen]   = useState(false);
  const [submitModal,    setSubmitModal]    = useState(false);
  const [submitResults,  setSubmitResults]  = useState([]);
  const [submitPassed,   setSubmitPassed]   = useState(0);
  const [isPremium,      setIsPremium]      = useState(false);
  const [showTopics,     setShowTopics]     = useState(false);
  const [solutionIndex,  setSolutionIndex]  = useState(0);
  const [copied,         setCopied]         = useState(false);
  const [isLoaded,       setIsLoaded]       = useState(false);
  const [isLOADING,      SetIsLOADING]     = useState(true);
  const [aiEnabled,      setAiEnabled]      = useState(false); // off by default — expensive

  const editorRef      = useRef(null);
  const monacoRef      = useRef(null);

  // ── Load saved code from localStorage ────────────────────────────────────
  useEffect(() => {
    const savedCodes = JSON.parse(localStorage.getItem('savedCodes') || '{}');
    const savedLang  = localStorage.getItem('savedLanguage') || 'cpp';
    setLanguage(savedLang);
    setCode(savedCodes[selectedQuestion.id] || boilerplate[savedLang] || boilerplate.cpp);
    setIsLoaded(true);
    SetIsLOADING(false);
  }, [selectedQuestion.id]);

  // ── Save code to localStorage on change ──────────────────────────────────
  useEffect(() => {
    if (!isLoaded) return;
    const savedCodes = JSON.parse(localStorage.getItem('savedCodes') || '{}');
    savedCodes[selectedQuestion.id] = code;
    localStorage.setItem('savedCodes', JSON.stringify(savedCodes));
    localStorage.setItem('savedLanguage', language);
  }, [code, language, selectedQuestion.id, isLoaded]);

  // ── Check if already solved ──────────────────────────────────────────────
  useEffect(() => {
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
  }, [selectedQuestion.id]);

  // ── Sync test results array size with testCases ──────────────────────────
  useEffect(() => {
    setTestResults(prev => {
      const next = Array(testCases.length).fill(null);
      prev.forEach((v, i) => { if (i < next.length) next[i] = v; });
      return next;
    });
  }, [testCases.length]);

  // ── Core execute helper ──────────────────────────────────────────────────
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
      return data; // { output? error? }
    } catch (err) {
      clearTimeout(timer);
      if (err.name === 'AbortError') return { error: 'Time Limit Exceeded' };
      return { error: err.message || 'Network error' };
    }
  };

  // ── Save submission to backend ───────────────────────────────────────────
  const saveSubmission = async (verdict, output = '') => {
    try {
      const token = await getToken();
      if (!token) return;
      await api.submissions.create(token, {
        questionId: selectedQuestion._id || String(selectedQuestion.id),
        language,
        code,
        verdict,
        output,
      });
    } catch {}
  };

  // ── Mark question solved ─────────────────────────────────────────────────
  const markSolved = async () => {
    try {
      const token = await getToken();
      if (!token) return;
      await api.progress.mark(token, selectedQuestion._id || String(selectedQuestion.id));
      setSolved(true);
    } catch {}
  };

  // ── Run single test case ─────────────────────────────────────────────────
  const handleRunCode = async (index, caseSet = 'main') => {
    setError('');
    const cases = caseSet === 'extra' ? extraTestCases : testCases;
    caseSet === 'extra' ? setExtraLoading(true) : setLoading(true);

    const result = await executeCode(cases[index].input);

    if (result.error) {
      setError(result.error);
      const verdict = result.error === 'Time Limit Exceeded' ? 'TLE' : 'CE';
      // Update TLE flag in test case
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

  // ── Run ALL test cases (Submit) ──────────────────────────────────────────
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
        if (normalise(actual) === normalise(expected)) {
          status = 'AC';
          passed++;
        }
      }

      results.push({ status, input: allCases[i].input, expected: allCases[i].output, actual: result.output || result.error || '' });
      setSubmitResults([...results]);
      setSubmitPassed(passed);
    }

    // Save final submission
    const allPassed = passed === allCases.length;
    await saveSubmission(allPassed ? 'AC' : 'WA', `${passed}/${allCases.length} passed`);
    if (allPassed && !solved) await markSolved();

    setRunningAll(false);
  };

  // ── Save code file ───────────────────────────────────────────────────────
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

  // ── Language change ──────────────────────────────────────────────────────
  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    if (window.confirm(`Changing language to ${lang.toUpperCase()} will clear your current code. Continue?`)) {
      setLanguage(lang);
      setCode(boilerplate[lang]);
      if (editorRef.current) editorRef.current.setValue(boilerplate[lang]);
    }
  };

  // ── Test case management ─────────────────────────────────────────────────
  const addTestCase = () => {
    setTestCases(prev => [...prev, { input: '', output: '', actualOutput: '', tle: false }]);
    setActiveTestCase(testCases.length); // switch to new tab
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

  // ── Monaco editor ────────────────────────────────────────────────────────
  const handleEditorMount = (editor, monaco) => {
    editorRef.current  = editor;
    monacoRef.current  = monaco;
  };

  const handleEditorChange = (value) => {
    setCode(value || '');
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

  // ── AI suggestions (debounced, only when enabled) ─────────────────────────
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

  const handleEditorChangeWithAI = (value, event) => {
    setCode(value || '');
    if (aiEnabled && event?.changes?.[0]?.text === ';') generateAI(value);
  };

  // ── Solution dialog ──────────────────────────────────────────────────────
  const handleClickOpen = () => {
    setOpen(true);
    document.getElementById('main-content')?.classList.add('blur-sm');
  };
  const handleClose = () => {
    setOpen(false);
    document.getElementById('main-content')?.classList.remove('blur-sm');
  };

  const solutions = selectedQuestion.solution || [];

  return (
    <>
      <Header />
      {isLOADING ? (
        <div className="flex items-center justify-center h-screen"><Loader2 /></div>
      ) : (
        <Box id="main-content" sx={{ p: isMobile ? '8px' : '16px', display: isFocusMode ? 'block' : 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '16px', overflow: 'hidden', minHeight: '100vh' }}>

          {/* ── Left Panel: Question ─────────────────────────────────────── */}
          <HowTouseModal />
          <HowTouseModal1 isModalOpen={isModalOpen} closeModal={() => setIsModalOpen(false)} />

          {!isFocusMode && (
            <Box sx={{ mb: '16px', p: '20px', border: '1px solid #e0e0e0', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', backgroundColor: '#fafafa', flex: 1, maxWidth: isMobile ? '100%' : '48%', maxHeight: '165vh', overflowY: 'auto' }}>

              {/* Question header */}
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, backgroundImage: 'linear-gradient(to right, #007BFF, #20c997)', backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent' }}>
                {selectedQuestion.name}
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                <Typography variant="body2" sx={{ px: 1.5, py: 0.5, borderRadius: 1, fontWeight: 600, color: selectedQuestion.difficulty === 'Easy' ? '#16a34a' : selectedQuestion.difficulty === 'Hard' ? '#dc2626' : '#d97706', background: selectedQuestion.difficulty === 'Easy' ? '#dcfce7' : selectedQuestion.difficulty === 'Hard' ? '#fee2e2' : '#fef3c7' }}>
                  {selectedQuestion.difficulty}
                </Typography>
                <Typography variant="body2" sx={{ px: 1.5, py: 0.5, borderRadius: 1, background: '#e0f2fe', color: '#0369a1' }}>★ {selectedQuestion.rating}</Typography>
                {solved && <Typography variant="body2" sx={{ px: 1.5, py: 0.5, borderRadius: 1, background: '#dcfce7', color: '#16a34a', fontWeight: 600 }}>✓ Solved</Typography>}
              </Box>

              <Typography variant="body2" sx={{ color: '#555', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <b>Topics:</b>
                {showTopics ? selectedQuestion.topics?.join(', ') : '••••••'}
                <IconButton size="small" onClick={() => setShowTopics(!showTopics)} sx={{ color: '#888', p: 0.5 }}>
                  {showTopics ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}
                </IconButton>
              </Typography>

              <Typography variant="body2" sx={{ color: '#555', mb: 2 }}><b>Company:</b> {selectedQuestion.company}</Typography>

              {/* Description */}
              {[
                { title: 'Description',          content: selectedQuestion.question_description },
                { title: 'Function Description', content: selectedQuestion.function_description },
                { title: 'Input Format',         content: selectedQuestion.input_format },
                { title: 'Output Format',        content: selectedQuestion.output_format },
                { title: 'Constraints',          content: selectedQuestion.constraints },
              ].filter(s => s.content).map((s, i) => (
                <Box key={i} sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#222', mb: 0.5 }}>{s.title}:</Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: '#555', lineHeight: 1.7 }}>{s.content}</Typography>
                </Box>
              ))}

              {/* Examples */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#222', mb: 1 }}>Examples:</Typography>
                {selectedQuestion.examples?.map((ex, i) => (
                  <Box key={i} sx={{ p: 1.5, mb: 1, border: '1px solid #e2e8f0', borderRadius: 2, background: '#fff', fontFamily: 'monospace', fontSize: 13 }}>
                    <div><b>Input:</b> {ex.input}</div>
                    <div><b>Output:</b> {ex.output}</div>
                    {ex.explanation && <div style={{ color: '#666' }}><b>Explanation:</b> {ex.explanation}</div>}
                  </Box>
                ))}
              </Box>

              {/* Extra test cases (premium) */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Extra Test Cases</Typography>
                {extraTestCases.map((tc, i) => (
                  <Accordion key={i}>
                    <AccordionSummary expandIcon={isPremium ? <ExpandMore /> : null}>
                      <Typography>Test Case {i + 1}</Typography>
                      {!isPremium && (
                        <div className="ml-8 cursor-pointer" onClick={() => alert('Premium feature — contact us to get access!')}>
                          <Premium />
                        </div>
                      )}
                      {isPremium && (
                        <IconButton
                          color={testResults[i] === null ? 'primary' : testResults[i] ? 'success' : 'error'}
                          sx={{ ml: 'auto' }}
                          onClick={e => { e.stopPropagation(); handleRunCode(i, 'extra'); }}
                          disabled={extraLoading}
                        >
                          {extraLoading ? <CircularProgress size={20} /> : <PlayArrow />}
                        </IconButton>
                      )}
                    </AccordionSummary>
                    {isPremium && (
                      <AccordionDetails>
                        <Typography variant="body2">Input:</Typography>
                        <TextField fullWidth size="small" value={tc.input} disabled margin="dense" sx={{ fontFamily: 'monospace' }} />
                        <Typography variant="body2">Expected Output:</Typography>
                        <TextField fullWidth size="small" value={tc.output} disabled margin="dense" />
                        <Typography variant="body2">Your Output:</Typography>
                        <TextField fullWidth size="small" value={tc.tle ? 'TLE' : tc.actualOutput || '—'} disabled margin="dense" sx={{ color: tc.tle ? 'red' : 'inherit' }} />
                        {tc.actualOutput && (
                          normalise(tc.actualOutput) === normalise(tc.output)
                            ? <CheckCircle sx={{ color: 'green', mt: 1 }} />
                            : <Cancel sx={{ color: 'red', mt: 1 }} />
                        )}
                      </AccordionDetails>
                    )}
                  </Accordion>
                ))}
              </Box>
            </Box>
          )}

          {/* ── Right Panel: Editor ──────────────────────────────────────── */}
          <Box sx={{ flex: 2, minWidth: '50%', maxWidth: '100%', overflowX: 'hidden', overflowY: 'auto' }}>

            {/* Toolbar */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1 }}>
              {isMobile ? (
                <IconButton onClick={() => setIsDrawerOpen(true)}><MenuIcon /></IconButton>
              ) : (
                <>
                  <Button variant="contained" size="small" onClick={() => setIsModalOpen(true)}>How to Use</Button>
                  <button className="custom-button" onClick={handleSaveCode}><span className="button-text">Save Code</span></button>
                  <Button variant="outlined" size="small" onClick={handleClickOpen} color="secondary">Solution</Button>
                  <Button variant="outlined" size="small" onClick={() => setIsFocusMode(!isFocusMode)}>
                    {isFocusMode ? 'Exit Focus' : 'Focus Mode'}
                  </Button>
                </>
              )}

              {/* AI toggle */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
                <Typography variant="caption" sx={{ color: '#666' }}>AI Suggestions</Typography>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={aiEnabled} onChange={() => setAiEnabled(p => !p)} />
                  <div className="group peer bg-white rounded-full duration-300 w-12 h-6 ring-2 ring-red-500 after:duration-300 after:bg-red-500 peer-checked:after:bg-green-500 peer-checked:ring-green-500 after:rounded-full after:absolute after:h-4 after:w-4 after:top-1 after:left-1 peer-checked:after:translate-x-6 peer-hover:after:scale-95"></div>
                </label>
              </Box>
            </Box>

            {/* Mobile Drawer */}
            <Drawer anchor="top" open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
              <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button variant="contained" onClick={() => { setIsModalOpen(true); setIsDrawerOpen(false); }}>How to Use</Button>
                <Button variant="outlined" onClick={() => { setIsFocusMode(!isFocusMode); setIsDrawerOpen(false); }}>{isFocusMode ? 'Exit Focus Mode' : 'Focus Mode'}</Button>
                <Button variant="outlined" color="secondary" onClick={() => { handleClickOpen(); setIsDrawerOpen(false); }}>View Solution</Button>
                <button className="custom-button" onClick={() => { handleSaveCode(); setIsDrawerOpen(false); }}><span className="button-text">Save Code</span></button>
              </Box>
            </Drawer>

            {/* Monaco Editor */}
            <Box sx={{ border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden', mb: 1 }}>
              {!isLoaded ? (
                <Box sx={{ height: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1e1e1e' }}>
                  <CircularProgress sx={{ color: '#20c997' }} />
                </Box>
              ) : (
                <MonacoEditor
                  height="500px"
                  language={monacoLang[language]}
                  theme="vs-dark"
                  value={code}
                  onChange={handleEditorChangeWithAI}
                  onMount={handleEditorMount}
                  options={{ fontFamily: 'JetBrains Mono, Courier New, monospace', fontSize: 14, minimap: { enabled: false }, scrollBeyondLastLine: false, automaticLayout: true }}
                />
              )}
            </Box>

            {/* Code saved indicator */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Tick />
              <Typography variant="caption" sx={{ color: '#888' }}>Code auto-saved locally</Typography>
            </Box>

            {/* Quick insert buttons */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, background: '#f5f5f5', p: 0.5, borderRadius: 1, mb: 1 }}>
              {['{}', '()', '[]', 'if', 'else', 'for', 'while', '<int>', 'vector', 'cin', 'cout', '<<', '>>', ';'].map((sym, i) => (
                <Button key={i} variant="text" size="small" sx={{ minWidth: 36, fontFamily: 'monospace', fontSize: 12, p: '2px 6px' }} onClick={() => insertText(sym)}>{sym}</Button>
              ))}
            </Box>

            {/* Language selector */}
            <Box sx={{ mb: 2 }}>
              <Select value={language} onChange={handleLanguageChange} size="small" fullWidth>
                <MenuItem value="cpp">C++</MenuItem>
                <MenuItem value="python">Python</MenuItem>
                <MenuItem value="java">Java</MenuItem>
              </Select>
            </Box>

            {/* Error display */}
            {error && (
              <Box sx={{ mb: 2, p: 1.5, background: '#fff1f2', border: '1px solid #fecaca', borderRadius: 2 }}>
                <Typography variant="body2" sx={{ color: '#dc2626', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>{error}</Typography>
              </Box>
            )}

            {/* Test Cases */}
            <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <IconButton size="small" color="error" onClick={deleteLastTestCase} sx={{ border: '1px solid #f87171', borderRadius: 1, px: 1 }}>
                <CloseIcon fontSize="small" />
                <Typography variant="caption" sx={{ ml: 0.5, color: '#f87171' }}>Delete Last TC</Typography>
              </IconButton>
            </Box>

            <Box sx={{ maxWidth: '100%', overflowX: 'auto', mb: 1 }}>
              <Tabs value={Math.min(activeTestCase, testCases.length - 1)} onChange={(_, v) => setActiveTestCase(v)} variant="scrollable" scrollButtons="auto">
                {testCases.map((_, i) => (
                  <Tab key={i} label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {testResults[i] === true && <CheckCircle sx={{ color: 'green', fontSize: 14 }} />}
                      {testResults[i] === false && <Cancel sx={{ color: 'red', fontSize: 14 }} />}
                      {`Case ${i + 1}`}
                    </Box>
                  } />
                ))}
                <Button size="small" onClick={addTestCase} sx={{ ml: 1, flexShrink: 0 }}><Add /> Add</Button>
              </Tabs>
            </Box>

            {/* Active test case panel */}
            {testCases[activeTestCase] && (
              <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2, background: '#f8f9fa', mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>Input:</Typography>
                <TextField fullWidth multiline size="small" value={testCases[activeTestCase].input}
                  onChange={e => updateTestCase(activeTestCase, 'input', e.target.value)}
                  sx={{ mb: 1, fontFamily: 'monospace' }} />

                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>Expected Output:</Typography>
                <TextField fullWidth size="small" value={testCases[activeTestCase].output || ''}
                  onChange={e => updateTestCase(activeTestCase, 'output', e.target.value)}
                  sx={{ mb: 1 }} />

                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>Your Output:</Typography>
                <TextField fullWidth size="small"
                  value={testCases[activeTestCase].tle ? '⏱ Time Limit Exceeded' : (testCases[activeTestCase].actualOutput || '— Run the code to see output')}
                  disabled sx={{ mb: 1.5, '& input': { fontFamily: 'monospace', color: testCases[activeTestCase].tle ? '#d97706' : 'inherit' } }} />

                {/* Pass / Fail indicator */}
                {testCases[activeTestCase].actualOutput && !testCases[activeTestCase].tle && (
                  normalise(testCases[activeTestCase].actualOutput) === normalise(testCases[activeTestCase].output)
                    ? <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, color: 'green' }}><CheckCircle /><Typography variant="body2" sx={{ fontWeight: 600 }}>Correct!</Typography></Box>
                    : <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, color: 'red' }}><Cancel /><Typography variant="body2" sx={{ fontWeight: 600 }}>Wrong Answer</Typography></Box>
                )}

                {/* Run Button */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <button
                    onClick={() => handleRunCode(activeTestCase, 'main')}
                    disabled={loading}
                    className="relative border hover:border-sky-600 duration-500 group cursor-pointer text-sky-50 overflow-hidden h-12 w-36 rounded-md bg-sky-800 p-2 flex justify-center items-center font-extrabold"
                  >
                    <div className="absolute z-10 w-48 h-48 rounded-full group-hover:scale-150 transition-all duration-500 ease-in-out bg-sky-900"></div>
                    <div className="absolute z-10 w-40 h-40 rounded-full group-hover:scale-150 transition-all duration-500 ease-in-out bg-sky-800"></div>
                    <div className="absolute z-10 w-32 h-32 rounded-full group-hover:scale-150 transition-all duration-500 ease-in-out bg-sky-700"></div>
                    <div className="absolute z-10 w-16 h-16 rounded-full group-hover:scale-150 transition-all duration-500 ease-in-out bg-sky-500"></div>
                    <p className="z-10">{loading ? <CircularProgress size={20} color="inherit" /> : '▶ Run'}</p>
                  </button>

                  <Button variant="contained" color="success" onClick={handleSubmit} disabled={runningAll}
                    sx={{ px: 3, fontWeight: 700, background: 'linear-gradient(135deg,#16a34a,#20c997)' }}>
                    {runningAll ? <CircularProgress size={20} color="inherit" /> : '🚀 Submit'}
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      )}

      {/* ── Solution Dialog ──────────────────────────────────────────────── */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Accepted Solution</span>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <IconButton onClick={() => setSolutionIndex(i => Math.max(0, i-1))} disabled={solutionIndex === 0}><ArrowBackIosIcon fontSize="small" /></IconButton>
            <Typography variant="caption">{solutionIndex + 1} / {solutions.length}</Typography>
            <IconButton onClick={() => setSolutionIndex(i => Math.min(solutions.length-1, i+1))} disabled={solutionIndex >= solutions.length-1}><ArrowForwardIosIcon fontSize="small" /></IconButton>
            <Button size="small" variant="outlined" color="error" onClick={handleClose}>Close</Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ position: 'relative' }}>
            <Button size="small" variant="outlined" sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
              onClick={() => { navigator.clipboard.writeText(solutions[solutionIndex] || ''); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
              {copied ? '✓ Copied' : 'Copy'}
            </Button>
            <Box sx={{ background: '#1e1e1e', borderRadius: 2, p: 2, maxHeight: 400, overflowY: 'auto', fontFamily: 'monospace', fontSize: 13, color: '#d4d4d4', whiteSpace: 'pre-wrap', mt: 1 }}>
              {solutions[solutionIndex] || 'No solution available.'}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button variant="contained" size="small" onMouseEnter={e => e.target.textContent = selectedQuestion.time_complexity || 'N/A'} onMouseLeave={e => e.target.textContent = 'TC'}>TC</Button>
            <Button variant="contained" color="secondary" size="small" onMouseEnter={e => e.target.textContent = selectedQuestion.space_complexity || 'N/A'} onMouseLeave={e => e.target.textContent = 'SC'}>SC</Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* ── Submit Results Modal ─────────────────────────────────────────── */}
      <Modal open={submitModal} onClose={() => !runningAll && setSubmitModal(false)}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '90%', maxWidth: 600, background: '#fff', borderRadius: 3, p: 3, maxHeight: '80vh', overflowY: 'auto', boxShadow: 24 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Submission Results</Typography>
            {!runningAll && <IconButton onClick={() => setSubmitModal(false)}><CloseIcon /></IconButton>}
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
                  <Box key={i} sx={{ px: 2, py: 1, borderRadius: 2, textAlign: 'center', minWidth: 80, background: r.status === 'AC' ? '#dcfce7' : r.status === 'TLE' ? '#fef3c7' : '#fee2e2', color: r.status === 'AC' ? '#16a34a' : r.status === 'TLE' ? '#92400e' : '#dc2626', fontWeight: 700, fontSize: 13 }}>
                    <div>Case {i+1}</div>
                    <div>{r.status}</div>
                  </Box>
                ))}
              </Box>

              <Typography variant="h6" sx={{ textAlign: 'center', color: submitPassed === testCases.length ? '#16a34a' : '#dc2626', fontWeight: 800, mb: 2 }}>
                {submitPassed === testCases.length ? '🎉 All Passed!' : `${submitPassed} / ${testCases.length} Passed`}
              </Typography>

              {runningAll && (
                <Box sx={{ textAlign: 'center' }}>
                  <CircularProgress size={20} sx={{ color: '#20c997' }} />
                  <Typography variant="caption" sx={{ ml: 1, color: '#666' }}>Running remaining cases...</Typography>
                </Box>
              )}

              {/* Detail per case */}
              {submitResults.map((r, i) => (
                <Box key={i} sx={{ mb: 1.5, p: 1.5, border: `1px solid ${r.status === 'AC' ? '#86efac' : '#fca5a5'}`, borderRadius: 2, background: r.status === 'AC' ? '#f0fdf4' : '#fff1f2' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: r.status === 'AC' ? '#16a34a' : '#dc2626' }}>Case {i+1}: {r.status}</Typography>
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', display: 'block', color: '#555' }}>Input: {r.input}</Typography>
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', display: 'block', color: '#555' }}>Expected: {r.expected}</Typography>
                  {r.status !== 'AC' && <Typography variant="caption" sx={{ fontFamily: 'monospace', display: 'block', color: '#dc2626' }}>Got: {r.actual}</Typography>}
                </Box>
              ))}

              {solved && submitPassed === testCases.length && (
                <Box sx={{ textAlign: 'center', mt: 2, p: 2, background: '#f0fdf4', borderRadius: 2, border: '1px solid #86efac' }}>
                  <Typography sx={{ color: '#16a34a', fontWeight: 700 }}>✓ Marked as Solved in your profile!</Typography>
                </Box>
              )}
            </>
          )}
        </Box>
      </Modal>

      <Footer />
    </>
  );
};

export default Upsolve;