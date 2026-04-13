import { useEffect, useState, useCallback, useRef } from 'react'
import { getBracket, saveBracket, subscribeToTable, getRegistrations } from '../../../lib/supabase'
import styles from './MaclarTab.module.css'
import tabStyles from './Tabs.module.css'

function reshuffleBracket(bracket) {
  const players = []
  bracket.rounds[0].forEach(match => {
    if (match.p1) players.push(match.p1)
    if (match.p2) players.push(match.p2)
  })
  const n = players.length
  const shuffled = [...players].sort(() => Math.random() - 0.5)
  let p = 1
  while (p < n) p *= 2
  const byes = p - n
  const next = JSON.parse(JSON.stringify(bracket))
  next.rounds.forEach((round, rIdx) => {
    round.forEach(match => {
      match.winner = null
      if (rIdx > 0) { match.p1 = null; match.p2 = null }
    })
  })
  if (next.thirdPlace) { next.thirdPlace.p1 = null; next.thirdPlace.p2 = null; next.thirdPlace.winner = null }
  let pi = 0
  for (let i = 0; i < next.rounds[0].length; i++) {
    if (i < byes) {
      next.rounds[0][i].p1 = shuffled[pi++]
      next.rounds[0][i].p2 = null
    } else {
      next.rounds[0][i].p1 = shuffled[pi++]
      next.rounds[0][i].p2 = shuffled[pi++] || null
    }
  }
  return next
}

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

function MatchCard({ match, onSelect, onClear, swapSelected, swapTarget, onSwapClick, kickMap = {} }) {
  const [copied, setCopied] = useState(null)
  const isBye = match.p1 && !match.p2
  const hasWinner = !!match.winner
  const p1win = !!match.winner && match.winner === match.p1
  const p2win = !!match.winner && match.winner === match.p2
  const p1canAdvance = !!match.p1 && (!hasWinner || p2win)
  const p2canAdvance = !!match.p2 && !isBye && (!hasWinner || p1win)

  function copy(name, slot) {
    if (!name) return
    navigator.clipboard?.writeText(name)
    setCopied(slot)
    setTimeout(() => setCopied(null), 1200)
  }

  const matchClass = [
    styles.match,
    hasWinner ? styles.decided : '',
    swapSelected ? styles.swapSelected : '',
    swapTarget ? styles.swapTarget : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={matchClass}>
      <button
        className={styles.swapBtn}
        onClick={onSwapClick}
        title={swapSelected ? 'Seçimi iptal et' : swapTarget ? 'Bu maçla yer değiştir' : 'Yer değiştir'}
      >⇄</button>
      {/* Player 1 */}
      <div className={`${styles.player} ${p1win ? styles.won : ''} ${hasWinner && !p1win ? styles.lost : ''} ${!match.p1 ? styles.bye : ''}`}>
        <span className={styles.pNameWrap}>
          <span
            className={`${styles.pName} ${match.p1 ? styles.copyable : ''}`}
            onClick={() => copy(match.p1, 'p1')}
          >
            {copied === 'p1' ? '✓' : (match.p1 || 'TBD')}
          </span>
          {match.p1 && kickMap[match.p1] && (
            <span className={styles.kickTooltip}>
              <span className={styles.kickTooltipLabel}>kick</span>
              {kickMap[match.p1]}
            </span>
          )}
        </span>
        <div className={styles.actionCell}>
          {p1win
            ? <span className={styles.winMark} title="Kazananı kaldır" onClick={onClear}>✕</span>
            : p1canAdvance && <button className={styles.advanceBtn} onClick={() => onSelect(match.p1)} title="Kazanan">▶</button>
          }
        </div>
      </div>

      <div className={styles.divider} />

      {/* Player 2 */}
      <div className={`${styles.player} ${p2win ? styles.won : ''} ${hasWinner && !p2win ? styles.lost : ''} ${isBye || !match.p2 ? styles.bye : ''}`}>
        <span className={styles.pNameWrap}>
          <span
            className={`${styles.pName} ${match.p2 && !isBye ? styles.copyable : ''}`}
            onClick={() => copy(!isBye ? match.p2 : null, 'p2')}
          >
            {copied === 'p2' ? '✓' : (isBye ? 'BYE' : (match.p2 || 'TBD'))}
          </span>
          {match.p2 && !isBye && kickMap[match.p2] && (
            <span className={styles.kickTooltip}>
              <span className={styles.kickTooltipLabel}>kick</span>
              {kickMap[match.p2]}
            </span>
          )}
        </span>
        <div className={styles.actionCell}>
          {p2win
            ? <span className={styles.winMark} title="Kazananı kaldır" onClick={onClear}>✕</span>
            : isBye && !hasWinner && match.p1
              ? <button className={styles.advanceBtn} onClick={() => onSelect(match.p1)} title="BYE — ilerlet">→</button>
              : p2canAdvance && <button className={styles.advanceBtn} onClick={() => onSelect(match.p2)} title="Kazanan">▶</button>
          }
        </div>
      </div>
    </div>
  )
}

