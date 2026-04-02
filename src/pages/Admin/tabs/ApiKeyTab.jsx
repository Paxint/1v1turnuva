import { useEffect, useState } from 'react'
import { getSetting, setSetting, deleteSetting } from '../../../lib/supabase'
import styles from './Tabs.module.css'

const API_KEY_PASSWORD = '37291307'

export default function ApiKeyTab() {
  const [unlocked, setUnlocked] = useState(false)
  const [passInput, setPassInput] = useState('')
  const [passErr, setPassErr]     = useState('')

  const [riotKey, setRiotKey] = useState('')
  const [show, setShow]       = useState(false)
  const [sucMsg, setSucMsg]   = useState('')

  function handleUnlock(e) {
    e.preventDefault()
    if (passInput === API_KEY_PASSWORD) {
      setUnlocked(true)
      getSetting('global', 'riot_api_key').then(v => setRiotKey(v || ''))
    } else {
      setPassErr('❌ Hatalı şifre.')
    }
  }

  async function save() {
    const val = riotKey.trim()
    if (!val) await deleteSetting('global', 'riot_api_key')
    else      await setSetting('global', 'riot_api_key', val)
    setSucMsg('✅ API Key kaydedildi!')
    setTimeout(() => setSucMsg(''), 3000)
  }

  if (!unlocked) {
    return (
      <div className={styles.card}>
        <div className={styles.cardTitle}>🔑 API Key Ayarları</div>
        <small style={{ color: 'rgba(212,245,192,0.4)', display: 'block', marginBottom: '1rem' }}>
          Bu bölüme erişmek için ek şifre gereklidir.
        </small>
        <form onSubmit={handleUnlock}>
          <input
            className={`ipt ${styles.mb}`}
            type="password"
            placeholder="Şifre"
            value={passInput}
            onChange={e => { setPassInput(e.target.value); setPassErr('') }}
            autoFocus
          />
          {passErr && <div className={styles.errMsg}>{passErr}</div>}
          <button className={styles.btnGreen} type="submit">🔓 Giriş</button>
        </form>
      </div>
    )
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardTitle}>🔑 API Key Ayarları</div>

      <label className={styles.fieldLabel}>Riot API Key</label>
      <small style={{ color: 'rgba(212,245,192,0.4)', display: 'block', marginBottom: '0.5rem' }}>
        developer.riot.games adresinden alınır. Kayıt doğrulamasında kullanılır.
      </small>

      <div style={{ position: 'relative' }}>
        <input
          className={`ipt ${styles.mb}`}
          type={show ? 'text' : 'password'}
          placeholder="RGAPI-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          value={riotKey}
          onChange={e => setRiotKey(e.target.value)}
          style={{ paddingRight: '3rem' }}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          style={{
            position: 'absolute', right: '0.75rem', top: '50%',
            transform: 'translateY(-60%)',
            background: 'none', border: 'none',
            color: 'rgba(212,245,192,0.5)', cursor: 'pointer', fontSize: '1rem',
          }}
        >
          {show ? '🙈' : '👁️'}
        </button>
      </div>

      <button className={styles.btnGreen} onClick={save}>💾 Kaydet</button>
      {sucMsg && <div className={styles.sucMsg}>{sucMsg}</div>}
    </div>
  )
}
