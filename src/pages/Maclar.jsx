import { useEffect, useState, useCallback } from 'react'
import { getBracket, saveBracket, subscribeToTable } from '../lib/supabase'
import styles from './Maclar.module.css'

function roundName(rIdx, total) {
  const rev = total - 1 - rIdx
  if (rev === 0) return 'Final'
  if (rev === 1) return 'Yarı Final'
  if (rev === 2) return 'Çeyrek Final'
  return `Tur ${rIdx + 1}`
}

// Remove a winner from a match and clean up the next round slot
function clearWinner(rounds, rIdx, mIdx) {
  const r = rounds
  const prevWinner = r[rIdx][mIdx].winner
  r[rIdx][mIdx].winner = null

  if (rIdx + 1 < r.length) {
    const nm = Math.floor(mIdx / 2)
    const slot = mIdx % 2 === 0 ? 'p1' : 'p2'
    if (r[rIdx + 1][nm][slot] === prevWinner) {
      r[rIdx + 1][nm][slot] = null
      // If next match's winner was also this player, cascade-clear
      if (r[rIdx + 1][nm].winner === prevWinner) {
        clearWinner(r, rIdx + 1, nm)
      }
    }
  }
}

function MatchCard({ match, onSelect, onClear }) {
  const isBye = match.p1 && !match.p2
  const hasWinner = !!match.winner
  const p1win = !!match.winner && match.winner === match.p1
  const p2win = !!match.winner && match.winner === match.p2
  // Can click a player if: they exist AND (no winner yet OR they're NOT already the winner)
  const p1clickable = !!match.p1 && (!hasWinner || p2win)
  const p2clickable = (!!match.p2 || isBye) && (!hasWinner || p1win)

  return (
    <div className={styles.match}>
      {/* Player 1 */}
      <div
        className={`${styles.player} ${p1win ? styles.won : ''} ${p1clickable ? styles.clickable : ''} ${hasWinner && !p1win ? styles.lost : ''}`}
        onClick={() => p1clickable && onSelect(match.p1)}
      >
        <span className={styles.pName}>{match.p1 || 'TBD'}</span>
        {p1win
          ? <span className={styles.winMark} title="Kazananı kaldır" onClick={e => { e.stopPropagation(); onClear() }}>✓ ✕</span>
          : p1clickable && <span className={styles.winBtn}>▲</span>
        }
      </div>

      <div className={styles.divider} />

      {/* Player 2 / BYE */}
      <div
        className={`${styles.player} ${p2win ? styles.won : ''} ${p2clickable && !isBye ? styles.clickable : ''} ${hasWinner && !p2win ? styles.lost : ''}`}
        onClick={() => !isBye && p2clickable && onSelect(match.p2)}
      >
        <span className={styles.pName}>{isBye ? 'BYE' : (match.p2 || 'TBD')}</span>
        {p2win
          ? <span className={styles.winMark} title="Kazananı kaldır" onClick={e => { e.stopPropagation(); onClear() }}>✓ ✕</span>
          : (!isBye && p2clickable) && <span className={styles.winBtn}>▲</span>
        }
        {isBye && !hasWinner && match.p1 &&
          <span className={styles.byeBtn} onClick={e => { e.stopPropagation(); onSelect(match.p1) }}>BYE →</span>
        }
      </div>
    </div>
  )
}

export default function Maclar() {
  const [bracket, setBracket] = useState(null)
  const [loading, setLoading] = useState(true)

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

  async function handleSelect(rIdx, mIdx, winner) {
    const next = JSON.parse(JSON.stringify(bracket))
    const match = next.rounds[rIdx][mIdx]

    // If a different winner was already set, clear them from next round first
    if (match.winner && match.winner !== winner) {
      clearWinner(next.rounds, rIdx, mIdx)
    }

    // Set new winner
    next.rounds[rIdx][mIdx].winner = winner
    if (rIdx + 1 < next.rounds.length) {
      const nm = Math.floor(mIdx / 2)
      const slot = mIdx % 2 === 0 ? 'p1' : 'p2'
      next.rounds[rIdx + 1][nm][slot] = winner
    }

    setBracket(next)
    await saveBracket(next)
  }

  async function handleClear(rIdx, mIdx) {
    const next = JSON.parse(JSON.stringify(bracket))
    clearWinner(next.rounds, rIdx, mIdx)
    setBracket(next)
    await saveBracket(next)
  }

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
          <div className={styles.bracketScroll}>
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
                        <MatchCard
                          match={match}
                          onSelect={(w) => handleSelect(rIdx, mIdx, w)}
                          onClear={() => handleClear(rIdx, mIdx)}
                        />
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
