import { useEffect, useState, useRef, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { getBroadcasters } from '../lib/supabase'
import { extractKickUsername } from '../lib/kickUtils'
import styles from './LiveNotification.module.css'

const CHECK_MS   = 2 * 60 * 1000        // 2 dakika
const SHOW_MS    = 7000                 // 7 saniye görünür

async function checkLive(broadcasters) {
  const results = {}
  await Promise.all(
    broadcasters.map(async b => {
      const username = extractKickUsername(b.link_url)
      if (!username) return
      try {
        const r = await fetch(
          `https://kick.com/api/v2/channels/${encodeURIComponent(username)}`,
          { headers: { Accept: 'application/json' } }
        )
        if (!r.ok) { results[username] = false; return }
        const data = await r.json()
        results[username] = !!data?.livestream
      } catch { results[username] = false }
    })
  )
  return results
}

export default function LiveNotification() {
  const location = useLocation()
  const [queue, setQueue]       = useState([])   // bildirim kuyruğu
  const [current, setCurrent]   = useState(null) // şu an gösterilen
  const [visible, setVisible]   = useState(false)
  const broadcastersRef         = useRef([])
  const timerRef                = useRef(null)

  // Kuyruğu tüket
  useEffect(() => {
    if (current || queue.length === 0) return
    const [next, ...rest] = queue
    setQueue(rest)
    setCurrent(next)
    setVisible(true)
    timerRef.current = setTimeout(() => setVisible(false), SHOW_MS)
  }, [queue, current])

  // Animasyon bitti → current'ı temizle (bir sonraki için)
  function handleAnimEnd() {
    if (!visible) { setCurrent(null) }
  }

  function dismiss() {
    clearTimeout(timerRef.current)
    setVisible(false)
  }

  const runCheck = useCallback(async () => {
    const list = broadcastersRef.current
    if (!list.length) return
    const liveMap = await checkLive(list)
    const liveOnes = list.filter(b => {
      const u = extractKickUsername(b.link_url)
      return u && liveMap[u]
    })
    if (liveOnes.length > 0) {
      setQueue(q => [...q, ...liveOnes])
    }
  }, [])

  useEffect(() => {
    getBroadcasters().then(list => {
      broadcastersRef.current = list
      runCheck()
    })
    const interval = setInterval(runCheck, CHECK_MS)
    return () => clearInterval(interval)
  }, [runCheck])

  // Yayıncılar sayfasında gösterme
  if (location.pathname === '/yayincilar') return null
  if (!current) return null

  const kickUser = extractKickUsername(current.link_url)

  return (
    <div
      className={`${styles.toast} ${visible ? styles.enter : styles.exit}`}
      onAnimationEnd={handleAnimEnd}
    >
      <button className={styles.close} onClick={dismiss} aria-label="Kapat">✕</button>
      <a
        className={styles.inner}
        href={current.link_url || '#'}
        target="_blank"
        rel="noreferrer"
        onClick={dismiss}
      >
        {current.image_url && (
          <img className={styles.avatar} src={current.image_url} alt={current.name} />
        )}
        <div className={styles.text}>
          <div className={styles.badge}>
            <span className={styles.dot} />
            YAYINDA
          </div>
          <div className={styles.name}>{current.name}</div>
          <div className={styles.sub}>Kick'te canlı yayın başladı →</div>
        </div>
      </a>
      <div className={styles.progress} style={{ animationDuration: `${SHOW_MS}ms` }} />
    </div>
  )
}
