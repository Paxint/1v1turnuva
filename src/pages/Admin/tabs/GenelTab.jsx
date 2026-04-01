import { useEffect, useState } from 'react'
import { getSetting, setSetting, deleteSetting } from '../../../lib/supabase'
import styles from './Tabs.module.css'

export default function GenelTab({ theme, setTheme }) {
  const [badge, setBadge] = useState('')
  const [followUrl, setFollowUrl] = useState('')
  const [countdown, setCountdown] = useState('')
  const [sucMsg, setSucMsg] = useState('')

  useEffect(() => {
    async function load() {
      const [b, f, c] = await Promise.all([
        getSetting(theme, 'badge'),
        getSetting(theme, 'follow_url'),
        getSetting(theme, 'countdown_target'),
      ])
      setBadge(b || '')
      setFollowUrl(f || '')
      setCountdown(c || '')
    }
    load()
  }, [theme])

  async function saveSettings() {
    await Promise.all([
      badge.trim()
        ? setSetting(theme, 'badge', badge.trim())
        : deleteSetting(theme, 'badge'),
      followUrl.trim()
        ? setSetting(theme, 'follow_url', followUrl.trim())
        : deleteSetting(theme, 'follow_url'),
      countdown.trim()
        ? setSetting(theme, 'countdown_target', countdown.trim())
        : deleteSetting(theme, 'countdown_target'),
    ])
    setSucMsg('✅ Kaydedildi!')
    setTimeout(() => setSucMsg(''), 3000)
  }

  return (
    <>
      {/* Broadcaster selector */}
      <div className={styles.card}>
        <div className={styles.cardTitle}>🎙️ Aktif Yayıncı</div>
        <div className={styles.broadcasterRow}>
          <div>
            <strong className={styles.profileLabel}>Profil Seç</strong>
            <small className={styles.profileSub}>Her yayıncının ayarları ayrı saklanır</small>
          </div>
          <div className={styles.radioGroup}>
            {[
              { value: 'pax',      label: 'PAXINT',   color: '#53fc18' },
              { value: 'raku',     label: 'RAKU',     color: '#00c2ff' },
              { value: 'redjangu', label: 'REDJANGU', color: '#d42020' },
            ].map(opt => (
              <label
                key={opt.value}
                className={styles.radioOption}
                style={theme === opt.value ? { borderColor: opt.color, color: opt.color, background: `${opt.color}12` } : {}}
              >
                <input
                  type="radio"
                  name="broadcaster"
                  value={opt.value}
                  checked={theme === opt.value}
                  onChange={() => setTheme(opt.value)}
                />
                <span className={styles.dot} style={theme === opt.value ? { background: opt.color, borderColor: opt.color } : {}} />
                {opt.label}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Page settings */}
      <div className={styles.card}>
        <div className={styles.cardTitle}>✏️ Anasayfa Ayarları</div>
        <label className={styles.fieldLabel}>🐍 Üst Rozet Metni</label>
        <input
          className={`ipt ${styles.mb}`}
          type="text"
          placeholder="🐍 Sadece Kick'te — Her Pazar 20:30"
          value={badge}
          onChange={e => setBadge(e.target.value)}
        />
        <label className={styles.fieldLabel}>🔗 "Takip Et" Butonu Linki</label>
        <input
          className={`ipt ${styles.mb}`}
          type="text"
          placeholder="https://kick.com/paxint"
          value={followUrl}
          onChange={e => setFollowUrl(e.target.value)}
        />
        <label className={styles.fieldLabel}>⏱️ Geri Sayım Tarihi (Anasayfada gösterilir)</label>
        <input
          className="ipt"
          type="datetime-local"
          value={countdown}
          onChange={e => setCountdown(e.target.value)}
        />
        <div style={{ marginTop: '0.8rem' }}>
          <button className={styles.btnGreen} onClick={saveSettings}>💾 Kaydet</button>
        </div>
        {sucMsg && <div className={styles.sucMsg}>{sucMsg}</div>}
      </div>
    </>
  )
}
