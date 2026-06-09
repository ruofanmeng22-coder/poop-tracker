import { useState, useEffect, useRef } from 'react';
import { saveRecord as apiSaveRecord, generateId, formatDuration, getRecords, getAchievements, unlockAchievement, getStats } from '../utils/api';
import { EXERCISE_TYPES, INTENSITY_LEVELS, MOODS, ACHIEVEMENTS } from '../utils/achievements';

export default function CheckIn({ userId, onRecord, greeting, onTrackingChange }) {
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [exerciseType, setExerciseType] = useState(1);
  const [intensity, setIntensity] = useState('moderate');
  const [mood, setMood] = useState('good');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [newAchievements, setNewAchievements] = useState([]);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isTracking) {
      timerRef.current = setInterval(() => {
        const diff = Date.now() - startTime;
        setElapsed(Math.floor(diff / 1000));
      }, 100);
    }
    return () => clearInterval(timerRef.current);
  }, [isTracking, startTime]);

  useEffect(() => {
    onTrackingChange?.(isTracking);
  }, [isTracking, onTrackingChange]);

  useEffect(() => {
    const onBeforeUnload = (e) => {
      if (isTracking) {
        e.preventDefault();
        e.returnValue = '运动计时中，确定要离开吗？';
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isTracking]);

  const handleStart = () => {
    const now = Date.now();
    setStartTime(now);
    setIsTracking(true);
    setElapsed(0);
    setCurrentRecord({
      id: generateId(),
      userId,
      startTime: now,
      endTime: null,
      duration: 0,
      shape: 1,
      color: 'moderate',
      mood: 'good',
      note: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  const handleStop = () => {
    clearInterval(timerRef.current);
    const now = Date.now();
    const duration = Math.floor((now - startTime) / 1000);
    setElapsed(duration);
    setIsTracking(false);
    setShowDetail(true);
    setCurrentRecord(prev => ({ ...prev, endTime: now, duration }));
  };

  const handleSave = async () => {
    setSaving(true);
    const record = { ...currentRecord, shape: exerciseType, color: intensity, mood, note };

    try {
      await apiSaveRecord(record);

      const allRecords = await getRecords({ userId });
      const unlockedData = await getAchievements(userId);
      const statsData = await getStats(userId);
      const unlocked = {};
      unlockedData.forEach(a => { unlocked[a.id] = a.unlockedAt; });

      const newlyUnlocked = [];
      for (const achievement of ACHIEVEMENTS) {
        if (!unlocked[achievement.id] && achievement.check(allRecords, statsData.streak)) {
          const now = new Date().toISOString();
          await unlockAchievement(achievement.id, userId, now);
          newlyUnlocked.push(achievement);
        }
      }

      if (newlyUnlocked.length > 0) {
        setNewAchievements(newlyUnlocked);
      }
    } catch (err) {
      console.error('Save failed:', err);
    }

    setSaving(false);
    setShowDetail(false);
    setCurrentRecord(null);
    setNote('');
    setExerciseType(1);
    setIntensity('moderate');
    setMood('good');
    onRecord();
  };

  const handleCancel = () => { setShowDetail(false); setCurrentRecord(null); };
  const dismissAchievement = () => { setNewAchievements([]); };

  const getDurationComment = (seconds) => {
    if (seconds < 300) return '⚡ 快速热身！';
    if (seconds < 600) return '✨ 刚刚热起来！';
    if (seconds < 1800) return '💪 不错的训练！';
    if (seconds < 3600) return '🔥 认真锻炼了！';
    if (seconds < 7200) return '🏋️ 铁人模式！';
    return '🤯 超级硬核！';
  };

  return (
    <div className="check-in">
      {newAchievements.length > 0 && (
        <div className="achievement-popup" onClick={dismissAchievement}>
          <div className="achievement-popup-content">
            <div className="achievement-popup-icon">🎉</div>
            <div className="achievement-popup-title">成就解锁！</div>
            {newAchievements.map(a => (
              <div key={a.id} className="achievement-popup-item">
                <span className="achievement-popup-emoji">{a.icon}</span>
                <div>
                  <div className="achievement-popup-name">{a.name}</div>
                  <div className="achievement-popup-desc">{a.desc}</div>
                </div>
              </div>
            ))}
            <div className="achievement-popup-hint">点击任意处关闭</div>
          </div>
        </div>
      )}

      {!isTracking && !showDetail && (
        <div className="check-in-idle">
          <div className="poop-mascot">
            <div className="poop-emoji-big">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#43A047" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            </div>
            <div className="poop-speech">{greeting || '该练了！'}</div>
          </div>
          <button className="btn-start" onClick={handleStart}>
            <span className="btn-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            </span>
            <span className="btn-text">开始打卡</span>
          </button>
          <div className="check-in-hint">点击开始计时你的运动时间</div>
        </div>
      )}

      {isTracking && (
        <div className="check-in-tracking">
          <div className="dashboard-card">
            <div className="dashboard-header">
              <span className="dashboard-pulse"></span>
              <span className="dashboard-status">运动进行中</span>
            </div>
            <div className="timer-ring">
              <svg className="timer-ring-svg" viewBox="0 0 200 200">
                <defs>
                  <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#43A047" />
                    <stop offset="100%" stopColor="#66BB6A" />
                  </linearGradient>
                </defs>
                <circle className="timer-ring-bg" cx="100" cy="100" r="90" />
                <circle
                  className="timer-ring-progress"
                  cx="100" cy="100" r="90"
                  strokeDasharray={565}
                  strokeDashoffset={565 - ((elapsed % 60) / 60) * 565}
                />
              </svg>
              <div className="timer-ring-inner">
                <div className="timer-value">{formatDuration(elapsed)}</div>
              </div>
            </div>
            <div className="dashboard-metrics">
              <div className="metric">
                <div className="metric-value">{Math.floor(elapsed / 60)}</div>
                <div className="metric-label">分钟</div>
              </div>
              <div className="metric">
                <div className="metric-value">{elapsed % 60}</div>
                <div className="metric-label">秒</div>
              </div>
              <div className="metric">
                <div className="metric-value">~{Math.floor(elapsed * 0.15)}</div>
                <div className="metric-label">千卡</div>
              </div>
            </div>
          </div>
          <button className="btn-stop" onClick={handleStop}>
            <span className="btn-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>
            </span>
            <span className="btn-text">结束打卡</span>
          </button>
        </div>
      )}

      {showDetail && currentRecord && (
        <div className="check-in-detail">
          <div className="detail-header">
            <span className="detail-emoji">🎉</span>
            <span>打卡完成！</span>
          </div>
          <div className="detail-duration">
            用时 <strong>{formatDuration(currentRecord.duration)}</strong>
            <div className="detail-comment">{getDurationComment(currentRecord.duration)}</div>
          </div>

          <div className="detail-section">
            <div className="detail-section-title">🏃 运动类型</div>
            <div className="shape-selector">
              {EXERCISE_TYPES.map(s => (
                <button key={s.value} className={`shape-option ${exerciseType === s.value ? 'active' : ''}`} onClick={() => setExerciseType(s.value)} style={{ borderColor: exerciseType === s.value ? s.color : undefined }}>
                  <span className="shape-emoji">{s.emoji}</span>
                  <span className="shape-label">{s.label}</span>
                </button>
              ))}
            </div>
            <div className="shape-desc">{EXERCISE_TYPES[exerciseType - 1].desc}</div>
          </div>

          <div className="detail-section">
            <div className="detail-section-title">🔥 运动强度</div>
            <div className="color-selector">
              {INTENSITY_LEVELS.map(c => (
                <button key={c.value} className={`color-option ${intensity === c.value ? 'active' : ''}`} onClick={() => setIntensity(c.value)}>
                  <span className="color-dot" style={{ background: c.color }}></span>
                  <span className="color-label">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="detail-section">
            <div className="detail-section-title">😊 运动感受</div>
            <div className="mood-selector">
              {MOODS.map(m => (
                <button key={m.value} className={`mood-option ${mood === m.value ? 'active' : ''}`} onClick={() => setMood(m.value)}>
                  <span className="mood-emoji">{m.emoji}</span>
                  <span className="mood-label">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="detail-section">
            <div className="detail-section-title">📝 备注</div>
            <textarea className="note-input" value={note} onChange={e => setNote(e.target.value)} placeholder="今天练了什么？感觉如何？..." rows={3} />
          </div>

          <div className="detail-actions">
            <button className="btn-cancel" onClick={handleCancel}>取消</button>
            <button className="btn-save" onClick={handleSave} disabled={saving}>
              <span>💾</span> {saving ? '保存中...' : '保存记录'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
