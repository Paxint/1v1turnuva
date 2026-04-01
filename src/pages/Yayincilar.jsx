import { useEffect, useState, useCallback } from 'react'
import { useTheme } from '../context/ThemeContext'
import { getBroadcasters, subscribeToTable } from '../lib/supabase'
import HoverEffect from '../components/HoverEffect'
import styles from './Yayincilar.module.css'

const DEFAULT_BROADCASTERS = [
  { name: 'Paxint',    subtitle: 'Yayıncı', image_url: '', sort_order: 0, effect: 'none' },
  { name: 'Rakuexe27', subtitle: 'Yayıncı', image_url: '', sort_order: 1, effect: 'none' },
  { name: 'Redjangu',  subtitle: 'Yayıncı', image_url: '', sort_order: 2, effect: 'none' },
]

export default function Yayincilar() {
  const { theme } = useTheme()
  const [broadcasters, setBroadcasters] = useState(DEFAULT_BROADCASTERS)
  const [hoveredEffect, setHoveredEffect] = useState('none')
  const [isHovering, setIsHovering] = useState(false)

  const load = useCallback(async () => {
    const rows = await getBroadcasters(theme)
    if (rows.length > 0) setBroadcasters(rows)
    else setBroadcasters(DEFAULT_BROADCASTERS)
  }, [theme])

  useEffect(() => {
    load()
    const unsub = subscribeToTable('broadcasters', load)
    return unsub
  }, [load])

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
        <span className={styles.pageTag}>Turnuva Kadrosu</span>
        <h1>Turnuva <span>Yayıncıları</span></h1>
      </div>

      <div className={`${styles.cards} fade-up-1`}>
        {broadcasters.map((b, i) => {
          const inner = (
            <>
              <div className={styles.cardImgWrap}>
                {b.image_url
                  ? <img className={styles.cardImg} src={b.image_url} alt={b.name} />
                  : <div className={styles.cardImgPlaceholder}>🎮</div>
                }
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
