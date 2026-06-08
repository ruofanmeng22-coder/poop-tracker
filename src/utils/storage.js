const STORAGE_KEY = 'poop-tracker-data';

export function getRecords() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveRecord(record) {
  const records = getRecords();
  records.push(record);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  return records;
}

export function updateRecord(id, updates) {
  const records = getRecords();
  const index = records.findIndex(r => r.id === id);
  if (index !== -1) {
    records[index] = { ...records[index], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }
  return records;
}

export function deleteRecord(id) {
  const records = getRecords().filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  return records;
}

export function getRecordsByDate(dateStr) {
  return getRecords().filter(r => r.date === dateStr);
}

export function getRecordsByDateRange(startDate, endDate) {
  return getRecords().filter(r => r.date >= startDate && r.date <= endDate);
}

export function getStreak() {
  const records = getRecords();
  if (records.length === 0) return 0;

  const dates = [...new Set(records.map(r => r.date))].sort().reverse();
  let streak = 1;
  const today = new Date().toISOString().split('T')[0];

  if (dates[0] !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (dates[0] !== yesterday) return 0;
  }

  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diff = (prev - curr) / 86400000;
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function formatDuration(seconds) {
  if (seconds < 60) return `${seconds}秒`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 60) return `${mins}分${secs}秒`;
  const hours = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return `${hours}时${remainMins}分`;
}

export function getLeaderboard() {
  const records = getRecords();
  const userStats = {};

  records.forEach(r => {
    const key = r.userName || '我';
    if (!userStats[key]) {
      userStats[key] = { name: key, count: 0, totalDuration: 0 };
    }
    userStats[key].count++;
    userStats[key].totalDuration += r.duration || 0;
  });

  return Object.values(userStats).sort((a, b) => b.count - a.count);
}
