const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

function getUser() {
  const u = localStorage.getItem('user');
  return u ? JSON.parse(u) : null;
}

function setAuth(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

async function api(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(API_BASE + path, opts);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `Lỗi ${res.status}`);
  }
  return data;
}

// Auth
const AuthAPI = {
  login: (email, password) => api('POST', '/auth/login', { email, password }),
  register: (payload) => api('POST', '/auth/register', payload),
  me: () => api('GET', '/auth/me')
};

// Jobs
const JobsAPI = {
  list: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api('GET', '/jobs' + (q ? '?' + q : ''));
  },
  get: (id) => api('GET', `/jobs/${id}`),
  create: (data) => api('POST', '/jobs', data),
  update: (id, data) => api('PUT', `/jobs/${id}`, data),
  remove: (id) => api('DELETE', `/jobs/${id}`),
  myList: () => api('GET', '/jobs/my/list')
};

// Applications
const ApplicationsAPI = {
  apply: (job_id, cover_letter) => api('POST', '/applications', { job_id, cover_letter }),
  my: () => api('GET', '/applications/my'),
  forRecruiter: () => api('GET', '/applications/for-recruiter'),
  updateStatus: (id, status) => api('PUT', `/applications/${id}/status`, { status })
};

// Companies
const CompaniesAPI = {
  list: () => api('GET', '/companies'),
  get: (id) => api('GET', `/companies/${id}`),
  create: (data) => api('POST', '/companies', data),
  update: (id, data) => api('PUT', `/companies/${id}`, data),
  my: () => api('GET', '/companies/my/company')
};

// Profiles
const ProfilesAPI = {
  me: () => api('GET', '/profiles/me'),
  update: (data) => api('PUT', '/profiles/me', data),
  get: (userId) => api('GET', `/profiles/${userId}`)
};

// Interviews
const InterviewsAPI = {
  create: (data) => api('POST', '/interviews', data),
  update: (id, data) => api('PUT', `/interviews/${id}`, data),
  forRecruiter: () => api('GET', '/interviews/for-recruiter'),
  my: () => api('GET', '/interviews/my')
};

// Admin
const AdminAPI = {
  users: () => api('GET', '/admin/users'),
  updateRole: (id, role) => api('PUT', `/admin/users/${id}/role`, { role }),
  deleteUser: (id) => api('DELETE', `/admin/users/${id}`),
  stats: () => api('GET', '/admin/stats')
};
