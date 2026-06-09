import { useState, useEffect } from 'react';
import { getLeaderboard, formatDuration } from '../utils/api';

export default function Leaderboard({ currentUserId }) {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    getLeaderboard().then(setLeaderboard);
  }, []);

  const rankEmojis = ['👑', '🥈', '🥉'];

  return (
    <div className="leaderboard">
      <div className="leaderboard-title">🏆 排行榜</div>
      <div className="leaderboard-subtitle">看看谁是最强健身达人！</div>

      {leaderboard.length === 0 ? (
        <div className="leaderboard-empty">
          <div className="lb-empty-icon">🏅</div>
          <div>还没有排行数据</div>
          <div className="lb-empty-hint">快去打卡上榜吧！</div>
        </div>
      ) : (
        <div className="leaderboard-list">
          {leaderboard.map((user, index) => (
            <div key={user.userId} className={`lb-item ${user.userId === currentUserId ? 'lb-me' : ''} ${index < 3 ? 'lb-top' : ''}`}>
              <div className="lb-rank">
                {index < 3 ? <span className="lb-rank-emoji">{rankEmojis[index]}</span> : <span className="lb-rank-number">#{index + 1}</span>}
              </div>
              <div className="lb-avatar">{user.avatar}</div>
              <div className="lb-info">
                <div className="lb-name">
                  {user.name}
                  {user.userId === currentUserId && <span className="lb-me-tag">我</span>}
                </div>
                <div className="lb-stats">平均用时 {formatDuration(Math.round(user.totalDuration / user.count))}</div>
              </div>
              <div className="lb-count">
                <div className="lb-count-number">{user.count}</div>
                <div className="lb-count-label">次</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="leaderboard-fun-facts">
        <div className="fun-fact-title">🤓 健身冷知识</div>
        <div className="fun-fact">每周运动 <strong>150分钟</strong> 就能显著改善健康 💪</div>
        <div className="fun-fact">力量训练后肌肉需要 <strong>48小时</strong> 恢复 🏋️</div>
        <div className="fun-fact">运动时听音乐可以提升 <strong>15%</strong> 的运动表现 🎵</div>
      </div>
    </div>
  );
}
