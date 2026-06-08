const API_BASE = '/api';

async function request(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API Error: ${res.status}`);
  }
  return res.json();
}

const USER_KEY = 'poop-tracker-userId';

export function getCurrentUserId() {
  return localStorage.getItem(USER_KEY);
}

export function setCurrentUserId(id) {
  localStorage.setItem(USER_KEY, id);
}

export async function createUser(name, avatar) {
  const user = await request('/users', {
    method: 'POST',
    body: JSON.stringify({ name, avatar }),
  });
  setCurrentUserId(user.id);
  return user;
}

export async function getUser(id) {
  return request(`/users/${id}`);
}

export async function updateUser(id, data) {
  return request(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function getAllUsers() {
  return request('/users');
}

export async function getRecords(params = {}) {
  const query = new URLSearchParams(params).toString();
  const queryStr = query ? `?${query}` : '';
  return request(`/records${queryStr}`);
}

export async function saveRecord(record) {
  return request('/records', {
    method: 'POST',
    body: JSON.stringify(record),
  });
}

export async function updateRecord(id, updates) {
  return request(`/records/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteRecord(id) {
  return request(`/records/${id}`, { method: 'DELETE' });
}

export async function getStats(userId) {
  const query = userId ? `?userId=${userId}` : '';
  return request(`/stats${query}`);
}

export async function getLeaderboard() {
  return request('/leaderboard');
}

export async function getAchievements(userId) {
  if (!userId) return [];
  return request(`/achievements?userId=${userId}`);
}

export async function unlockAchievement(id, userId, unlockedAt) {
  return request('/achievements', {
    method: 'POST',
    body: JSON.stringify({ id, userId, unlockedAt }),
  });
}

export async function exportData() {
  return request('/export');
}

export async function importData(data) {
  return request('/import', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '0秒';
  if (seconds < 60) return `${seconds}秒`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 60) return `${mins}分${secs}秒`;
  const hours = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return `${hours}时${remainMins}分`;
}
