import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { getSetting } from '../lib/supabase'
import styles from './Home.module.css'

export default function Home() {
  const { theme } = useTheme()
  const [badge, setBadge] = useState('🐍 Sadece Kick\'te — Her Pazar 20:30')
  const [followUrl, setFollowUrl] = useState('https://kick.com/paxint')
  const [posterSrc, setPosterSrc] = useState('/poster.png')

  useEffect(() => {
    async function load() {
      const [b, f, p] = await Promise.all([
        getSetting(theme, 'badge'),
        getSetting(theme, 'follow_url'),
        getSetting(theme, 'poster_url'),
      ])
      if (b) setBadge(b)
      else setBadge('🐍 Sadece Kick\'te — Her Pazar 20:30')
      if (f) setFollowUrl(f)
      else setFollowUrl('https://kick.com/paxint')
      if (p) setPosterSrc(p)
      else setPosterSrc('/poster.png')
    }
    load()
  }, [theme])

  return (
    <section className={styles.hero}>
      <div className={`${styles.heroBadge} fade-up`}>{badge}</div>

      <div className={`${styles.posterWrap} fade-up-1`}>
        <img
          className={styles.poster}
          src={posterSrc}
          alt="Turnuva Posteri"
          onError={e => { e.currentTarget.style.display = 'none' }}
        />
      </div>

      <div className={`${styles.heroCta} fade-up-2`}>
        <a className="btn btn-primary" href={followUrl} target="_blank" rel="noreferrer">
          Kick'te Takip Et
        </a>
        <Link className="btn btn-outline" to="/kurallar">
          Turnuva Kuralları
        </Link>
      </div>
    </section>
  )
}
