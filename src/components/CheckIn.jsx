import { useState, useEffect, useRef } from 'react';
import { saveRecord as apiSaveRecord, generateId, formatDuration, getRecords, getAchievements, unlockAchievement } from '../utils/api';
import { BRISTOL_SCALE, POOP_COLORS, MOODS, ACHIEVEMENTS } from '../utils/achievements';

export default function CheckIn({ userId, onRecord, greeting }) {
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [shape, setShape] = useState(4);
  const [color, setColor] = useState('brown');
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
        setElapsedMs(Math.floor((diff % 1000) / 10));
      }, 50);
    }
    return () => clearInterval(timerRef.current);
  }, [isTracking, startTime]);

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
      shape: 4,
      color: 'brown',
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
    const record = { ...currentRecord, shape, color, mood, note };

    try {
      await apiSaveRecord(record);

      const allRecords = await getRecords({ userId });
      const unlockedData = await getAchievements(userId);
      const unlocked = {};
      unlockedData.forEach(a => { unlocked[a.id] = a.unlockedAt; });

      const newlyUnlocked = [];
      for (const achievement of ACHIEVEMENTS) {
        if (!unlocked[achievement.id] && achievement.check(allRecords)) {
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
    setShape(4);
    setColor('brown');
    setMood('good');
    onRecord();
  };

  const handleCancel = () => { setShowDetail(false); setCurrentRecord(null); };
  const dismissAchievement = () => { setNewAchievements([]); };

  const getDurationComment = (seconds) => {
    if (seconds < 60) return '⚡ 速战速决！';
    if (seconds < 180) return '✨ 完美节奏！';
    if (seconds < 300) return '👌 稳稳当当';
    if (seconds < 600) return '🧘 慢慢来不急';
    if (seconds < 1800) return '📖 带了手机吧？';
    return '🤯 你没事吧？';
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
            <div className="poop-emoji-big">🚽</div>
            <div className="poop-speech">{greeting || '该蹲坑啦！'}</div>
          </div>
          <button className="btn-start" onClick={handleStart}>
            <span className="btn-icon">💩</span>
            <span className="btn-text">开始打卡</span>
          </button>
          <div className="check-in-hint">点击开始计时你的如厕时间</div>
        </div>
      )}

      {isTracking && (
        <div className="check-in-tracking">
          <div className="tracking-animation">
            <div className="poop-floating">💩</div>
            <div className="poop-floating delay-1">💨</div>
            <div className="poop-floating delay-2">🧻</div>
          </div>
          <div className="timer-display">
            <div className="timer-label">⏱️ 正在进行中...</div>
            <div className="timer-value">{formatDuration(elapsed)}<span className="timer-ms">.{String(elapsedMs).padStart(2, '0')}</span></div>
          </div>
          <button className="btn-stop" onClick={handleStop}>
            <span className="btn-icon">✅</span>
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
            <div className="detail-section-title">💩 便便形状（布里斯托量表）</div>
            <div className="shape-selector">
              {BRISTOL_SCALE.map(s => (
                <button key={s.value} className={`shape-option ${shape === s.value ? 'active' : ''}`} onClick={() => setShape(s.value)} style={{ borderColor: shape === s.value ? s.color : undefined }}>
                  <span className="shape-emoji">{s.emoji}</span>
                  <span className="shape-label">{s.label}</span>
                </button>
              ))}
            </div>
            <div className="shape-desc">{BRISTOL_SCALE[shape - 1].desc}</div>
          </div>

          <div className="detail-section">
            <div className="detail-section-title">🎨 便便颜色</div>
            <div className="color-selector">
              {POOP_COLORS.map(c => (
                <button key={c.value} className={`color-option ${color === c.value ? 'active' : ''}`} onClick={() => setColor(c.value)}>
                  <span className="color-dot" style={{ background: c.color }}></span>
                  <span className="color-label">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="detail-section">
            <div className="detail-section-title">😊 心情</div>
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
            <textarea className="note-input" value={note} onChange={e => setNote(e.target.value)} placeholder="今天蹲坑有什么特别的吗？吃了什么？..." rows={3} />
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
