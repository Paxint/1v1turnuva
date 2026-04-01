import { useEffect, useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { getBroadcasters } from '../lib/supabase'
import styles from './Yayincilar.module.css'

const DEFAULT_BROADCASTERS = [
  { name: 'Paxint',     subtitle: 'Yayıncı', image_url: '', sort_order: 0 },
  { name: 'Rakuexe27',  subtitle: 'Yayıncı', image_url: '', sort_order: 1 },
  { name: 'Redjangu',   subtitle: 'Yayıncı', image_url: '', sort_order: 2 },
]

export default function Yayincilar() {
  const { theme } = useTheme()
  const [broadcasters, setBroadcasters] = useState(DEFAULT_BROADCASTERS)

  useEffect(() => {
    async function load() {
      const rows = await getBroadcasters(theme)
      if (rows.length > 0) setBroadcasters(rows)
      else setBroadcasters(DEFAULT_BROADCASTERS)
    }
    load()
  }, [theme])

  return (
    <div className={styles.page}>
      <div className={`${styles.pageHeader} fade-up`}>
        <span className={styles.pageTag}>Turnuva Kadrosu</span>
        <h1>Turnuva <span>Yayıncıları</span></h1>
      </div>

      <div className={`${styles.cards} fade-up-1`}>
        {broadcasters.map((b, i) => (
          <div className={styles.card} key={i}>
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
    </div>
  )
}
