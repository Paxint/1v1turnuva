import { useEffect, useState, useCallback } from 'react'
import { getBracket, saveBracket, subscribeToTable } from '../../../lib/supabase'
import styles from './MaclarTab.module.css'
import tabStyles from './Tabs.module.css'

function roundName(rIdx, total) {
  const rev = total - 1 - rIdx
  if (rev === 0) return 'Final'
  if (rev === 1) return 'Yarı Final'
  if (rev === 2) return 'Çeyrek Final'
  return `Tur ${rIdx + 1}`
}

function clearWinner(rounds, rIdx, mIdx) {
  const prevWinner = rounds[rIdx][mIdx].winner
  rounds[rIdx][mIdx].winner = null
  if (rIdx + 1 < rounds.length) {
    const nm = Math.floor(mIdx / 2)
    const slot = mIdx % 2 === 0 ? 'p1' : 'p2'
    if (rounds[rIdx + 1][nm][slot] === prevWinner) {
      rounds[rIdx + 1][nm][slot] = null
      if (rounds[rIdx + 1][nm].winner === prevWinner) {
        clearWinner(rounds, rIdx + 1, nm)
      }
    }
  }
}

function MatchCard({ match, onSelect, onClear }) {
  const isBye = match.p1 && !match.p2
  const hasWinner = !!match.winner
  const p1win = !!match.winner && match.winner === match.p1
  const p2win = !!match.winner && match.winner === match.p2
  const p1clickable = !!match.p1 && (!hasWinner || p2win)
  const p2clickable = (!!match.p2 || isBye) && (!hasWinner || p1win)

  return (
    <div className={`${styles.match} ${hasWinner ? styles.decided : ''}`}>
      <div
        className={`${styles.player} ${p1win ? styles.won : ''} ${p1clickable ? styles.clickable : ''} ${hasWinner && !p1win ? styles.lost : ''} ${!match.p1 ? styles.bye : ''}`}
        onClick={() => p1clickable && onSelect(match.p1)}
      >
        <span className={styles.pName}>{match.p1 || 'TBD'}</span>
        {p1win
          ? <span className={styles.winMark} title="Kazananı kaldır" onClick={e => { e.stopPropagation(); onClear() }}>✓ ✕</span>
          : p1clickable && <span className={styles.winBtn}>▲</span>
        }
      </div>
      <div className={styles.divider} />
      <div
        className={`${styles.player} ${p2win ? styles.won : ''} ${p2clickable && !isBye ? styles.clickable : ''} ${hasWinner && !p2win ? styles.lost : ''} ${isBye || !match.p2 ? styles.bye : ''}`}
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

export default function MaclarTab() {
  const [bracket, setBracket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

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
    if (match.winner && match.winner !== winner) {
      clearWinner(next.rounds, rIdx, mIdx)
    }
    next.rounds[rIdx][mIdx].winner = winner
    if (rIdx + 1 < next.rounds.length) {
      const nm = Math.floor(mIdx / 2)
      const slot = mIdx % 2 === 0 ? 'p1' : 'p2'
      next.rounds[rIdx + 1][nm][slot] = winner
    }
    setBracket(next)
    await saveBracket(next)
    setMsg('✅ Kaydedildi')
    setTimeout(() => setMsg(''), 2000)
  }

  async function handleClear(rIdx, mIdx) {
    const next = JSON.parse(JSON.stringify(bracket))
    clearWinner(next.rounds, rIdx, mIdx)
    setBracket(next)
    await saveBracket(next)
    setMsg('✅ Kaydedildi')
    setTimeout(() => setMsg(''), 2000)
  }

  async function handleClearBracket() {
    if (!window.confirm('Bracket silinsin mi?')) return
    await saveBracket(null)
    setBracket(null)
    setMsg('✅ Bracket silindi.')
    setTimeout(() => setMsg(''), 2000)
  }

  async function handleResetBracket() {
    if (!window.confirm('Tüm sonuçlar sıfırlanıp bracket başa döndürülsün mü?')) return
    const next = JSON.parse(JSON.stringify(bracket))
    next.rounds.forEach((round, rIdx) => {
      round.forEach(match => {
        match.winner = null
        if (rIdx > 0) { match.p1 = null; match.p2 = null }
      })
    })
    setBracket(next)
    await saveBracket(next)
    setMsg('✅ Bracket başa döndürüldü.')
    setTimeout(() => setMsg(''), 2000)
  }

  const champion = bracket?.rounds?.at(-1)?.[0]?.winner

  return (
    <div className={styles.wrap}>
      {loading ? (
        <p className={styles.empty}>Yükleniyor...</p>
      ) : !bracket ? (
        <p className={styles.empty}>Bracket henüz oluşturulmadı. Kayıtlar sekmesinden oluşturun.</p>
      ) : (
        <>
          {champion && (
            <div className={styles.champBanner}>🏆 Şampiyon: <strong>{champion}</strong></div>
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
          {msg && <div className={styles.saveMsg}>{msg}</div>}
          <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.2rem' }}>
            <button className={tabStyles.btnOutline} onClick={handleResetBracket} style={{ flex: 1 }}>
              🔄 Başa Döndür
            </button>
            <button className={tabStyles.btnOutline} onClick={handleClearBracket} style={{ flex: 1, color: '#ff6060', borderColor: 'rgba(255,96,96,0.4)' }}>
              🗑️ Bracket Temizle
            </button>
          </div>
        </>
      )}
    </div>
  )
}
