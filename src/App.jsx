import { useState, useEffect } from 'react'
import CheckIn from './components/CheckIn'
import Calendar from './components/Calendar'
import Statistics from './components/Statistics'
import Achievements from './components/Achievements'
import Leaderboard from './components/Leaderboard'
import { getCurrentUserId, getUser, createUser, getAllUsers, setCurrentUserId } from './utils/api'

const TABS = [
  { id: 'checkin', label: '打卡', icon: '🚽' },
  { id: 'calendar', label: '日历', icon: '📅' },
  { id: 'stats', label: '统计', icon: '📊' },
  { id: 'achievements', label: '成就', icon: '🏆' },
  { id: 'leaderboard', label: '排行', icon: '🥇' },
]

const AVATARS = ['💩', '🚽', '👑', '🌟', '🔥', '😎', '💪', '🎯', '🦊', '🐱', '🐶', '🐼']

const GREETINGS = ['该蹲坑啦！', '肚子有感觉没？', '是时候了！', '走，去厕所！', '蹲一个？', '冲鸭！去拉屎！']

function App() {
  const [activeTab, setActiveTab] = useState('checkin')
  const [refreshKey, setRefreshKey] = useState(0)
  const [currentUser, setCurrentUser] = useState(null)
  const [showUserSetup, setShowUserSetup] = useState(false)
  const [setupName, setSetupName] = useState('')
  const [setupAvatar, setSetupAvatar] = useState('💩')
  const [existingUsers, setExistingUsers] = useState([])
  const [showUserSwitch, setShowUserSwitch] = useState(false)
  const [greeting, setGreeting] = useState(GREETINGS[0])

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
    const name = setupName.trim() || '神秘屎者'
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
    setSetupAvatar('💩')
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
            <div className="setup-emoji">🚽</div>
            <h1 className="setup-title">蹲坑日记</h1>
            <p className="setup-subtitle">记录每一次畅快体验</p>
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
            🚀 开始蹲坑
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
          <span className="logo-emoji">🚽</span>
          <span className="logo-text">蹲坑日记</span>
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
        {activeTab === 'checkin' && <CheckIn userId={currentUser.id} onRecord={handleRecord} greeting={greeting} />}
        {activeTab === 'calendar' && <Calendar userId={currentUser.id} key={refreshKey} />}
        {activeTab === 'stats' && <Statistics userId={currentUser.id} key={refreshKey} />}
        {activeTab === 'achievements' && <Achievements userId={currentUser.id} key={refreshKey} />}
        {activeTab === 'leaderboard' && <Leaderboard currentUserId={currentUser.id} key={refreshKey} />}
      </main>

      <nav className="app-nav">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => { setActiveTab(tab.id); setShowUserSwitch(false); }}
          >
            <span className="nav-icon">{tab.icon}</span>
            <span className="nav-label">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

export default App
