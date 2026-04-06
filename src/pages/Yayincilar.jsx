import { useEffect, useState, useCallback } from 'react'
import { getBroadcasters, subscribeToTable } from '../lib/supabase'
import HoverEffect from '../components/HoverEffect'
import styles from './Yayincilar.module.css'

const DEFAULT_BROADCASTERS = [
  { name: 'Paxint',    subtitle: 'Yayıncı', image_url: '', sort_order: 0, effect: 'none' },
  { name: 'Rakuexe27', subtitle: 'Yayıncı', image_url: '', sort_order: 1, effect: 'none' },
  { name: 'Redjangu',  subtitle: 'Yayıncı', image_url: '', sort_order: 2, effect: 'none' },
]

function extractKickUsername(url) {
  if (!url) return null
  try {
    const u = new URL(url)
    if (!u.hostname.includes('kick.com')) return null
    const parts = u.pathname.split('/').filter(Boolean)
    return parts[0] || null
  } catch {
    return null
  }
}

export default function Yayincilar() {
  const [broadcasters, setBroadcasters] = useState(DEFAULT_BROADCASTERS)
  const [liveStatus, setLiveStatus] = useState({})
  const [hoveredEffect, setHoveredEffect] = useState('none')
  const [isHovering, setIsHovering] = useState(false)

  const load = useCallback(async () => {
    const rows = await getBroadcasters()
    if (rows.length > 0) setBroadcasters(rows)
    else setBroadcasters(DEFAULT_BROADCASTERS)
  }, [])

  const checkLive = useCallback(async (list) => {
    const entries = list
      .map(b => ({ username: extractKickUsername(b.link_url) }))
      .filter(({ username }) => username)
    if (entries.length === 0) return
    const statuses = {}
    await Promise.all(
      entries.map(async ({ username }) => {
        try {
          const r = await fetch(
            `https://kick.com/api/v2/channels/${encodeURIComponent(username)}`,
            { headers: { 'Accept': 'application/json' } }
          )
          if (!r.ok) { statuses[username] = false; return }
          const data = await r.json()
          statuses[username] = !!data?.livestream
        } catch {
          statuses[username] = false
        }
      })
    )
    setLiveStatus(statuses)
  }, [])

  useEffect(() => {
    load()
    const unsub = subscribeToTable('broadcasters', load)
    return unsub
  }, [load])

  useEffect(() => {
    checkLive(broadcasters)
  }, [broadcasters, checkLive])

  function handleEnter(effect) {
    setHoveredEffect(effect || 'none')
    setIsHovering(true)
  }

  function handleLeave() {
    setIsHovering(false)
  }

  return (
    <div className={styles.page}>
      <div className={`${styles.pageHeader} fade-up`}>
        <span className={styles.pageTag}>Yayıncı Kadrosu</span>
        <h1><span>Yayıncılar</span></h1>
      </div>

      <div className={`${styles.cards} fade-up-1`}>
        {broadcasters.map((b, i) => {
          const kickUser = extractKickUsername(b.link_url)
          const isLive = kickUser ? !!liveStatus[kickUser] : false
          const inner = (
            <>
              <div className={styles.cardImgWrap}>
                {b.image_url
                  ? <img className={styles.cardImg} src={b.image_url} alt={b.name} />
                  : <div className={styles.cardImgPlaceholder}>🎮</div>
                }
                {isLive && (
                  <div className={styles.liveBadge}>
                    <span className={styles.liveDot} />
                    YAYINDA
                  </div>
                )}
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardName}>{b.name}</div>
                <div className={styles.cardSub}>{b.subtitle}</div>
              </div>
            </>
          )
          return b.link_url ? (
            <a
              key={i}
              className={styles.card}
              href={b.link_url}
              target="_blank"
              rel="noreferrer"
              onMouseEnter={() => handleEnter(b.effect)}
              onMouseLeave={handleLeave}
            >{inner}</a>
          ) : (
            <div
              key={i}
              className={styles.card}
              onMouseEnter={() => handleEnter(b.effect)}
              onMouseLeave={handleLeave}
            >{inner}</div>
          )
        })}
      </div>

      <HoverEffect effect={hoveredEffect} active={isHovering} />
    </div>
  )
}
