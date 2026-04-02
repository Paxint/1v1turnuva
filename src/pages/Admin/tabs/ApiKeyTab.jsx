import { useEffect, useState } from 'react'
import { getSetting, setSetting, deleteSetting } from '../../../lib/supabase'
import styles from './Tabs.module.css'

export default function ApiKeyTab() {
  const [riotKey, setRiotKey]   = useState('')
  const [show, setShow]         = useState(false)
  const [sucMsg, setSucMsg]     = useState('')
  const [errMsg, setErrMsg]     = useState('')

  useEffect(() => {
    getSetting('global', 'riot_api_key').then(v => setRiotKey(v || ''))
  }, [])

  async function save() {
    setErrMsg('')
    const val = riotKey.trim()
    if (!val) {
      await deleteSetting('global', 'riot_api_key')
    } else {
      await setSetting('global', 'riot_api_key', val)
    }
    setSucMsg('✅ API Key kaydedildi!')
    setTimeout(() => setSucMsg(''), 3000)
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

      {errMsg && <div className={styles.errMsg}>{errMsg}</div>}

      <button className={styles.btnGreen} onClick={save}>💾 Kaydet</button>
      {sucMsg && <div className={styles.sucMsg}>{sucMsg}</div>}
    </div>
  )
}
