import { useState, useEffect } from 'react'
import CheckIn from './components/CheckIn'
import Calendar from './components/Calendar'
import Statistics from './components/Statistics'
import Achievements from './components/Achievements'
import Leaderboard from './components/Leaderboard'
import { getCurrentUserId, getUser, createUser, getAllUsers, setCurrentUserId } from './utils/api'

const TABS = [
  { id: 'checkin', label: '打卡', icon: 'checkin' },
  { id: 'calendar', label: '日历', icon: 'calendar' },
  { id: 'stats', label: '统计', icon: 'stats' },
  { id: 'achievements', label: '成就', icon: 'achievements' },
  { id: 'leaderboard', label: '排行', icon: 'leaderboard' },
]

function TabIcon({ type, active }) {
  const color = active ? '#43A047' : '#999'
  const icons = {
    checkin: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
    ),
    calendar: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
    ),
    stats: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
    ),
    achievements: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
    ),
    leaderboard: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
    ),
  }
  return icons[type] || null
}

const AVATARS = ['💪', '🏋️', '🏃', '🧘', '🏊', '🚴', '🔥', '😎', '🦊', '🐱', '🐶', '🐼']

const GREETINGS = ['该练了！', '今天动了吗？', '冲鸭！去运动！', '别躺了，练起来！', '燃烧吧卡路里！', '动一动更健康！']

