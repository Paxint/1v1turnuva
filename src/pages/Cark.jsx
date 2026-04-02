import { useState, useRef, useEffect, useCallback } from 'react'
import styles from './Cark.module.css'

const SEGMENT_COLORS = [
  '#53fc18', '#00c2ff', '#ff4444', '#ffd700',
  '#ff6b35', '#a855f7', '#06b6d4', '#f97316',
  '#10b981', '#ec4899', '#facc15', '#38bdf8',
]

const STORAGE_KEY = 'cark_options'
const CANVAS_SIZE = 420

function loadOptions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}
  return ['Oyuncu 1', 'Oyuncu 2', 'Oyuncu 3', 'Oyuncu 4']
}

function saveOptions(opts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(opts))
}

export default function Cark() {
  const canvasRef = useRef(null)
  const angleRef = useRef(0)
  const rafRef = useRef(null)

  const [options, setOptions] = useState(loadOptions)
  const [input, setInput] = useState('')
  const [spinning, setSpinning] = useState(false)
  const [winner, setWinner] = useState(null)
  const [teamDraw, setTeamDraw] = useState(null)

  function drawFive() {
    if (options.length < 10) return
    const shuffled = [...options].sort(() => Math.random() - 0.5)
    setTeamDraw({ team1: shuffled.slice(0, 5), team2: shuffled.slice(5, 10) })
  }

  const draw = useCallback((angle) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const cx = CANVAS_SIZE / 2
    const cy = CANVAS_SIZE / 2
    const r = cx - 16
    const n = options.length

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
    if (n === 0) return

    const arc = (2 * Math.PI) / n

    // Dış glow halkası
    ctx.beginPath()
    ctx.arc(cx, cy, r + 8, 0, 2 * Math.PI)
    ctx.strokeStyle = 'rgba(83,252,24,0.35)'
    ctx.lineWidth = 5
    ctx.stroke()

    for (let i = 0; i < n; i++) {
      const start = angle + i * arc
      const end = start + arc

      // Dilim
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, r, start, end)
      ctx.closePath()
      ctx.fillStyle = SEGMENT_COLORS[i % SEGMENT_COLORS.length]
      ctx.fill()
      ctx.strokeStyle = '#050a03'
      ctx.lineWidth = 2
      ctx.stroke()

      // Yazı
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(start + arc / 2)
      ctx.textAlign = 'right'
      const fontSize = Math.max(9, Math.min(15, 190 / n))
      ctx.font = `bold ${fontSize}px 'Barlow Condensed', sans-serif`
      ctx.fillStyle = '#000'
      ctx.shadowColor = 'rgba(255,255,255,0.5)'
      ctx.shadowBlur = 3
      const maxLen = Math.max(6, Math.floor(280 / (n * 3)))
      const label = options[i].length > maxLen ? options[i].slice(0, maxLen) + '…' : options[i]
      ctx.fillText(label, r - 10, fontSize / 3)
      ctx.restore()
    }

    // Merkez kapak
    ctx.beginPath()
    ctx.arc(cx, cy, 22, 0, 2 * Math.PI)
    ctx.fillStyle = '#050a03'
    ctx.fill()
    ctx.strokeStyle = '#53fc18'
    ctx.lineWidth = 3
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(cx, cy, 8, 0, 2 * Math.PI)
    ctx.fillStyle = '#53fc18'
    ctx.fill()
  }, [options])

  useEffect(() => {
    draw(angleRef.current)
  }, [draw])

  useEffect(() => {
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [])

  function spin() {
    if (spinning || options.length < 2) return
    setWinner(null)
    setSpinning(true)

    const extraSpins = (5 + Math.floor(Math.random() * 5)) * 2 * Math.PI
    const randomExtra = Math.random() * 2 * Math.PI
    const totalRotation = extraSpins + randomExtra
    const duration = 4000 + Math.random() * 1500
    const startAngle = angleRef.current
    const startTime = performance.now()

    function easeOut(t) { return 1 - Math.pow(1 - t, 3.5) }

    function animate(now) {
      const t = Math.min((now - startTime) / duration, 1)
      angleRef.current = startAngle + totalRotation * easeOut(t)
      draw(angleRef.current)
      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        setSpinning(false)
        const n = options.length
        const arc = (2 * Math.PI) / n
        const pos = -Math.PI / 2 - angleRef.current
        const normalized = ((pos % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
        const idx = Math.floor(normalized / arc) % n
        setWinner(options[idx])
      }
    }
    rafRef.current = requestAnimationFrame(animate)
  }

  function addOption() {
    const val = input.trim()
    if (!val) return
    const next = [...options, val]
    setOptions(next)
    saveOptions(next)
    setInput('')
  }

  function removeOption(i) {
    const next = options.filter((_, idx) => idx !== i)
    setOptions(next)
    saveOptions(next)
  }

  function clearAll() {
    if (!window.confirm('Tüm seçenekler silinsin mi?')) return
    setOptions([])
    saveOptions([])
    setWinner(null)
  }

  return (
    <div className={styles.page}>
      <div className={`${styles.pageHeader} fade-up`}>
        <span className={styles.pageTag}>Takım Belirleme</span>
        <h1>Kader <span>Çarkı</span></h1>
      </div>

      <div className={`${styles.layout} fade-up-1`}>
        {/* Sol: seçenek listesi */}
        <div className={styles.sidebar}>
          <div className={styles.sideTitle}>
            Seçenekler <span className={styles.count}>{options.length}</span>
          </div>

          <div className={styles.addRow}>
            <input
              className="ipt"
              placeholder="İsim veya takım ekle…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addOption()}
            />
            <button className={styles.addBtn} onClick={addOption}>+</button>
          </div>

          {options.length === 0 && (
            <div className={styles.emptyHint}>Henüz seçenek yok. Yukarıdan ekleyin.</div>
          )}

          <ul className={styles.list}>
            {options.map((opt, i) => (
              <li key={i} className={styles.item}>
                <span
                  className={styles.dot}
                  style={{ background: SEGMENT_COLORS[i % SEGMENT_COLORS.length] }}
                />
                <span className={styles.itemName}>{opt}</span>
                <button className={styles.delBtn} onClick={() => removeOption(i)}>✕</button>
              </li>
            ))}
          </ul>

          {options.length >= 10 && (
            <button className={styles.drawBtn} onClick={drawFive}>
              🎲 5'li Takım Çek
            </button>
          )}

          {options.length > 0 && (
            <button className={styles.clearBtn} onClick={clearAll}>🗑️ Tümünü Temizle</button>
          )}

          {options.length === 1 && (
            <div className={styles.warnHint}>En az 2 seçenek gerekli</div>
          )}
        </div>

        {/* Sağ: çark */}
        <div className={styles.wheelWrap}>
          <div className={styles.pointer}>▼</div>
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className={styles.canvas}
            onClick={spin}
            style={{ cursor: spinning || options.length < 2 ? 'default' : 'pointer' }}
          />
          <button
            className={styles.spinBtn}
            onClick={spin}
            disabled={spinning || options.length < 2}
          >
            {spinning ? '⏳ Dönüyor…' : '🎯 ÇEVİR'}
          </button>
        </div>
      </div>

      {/* 5'li takım çekimi modal */}
      {teamDraw && (
        <div className={styles.overlay} onClick={() => setTeamDraw(null)}>
          <div className={styles.teamModal} onClick={e => e.stopPropagation()}>
            <div className={styles.teamModalTitle}>🎲 Takım Çekimi</div>
            <div className={styles.teams}>
              <div className={styles.team}>
                <div className={styles.teamLabel} style={{ color: '#53fc18' }}>Takım 1</div>
                <ul className={styles.teamList}>
                  {teamDraw.team1.map((p, i) => (
                    <li key={i} className={styles.teamPlayer} style={{ borderLeftColor: '#53fc18' }}>{p}</li>
                  ))}
                </ul>
              </div>
              <div className={styles.teamDivider}>VS</div>
              <div className={styles.team}>
                <div className={styles.teamLabel} style={{ color: '#00c2ff' }}>Takım 2</div>
                <ul className={styles.teamList}>
                  {teamDraw.team2.map((p, i) => (
                    <li key={i} className={styles.teamPlayer} style={{ borderLeftColor: '#00c2ff' }}>{p}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className={styles.teamActions}>
              <button className={styles.reDrawBtn} onClick={drawFive}>🔀 Yeniden Çek</button>
              <button className={styles.modalClose} onClick={() => setTeamDraw(null)}>Kapat</button>
            </div>
          </div>
        </div>
      )}

      {/* Kazanan modal */}
      {winner && (
        <div className={styles.overlay} onClick={() => setWinner(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.confetti}>🎉</div>
            <div className={styles.modalLabel}>Kazanan</div>
            <div className={styles.modalWinner}>{winner}</div>
            <button className={styles.modalClose} onClick={() => setWinner(null)}>Kapat</button>
          </div>
        </div>
      )}
    </div>
  )
}
