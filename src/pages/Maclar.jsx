import { useEffect, useState, useCallback, useRef } from 'react'
import { getBracket, subscribeToTable } from '../lib/supabase'
import styles from './Maclar.module.css'

function roundName(rIdx, total) {
  const rev = total - 1 - rIdx
  if (rev === 0) return 'Final'
  if (rev === 1) return 'Yarı Final'
  if (rev === 2) return 'Çeyrek Final'
  return `Tur ${rIdx + 1}`
}

function MatchCard({ match }) {
  const isBye = match.p1 && !match.p2
  const hasWinner = !!match.winner
  const p1win = !!match.winner && match.winner === match.p1
  const p2win = !!match.winner && match.winner === match.p2

  return (
    <div className={`${styles.match} ${hasWinner ? styles.decided : ''}`}>
      {/* Player 1 */}
      <div className={`${styles.player} ${p1win ? styles.won : ''} ${hasWinner && !p1win ? styles.lost : ''} ${!match.p1 ? styles.bye : ''}`}>
        <span className={styles.pName}>{match.p1 || 'TBD'}</span>
        {p1win && <span className={styles.winMark}>✓</span>}
      </div>

      <div className={styles.divider} />

      {/* Player 2 / BYE */}
      <div className={`${styles.player} ${p2win ? styles.won : ''} ${hasWinner && !p2win ? styles.lost : ''} ${isBye || !match.p2 ? styles.bye : ''}`}>
        <span className={styles.pName}>{isBye ? 'BYE' : (match.p2 || 'TBD')}</span>
        {p2win && <span className={styles.winMark}>✓</span>}
      </div>
    </div>
  )
}

export default function Maclar() {
  const [bracket, setBracket] = useState(null)
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef(null)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    let isDown = false, startX, startY, scrollLeft, scrollTop
    const onDown = (e) => {
      isDown = true
      el.classList.add(styles.dragging)
      startX = e.pageX - el.offsetLeft
      startY = e.pageY - el.offsetTop
      scrollLeft = el.scrollLeft
      scrollTop = el.scrollTop
    }
    const onUp = () => { isDown = false; el.classList.remove(styles.dragging) }
    const onMove = (e) => {
      if (!isDown) return
      e.preventDefault()
      el.scrollLeft = scrollLeft - (e.pageX - el.offsetLeft - startX)
      el.scrollTop  = scrollTop  - (e.pageY - el.offsetTop  - startY)
    }
    el.addEventListener('mousedown', onDown)
    el.addEventListener('mouseup', onUp)
    el.addEventListener('mouseleave', onUp)
    el.addEventListener('mousemove', onMove)
    return () => {
      el.removeEventListener('mousedown', onDown)
      el.removeEventListener('mouseup', onUp)
      el.removeEventListener('mouseleave', onUp)
      el.removeEventListener('mousemove', onMove)
    }
  }, [])

  const load = useCallback(async () => {
    const data = await getBracket()
    setBracket(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    const unsub = subscribeToTable('settings', load)
    return unsub
  }, [load])

  const champion = bracket?.rounds?.at(-1)?.[0]?.winner

  return (
    <div className={styles.page}>
      <div className={`${styles.pageHeader} fade-up`}>
        <span className={styles.pageTag}>Turnuva</span>
        <h1>Turnuva <span>Bracket</span></h1>
      </div>

      {loading ? (
        <div className={styles.empty}>Yükleniyor...</div>
      ) : !bracket ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🏆</div>
          <p>Bracket henüz oluşturulmadı.</p>
          <small>Admin panelinden katılımcıları ekleyip bracket oluşturabilirsiniz.</small>
        </div>
      ) : (
        <>
          {champion && (
            <div className={`${styles.champion} fade-up`}>
              🏆 Şampiyon: <strong>{champion}</strong>
            </div>
          )}
          <div className={styles.bracketScroll} ref={scrollRef}>
            <div className={styles.bracket}>
              {bracket.rounds.map((round, rIdx) => (
                <div className={styles.round} key={rIdx}>
                  <div className={styles.roundLabel}>
                    {roundName(rIdx, bracket.rounds.length)}
                  </div>
                  <div className={styles.matchList}>
                    {round.map((match, mIdx) => (
                      <div
                        key={match.id}
                        className={styles.matchSlot}
                        style={{ flex: Math.pow(2, rIdx) }}
                      >
                        <MatchCard match={match} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
