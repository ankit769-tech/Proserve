// public/js/api.js
// Shared frontend -> backend helper for ProServe
// Put <script src="/js/api.js"></script> before </body> on all pages.

const API_BASE = '/api'; // backend served from same origin

/* -------------------------
   Utility: request wrapper
   ------------------------- */
async function apiFetch(path, opts = {}) {
  const token = localStorage.getItem('ps_token');
  const headers = opts.headers || {};
  if (!headers['Content-Type'] && !(opts.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) headers['Authorization'] = 'Bearer ' + token;

  const res = await fetch(API_BASE + path, {
    method: opts.method || 'GET',
    headers,
    body: opts.body instanceof FormData ? opts.body : (opts.body ? JSON.stringify(opts.body) : null),
  });

  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json().catch(()=>null) : null;

  if (!res.ok) {
    const message = (data && (data.message || (data.errors && data.errors[0]?.msg))) || res.statusText || 'Request failed';
    throw new Error(message);
  }
  return data;
}

/* -------------------------
   Auth helpers
   ------------------------- */
async function loginUser(email, password) {
  const data = await apiFetch('/auth/login', { method: 'POST', body: { email, password } });
  if (data && data.token) {
    localStorage.setItem('ps_token', data.token);
    localStorage.setItem('ps_user', JSON.stringify(data.user || {}));
  }
  return data;
}

async function signupUser(payload) {
  const data = await apiFetch('/auth/register', { method: 'POST', body: payload });
  if (data && data.token) {
    localStorage.setItem('ps_token', data.token);
    localStorage.setItem('ps_user', JSON.stringify(data.user || {}));
  }
  return data;
}

function logout() {
  localStorage.removeItem('ps_token');
  localStorage.removeItem('ps_user');
  window.location.href = '/login.html';
}

function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem('ps_user') || 'null'); } catch(e){ return null; }
}

/* -------------------------
   Profile & user helpers
   ------------------------- */
async function loadProfile() {
  return await apiFetch('/users/me');
}

async function updateProfile(updates) {
  return await apiFetch('/users/me', { method: 'PUT', body: updates });
}

/* -------------------------
   Services
   ------------------------- */
async function fetchServices(queryParams = '') {
  const qs = queryParams ? '?' + new URLSearchParams(queryParams).toString() : '';
  return await apiFetch('/services' + qs);
}

async function fetchService(serviceId) {
  return await apiFetch('/services/' + serviceId);
}

async function createService(payload) {
  return await apiFetch('/services', { method: 'POST', body: payload });
}

/* -------------------------
   Bookings
   ------------------------- */
async function createBooking(payload) {
  return await apiFetch('/bookings', { method: 'POST', body: payload });
}

async function fetchBooking(id) {
  return await apiFetch('/bookings/' + id);
}

async function acceptBooking(id) {
  return await apiFetch('/bookings/' + id + '/accept', { method: 'POST' });
}

async function rejectBooking(id) {
  return await apiFetch('/bookings/' + id + '/reject', { method: 'POST' });
}

/* -------------------------
   Reviews
   ------------------------- */
async function postReview(payload) {
  return await apiFetch('/reviews', { method: 'POST', body: payload });
}

/* -------------------------
   Worker utilities
   ------------------------- */
async function updateAvailability(av) {
  return await apiFetch('/users/me/availability', { method: 'PUT', body: av });
}

async function addBankAccount(bank) {
  return await apiFetch('/users/me/bank', { method: 'POST', body: bank });
}

/* -------------------------
   Upload helper (file uploads)
   Example usage:
     let fd = new FormData();
     fd.append('files', fileInput.files[0]);
     apiUpload('/users/me/upload-verification', fd);
   ------------------------- */
async function apiUpload(path, formData) {
  // Note: apiFetch sets json header by default; for FormData we need custom fetch
  const token = localStorage.getItem('ps_token');
  const res = await fetch(API_BASE + path, {
    method: 'POST',
    headers: token ? { 'Authorization': 'Bearer ' + token } : {},
    body: formData
  });
  if (!res.ok) {
    let json = null;
    try { json = await res.json(); } catch(e){}
    throw new Error((json && json.message) || res.statusText);
  }
  return await res.json();
}

/* -------------------------
   Small UI helpers (non-intrusive)
   ------------------------- */
function showToast(msg) {
  // Minimal unobtrusive toast: uses alert fallback if no toast container
  if (typeof M !== 'undefined' && M.toast) { M.toast({html: msg}); return; }
  console.log('[ProServe toast] ' + msg);
  // fallback: small on-page message element optional
}

/* -------------------------
   Auto-run: if user page loads and token exists, refresh stored user
   ------------------------- */
(async function init() {
  const token = localStorage.getItem('ps_token');
  if (!token) return;
  try {
    const user = await loadProfile();
    localStorage.setItem('ps_user', JSON.stringify(user));
  } catch (err) {
    // token invalid: clear it
    localStorage.removeItem('ps_token');
    localStorage.removeItem('ps_user');
  }
})();
