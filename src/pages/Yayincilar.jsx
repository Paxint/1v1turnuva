import { useEffect, useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { getBroadcasters } from '../lib/supabase'
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

  useEffect(() => {
    async function load() {
      const rows = await getBroadcasters(theme)
      if (rows.length > 0) setBroadcasters(rows)
      else setBroadcasters(DEFAULT_BROADCASTERS)
    }
    load()
  }, [theme])

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
        {broadcasters.map((b, i) => (
          <div
            className={styles.card}
            key={i}
            onMouseEnter={() => handleEnter(b.effect)}
            onMouseLeave={handleLeave}
          >
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
          </div>
        ))}
      </div>

      <HoverEffect effect={hoveredEffect} active={isHovering} />
    </div>
  )
}