function App() {
  const [activeTab, setActiveTab] = useState('checkin')
  const [refreshKey, setRefreshKey] = useState(0)
  const [currentUser, setCurrentUser] = useState(null)
  const [showUserSetup, setShowUserSetup] = useState(false)
  const [setupName, setSetupName] = useState('')
  const [setupAvatar, setSetupAvatar] = useState('💪')
  const [existingUsers, setExistingUsers] = useState([])
  const [showUserSwitch, setShowUserSwitch] = useState(false)
  const [greeting, setGreeting] = useState(GREETINGS[0])
  const [isTracking, setIsTracking] = useState(false)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [pendingTab, setPendingTab] = useState(null)

  useEffect(() => {
    initUser()
    setGreeting(GREETINGS[Math.floor(Math.random() * GREETINGS.length)])
  }, [])

  async function initUser() {
    const userId = getCurrentUserId()
    if (userId) {
      try {
        const user = await getUser(userId)
        setCurrentUser(user)
        return
      } catch {
        setCurrentUserId('')
      }
    }

    const users = await getAllUsers()
    setExistingUsers(users)
    setShowUserSetup(true)
  }

  async function handleCreateUser() {
    const name = setupName.trim() || '健身达人'
    const user = await createUser(name, setupAvatar)
    setCurrentUser(user)
    setShowUserSetup(false)
  }

  async function handleSelectUser(userId) {
    setCurrentUserId(userId)
    const user = await getUser(userId)
    setCurrentUser(user)
    setShowUserSetup(false)
  }

  async function handleSwitchUser(userId) {
    setCurrentUserId(userId)
    const user = await getUser(userId)
    setCurrentUser(user)
    setShowUserSwitch(false)
    setRefreshKey(prev => prev + 1)
  }

  async function handleCreateNewFromSwitch() {
    const users = await getAllUsers()
    setExistingUsers(users)
    setSetupName('')
    setSetupAvatar('💪')
    setShowUserSwitch(false)
    setShowUserSetup(true)
  }

  const handleRecord = () => {
    setRefreshKey(prev => prev + 1)
  }

  if (showUserSetup) {
    return (
      <div className="app">
        <div className="user-setup-page">
          <div className="setup-hero">
            <div className="setup-emoji">💪</div>
            <h1 className="setup-title">练了么</h1>
            <p className="setup-subtitle">记录每一次汗水与坚持</p>
          </div>

          {existingUsers.length > 0 && (
            <div className="setup-section">
              <div className="setup-section-title">选择已有用户</div>
              <div className="existing-users">
                {existingUsers.map(u => (
                  <button key={u.id} className="existing-user-btn" onClick={() => handleSelectUser(u.id)}>
                    <span className="existing-user-avatar">{u.avatar}</span>
                    <span className="existing-user-name">{u.name}</span>
                  </button>
                ))}
              </div>
              <div className="setup-divider">
                <span>或创建新用户</span>
              </div>
            </div>
          )}

          <div className="setup-section">
            <div className="setup-section-title">选择头像</div>
            <div className="avatar-grid">
              {AVATARS.map(a => (
                <button
                  key={a}
                  className={`avatar-option ${setupAvatar === a ? 'active' : ''}`}
                  onClick={() => setSetupAvatar(a)}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div className="setup-section">
            <div className="setup-section-title">你的昵称</div>
            <input
              type="text"
              className="setup-input"
              value={setupName}
              onChange={e => setSetupName(e.target.value)}
              placeholder="输入昵称..."
              maxLength={20}
              onKeyDown={e => e.key === 'Enter' && handleCreateUser()}
            />
          </div>

          <button className="setup-go-btn" onClick={handleCreateUser}>
            🚀 开始运动
          </button>
        </div>
      </div>
    )
  }

  if (!currentUser) return null

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-logo">
          <span className="logo-icon">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          </span>
          <span className="logo-text">练了么</span>
        </div>
        <button className="header-user-btn" onClick={() => setShowUserSwitch(!showUserSwitch)}>
          <span className="header-avatar">{currentUser.avatar}</span>
          <span className="header-name">{currentUser.name}</span>
        </button>
      </header>

      {showUserSwitch && (
        <div className="user-switch-panel">
          <div className="switch-panel-header">切换用户</div>
          {existingUsers.length > 0 && existingUsers.map(u => (
            <button
              key={u.id}
              className={`switch-user-btn ${u.id === currentUser.id ? 'current' : ''}`}
              onClick={() => handleSwitchUser(u.id)}
            >
              <span className="switch-user-avatar">{u.avatar}</span>
              <span className="switch-user-name">{u.name}</span>
              {u.id === currentUser.id && <span className="switch-user-tag">当前</span>}
            </button>
          ))}
          <button className="switch-new-btn" onClick={handleCreateNewFromSwitch}>
            ➕ 创建新用户
          </button>
        </div>
      )}

      <main className="app-content">
        {activeTab === 'checkin' && <CheckIn userId={currentUser.id} onRecord={handleRecord} greeting={greeting} onTrackingChange={setIsTracking} />}
        {activeTab === 'calendar' && <Calendar userId={currentUser.id} key={refreshKey} />}
        {activeTab === 'stats' && <Statistics userId={currentUser.id} key={refreshKey} />}
        {activeTab === 'achievements' && <Achievements userId={currentUser.id} key={refreshKey} />}
        {activeTab === 'leaderboard' && <Leaderboard currentUserId={currentUser.id} key={refreshKey} />}
      </main>

      {showLeaveConfirm && (
        <div className="modal-overlay" onClick={() => setShowLeaveConfirm(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">⚠️</div>
            <div className="modal-title">运动计时中</div>
            <div className="modal-desc">切换页面将丢失当前计时，确定要离开吗？</div>
            <div className="modal-actions">
              <button className="modal-btn secondary" onClick={() => setShowLeaveConfirm(false)}>继续运动</button>
              <button className="modal-btn primary" onClick={() => { setShowLeaveConfirm(false); setActiveTab(pendingTab); setIsTracking(false); }}>确认离开</button>
            </div>
          </div>
        </div>
      )}

      <nav className="app-nav">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => {
              if (isTracking && tab.id !== 'checkin') {
                setPendingTab(tab.id);
                setShowLeaveConfirm(true);
              } else {
                setActiveTab(tab.id);
                setShowUserSwitch(false);
              }
            }}
          >
            <span className="nav-icon"><TabIcon type={tab.icon} active={activeTab === tab.id} /></span>
            <span className="nav-label">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

export default App
