import React, { useState } from 'react';
import api from '../Utils/api';

const SuggestionForm = () => {
  const [form,      setForm]      = useState({ name: '', email: '', message: '' });
  const [status,    setStatus]    = useState('idle'); // idle | loading | success | error
  const [errMsg,    setErrMsg]    = useState('');

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setStatus('loading');
    setErrMsg('');
    try {
      await api.feedback.send(form);
      setStatus('success');
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      setStatus('error');
      setErrMsg(err.message || 'Something went wrong. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div style={{ background: 'rgba(32,201,151,0.08)', border: '1px solid rgba(32,201,151,0.2)', borderRadius: 14, padding: '32px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
        <h3 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: 18, color: '#fff', marginBottom: 8 }}>Thanks for your feedback!</h3>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: '#8C8C8C', marginBottom: 20 }}>We read every suggestion and use them to improve Codify.</p>
        <button
          onClick={() => setStatus('idle')}
          style={{ padding: '9px 20px', background: 'rgba(32,201,151,0.1)', border: '1px solid rgba(32,201,151,0.25)', borderRadius: 8, color: '#20c997', fontFamily: "'DM Sans',sans-serif", fontSize: 13, cursor: 'pointer', transition: 'all .2s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(32,201,151,0.18)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(32,201,151,0.1)'}
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <style>{`
        .fb-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 10px;
          padding: 12px 14px;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          outline: none;
          transition: all .22s;
          resize: none;
        }
        .fb-input::placeholder { color: #6A6A6A; }
        .fb-input:focus {
          border-color: rgba(32,201,151,0.3);
          background: rgba(32,201,151,0.04);
          box-shadow: 0 0 0 3px rgba(32,201,151,0.08);
        }
        .fb-btn {
          width: 100%;
          padding: 13px;
          background: #20c997;
          color: #000;
          border: none;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all .22s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .fb-btn:hover:not(:disabled) { opacity: .88; transform: translateY(-1px); }
        .fb-btn:disabled { opacity: .6; cursor: not-allowed; }
      `}</style>

      <input
        className="fb-input"
        type="text"
        name="name"
        placeholder="Your name"
        value={form.name}
        onChange={handleChange}
        required
      />
      <input
        className="fb-input"
        type="email"
        name="email"
        placeholder="Your email"
        value={form.email}
        onChange={handleChange}
        required
      />
      <textarea
        className="fb-input"
        name="message"
        placeholder="Your suggestion or feedback..."
        value={form.message}
        onChange={handleChange}
        rows={4}
        required
      />

      {status === 'error' && (
        <div style={{ padding: '10px 14px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: '#f87171' }}>
          ⚠️ {errMsg}
        </div>
      )}

      <button className="fb-btn" type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? (
          <>
            <span style={{ width: 14, height: 14, border: '2px solid rgba(0,0,0,0.3)', borderTop: '2px solid #000', borderRadius: '50%', animation: 'spin 1s linear infinite', display: 'inline-block' }} />
            Sending...
          </>
        ) : (
          <>Send Feedback ↗</>
        )}
      </button>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </form>
  );
};

export default SuggestionForm;