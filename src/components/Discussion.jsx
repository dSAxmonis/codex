import React, { useState, useEffect, useCallback } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import Header from './Header';
import Footer from './Footer';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const BADGE_CONFIG = {
  Rookie:      { color: '#6A6A6A', emoji: '🌱' },
  Contributor: { color: '#20c997', emoji: '⭐' },
  Expert:      { color: '#007BFF', emoji: '🔥' },
  Legend:      { color: '#f59e0b', emoji: '👑' },
};

const POINTS_INFO = [
  { action: 'Post OA Experience',   points: '+50' },
  { action: 'Your post gets upvote', points: '+10' },
  { action: 'Add a comment',        points: '+5'  },
  { action: 'Comment gets upvote',  points: '+5'  },
];

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60)   return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400)return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}

const S = {
  page:    { background: '#080B0F', minHeight: '100vh', color: '#fff', fontFamily: "'DM Sans', sans-serif" },
  wrap:    { maxWidth: 900, margin: '0 auto', padding: '32px 20px' },
  card:    { background: '#0D1117', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 20, marginBottom: 16 },
  tag:     (c) => ({ background: `${c}22`, color: c, border: `1px solid ${c}44`, borderRadius: 6, padding: '2px 10px', fontSize: 11, fontWeight: 600 }),
  btn:     { background: '#20c997', color: '#000', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: 14 },
  btnGhost:{ background: 'transparent', color: '#20c997', border: '1px solid rgba(32,201,151,0.3)', borderRadius: 8, padding: '8px 16px', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: 13 },
  input:   { background: '#161B22', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', color: '#fff', fontFamily: "'DM Sans', sans-serif", fontSize: 14, width: '100%', boxSizing: 'border-box' },
  label:   { fontSize: 12, color: '#6A6A6A', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '.08em' },
};

// ── Create Post Modal ─────────────────────────────────────────────────────────
function CreatePostModal({ onClose, onCreated, token }) {
  const [form, setForm] = useState({ title: '', content: '', company: '', role: '', difficulty: '', year: new Date().getFullYear(), tags: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!form.title.trim() || !form.content.trim()) { setError('Title and content are required'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/api/discussion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onCreated(data);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#0D1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 28, width: '100%', maxWidth: 580, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 20, fontWeight: 800, margin: 0 }}>📝 Share OA Experience</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#6A6A6A', cursor: 'pointer', fontSize: 20 }}>✕</button>
        </div>

        <div style={{ display: 'grid', gap: 14 }}>
          <div>
            <label style={S.label}>Title *</label>
            <input style={S.input} placeholder="e.g. Google SDE Intern OA 2025 — Array problems" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={S.label}>Company</label>
              <input style={S.input} placeholder="e.g. Google" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
            </div>
            <div>
              <label style={S.label}>Role</label>
              <input style={S.input} placeholder="e.g. SDE Intern" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={S.label}>Difficulty</label>
              <select style={{ ...S.input, cursor: 'pointer' }} value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}>
                <option value="">Select</option>
                <option>Easy</option><option>Medium</option><option>Hard</option>
              </select>
            </div>
            <div>
              <label style={S.label}>Year</label>
              <input style={S.input} type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} />
            </div>
          </div>
          <div>
            <label style={S.label}>Content * (describe the OA, questions asked, approach)</label>
            <textarea style={{ ...S.input, minHeight: 140, resize: 'vertical' }} placeholder="Describe the OA experience, questions asked, difficulty, tips..." value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} />
          </div>
          <div>
            <label style={S.label}>Tags (comma separated)</label>
            <input style={S.input} placeholder="e.g. arrays, dp, graphs" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
          </div>
        </div>

        {error && <p style={{ color: '#ef4444', fontSize: 13, marginTop: 10 }}>{error}</p>}

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button style={S.btn} onClick={handleSubmit} disabled={loading}>
            {loading ? 'Posting...' : '🚀 Post (+50 pts)'}
          </button>
          <button style={S.btnGhost} onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── Post Card ─────────────────────────────────────────────────────────────────
function PostCard({ post, onClick, userId, token, onUpvote }) {
  const voted = post.upvotes?.includes(userId);
  const diffColor = { Easy: '#20c997', Medium: '#f59e0b', Hard: '#ef4444' }[post.difficulty] || '#6A6A6A';

  async function handleUpvote(e) {
    e.stopPropagation();
    if (!token) return;
    try {
      const res = await fetch(`${API}/api/discussion/${post._id}/upvote`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      onUpvote(post._id, data.upvotes, data.voted);
    } catch {}
  }

  return (
    <div style={{ ...S.card, cursor: 'pointer', transition: 'border-color .2s' }}
      onClick={() => onClick(post)}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(32,201,151,0.3)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
        {post.company && <span style={S.tag('#007BFF')}>{post.company}</span>}
        {post.role && <span style={S.tag('#8B5CF6')}>{post.role}</span>}
        {post.difficulty && <span style={S.tag(diffColor)}>{post.difficulty}</span>}
        {post.verified && <span style={S.tag('#20c997')}>✓ Verified</span>}
        {post.year && <span style={S.tag('#6A6A6A')}>{post.year}</span>}
      </div>

      <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 16, fontWeight: 700, margin: '0 0 8px', lineHeight: 1.4 }}>{post.title}</h3>
      <p style={{ color: '#8C8C8C', fontSize: 13, margin: '0 0 12px', lineHeight: 1.6 }}>
        {post.content.slice(0, 150)}{post.content.length > 150 ? '...' : ''}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: '#6A6A6A' }}>
        <span>by <strong style={{ color: '#ccc' }}>{post.userName}</strong></span>
        <span>{timeAgo(post.createdAt)}</span>
        <span>👁 {post.views || 0}</span>
        <span>💬 {post.comments?.length || 0}</span>
        <button
          onClick={handleUpvote}
          style={{ marginLeft: 'auto', background: voted ? 'rgba(32,201,151,0.15)' : 'transparent', border: `1px solid ${voted ? '#20c997' : 'rgba(255,255,255,0.1)'}`, borderRadius: 6, padding: '4px 10px', color: voted ? '#20c997' : '#6A6A6A', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
          ▲ {post.upvotes?.length || 0}
        </button>
      </div>

      {post.tags?.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
          {post.tags.map((t, i) => <span key={i} style={{ background: 'rgba(255,255,255,0.05)', color: '#8C8C8C', borderRadius: 4, padding: '2px 8px', fontSize: 11 }}>#{t}</span>)}
        </div>
      )}
    </div>
  );
}

// ── Post Detail View ──────────────────────────────────────────────────────────
function PostDetail({ postId, onBack, userId, token }) {
  const [post, setPost] = useState(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/discussion/${postId}`)
      .then(r => r.json()).then(setPost).finally(() => setLoading(false));
  }, [postId]);

  async function handleUpvote() {
    if (!token) return;
    const res = await fetch(`${API}/api/discussion/${postId}/upvote`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setPost(p => ({ ...p, upvotes: data.voted
      ? [...(p.upvotes||[]), userId]
      : (p.upvotes||[]).filter(u => u !== userId)
    }));
  }

  async function handleComment() {
    if (!comment.trim() || !token) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/discussion/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: comment }),
      });
      const data = await res.json();
      setPost(p => ({ ...p, comments: data.comments }));
      setComment('');
    } catch {}
    finally { setSubmitting(false); }
  }

  async function handleCommentUpvote(commentId) {
    if (!token) return;
    const res = await fetch(`${API}/api/discussion/${postId}/comments/${commentId}/upvote`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setPost(p => ({ ...p, comments: p.comments.map(c =>
      c._id === commentId
        ? { ...c, upvotes: data.voted ? [...(c.upvotes||[]), userId] : (c.upvotes||[]).filter(u => u !== userId) }
        : c
    )}));
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#6A6A6A' }}>Loading...</div>;
  if (!post) return <div style={{ textAlign: 'center', padding: 60, color: '#ef4444' }}>Post not found</div>;

  const voted = post.upvotes?.includes(userId);
  const diffColor = { Easy: '#20c997', Medium: '#f59e0b', Hard: '#ef4444' }[post.difficulty] || '#6A6A6A';

  return (
    <div>
      <button onClick={onBack} style={{ ...S.btnGhost, marginBottom: 20 }}>← Back</button>

      <div style={S.card}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          {post.company && <span style={S.tag('#007BFF')}>{post.company}</span>}
          {post.role && <span style={S.tag('#8B5CF6')}>{post.role}</span>}
          {post.difficulty && <span style={S.tag(diffColor)}>{post.difficulty}</span>}
          {post.verified && <span style={S.tag('#20c997')}>✓ Verified</span>}
          {post.year && <span style={S.tag('#6A6A6A')}>{post.year}</span>}
        </div>

        <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 22, fontWeight: 800, margin: '0 0 12px' }}>{post.title}</h1>

        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#6A6A6A', marginBottom: 20 }}>
          <span>by <strong style={{ color: '#ccc' }}>{post.userName}</strong></span>
          <span>{timeAgo(post.createdAt)}</span>
          <span>👁 {post.views}</span>
        </div>

        <p style={{ color: '#ccc', fontSize: 15, lineHeight: 1.8, whiteSpace: 'pre-wrap', marginBottom: 20 }}>{post.content}</p>

        {post.tags?.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            {post.tags.map((t, i) => <span key={i} style={{ background: 'rgba(255,255,255,0.05)', color: '#8C8C8C', borderRadius: 4, padding: '2px 8px', fontSize: 11 }}>#{t}</span>)}
          </div>
        )}

        <button onClick={handleUpvote} style={{ background: voted ? 'rgba(32,201,151,0.15)' : 'transparent', border: `1px solid ${voted ? '#20c997' : 'rgba(255,255,255,0.1)'}`, borderRadius: 8, padding: '8px 16px', color: voted ? '#20c997' : '#6A6A6A', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
          ▲ Upvote ({post.upvotes?.length || 0})
        </button>
      </div>

      {/* Comments */}
      <div style={{ marginTop: 24 }}>
        <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
          💬 {post.comments?.length || 0} Comments
        </h3>

        {token && (
          <div style={{ ...S.card, marginBottom: 20 }}>
            <textarea
              style={{ ...S.input, minHeight: 80, resize: 'vertical', marginBottom: 10 }}
              placeholder="Add a comment... (+5 pts)"
              value={comment}
              onChange={e => setComment(e.target.value)}
            />
            <button style={S.btn} onClick={handleComment} disabled={submitting}>
              {submitting ? 'Posting...' : '💬 Comment'}
            </button>
          </div>
        )}

        {post.comments?.map((c, i) => {
          const commentVoted = c.upvotes?.includes(userId);
          return (
            <div key={i} style={{ ...S.card, borderLeft: '3px solid rgba(32,201,151,0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: 13, color: '#20c997' }}>{c.userName}</span>
                  <span style={{ color: '#6A6A6A', fontSize: 11, marginLeft: 10 }}>{timeAgo(c.createdAt)}</span>
                </div>
                <button onClick={() => handleCommentUpvote(c._id)} style={{ background: commentVoted ? 'rgba(32,201,151,0.1)' : 'transparent', border: `1px solid ${commentVoted ? '#20c997' : 'rgba(255,255,255,0.1)'}`, borderRadius: 6, padding: '2px 8px', color: commentVoted ? '#20c997' : '#6A6A6A', cursor: 'pointer', fontSize: 11 }}>
                  ▲ {c.upvotes?.length || 0}
                </button>
              </div>
              <p style={{ color: '#ccc', fontSize: 14, lineHeight: 1.7, marginTop: 8, whiteSpace: 'pre-wrap' }}>{c.content}</p>
            </div>
          );
        })}

        {post.comments?.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: '#6A6A6A' }}>No comments yet. Be the first!</div>
        )}
      </div>
    </div>
  );
}

// ── Leaderboard Panel ─────────────────────────────────────────────────────────
function Leaderboard() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch(`${API}/api/discussion/leaderboard/top`)
      .then(r => r.json()).then(data => setUsers(Array.isArray(data) ? data : [])).catch(() => {});
  }, []);

  return (
    <div style={{ ...S.card, position: 'sticky', top: 20 }}>
      <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 15, fontWeight: 700, marginBottom: 16 }}>🏆 Leaderboard</h3>
      {users.slice(0, 10).map((u, i) => {
        const badge = BADGE_CONFIG[u.badge] || BADGE_CONFIG.Rookie;
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < 9 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: i < 3 ? ['#f59e0b','#aaa','#cd7f32'][i] : '#6A6A6A', minWidth: 20 }}>#{i+1}</span>
            <span style={{ fontSize: 14 }}>{badge.emoji}</span>
            <span style={{ fontSize: 13, flex: 1, color: '#ccc' }}>{u.fullName || u.username || 'Anonymous'}</span>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: '#20c997' }}>{u.points || 0}pts</span>
          </div>
        );
      })}
      {users.length === 0 && <p style={{ color: '#6A6A6A', fontSize: 13, textAlign: 'center' }}>No data yet</p>}

      <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <p style={{ fontSize: 11, color: '#6A6A6A', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.08em' }}>Earn Points</p>
        {POINTS_INFO.map((p, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#8C8C8C', padding: '4px 0' }}>
            <span>{p.action}</span>
            <span style={{ color: '#20c997', fontWeight: 700 }}>{p.points}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Discussion() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [company, setCompany] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [sort, setSort] = useState('new');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [token, setToken] = useState(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (user) getToken().then(setToken).catch(() => {});
  }, [user, getToken]);

  const fetchPosts = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams({ sort, limit: 30 });
      if (search)     params.append('search', search);
      if (company)    params.append('company', company);
      if (difficulty) params.append('difficulty', difficulty);
      const res = await fetch(`${API}/api/discussion?${params}`);
      const data = await res.json();
      setPosts(data.posts || []);
      setTotal(data.total || 0);
    } catch (e) { setError('Failed to load posts'); }
    finally { setLoading(false); }
  }, [search, company, difficulty, sort]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  function handleUpvote(postId, newCount, voted) {
    setPosts(prev => prev.map(p =>
      p._id === postId
        ? { ...p, upvotes: voted
            ? [...(p.upvotes||[]), user?.id]
            : (p.upvotes||[]).filter(u => u !== user?.id)
          }
        : p
    ));
  }

  function handleCreated(data) {
    setShowCreate(false);
    setPosts(prev => [data.post, ...prev]);
    setTotal(t => t + 1);
  }

  if (selectedPost) {
    return (
      <div style={S.page}>
        <Header />
        <div style={S.wrap}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24 }}>
            <PostDetail postId={selectedPost._id} onBack={() => setSelectedPost(null)} userId={user?.id} token={token} />
            <Leaderboard />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700;800&family=DM+Sans:wght@300;400;500&family=Space+Mono&display=swap');
        * { box-sizing: border-box; }
        textarea, input, select { outline: none; }
        textarea::placeholder, input::placeholder { color: #444; }
      `}</style>
      <Header />
      <div style={S.wrap}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 28, fontWeight: 800, margin: '0 0 6px', background: 'linear-gradient(135deg, #fff 60%, #20c997)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              OA Discussion
            </h1>
            <p style={{ color: '#6A6A6A', fontSize: 14, margin: 0 }}>Share and discover Online Assessment experiences • Earn points for contributing</p>
          </div>
          {user && (
            <button style={S.btn} onClick={() => setShowCreate(true)}>+ Share OA</button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24 }}>
          <div>
            {/* Filters */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
              <input style={{ ...S.input, width: 'auto', flex: 1, minWidth: 180 }} placeholder="🔍 Search posts..." value={search} onChange={e => setSearch(e.target.value)} />
              <input style={{ ...S.input, width: 140 }} placeholder="Company" value={company} onChange={e => setCompany(e.target.value)} />
              <select style={{ ...S.input, width: 120, cursor: 'pointer' }} value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                <option value="">All</option>
                <option>Easy</option><option>Medium</option><option>Hard</option>
              </select>
              <select style={{ ...S.input, width: 110, cursor: 'pointer' }} value={sort} onChange={e => setSort(e.target.value)}>
                <option value="new">Latest</option>
                <option value="top">Top</option>
              </select>
            </div>

            <p style={{ color: '#6A6A6A', fontSize: 13, marginBottom: 16 }}>{total} posts</p>

            {loading && <div style={{ textAlign: 'center', padding: 60, color: '#6A6A6A' }}>Loading...</div>}
            {error && <div style={{ textAlign: 'center', padding: 40, color: '#ef4444' }}>{error}</div>}

            {!loading && posts.length === 0 && (
              <div style={{ textAlign: 'center', padding: 60 }}>
                <p style={{ fontSize: 32, marginBottom: 12 }}>📭</p>
                <p style={{ color: '#6A6A6A', fontSize: 15 }}>No posts yet. Be the first to share!</p>
                {user && <button style={{ ...S.btn, marginTop: 16 }} onClick={() => setShowCreate(true)}>+ Share OA Experience</button>}
              </div>
            )}

            {posts.map(post => (
              <PostCard
                key={post._id}
                post={post}
                onClick={setSelectedPost}
                userId={user?.id}
                token={token}
                onUpvote={handleUpvote}
              />
            ))}
          </div>

          <Leaderboard />
        </div>
      </div>

      {showCreate && (
        <CreatePostModal
          token={token}
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}

      <Footer />
    </div>
  );
}