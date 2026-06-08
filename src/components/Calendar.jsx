import { useState, useMemo, useEffect } from 'react';
import { getRecords } from '../utils/api';

export default function Calendar({ userId }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [records, setRecords] = useState([]);

  useEffect(() => {
    if (userId) getRecords({ userId }).then(setRecords);
  }, [userId]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPad = firstDay.getDay();
    const totalDays = lastDay.getDate();
    const days = [];
    for (let i = 0; i < startPad; i++) days.push({ day: null, dateStr: null });
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayRecords = records.filter(r => r.date === dateStr);
      days.push({ day: d, dateStr, count: dayRecords.length, records: dayRecords });
    }
    return days;
  }, [year, month, records]);

  const selectedRecords = selectedDate ? records.filter(r => r.date === selectedDate) : [];
  const today = new Date().toISOString().split('T')[0];

  const getHeatColor = (count) => {
    if (count === 0) return 'transparent';
    if (count === 1) return '#A1887F';
    if (count === 2) return '#8D6E63';
    if (count === 3) return '#795548';
    return '#5D4037';
  };

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button className="cal-nav-btn" onClick={() => { setCurrentDate(new Date(year, month - 1, 1)); setSelectedDate(null); }}>◀</button>
        <div className="cal-title">{year}年{month + 1}月</div>
        <button className="cal-nav-btn" onClick={() => { setCurrentDate(new Date(year, month + 1, 1)); setSelectedDate(null); }}>▶</button>
      </div>
      <div className="calendar-weekdays">
        {['日', '一', '二', '三', '四', '五', '六'].map(d => <div key={d} className="weekday">{d}</div>)}
      </div>
      <div className="calendar-grid">
        {calendarDays.map((day, i) => (
          <div key={i} className={`cal-day ${!day.day ? 'empty' : ''} ${day.dateStr === today ? 'today' : ''} ${day.dateStr === selectedDate ? 'selected' : ''}`} onClick={() => day.day && setSelectedDate(day.dateStr)}>
            {day.day && (
              <>
                <span className="day-number">{day.day}</span>
                {day.count > 0 && (
                  <div className="day-indicator" style={{ background: getHeatColor(day.count) }}>
                    {day.count > 1 && <span className="day-count">{day.count}</span>}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
      <div className="calendar-legend">
        <span className="legend-label">少</span>
        <div className="legend-colors">
          {[ '#D7CCC8', '#A1887F', '#8D6E63', '#795548', '#5D4037'].map(c => <div key={c} className="legend-block" style={{ background: c }}></div>)}
        </div>
        <span className="legend-label">多</span>
      </div>
      {selectedDate && (
        <div className="selected-date-detail">
          <div className="selected-date-header">📅 {selectedDate} 的打卡记录</div>
          {selectedRecords.length === 0 ? (
            <div className="no-records">这天没有打卡记录 💨</div>
          ) : (
            <div className="selected-records">
              {selectedRecords.map((r, i) => (
                <div key={r.id} className="record-card">
                  <div className="record-card-header">
                    <span>第{i + 1}次</span>
                    <span className="record-duration">⏱️ {r.duration ? `${Math.floor(r.duration / 60)}分${r.duration % 60}秒` : '未知'}</span>
                  </div>
                  <div className="record-card-details">
                    {r.shape && <span>💩 布里斯托{r.shape}型</span>}
                    {r.mood && <span>{r.mood === 'great' ? '😎' : r.mood === 'good' ? '😊' : r.mood === 'normal' ? '😐' : r.mood === 'struggle' ? '😣' : '😭'}</span>}
                    {r.note && <div className="record-note">📝 {r.note}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
