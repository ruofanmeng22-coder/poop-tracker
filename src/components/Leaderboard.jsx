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
      <div className="leaderboard-subtitle">看看谁是最强屎者！</div>

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
        <div className="fun-fact-title">🤓 冷知识</div>
        <div className="fun-fact">人一生平均花费 <strong>3年</strong> 的时间在厕所里 🚽</div>
        <div className="fun-fact">健康的排便时间应该在 <strong>3-5分钟</strong> ⏱️</div>
        <div className="fun-fact">每天排便 <strong>1-3次</strong> 或每2-3天一次都属正常 📊</div>
      </div>
    </div>
  );
}
