import { useEffect, useState } from 'react'
import { getSetting, setSetting, deleteSetting } from '../../../lib/supabase'
import styles from './Tabs.module.css'

export default function CarkTab() {
  const [enabled, setEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sucMsg, setSucMsg] = useState('')

  useEffect(() => {
    getSetting('global', 'cark_enabled').then(v => {
      setEnabled(v === 'true')
      setLoading(false)
    })
  }, [])

  async function toggle() {
    const next = !enabled
    setEnabled(next)
    if (next) await setSetting('global', 'cark_enabled', 'true')
    else await deleteSetting('global', 'cark_enabled')
    setSucMsg(next ? '✅ Çark sayfası açıldı!' : '✅ Çark sayfası kapatıldı!')
    setTimeout(() => setSucMsg(''), 3000)
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardTitle}>🎡 Çark Sayfası</div>

      <small style={{ color: 'rgba(212,245,192,0.4)', display: 'block', marginBottom: '1.5rem', lineHeight: 1.6 }}>
        Açıkken navbar'da "Çark" linki görünür. Seçenek listesi ziyaretçinin
        tarayıcısında yerel olarak saklanır.
      </small>

      {loading ? (
        <div style={{ color: 'rgba(212,245,192,0.3)', fontSize: '0.85rem' }}>Yükleniyor…</div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <button
            onClick={toggle}
            style={{
              position: 'relative',
              width: '52px',
              height: '28px',
              borderRadius: '14px',
              border: 'none',
              background: enabled ? 'var(--green)' : 'rgba(212,245,192,0.12)',
              cursor: 'pointer',
              transition: 'background 0.25s',
              flexShrink: 0,
              boxShadow: enabled ? '0 0 14px var(--green-glow)' : 'none',
            }}
          >
            <span style={{
              position: 'absolute',
              top: '4px',
              left: enabled ? '28px' : '4px',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: enabled ? 'var(--black)' : 'rgba(212,245,192,0.4)',
              transition: 'left 0.25s',
            }} />
          </button>
          <span style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700,
            fontSize: '1rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: enabled ? 'var(--green)' : 'rgba(212,245,192,0.35)',
          }}>
            {enabled ? 'Çark Açık' : 'Çark Kapalı'}
          </span>
        </div>
      )}

      {sucMsg && <div className={styles.sucMsg} style={{ marginTop: '1rem' }}>{sucMsg}</div>}
    </div>
  )
}
