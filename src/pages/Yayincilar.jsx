import { useEffect, useState, useCallback, useRef } from 'react'
import { getBroadcasters, subscribeToTable } from '../lib/supabase'
import { extractKickUsername } from '../lib/kickUtils'
import HoverEffect from '../components/HoverEffect'
import styles from './Yayincilar.module.css'

const EFFECT_COLORS = {
  fire:      { color: '#ff5000', glow: 'rgba(255,80,0,0.45)',      border: 'rgba(255,80,0,0.3)'     },
  ice:       { color: '#00b4ff', glow: 'rgba(0,180,255,0.45)',     border: 'rgba(0,180,255,0.28)'   },
  lightning: { color: '#ffdc00', glow: 'rgba(255,220,0,0.45)',     border: 'rgba(255,220,0,0.28)'   },
  poison:    { color: '#cc00ff', glow: 'rgba(200,0,255,0.45)',     border: 'rgba(200,0,255,0.28)'   },
  dark:      { color: '#a050dd', glow: 'rgba(140,60,210,0.45)',    border: 'rgba(140,60,210,0.25)'  },
  blood:     { color: '#dd0000', glow: 'rgba(210,0,0,0.45)',       border: 'rgba(210,0,0,0.28)'     },
  water:     { color: '#0088ff', glow: 'rgba(0,136,255,0.45)',     border: 'rgba(0,136,255,0.28)'   },
  grass:     { color: '#00dd44', glow: 'rgba(0,210,68,0.45)',      border: 'rgba(0,210,68,0.28)'    },
  fighting:  { color: '#ff4400', glow: 'rgba(255,68,0,0.45)',      border: 'rgba(255,68,0,0.28)'    },
  ground:    { color: '#cc8800', glow: 'rgba(200,130,0,0.45)',     border: 'rgba(200,130,0,0.28)'   },
  flying:    { color: '#88ccff', glow: 'rgba(136,204,255,0.4)',    border: 'rgba(136,204,255,0.22)' },
  psychic:   { color: '#ff0088', glow: 'rgba(255,0,136,0.45)',     border: 'rgba(255,0,136,0.28)'   },
  bug:       { color: '#88dd00', glow: 'rgba(136,221,0,0.45)',     border: 'rgba(136,221,0,0.28)'   },
  rock:      { color: '#bb9944', glow: 'rgba(187,153,68,0.45)',    border: 'rgba(187,153,68,0.28)'  },
  ghost:     { color: '#9900cc', glow: 'rgba(153,0,204,0.45)',     border: 'rgba(153,0,204,0.28)'   },
  dragon:    { color: '#5500ff', glow: 'rgba(85,0,255,0.45)',      border: 'rgba(85,0,255,0.28)'    },
  steel:     { color: '#aabbcc', glow: 'rgba(170,187,204,0.4)',    border: 'rgba(170,187,204,0.22)' },
  fairy:     { color: '#ff66cc', glow: 'rgba(255,102,204,0.45)',   border: 'rgba(255,102,204,0.28)' },
  normal:    { color: '#bbaa88', glow: 'rgba(187,170,136,0.35)',   border: 'rgba(187,170,136,0.2)'  },
}

const DEFAULT_BROADCASTERS = [
  { name: 'Paxint',    subtitle: 'Yayıncı', image_url: '', sort_order: 0, effect: 'none' },
  { name: 'Rakuexe27', subtitle: 'Yayıncı', image_url: '', sort_order: 1, effect: 'none' },
  { name: 'Redjangu',  subtitle: 'Yayıncı', image_url: '', sort_order: 2, effect: 'none' },
]

export default function Yayincilar() {
  const [broadcasters, setBroadcasters] = useState(DEFAULT_BROADCASTERS)
  const [liveStatus, setLiveStatus] = useState({})
  const [hoveredEffect, setHoveredEffect] = useState('none')
  const [isHovering, setIsHovering] = useState(false)
  const broadcastersRef = useRef(DEFAULT_BROADCASTERS)

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

  const load = useCallback(async () => {
    const rows = await getBroadcasters()
    const list = rows.length > 0 ? rows : DEFAULT_BROADCASTERS
    broadcastersRef.current = list
    setBroadcasters(list)
    checkLive(list)
  }, [checkLive])

  useEffect(() => {
    load()
    const unsub = subscribeToTable('broadcasters', load)
    const interval = setInterval(() => checkLive(broadcastersRef.current), 2 * 60 * 1000)
    return () => { unsub(); clearInterval(interval) }
  }, [load, checkLive])

  function handleCardMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--sx', `${e.clientX - rect.left}px`)
    e.currentTarget.style.setProperty('--sy', `${e.clientY - rect.top}px`)
  }

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
          const cardClass = `${styles.card} ${isLive ? styles.cardLive : ''}`
          const ec = b.effect && b.effect !== 'none' ? EFFECT_COLORS[b.effect] : null
          const effectStyle = ec ? {
            '--effect-color':  ec.color,
            '--effect-glow':   ec.glow,
            '--effect-border': ec.border,
          } : {}
          return b.link_url ? (
            <a
              key={b.name}
              className={cardClass}
              style={effectStyle}
              href={b.link_url}
              target="_blank"
              rel="noreferrer"
              onMouseEnter={() => handleEnter(b.effect)}
              onMouseLeave={handleLeave}
              onMouseMove={handleCardMouseMove}
            >{inner}</a>
          ) : (
            <div
              key={b.name}
              className={cardClass}
              style={effectStyle}
              onMouseEnter={() => handleEnter(b.effect)}
              onMouseLeave={handleLeave}
              onMouseMove={handleCardMouseMove}
            >{inner}</div>
          )
        })}
      </div>

      <HoverEffect effect={hoveredEffect} active={isHovering} />
    </div>
  )
}
