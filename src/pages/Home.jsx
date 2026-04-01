import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { getSetting, subscribeToTable } from '../lib/supabase'
import styles from './Home.module.css'

export default function Home() {
  const { theme } = useTheme()
  const [badge, setBadge] = useState('Sadece Kick\'te — Her Pazar 20:30')
  const [followUrl, setFollowUrl] = useState('https://kick.com/paxint')
  const [posterSrc, setPosterSrc] = useState(null)
  const [imgError, setImgError] = useState(false)

  const load = useCallback(async () => {
    const [b, f, p] = await Promise.all([
      getSetting(theme, 'badge'),
      getSetting(theme, 'follow_url'),
      getSetting(theme, 'poster_url'),
    ])
    setBadge(b || 'Sadece Kick\'te — Her Pazar 20:30')
    setFollowUrl(f || 'https://kick.com/paxint')
    setImgError(false)
    setPosterSrc(p || null)
  }, [theme])

  useEffect(() => {
    load()
    const unsub = subscribeToTable('settings', load)
    return unsub
  }, [load])

  return (
    <section className={styles.hero}>
      {/* Decorative lines */}
      <div className={styles.decoL} aria-hidden />
      <div className={styles.decoR} aria-hidden />

      {/* Live badge */}
      <div className={`${styles.heroBadge} fade-up`}>
        <span className={styles.liveDot} />
        {badge}
      </div>

      {/* Poster */}
      {posterSrc && !imgError && (
        <div className={`${styles.posterFrame} fade-up-1`}>
          <div className={styles.posterInner}>
            <span className={styles.cornerTL} aria-hidden />
            <span className={styles.cornerTR} aria-hidden />
            <span className={styles.cornerBL} aria-hidden />
            <span className={styles.cornerBR} aria-hidden />
            <img
              key={posterSrc}
              className={styles.poster}
              src={posterSrc}
              alt="Turnuva Posteri"
              onError={() => setImgError(true)}
            />
          </div>
        </div>
      )}

      {/* CTA buttons */}
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
