import { useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import LoginScreen from './LoginScreen'
import GenelTab from './tabs/GenelTab'
import PosterlerTab from './tabs/PosterlerTab'
import YayincilarTab from './tabs/YayincilarTab'
import KurallarTab from './tabs/KurallarTab'
import KayitlarTab from './tabs/KayitlarTab'
import MaclarTab from './tabs/MaclarTab'
import ApiKeyTab from './tabs/ApiKeyTab'
import CarkTab from './tabs/CarkTab'
import LogTab from './tabs/LogTab'
import KullanicilarTab from './tabs/KullanicilarTab'
import styles from './Admin.module.css'

const SESSION_KEY = 'paxint_admin_session'

const ALL  = ['superadmin', 'yayinci', 'moderator']
const SA_Y = ['superadmin', 'yayinci']
const SA   = ['superadmin']

const TABS = [
  { id: 'genel',        label: '🎨 Genel',       roles: ALL  },
  { id: 'posterler',    label: '🖼️ Posterler',   roles: SA_Y },
  { id: 'yayincilar',   label: '🎮 Yayıncılar',  roles: SA_Y },
  { id: 'kurallar',     label: '📋 Kurallar',     roles: ALL  },
  { id: 'kayitlar',     label: '📝 Kayıtlar',     roles: SA_Y },
  { id: 'maclar',       label: '🏆 Maçlar',       roles: ALL  },
  { id: 'apikey',       label: '🔑 API Key',      roles: SA   },
  { id: 'cark',         label: '🎡 Çark',         roles: ALL  },
  { id: 'log',          label: '📊 Log',          roles: ALL  },
  { id: 'kullanicilar', label: '👥 Kullanıcılar', roles: ALL  },
]

function getSession() {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)) } catch { return null }
}

export default function Admin() {
  const { theme, setTheme } = useTheme()
  const [loggedIn, setLoggedIn] = useState(() => !!getSession()?.role)
  const [role, setRole]         = useState(() => getSession()?.role ?? null)
  const [username, setUsername] = useState(() => getSession()?.username ?? '')
  const [activeTab, setActiveTab] = useState('genel')

  async function handleLogin(uname, password) {
    try {
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: uname, password }),
      })
      if (!res.ok) return false
      const user = await res.json()
      const session = { role: user.role, username: user.username, token: user.token, expires: user.expires }
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
      setRole(user.role)
      setUsername(user.username)
      setLoggedIn(true)
      return true
    } catch {
      return false
    }
  }

  function handleLogout() {
    sessionStorage.removeItem(SESSION_KEY)
    setLoggedIn(false)
    setRole(null)
  }

  if (!loggedIn) return <LoginScreen onLogin={handleLogin} />

  const visibleTabs = TABS.filter(t => t.roles.includes(role))

  // Aktif tab görünür değilse ilk görünür tab'a geç
  const activeVisible = visibleTabs.find(t => t.id === activeTab)
    ? activeTab
    : visibleTabs[0]?.id

  return (
    <div className={styles.body}>
      <div className={styles.panel}>
        <div className={styles.adminTop}>
          <h1>⚙️ Admin Panel</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'rgba(212,245,192,0.4)', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.06em' }}>
              {username} · {role === 'superadmin' ? 'Süper Admin' : role === 'yayinci' ? 'Yayıncı' : 'Moderatör'}
            </span>
            <a href="/" className={styles.backLink}>← Anasayfaya Dön</a>
          </div>
        </div>

        {/* Tab Bar */}
        <div className={styles.tabBar}>
          {visibleTabs.map(t => (
            <button
              key={t.id}
              className={`${styles.tab} ${activeVisible === t.id ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeVisible === 'genel'        && <GenelTab theme={theme} setTheme={setTheme} />}
        {activeVisible === 'posterler'    && <PosterlerTab theme={theme} />}
        {activeVisible === 'yayincilar'   && <YayincilarTab />}
        {activeVisible === 'kurallar'     && <KurallarTab theme={theme} />}
        {activeVisible === 'kayitlar'     && <KayitlarTab />}
        {activeVisible === 'maclar'       && <MaclarTab />}
        {activeVisible === 'apikey'       && <ApiKeyTab />}
        {activeVisible === 'cark'         && <CarkTab />}
        {activeVisible === 'log'          && <LogTab />}
        {activeVisible === 'kullanicilar' && <KullanicilarTab role={role} />}

        <button className={styles.logoutBtn} onClick={handleLogout}>Çıkış Yap</button>
      </div>
    </div>
  )
}