export default function MaclarTab() {
  const [bracket, setBracket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [zoom, setZoom] = useState(1)
  const [swapSel, setSwapSel] = useState(null)
  const [kickMap, setKickMap] = useState({})
  const scrollRef = useRef(null)
  const labelsRef = useRef(null)

  function zoomIn()    { setZoom(z => Math.min(1.5, +(z + 0.1).toFixed(1))) }
  function zoomOut()   { setZoom(z => Math.max(0.5, +(z - 0.1).toFixed(1))) }
  function zoomReset() { setZoom(1) }

  useEffect(() => {
    const el = scrollRef.current
    const labels = labelsRef.current
    if (!el || !labels) return
    const sync = () => { labels.scrollLeft = el.scrollLeft }
    el.addEventListener('scroll', sync)
    return () => el.removeEventListener('scroll', sync)
  }, [])

  const load = useCallback(async () => {
    const [data, regs] = await Promise.all([getBracket(), getRegistrations()])
    setBracket(data)
    const map = {}
    regs.forEach(r => { if (r.lol_nick) map[r.lol_nick] = r.kick_nick })
    setKickMap(map)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    const unsub = subscribeToTable('settings', load)
    return unsub
  }, [load])

  const sfIdx = bracket ? bracket.rounds.length - 2 : -1

  async function handleSelect(rIdx, mIdx, winner) {
    const next = JSON.parse(JSON.stringify(bracket))
    const match = next.rounds[rIdx][mIdx]
    if (match.winner && match.winner !== winner) {
      clearWinner(next.rounds, rIdx, mIdx)
      if (next.thirdPlace && rIdx === sfIdx) {
        if (mIdx === 0) next.thirdPlace.p1 = null
        else if (mIdx === 1) next.thirdPlace.p2 = null
        next.thirdPlace.winner = null
      }
    }
    next.rounds[rIdx][mIdx].winner = winner
    if (rIdx + 1 < next.rounds.length) {
      const nm = Math.floor(mIdx / 2)
      const slot = mIdx % 2 === 0 ? 'p1' : 'p2'
      next.rounds[rIdx + 1][nm][slot] = winner
    }
    // Yarı final kaybedeni 3. yer maçına yaz
    if (next.thirdPlace && rIdx === sfIdx) {
      const loser = winner === match.p1 ? match.p2 : match.p1
      if (mIdx === 0) next.thirdPlace.p1 = loser || null
      else if (mIdx === 1) next.thirdPlace.p2 = loser || null
    }
    setBracket(next)
    await saveBracket(next)
    setMsg('✅ Kaydedildi')
    setTimeout(() => setMsg(''), 2000)
  }

  async function handleClear(rIdx, mIdx) {
    const next = JSON.parse(JSON.stringify(bracket))
    clearWinner(next.rounds, rIdx, mIdx)
    if (next.thirdPlace && rIdx === sfIdx) {
      if (mIdx === 0) next.thirdPlace.p1 = null
      else if (mIdx === 1) next.thirdPlace.p2 = null
      next.thirdPlace.winner = null
    }
    setBracket(next)
    await saveBracket(next)
    setMsg('✅ Kaydedildi')
    setTimeout(() => setMsg(''), 2000)
  }

  async function handleSelectThirdPlace(winner) {
    const next = JSON.parse(JSON.stringify(bracket))
    next.thirdPlace.winner = winner
    setBracket(next)
    await saveBracket(next)
    setMsg('✅ Kaydedildi')
    setTimeout(() => setMsg(''), 2000)
  }

  async function handleClearThirdPlace() {
    const next = JSON.parse(JSON.stringify(bracket))
    next.thirdPlace.winner = null
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

  async function handleReshuffle() {
    if (!window.confirm('Tüm karşılaşmalar yeniden karıştırılsın mı? Mevcut sonuçlar silinir.')) return
    const next = reshuffleBracket(bracket)
    setBracket(next)
    await saveBracket(next)
    setMsg('✅ Bracket yeniden karıştırıldı.')
    setTimeout(() => setMsg(''), 2500)
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
    if (next.thirdPlace) { next.thirdPlace.p1 = null; next.thirdPlace.p2 = null; next.thirdPlace.winner = null }
    setBracket(next)
    await saveBracket(next)
    setMsg('✅ Bracket başa döndürüldü.')
    setTimeout(() => setMsg(''), 2000)
  }

  function handleSwapClick(rIdx, mIdx) {
    if (!swapSel) {
      setSwapSel({ rIdx, mIdx })
      return
    }
    // Aynı maça tekrar tıklandı → iptal
    if (swapSel.rIdx === rIdx && swapSel.mIdx === mIdx) {
      setSwapSel(null)
      return
    }
    // Farklı tur → seçimi değiştir
    if (swapSel.rIdx !== rIdx) {
      setSwapSel({ rIdx, mIdx })
      return
    }
    // Aynı tur, farklı maç → yer değiştir
    const next = JSON.parse(JSON.stringify(bracket))
    const a = next.rounds[rIdx][swapSel.mIdx]
    const b = next.rounds[rIdx][mIdx]
    if (a.winner) clearWinner(next.rounds, rIdx, swapSel.mIdx)
    if (b.winner) clearWinner(next.rounds, rIdx, mIdx)
    const { p1: ap1, p2: ap2 } = next.rounds[rIdx][swapSel.mIdx]
    next.rounds[rIdx][swapSel.mIdx].p1 = next.rounds[rIdx][mIdx].p1
    next.rounds[rIdx][swapSel.mIdx].p2 = next.rounds[rIdx][mIdx].p2
    next.rounds[rIdx][mIdx].p1 = ap1
    next.rounds[rIdx][mIdx].p2 = ap2
    next.rounds[rIdx][swapSel.mIdx].winner = null
    next.rounds[rIdx][mIdx].winner = null
    setBracket(next)
    saveBracket(next)
    setSwapSel(null)
    setMsg('✅ Maçlar yer değiştirdi')
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
          <div className={styles.zoomBar}>
            <button className={styles.zoomBtn} onClick={zoomOut} title="Küçült">−</button>
            <span className={styles.zoomVal} onClick={zoomReset} title="Sıfırla">{Math.round(zoom * 100)}%</span>
            <button className={styles.zoomBtn} onClick={zoomIn} title="Büyüt">+</button>
          </div>

          <div className={styles.roundLabelsBar} ref={labelsRef}>
            <div className={styles.roundLabelsInner} style={{ zoom }}>
              {bracket.rounds.map((_, rIdx) => (
                <div
                  key={rIdx}
                  className={`${styles.roundLabelCell} ${rIdx === bracket.rounds.length - 1 ? styles.roundLabelCellFinal : ''}`}
                >
                  {roundName(rIdx, bracket.rounds.length)}
                </div>
              ))}
            </div>
          </div>

          <div className={styles.bracketScroll} ref={scrollRef}>
            <div className={styles.bracket} style={{ zoom }}>
              {bracket.rounds.map((round, rIdx) => (
                <div className={styles.round} key={rIdx}>
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
                          swapSelected={!!(swapSel && swapSel.rIdx === rIdx && swapSel.mIdx === mIdx)}
                          swapTarget={!!(swapSel && swapSel.rIdx === rIdx && swapSel.mIdx !== mIdx)}
                          onSwapClick={() => handleSwapClick(rIdx, mIdx)}
                          kickMap={kickMap}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {bracket.thirdPlace && (
            <div className={styles.thirdPlaceSection}>
              <div className={styles.thirdPlaceLabel}>3. YER MAÇI</div>
              <MatchCard
                match={bracket.thirdPlace}
                onSelect={(w) => handleSelectThirdPlace(w)}
                onClear={() => handleClearThirdPlace()}
              />
            </div>
          )}

          {msg && <div className={styles.saveMsg}>{msg}</div>}
          <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.2rem', flexWrap: 'wrap' }}>
            <button className={tabStyles.btnOutline} onClick={handleReshuffle} style={{ flex: 1, minWidth: '140px', color: '#00c2ff', borderColor: 'rgba(0,194,255,0.4)' }}>
              🔀 Randomize
            </button>
            <button className={tabStyles.btnOutline} onClick={handleResetBracket} style={{ flex: 1, minWidth: '140px' }}>
              🔄 Başa Döndür
            </button>
            <button className={tabStyles.btnOutline} onClick={handleClearBracket} style={{ flex: 1, minWidth: '140px', color: '#ff6060', borderColor: 'rgba(255,96,96,0.4)' }}>
              🗑️ Bracket Temizle
            </button>
          </div>
        </>
      )}
    </div>
  )
}
