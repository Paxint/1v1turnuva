import { useEffect, useState, useRef, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { getBroadcasters } from '../lib/supabase'
import { extractKickUsername } from '../lib/kickUtils'
import styles from './LiveBar.module.css'

const CHECK_MS = 2 * 60 * 1000

async function fetchLiveStatus(broadcasters) {
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

export default function LiveBar() {
  const location = useLocation()
  const [liveBroadcasters, setLiveBroadcasters] = useState([])
  const broadcastersRef = useRef([])

  const runCheck = useCallback(async () => {
    const list = broadcastersRef.current
    if (!list.length) return
    const liveMap = await fetchLiveStatus(list)
    const live = list.filter(b => {
      const u = extractKickUsername(b.link_url)
      return u && liveMap[u]
    })
    setLiveBroadcasters(live)
  }, [])

  useEffect(() => {
    getBroadcasters().then(list => {
      broadcastersRef.current = list
      runCheck()
    })
    const interval = setInterval(runCheck, CHECK_MS)
    return () => clearInterval(interval)
  }, [runCheck])

  if (location.pathname === '/yayincilar') return null
  if (liveBroadcasters.length === 0) return null

  return (
    <div className={styles.bar}>
      {liveBroadcasters.map(b => (
        <a
          key={b.name}
          className={styles.item}
          href={b.link_url || '#'}
          target="_blank"
          rel="noreferrer"
        >
          <span className={styles.dot} />
          <div className={styles.text}>
            <span className={styles.label}>ŞU AN YAYINDA</span>
            <span className={styles.name}>{b.name}</span>
          </div>
          <span className={styles.arrow}>→</span>
        </a>
      ))}
    </div>
  )
}
