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
import styles from './Admin.module.css'

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'Paxint2026'
const SESSION_KEY = 'paxint_admin_session'

const TABS = [
  { id: 'genel',      label: '🎨 Genel' },
  { id: 'posterler',  label: '🖼️ Posterler' },
  { id: 'yayincilar', label: '🎮 Yayıncılar' },
  { id: 'kurallar',   label: '📋 Kurallar' },
  { id: 'kayitlar',   label: '📝 Kayıtlar' },
  { id: 'maclar',     label: '🏆 Maçlar' },
  { id: 'apikey',     label: '🔑 API Key' },
  { id: 'cark',       label: '🎡 Çark' },
]

export default function Admin() {
  const { theme, setTheme } = useTheme()
  const [loggedIn, setLoggedIn] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === '1'
  )
  const [activeTab, setActiveTab] = useState('genel')

  function handleLogin(password) {
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, '1')
      setLoggedIn(true)
      return true
    }
    return false
  }

  function handleLogout() {
    sessionStorage.removeItem(SESSION_KEY)
    setLoggedIn(false)
  }

  if (!loggedIn) return <LoginScreen onLogin={handleLogin} />

  return (
    <div className={styles.body}>
      <div className={styles.panel}>
        <div className={styles.adminTop}>
          <h1>⚙️ Admin Panel</h1>
          <a href="/" className={styles.backLink}>← Anasayfaya Dön</a>
        </div>

        {/* Tab Bar */}
        <div className={styles.tabBar}>
          {TABS.map(t => (
            <button
              key={t.id}
              className={`${styles.tab} ${activeTab === t.id ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'genel'      && <GenelTab theme={theme} setTheme={setTheme} />}
        {activeTab === 'posterler'  && <PosterlerTab theme={theme} />}
        {activeTab === 'yayincilar' && <YayincilarTab />}
        {activeTab === 'kurallar'   && <KurallarTab theme={theme} />}
        {activeTab === 'kayitlar'   && <KayitlarTab />}
        {activeTab === 'maclar'     && <MaclarTab />}
        {activeTab === 'apikey'     && <ApiKeyTab />}
        {activeTab === 'cark'       && <CarkTab />}

        <button className={styles.logoutBtn} onClick={handleLogout}>Çıkış Yap</button>
      </div>
    </div>
  )
}
