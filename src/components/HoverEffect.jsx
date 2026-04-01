import { useEffect, useRef } from 'react'

// ─── Effect configs ───────────────────────────────────────────────────────────
const CONFIGS = {
  fire:      { spawn: 6,  init: 70, tint: 'rgba(255,80,0,0.10)'    },
  ice:       { spawn: 2,  init: 45, tint: 'rgba(0,180,255,0.07)'   },
  lightning: { spawn: 10, init: 55, tint: 'rgba(100,120,255,0.08)' },
  poison:    { spawn: 3,  init: 60, tint: 'rgba(0,220,0,0.07)'     },
  dark:      { spawn: 4,  init: 65, tint: 'rgba(60,0,120,0.16)'    },
  blood:     { spawn: 5,  init: 55, tint: 'rgba(180,0,0,0.10)'     },
}

// ─── Particle factory ─────────────────────────────────────────────────────────
function makeParticle(effect, W, H) {
  switch (effect) {
    case 'fire': return {
      x: Math.random() * W, y: H + 5,
      vx: (Math.random() - 0.5) * 2.5, vy: -(Math.random() * 4 + 2),
      size: Math.random() * 14 + 4, life: 0,
      maxLife: Math.random() * 70 + 30,
      wobble: Math.random() * Math.PI * 2,
    }
    case 'ice': return {
      x: Math.random() * W, y: -10,
      vx: (Math.random() - 0.5) * 1.2, vy: Math.random() * 1.8 + 0.5,
      size: Math.random() * 7 + 2, life: 0,
      maxLife: Math.random() * 130 + 60,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.04,
    }
    case 'lightning': return {
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 7, vy: (Math.random() - 0.5) * 7,
      size: Math.random() * 3 + 1, life: 0,
      maxLife: Math.random() * 18 + 8,
    }
    case 'poison': return {
      x: Math.random() * W, y: H + 5,
      vx: (Math.random() - 0.5) * 1.5, vy: -(Math.random() * 2 + 0.5),
      size: Math.random() * 10 + 3, life: 0,
      maxLife: Math.random() * 100 + 50,
      pulse: Math.random() * Math.PI * 2,
    }
    case 'dark': return {
      x: W / 2 + (Math.random() - 0.5) * W,
      y: H / 2 + (Math.random() - 0.5) * H,
      vx: (Math.random() - 0.5) * 2.5, vy: (Math.random() - 0.5) * 2.5,
      size: Math.random() * 20 + 6, life: 0,
      maxLife: Math.random() * 90 + 40,
    }
    case 'blood': return {
      x: Math.random() * W, y: -8,
      vx: (Math.random() - 0.5) * 0.8, vy: Math.random() * 6 + 3,
      size: Math.random() * 4 + 1.5, life: 0,
      maxLife: Math.random() * 50 + 25,
    }
    default: return null
  }
}

// ─── Update particle ──────────────────────────────────────────────────────────
function updateP(p, effect, W, H) {
  p.life++
  p.x += p.vx
  p.y += p.vy
  switch (effect) {
    case 'fire':
      p.wobble += 0.08
      p.vx += Math.sin(p.wobble) * 0.12
      break
    case 'ice':
      p.rotation += p.rotSpeed
      p.vx += Math.sin(p.life * 0.03) * 0.04
      break
    case 'lightning':
      p.vx += (Math.random() - 0.5) * 1.5
      p.vy += (Math.random() - 0.5) * 1.5
      break
    case 'poison':
      p.vx += Math.sin(p.life * 0.06) * 0.08
      break
    case 'dark': {
      const dx = W / 2 - p.x
      const dy = H / 2 - p.y
      const dist = Math.sqrt(dx * dx + dy * dy) || 1
      p.vx += (dx / dist) * 0.04
      p.vy += (dy / dist) * 0.04
      p.vx *= 0.97; p.vy *= 0.97
      break
    }
    case 'blood':
      p.vy += 0.25
      break
  }
}

