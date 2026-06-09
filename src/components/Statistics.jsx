import { useState, useEffect } from 'react';
import { getStats, formatDuration } from '../utils/api';
import { EXERCISE_TYPES, MOODS } from '../utils/achievements';

export default function Statistics({ userId }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      getStats(userId).then(data => { setStats(data); setLoading(false); }).catch(() => setLoading(false));
    }
  }, [userId]);

  if (loading) return <div className="statistics-empty"><div className="stats-empty-icon">⏳</div><div className="stats-empty-text">加载中...</div></div>;

  if (!stats || stats.total === 0) return <div className="statistics-empty"><div className="stats-empty-icon">📊</div><div className="stats-empty-text">还没有打卡记录</div><div className="stats-empty-hint">快去打卡吧！数据会在这里显示</div></div>;

  const hourCounts = new Array(24).fill(0);
  stats.hourDistribution.forEach(h => { hourCounts[h.hour] = h.count; });
  const maxHourCount = Math.max(...hourCounts);
  const peakHour = hourCounts.indexOf(Math.max(...hourCounts));

  const weekDayCounts = new Array(7).fill(0);
  stats.weekDayDistribution.forEach(w => { weekDayCounts[w.weekday] = w.count; });
  const maxWeekDayCount = Math.max(...weekDayCounts);

  return (
    <div className="statistics">
      <div className="stats-overview">
        <div className="stat-card highlight"><div className="stat-value">{stats.total}</div><div className="stat-label">累计打卡</div><div className="stat-emoji">🏋️</div></div>
        <div className="stat-card"><div className="stat-value">{stats.streak}</div><div className="stat-label">连续天数</div><div className="stat-emoji">🔥</div></div>
        <div className="stat-card"><div className="stat-value">{stats.todayCount}</div><div className="stat-label">今日打卡</div><div className="stat-emoji">📅</div></div>
        <div className="stat-card"><div className="stat-value">{stats.thisWeekCount}</div><div className="stat-label">本周打卡</div><div className="stat-emoji">📆</div></div>
      </div>

      <div className="stats-section">
        <div className="stats-section-title">⏱️ 时间统计</div>
        <div className="stats-grid">
          <div className="stat-item"><div className="stat-item-label">平均用时</div><div className="stat-item-value">{formatDuration(stats.avgDuration)}</div></div>
          <div className="stat-item"><div className="stat-item-label">最长用时</div><div className="stat-item-value">{formatDuration(stats.maxDuration)}</div></div>
          <div className="stat-item"><div className="stat-item-label">最短用时</div><div className="stat-item-value">{formatDuration(stats.minDuration)}</div></div>
          <div className="stat-item"><div className="stat-item-label">总用时</div><div className="stat-item-value">{formatDuration(stats.totalDuration)}</div></div>
        </div>
      </div>

      <div className="stats-section">
        <div className="stats-section-title">🕐 高峰时段</div>
        <div className="hour-chart">
          {hourCounts.map((count, hour) => (
            <div key={hour} className="hour-bar-wrapper">
              <div className="hour-bar" style={{ height: maxHourCount > 0 ? `${(count / maxHourCount) * 100}%` : '0%', background: count === maxHourCount && count > 0 ? 'var(--primary)' : 'var(--primary-light)' }}>
                {count > 0 && <span className="hour-bar-count">{count}</span>}
              </div>
              <span className="hour-label">{hour}</span>
            </div>
          ))}
        </div>
        <div className="peak-hour-info">🏆 高峰时段: <strong>{peakHour}点</strong></div>
      </div>

      <div className="stats-section">
        <div className="stats-section-title">📅 星期分布</div>
        <div className="weekday-chart">
          {['周日', '周一', '周二', '周三', '周四', '周五', '周六'].map((day, i) => (
            <div key={i} className="weekday-bar-wrapper">
              <div className="weekday-bar" style={{ height: maxWeekDayCount > 0 ? `${(weekDayCounts[i] / maxWeekDayCount) * 100}%` : '0%', background: weekDayCounts[i] === maxWeekDayCount && weekDayCounts[i] > 0 ? 'var(--primary)' : 'var(--primary-light)' }}>
                {weekDayCounts[i] > 0 && <span className="weekday-bar-count">{weekDayCounts[i]}</span>}
              </div>
              <span className="weekday-label">{day}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="stats-section">
        <div className="stats-section-title">🏃 运动类型分布</div>
        <div className="shape-stats">
          {stats.shapeDistribution.map(({ shape, count }) => {
            const info = EXERCISE_TYPES[shape - 1];
            return (
              <div key={shape} className="shape-stat-row">
                <span className="shape-stat-emoji">{info?.emoji || '🎯'}</span>
                <span className="shape-stat-label">{info?.label || `${shape}型`}</span>
                <div className="shape-stat-bar-bg"><div className="shape-stat-bar" style={{ width: `${(count / stats.total) * 100}%` }}></div></div>
                <span className="shape-stat-count">{count}次</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="stats-section">
        <div className="stats-section-title">😊 感受分布</div>
        <div className="mood-stats">
          {stats.moodDistribution.map(({ mood, count }) => {
            const info = MOODS.find(m => m.value === mood);
            return (
              <div key={mood} className="mood-stat-item">
                <span className="mood-stat-emoji">{info?.emoji || '😐'}</span>
                <span className="mood-stat-label">{info?.label || mood}</span>
                <span className="mood-stat-count">{count}次</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
