import { useState, useEffect } from 'react';
import { ACHIEVEMENTS } from '../utils/achievements';
import { getAchievements } from '../utils/api';

export default function Achievements({ userId }) {
  const [unlockedData, setUnlockedData] = useState([]);

  useEffect(() => {
    if (userId) getAchievements(userId).then(setUnlockedData);
  }, [userId]);

  const unlocked = {};
  unlockedData.forEach(a => { unlocked[a.id] = a.unlockedAt; });

  const achievements = ACHIEVEMENTS.map(a => ({
    ...a,
    unlockedAt: unlocked[a.id] || null,
    isUnlocked: !!unlocked[a.id],
  }));

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const progress = Math.round((unlockedCount / achievements.length) * 100);

  return (
    <div className="achievements">
      <div className="achievements-progress">
        <div className="progress-header">
          <span>🏆 成就进度</span>
          <span>{unlockedCount}/{achievements.length}</span>
        </div>
        <div className="progress-bar-bg">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="progress-percent">{progress}%</div>
      </div>
      <div className="achievements-grid">
        {achievements.map(a => (
          <div key={a.id} className={`achievement-card ${a.isUnlocked ? 'unlocked' : 'locked'}`}>
            <div className="achievement-icon">{a.isUnlocked ? a.icon : '🔒'}</div>
            <div className="achievement-info">
              <div className="achievement-name">{a.isUnlocked ? a.name : '???'}</div>
              <div className="achievement-desc">{a.isUnlocked ? a.desc : '继续打卡来解锁这个成就'}</div>
              {a.isUnlocked && a.unlockedAt && <div className="achievement-date">🎉 {new Date(a.unlockedAt).toLocaleDateString('zh-CN')} 解锁</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
