// /**
//  * api.js — Central API utility for Codify frontend
//  * All backend calls go through here.
//  * Import: import api from '../utils/api';
//  */

// const BASE = process.env.REACT_APP_API_URL || 'https://codex-backend-psi.vercel.app';

// // ── Core fetch wrapper ────────────────────────────────────────────────────────
// async function request(path, options = {}, token = null) {
//   const headers = { 'Content-Type': 'application/json', ...options.headers };
//   if (token) headers['Authorization'] = `Bearer ${token}`;

//   const res = await fetch(`${BASE}${path}`, { ...options, headers });

//   if (!res.ok) {
//     const err = await res.json().catch(() => ({ error: res.statusText }));
//     throw new Error(err.error || `Request failed: ${res.status}`);
//   }

//   return res.json();
// }

// // ── Auth ──────────────────────────────────────────────────────────────────────
// const auth = {
//   sync: (token, { email, fullName, username }) =>
//     request('/api/auth/sync', { method: 'POST', body: JSON.stringify({ email, fullName, username }) }, token),
// };

// // ── Users ─────────────────────────────────────────────────────────────────────
// const users = {
//   me:          (token)         => request('/api/users/me', {}, token),
//   update:      (token, data)   => request('/api/users/me', { method: 'PUT', body: JSON.stringify(data) }, token),
//   leaderboard: ()              => request('/api/users/leaderboard'),
// };

// // ── Companies ─────────────────────────────────────────────────────────────────
// const companies = {
//   list:   (params = {}) => request(`/api/companies?${new URLSearchParams(params)}`),
//   single: (id)          => request(`/api/companies/${id}`),
// };

// // ── Questions ─────────────────────────────────────────────────────────────────
// const questions = {
//   list:   (params = {}) => request(`/api/questions?${new URLSearchParams(params)}`),
//   meta:   ()            => request('/api/questions/meta'),
//   single: (id)          => request(`/api/questions/${id}`),
// };

// // ── Progress ──────────────────────────────────────────────────────────────────
// const progress = {
//   get:    (token)              => request('/api/progress', {}, token),
//   mark:   (token, questionId) => request(`/api/progress/${questionId}`, { method: 'POST' }, token),
//   unmark: (token, questionId) => request(`/api/progress/${questionId}`, { method: 'DELETE' }, token),
// };

// // ── Submissions ───────────────────────────────────────────────────────────────
// const submissions = {
//   list:   (token)       => request('/api/submissions', {}, token),
//   byQ:    (token, qId)  => request(`/api/submissions/${qId}`, {}, token),
//   create: (token, data) => request('/api/submissions', { method: 'POST', body: JSON.stringify(data) }, token),
// };

// // ── Feedback ──────────────────────────────────────────────────────────────────
// const feedback = {
//   send: (data) => request('/api/feedback', { method: 'POST', body: JSON.stringify(data) }),
// };

// // ── Execute ───────────────────────────────────────────────────────────────────
// const execute = {
//   run: (data) => request('/api/execute', { method: 'POST', body: JSON.stringify(data) }),
// };

// const api = { auth, users, companies, questions, progress, submissions, feedback, execute };
// export default api;

/**
 * api.js — Central API utility for Codify frontend
 * All backend calls go through here.
 * Import: import api from '../utils/api';
 */

const BASE = process.env.REACT_APP_API_URL || 'https://codex-backend-psi.vercel.app';

// ── Core fetch wrapper ────────────────────────────────────────────────────────
async function request(path, options = {}, token = null) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }

  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────────────────────
const auth = {
  sync: (token, { email, fullName, username }) =>
    request('/api/auth/sync', { method: 'POST', body: JSON.stringify({ email, fullName, username }) }, token),
};

// ── Users ─────────────────────────────────────────────────────────────────────
const users = {
  me:          (token)         => request('/api/users/me', {}, token),
  update:      (token, data)   => request('/api/users/me', { method: 'PUT', body: JSON.stringify(data) }, token),
  leaderboard: ()              => request('/api/users/leaderboard'),
};

// ── Companies ─────────────────────────────────────────────────────────────────
const companies = {
  list:   (params = {}) => request(`/api/companies?${new URLSearchParams(params)}`),
  single: (id)          => request(`/api/companies/${id}`),
};

// ── Questions ─────────────────────────────────────────────────────────────────
const questions = {
  list:   (params = {}) => request(`/api/questions?${new URLSearchParams(params)}`),
  meta:   ()            => request('/api/questions/meta'),
  single: (id)          => request(`/api/questions/${id}`),
};

// ── Progress ──────────────────────────────────────────────────────────────────
const progress = {
  get:    (token)              => request('/api/progress', {}, token),
  mark:   (token, questionId) => request(`/api/progress/${questionId}`, { method: 'POST' }, token),
  unmark: (token, questionId) => request(`/api/progress/${questionId}`, { method: 'DELETE' }, token),
};

// ── Submissions ───────────────────────────────────────────────────────────────
const submissions = {
  list:   (token)       => request('/api/submissions', {}, token),
  byQ:    (token, qId)  => request(`/api/submissions/${qId}`, {}, token),
  create: (token, data) => request('/api/submissions', { method: 'POST', body: JSON.stringify(data) }, token),
};

// ── Feedback ──────────────────────────────────────────────────────────────────
const feedback = {
  send: (data) => request('/api/feedback', { method: 'POST', body: JSON.stringify(data) }),
};

// ── Execute ───────────────────────────────────────────────────────────────────
const execute = {
  run: (data) => request('/api/execute', { method: 'POST', body: JSON.stringify(data) }),
};

// ── CodeCast ──────────────────────────────────────────────────────────────────
const codecast = {
  createRoom: (token, { questionId, language }) =>
    request('/api/codecast/rooms', { method: 'POST', body: JSON.stringify({ questionId, language }) }, token),
  getRoom:    (token, roomId) =>
    request(`/api/codecast/rooms/${roomId}`, {}, token),
  listRooms:  (token) =>
    request('/api/codecast/rooms', {}, token),
};

const api = { auth, users, companies, questions, progress, submissions, feedback, execute, codecast };
export default api;