// ─── Draw particle ────────────────────────────────────────────────────────────
function drawP(ctx, p, effect) {
  const t = p.life / p.maxLife
  const alpha = t < 0.15 ? t / 0.15 : Math.max(0, 1 - (t - 0.15) / 0.85)
  if (alpha <= 0) return
  ctx.save()
  ctx.globalAlpha = alpha

  switch (effect) {
    case 'fire': {
      const hue = 45 - t * 40
      const lit = 65 - t * 30
      ctx.shadowBlur = 28; ctx.shadowColor = `hsl(${hue},100%,${lit}%)`
      ctx.fillStyle = `hsl(${hue},100%,${lit}%)`
      ctx.beginPath()
      ctx.arc(p.x, p.y, Math.max(0.5, p.size * (1 - t * 0.65)), 0, Math.PI * 2)
      ctx.fill()
      break
    }
    case 'ice': {
      ctx.translate(p.x, p.y); ctx.rotate(p.rotation)
      ctx.strokeStyle = `hsl(200, 85%, ${65 + t * 25}%)`
      ctx.lineWidth = 1.5
      ctx.shadowBlur = 14; ctx.shadowColor = '#99d6ff'
      for (let i = 0; i < 6; i++) {
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(p.size, 0); ctx.stroke()
        // Side branches
        ctx.beginPath(); ctx.moveTo(p.size * 0.5, 0)
        ctx.lineTo(p.size * 0.5, -p.size * 0.3); ctx.stroke()
        ctx.rotate(Math.PI / 3)
      }
      break
    }
    case 'lightning': {
      ctx.shadowBlur = 22; ctx.shadowColor = '#c0d0ff'
      ctx.fillStyle = `hsl(225, 100%, ${75 + t * 25}%)`
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fill()
      break
    }
    case 'poison': {
      const s = Math.max(0.5, p.size * (1 + Math.sin(p.pulse + p.life * 0.1) * 0.15) * (1 - t * 0.3))
      ctx.shadowBlur = 16; ctx.shadowColor = '#00ff66'
      ctx.strokeStyle = `hsl(130, 80%, 45%)`; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.arc(p.x, p.y, s, 0, Math.PI * 2); ctx.stroke()
      ctx.fillStyle = `hsl(130, 100%, 65%)`
      ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0.3, s * 0.35), 0, Math.PI * 2); ctx.fill()
      break
    }
    case 'dark': {
      ctx.globalAlpha = 1
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size)
      g.addColorStop(0, `hsla(270,80%,22%,${alpha})`)
      g.addColorStop(1, `hsla(270,80%,5%,0)`)
      ctx.fillStyle = g
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill()
      break
    }
    case 'blood': {
      ctx.shadowBlur = 6; ctx.shadowColor = '#ff2200'
      ctx.fillStyle = `hsl(355, 90%, ${38 - t * 15}%)`
      ctx.beginPath()
      ctx.ellipse(p.x, p.y + p.size * 0.5, p.size * 0.55, p.size * 1.6, 0, 0, Math.PI * 2)
      ctx.fill()
      break
    }
  }
  ctx.restore()
}

// ─── Lightning bolt ───────────────────────────────────────────────────────────
function drawBolt(ctx, W, H) {
  ctx.save()
  ctx.strokeStyle = 'rgba(200,220,255,0.85)'
  ctx.lineWidth = 1.5
  ctx.shadowBlur = 22; ctx.shadowColor = '#aabbff'
  ctx.beginPath()
  let x = Math.random() * W, y = 0
  ctx.moveTo(x, y)
  while (y < H) {
    x += (Math.random() - 0.5) * 100
    y += Math.random() * 70 + 20
    ctx.lineTo(Math.min(Math.max(x, 0), W), y)
  }
  ctx.stroke()
  ctx.restore()
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function HoverEffect({ effect, active }) {
  const canvasRef = useRef(null)
  const activeRef = useRef(active)
  const frameRef  = useRef(null)
  const stateRef  = useRef({ particles: [], opacity: 0 })

  // Sync active into ref so the loop can read it without re-running the effect
  useEffect(() => { activeRef.current = active }, [active])

  useEffect(() => {
    if (!effect || effect === 'none') return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const cfg = CONFIGS[effect]
    if (!cfg) return

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const S = stateRef.current
    S.particles = []
    S.opacity = 0

    // Seed particles spread across lifecycle so burst isn't all at age 0
    for (let i = 0; i < cfg.init; i++) {
      const p = makeParticle(effect, canvas.width, canvas.height)
      if (p) { p.life = Math.floor(Math.random() * p.maxLife * 0.5); S.particles.push(p) }
    }

    function loop() {
      const W = canvas.width, H = canvas.height

      S.opacity = activeRef.current
        ? Math.min(1, S.opacity + 0.06)
        : Math.max(0, S.opacity - 0.05)

      canvas.style.opacity = S.opacity

      if (S.opacity > 0) {
        ctx.clearRect(0, 0, W, H)
        ctx.fillStyle = cfg.tint
        ctx.fillRect(0, 0, W, H)

        if (activeRef.current) {
          for (let i = 0; i < cfg.spawn; i++) {
            if (S.particles.length < 220) {
              const p = makeParticle(effect, W, H)
              if (p) S.particles.push(p)
            }
          }
          if (effect === 'lightning' && Math.random() < 0.04) drawBolt(ctx, W, H)
        }

        S.particles = S.particles.filter(p => {
          updateP(p, effect, W, H)
          drawP(ctx, p, effect)
          return p.life < p.maxLife
        })
      }

      frameRef.current = requestAnimationFrame(loop)
    }

    frameRef.current = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(frameRef.current)
      window.removeEventListener('resize', resize)
      S.particles = []
    }
  }, [effect])

  if (!effect || effect === 'none') return null

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', inset: 0,
        width: '100vw', height: '100vh',
        pointerEvents: 'none',
        zIndex: 50,
        opacity: 0,
      }}
    />
  )
}
