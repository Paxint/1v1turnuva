import { useEffect, useState, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { getSetting, getRegistrations, getBracket, getBroadcasters, subscribeToTable } from '../lib/supabase'
import { extractKickUsername } from '../lib/kickUtils'
import styles from './Home.module.css'

function MagneticWrap({ children }) {
  const ref = useRef(null)
  function onMouseMove(e) {
    const el = ref.current
    const rect = el.getBoundingClientRect()
    const dx = e.clientX - (rect.left + rect.width / 2)
    const dy = e.clientY - (rect.top + rect.height / 2)
    el.style.transition = 'transform 0.1s ease'
    el.style.transform = `translate(${dx * 0.35}px, ${dy * 0.35}px)`
  }
  function onMouseLeave() {
    const el = ref.current
    el.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
    el.style.transform = ''
  }
  return (
    <div ref={ref} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave} style={{ display: 'inline-block' }}>
      {children}
    </div>
  )
}

function useCountUp(target, duration = 1400) {
  const [count, setCount] = useState(0)
  const prev = useRef(0)
  useEffect(() => {
    if (!target) { setCount(0); return }
    const start = prev.current
    const diff = target - start
    if (diff <= 0) { setCount(target); return }
    const startTime = performance.now()
    let raf
    function step(now) {
      const t = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setCount(Math.round(start + diff * eased))
      if (t < 1) raf = requestAnimationFrame(step)
      else prev.current = target
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return count
}

function useCountdown(target) {
  const [diff, setDiff] = useState(null)
  useEffect(() => {
    if (!target) { setDiff(null); return }
    function update() {
      const d = Math.max(0, new Date(target).getTime() - Date.now())
      setDiff(d)
    }
    update()
    const t = setInterval(update, 1000)
    return () => clearInterval(t)
  }, [target])
  if (diff === null) return null
  return {
    days:  Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    mins:  Math.floor((diff % 3600000) / 60000),
    secs:  Math.floor((diff % 60000) / 1000),
    ended: diff === 0,
  }
}


function CountdownUnit({ value, label }) {
  return (
    <div className={styles.cdUnit}>
      <span className={styles.cdNum}>{String(value).padStart(2, '0')}</span>
      <span className={styles.cdLabel}>{label}</span>
    </div>
  )
}

export default function Home() {
  const { theme, ready } = useTheme()
  const [badge, setBadge] = useState('Sadece Kick\'te — Her Pazar 20:30')
  const [followUrl, setFollowUrl] = useState('https://kick.com/paxint')
  const [posterSrc, setPosterSrc] = useState(null)
  const [imgError, setImgError] = useState(false)
  const [regCount, setRegCount] = useState(0)
  const [champion, setChampion] = useState(null)
  const [countdownTarget, setCountdownTarget] = useState(null)

  const load = useCallback(async () => {
    const [b, f, p, c, regs, bracket] = await Promise.all([
      getSetting(theme, 'badge'),
      getSetting(theme, 'follow_url'),
      getSetting(theme, 'poster_url'),
      getSetting(theme, 'countdown_target'),
      getRegistrations(),
      getBracket(),
    ])
    setBadge(b || 'Sadece Kick\'te — Her Pazar 20:30')
    setFollowUrl(f || 'https://kick.com/paxint')
    setImgError(false)
    setPosterSrc(p || null)
    setCountdownTarget(c || null)
    setRegCount(regs.length)
    setChampion(bracket?.rounds?.at(-1)?.[0]?.winner || null)
  }, [theme])

  useEffect(() => {
    if (!ready) return
    load()
    const unsub1 = subscribeToTable('settings', load)
    const unsub2 = subscribeToTable('registrations', load)
    return () => { unsub1(); unsub2() }
  }, [load, ready])

  const [liveBroadcasters, setLiveBroadcasters] = useState([])

  useEffect(() => {
    async function checkLive() {
      const rows = await getBroadcasters()
      const candidates = rows
        .map(b => ({ name: b.name, username: extractKickUsername(b.link_url), link_url: b.link_url }))
        .filter(b => b.username)
      if (candidates.length === 0) { setLiveBroadcasters([]); return }
      const live = []
      await Promise.all(candidates.map(async (b) => {
        try {
          const r = await fetch(
            `https://kick.com/api/v2/channels/${encodeURIComponent(b.username)}`,
            { headers: { 'Accept': 'application/json' } }
          )
          if (!r.ok) return
          const data = await r.json()
          if (data?.livestream) live.push(b)
        } catch { }
      }))
      setLiveBroadcasters(live)
    }
    checkLive()
    const interval = setInterval(checkLive, 2 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const animCount = useCountUp(regCount)
  const countdown = useCountdown(countdownTarget)

  const FLAME_MIN = 8
  const FLAME_MAX = 64
  const flameIntensity = animCount < FLAME_MIN
    ? 0
    : Math.min(1, (animCount - FLAME_MIN) / (FLAME_MAX - FLAME_MIN))
  const flameVisual = flameIntensity > 0 ? Math.pow(flameIntensity, 0.4) : 0

  const hasImage = posterSrc && !imgError

  return (
    <section className={styles.hero}>
      <div className={styles.decoL} aria-hidden />
      <div className={styles.decoR} aria-hidden />

      <div className={`${styles.heroInner} ${!hasImage ? styles.noImage : ''}`}>

        {/* ── Badge + headline ── */}
        <div className={styles.heroMeta}>

          <div className={styles.heroBadge}>
            <span className={styles.liveDot} />
            {badge}
          </div>

          <div className={styles.heroHeadline}>
            <span className={styles.h1}>1<em>V</em>1</span>
            <span className={styles.h2}>TURNUVA</span>
          </div>

        </div>

        {/* ── Right column: poster ── */}
        {hasImage && (
          <div className={styles.heroRight}>
            <div className={styles.posterFrame}>
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
          </div>
        )}

        {/* ── CTA + stats ── */}
        <div className={styles.heroActions}>

          <div className={styles.heroCta}>
            <MagneticWrap>
              <a className="btn btn-primary" href={followUrl} target="_blank" rel="noreferrer">
                Kick'te Takip Et
              </a>
            </MagneticWrap>
            <MagneticWrap>
              <Link className="btn btn-outline" to="/kayit">
                Turnuvaya Katıl
              </Link>
            </MagneticWrap>
          </div>

          <div className={styles.statsStrip}>
            <div className={`${styles.statItem} ${styles.statItemFire}`} style={{ '--flame': flameIntensity, '--flame-v': flameVisual }}>
              {flameIntensity > 0 && <span className={styles.flame} aria-hidden />}
              <span className={styles.statNum}>{animCount}</span>
              <span className={styles.statLabel}>Kayıtlı Oyuncu</span>
            </div>

            <div className={styles.statDivider} />

            {champion ? (
              <div className={styles.statItem}>
                <span className={`${styles.statNum} ${styles.statChamp}`}>{champion}</span>
                <span className={styles.statLabel}>Son Şampiyon</span>
              </div>
            ) : (
              <div className={styles.statItem}>
                <span className={`${styles.statNum} ${styles.statMystery}`}>???</span>
                <span className={styles.statLabel}>Sıradaki Şampiyon</span>
              </div>
            )}

            {countdown && !countdown.ended && (
              <>
                <div className={styles.statDivider} />
                <div className={styles.statItem}>
                  <div className={styles.countdown}>
                    <CountdownUnit value={countdown.days}  label="GÜN" />
                    <span className={styles.cdSep}>:</span>
                    <CountdownUnit value={countdown.hours} label="SAAT" />
                    <span className={styles.cdSep}>:</span>
                    <CountdownUnit value={countdown.mins}  label="DAK" />
                    <span className={styles.cdSep}>:</span>
                    <CountdownUnit value={countdown.secs}  label="SAN" />
                  </div>
                  <span className={styles.statLabel}>Turnuvaya Kalan</span>
                </div>
              </>
            )}

            {countdown?.ended && (
              <>
                <div className={styles.statDivider} />
                <div className={styles.statItem}>
                  <span className={`${styles.statNum} ${styles.statLive}`}>CANLI</span>
                  <span className={styles.statLabel}>Turnuva Başladı</span>
                </div>
              </>
            )}
          </div>

        </div>

      </div>

      {/* Live broadcaster popups */}
      {liveBroadcasters.length > 0 && (
        <div className={styles.livePopups}>
          {liveBroadcasters.map((b, i) => (
            <a
              key={i}
              href={b.link_url}
              target="_blank"
              rel="noreferrer"
              className={styles.livePopup}
              style={{ animationDelay: `${i * 0.12}s` }}
            >
              <span className={styles.livePopupDot} />
              <div className={styles.livePopupContent}>
                <span className={styles.livePopupLabel}>Şu an yayında</span>
                <span className={styles.livePopupName}>{b.name}</span>
              </div>
              <span className={styles.livePopupArrow}>→</span>
            </a>
          ))}
        </div>
      )}

    </section>
  )
}
