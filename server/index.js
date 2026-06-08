import express from 'express';
import Database from 'better-sqlite3';
import cors from 'cors';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const dbPath = process.env.NODE_ENV === 'production'
  ? join('/tmp', 'poop-tracker.db')
  : join(__dirname, 'poop-tracker.db');

const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    avatar TEXT DEFAULT '💩',
    createdAt INTEGER DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS records (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    startTime INTEGER NOT NULL,
    endTime INTEGER,
    duration INTEGER DEFAULT 0,
    shape INTEGER,
    color TEXT,
    mood TEXT,
    note TEXT,
    date TEXT NOT NULL,
    createdAt INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (userId) REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_records_date ON records(date);
  CREATE INDEX IF NOT EXISTS idx_records_user ON records(userId);

  CREATE TABLE IF NOT EXISTS achievements (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    unlockedAt TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_achievements_user ON achievements(userId);
`);

app.post('/api/users', (req, res) => {
  const { name, avatar } = req.body;
  const id = crypto.randomUUID();
  const finalAvatar = avatar || '💩';

  try {
    db.prepare('INSERT INTO users (id, name, avatar) VALUES (?, ?, ?)').run(id, name || '神秘屎者', finalAvatar);
    res.json({ id, name: name || '神秘屎者', avatar: finalAvatar });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/:id', (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

app.put('/api/users/:id', (req, res) => {
  const { name, avatar } = req.body;
  const updates = [];
  const params = [];

  if (name !== undefined) { updates.push('name = ?'); params.push(name); }
  if (avatar !== undefined) { updates.push('avatar = ?'); params.push(avatar); }

  if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });

  params.push(req.params.id);
  try {
    db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...params);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users', (req, res) => {
  const users = db.prepare('SELECT * FROM users ORDER BY createdAt DESC').all();
  res.json(users);
});

app.get('/api/records', (req, res) => {
  const { date, startDate, endDate, userId } = req.query;
  let sql = 'SELECT r.*, u.name as userName, u.avatar as userAvatar FROM records r LEFT JOIN users u ON r.userId = u.id WHERE 1=1';
  const params = [];

  if (date) { sql += ' AND r.date = ?'; params.push(date); }
  if (startDate && endDate) { sql += ' AND r.date >= ? AND r.date <= ?'; params.push(startDate, endDate); }
  if (userId) { sql += ' AND r.userId = ?'; params.push(userId); }

  sql += ' ORDER BY r.startTime DESC';
  const records = db.prepare(sql).all(...params);
  res.json(records);
});

app.post('/api/records', (req, res) => {
  const { id, userId, startTime, endTime, duration, shape, color, mood, note, date } = req.body;

  if (!userId) return res.status(400).json({ error: 'userId is required' });

  const stmt = db.prepare(`
    INSERT INTO records (id, userId, startTime, endTime, duration, shape, color, mood, note, date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  try {
    stmt.run(id, userId, startTime, endTime, duration || 0, shape, color, mood, note, date);
    const record = db.prepare('SELECT r.*, u.name as userName, u.avatar as userAvatar FROM records r LEFT JOIN users u ON r.userId = u.id WHERE r.id = ?').get(id);
    res.json({ success: true, record });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/records/:id', (req, res) => {
  const { id } = req.params;
  const fields = req.body;

  const validFields = ['startTime', 'endTime', 'duration', 'shape', 'color', 'mood', 'note', 'date'];
  const updates = [];
  const params = [];

  for (const [key, value] of Object.entries(fields)) {
    if (validFields.includes(key)) { updates.push(`${key} = ?`); params.push(value); }
  }

  if (updates.length === 0) return res.status(400).json({ error: 'No valid fields to update' });

  params.push(id);
  try {
    db.prepare(`UPDATE records SET ${updates.join(', ')} WHERE id = ?`).run(...params);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/records/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM records WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/stats', (req, res) => {
  const { userId } = req.query;

  let userFilter = '';
  const params = [];
  if (userId) { userFilter = ' AND userId = ?'; params.push(userId); }

  const total = db.prepare(`SELECT COUNT(*) as count FROM records WHERE 1=1${userFilter}`).get(...params).count;

  const today = new Date().toISOString().split('T')[0];
  const todayCount = db.prepare(`SELECT COUNT(*) as count FROM records WHERE date = ?${userFilter}`).get(today, ...params).count;

  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
  const thisWeekStartStr = thisWeekStart.toISOString().split('T')[0];
  const thisWeekCount = db.prepare(`SELECT COUNT(*) as count FROM records WHERE date >= ?${userFilter}`).get(thisWeekStartStr, ...params).count;

  const thisMonthStr = today.substring(0, 7);
  const thisMonthCount = db.prepare(`SELECT COUNT(*) as count FROM records WHERE date LIKE ? || '%'${userFilter}`).get(thisMonthStr, ...params).count;

  const streak = calculateStreak(userId);

  const hourDistribution = db.prepare(`
    SELECT CAST(strftime('%H', startTime / 1000, 'unixepoch') AS INTEGER) as hour, COUNT(*) as count
    FROM records WHERE 1=1${userFilter}
    GROUP BY hour ORDER BY hour
  `).all(...params);

  const weekDayDistribution = db.prepare(`
    SELECT CAST(strftime('%w', date) AS INTEGER) as weekday, COUNT(*) as count
    FROM records WHERE 1=1${userFilter}
    GROUP BY weekday ORDER BY weekday
  `).all(...params);

  const shapeDistribution = db.prepare(`
    SELECT shape, COUNT(*) as count
    FROM records WHERE shape IS NOT NULL${userFilter}
    GROUP BY shape ORDER BY count DESC
  `).all(...params);

  const moodDistribution = db.prepare(`
    SELECT mood, COUNT(*) as count
    FROM records WHERE mood IS NOT NULL${userFilter}
    GROUP BY mood ORDER BY count DESC
  `).all(...params);

  const avgDuration = db.prepare(`SELECT AVG(duration) as avg FROM records WHERE duration > 0${userFilter}`).get(...params).avg || 0;
  const maxDuration = db.prepare(`SELECT MAX(duration) as max FROM records WHERE duration > 0${userFilter}`).get(...params).max || 0;
  const minDuration = db.prepare(`SELECT MIN(duration) as min FROM records WHERE duration > 0${userFilter}`).get(...params).min || 0;
  const totalDuration = db.prepare(`SELECT SUM(duration) as total FROM records WHERE duration > 0${userFilter}`).get(...params).total || 0;

  res.json({
    total, todayCount, thisWeekCount, thisMonthCount, streak,
    hourDistribution, weekDayDistribution, shapeDistribution, moodDistribution,
    avgDuration: Math.round(avgDuration), maxDuration, minDuration, totalDuration,
  });
});

function calculateStreak(userId) {
  let userFilter = '';
  const params = [];
  if (userId) { userFilter = ' AND userId = ?'; params.push(userId); }

  const dates = db.prepare(`SELECT DISTINCT date FROM records WHERE 1=1${userFilter} ORDER BY date DESC`).all(...params);
  if (dates.length === 0) return 0;

  let streak = 1;
  const today = new Date().toISOString().split('T')[0];

  if (dates[0].date !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (dates[0].date !== yesterday) return 0;
  }

  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1].date);
    const curr = new Date(dates[i].date);
    const diff = (prev - curr) / 86400000;
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

app.get('/api/leaderboard', (req, res) => {
  const leaderboard = db.prepare(`
    SELECT u.id as userId, u.name, u.avatar,
           COUNT(r.id) as count,
           COALESCE(SUM(r.duration), 0) as totalDuration
    FROM users u
    LEFT JOIN records r ON u.id = r.userId
    GROUP BY u.id
    HAVING count > 0
    ORDER BY count DESC, totalDuration ASC
  `).all();
  res.json(leaderboard);
});

app.get('/api/achievements', (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.json([]);

  const achievements = db.prepare('SELECT * FROM achievements WHERE userId = ?').all(userId);
  res.json(achievements);
});

app.post('/api/achievements', (req, res) => {
  const { id, userId, unlockedAt } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId is required' });

  try {
    db.prepare('INSERT OR REPLACE INTO achievements (id, userId, unlockedAt) VALUES (?, ?, ?)').run(id, userId, unlockedAt);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/export', (req, res) => {
  const users = db.prepare('SELECT * FROM users').all();
  const records = db.prepare('SELECT * FROM records').all();
  const achievements = db.prepare('SELECT * FROM achievements').all();

  res.json({ users, records, achievements, exportedAt: new Date().toISOString() });
});

app.post('/api/import', (req, res) => {
  const { users, records, achievements } = req.body;

  try {
    const insertUser = db.prepare('INSERT OR REPLACE INTO users (id, name, avatar, createdAt) VALUES (?, ?, ?, ?)');
    const insertRecord = db.prepare('INSERT OR REPLACE INTO records (id, userId, startTime, endTime, duration, shape, color, mood, note, date, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    const insertAchievement = db.prepare('INSERT OR REPLACE INTO achievements (id, userId, unlockedAt) VALUES (?, ?, ?)');

    const transaction = db.transaction(() => {
      if (users) {
        for (const u of users) insertUser.run(u.id, u.name, u.avatar, u.createdAt);
      }
      if (records) {
        for (const r of records) insertRecord.run(r.id, r.userId, r.startTime, r.endTime, r.duration, r.shape, r.color, r.mood, r.note, r.date, r.createdAt);
      }
      if (achievements) {
        for (const a of achievements) insertAchievement.run(a.id, a.userId, a.unlockedAt);
      }
    });

    transaction();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const distPath = join(__dirname, '..', 'dist');
app.use(express.static(distPath));
app.get('{*path}', (req, res) => {
  res.sendFile(join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`💩 拉屎打卡运行在 http://localhost:${PORT}`);
});
