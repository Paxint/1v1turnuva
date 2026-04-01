import { useEffect, useRef } from 'react'

// ─── Pokemon type configs ─────────────────────────────────────────────────────
const CONFIGS = {
  // Mevcut
  fire:      { spawn: 6,  init: 70, tint: 'rgba(255,80,0,0.10)'     },
  ice:       { spawn: 2,  init: 45, tint: 'rgba(0,180,255,0.07)'    },
  lightning: { spawn: 10, init: 55, tint: 'rgba(255,220,0,0.08)'    },
  poison:    { spawn: 3,  init: 60, tint: 'rgba(0,220,0,0.07)'      },
  dark:      { spawn: 4,  init: 65, tint: 'rgba(40,0,80,0.18)'      },
  blood:     { spawn: 5,  init: 55, tint: 'rgba(180,0,0,0.10)'      },
  // Yeni
  water:     { spawn: 4,  init: 50, tint: 'rgba(0,100,220,0.08)'    },
  grass:     { spawn: 3,  init: 50, tint: 'rgba(0,180,50,0.07)'     },
  fighting:  { spawn: 9,  init: 65, tint: 'rgba(200,60,0,0.11)'     },
  ground:    { spawn: 5,  init: 55, tint: 'rgba(160,110,20,0.11)'   },
  flying:    { spawn: 5,  init: 50, tint: 'rgba(140,200,255,0.06)'  },
  psychic:   { spawn: 4,  init: 55, tint: 'rgba(230,0,130,0.08)'    },
  bug:       { spawn: 6,  init: 55, tint: 'rgba(100,210,0,0.07)'    },
  rock:      { spawn: 3,  init: 40, tint: 'rgba(130,100,40,0.10)'   },
  ghost:     { spawn: 3,  init: 50, tint: 'rgba(70,0,130,0.14)'     },
  dragon:    { spawn: 5,  init: 65, tint: 'rgba(40,0,210,0.13)'     },
  steel:     { spawn: 7,  init: 55, tint: 'rgba(180,200,220,0.08)'  },
  fairy:     { spawn: 4,  init: 55, tint: 'rgba(255,100,200,0.08)'  },
  normal:    { spawn: 3,  init: 40, tint: 'rgba(180,170,140,0.05)'  },
}

// ─── Particle factory ─────────────────────────────────────────────────────────
function makeParticle(effect, W, H) {
  const cx = W / 2, cy = H / 2
  switch (effect) {

    /* ── Fire ── */
    case 'fire': return {
      x: Math.random() * W, y: H + 5,
      vx: (Math.random() - 0.5) * 2.5, vy: -(Math.random() * 4 + 2),
      size: Math.random() * 14 + 4, life: 0, maxLife: Math.random() * 70 + 30,
      wobble: Math.random() * Math.PI * 2,
    }

    /* ── Water ── */
    case 'water': return {
      x: Math.random() * W, y: -10,
      vx: (Math.random() - 0.5) * 1.5, vy: Math.random() * 5 + 3,
      size: Math.random() * 6 + 3, life: 0, maxLife: Math.random() * 60 + 30,
      wave: Math.random() * Math.PI * 2,
    }

    /* ── Grass ── */
    case 'grass': return {
      x: Math.random() * W, y: -10,
      vx: (Math.random() - 0.5) * 2 + 1, vy: Math.random() * 2 + 0.5,
      size: Math.random() * 10 + 5, life: 0, maxLife: Math.random() * 120 + 60,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.05,
    }

    /* ── Ice ── */
    case 'ice': return {
      x: Math.random() * W, y: -10,
      vx: (Math.random() - 0.5) * 1.2, vy: Math.random() * 1.8 + 0.5,
      size: Math.random() * 7 + 2, life: 0, maxLife: Math.random() * 130 + 60,
      rotation: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 0.04,
    }

    /* ── Lightning / Electric ── */
    case 'lightning': return {
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 7, vy: (Math.random() - 0.5) * 7,
      size: Math.random() * 3 + 1, life: 0, maxLife: Math.random() * 18 + 8,
    }

    /* ── Fighting ── */
    case 'fighting': {
      const angle = Math.random() * Math.PI * 2
      const speed = Math.random() * 8 + 4
      const ox = cx + (Math.random() - 0.5) * W * 0.6
      const oy = cy + (Math.random() - 0.5) * H * 0.6
      return {
        x: ox, y: oy,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        size: Math.random() * 5 + 2, life: 0, maxLife: Math.random() * 30 + 15,
        isRing: Math.random() < 0.1,
        ringR: 0, ox, oy,
      }
    }

    /* ── Poison ── */
    case 'poison': return {
      x: Math.random() * W, y: H + 5,
      vx: (Math.random() - 0.5) * 1.5, vy: -(Math.random() * 2 + 0.5),
      size: Math.random() * 10 + 3, life: 0, maxLife: Math.random() * 100 + 50,
      pulse: Math.random() * Math.PI * 2,
    }

    /* ── Ground ── */
    case 'ground': return {
      x: Math.random() * W, y: H + 5,
      vx: (Math.random() - 0.5) * 3, vy: -(Math.random() * 3 + 1),
      size: Math.random() * 10 + 4, life: 0, maxLife: Math.random() * 60 + 30,
      isChunk: Math.random() < 0.3,
      rotation: Math.random() * Math.PI * 2,
    }

    /* ── Flying ── */
    case 'flying': {
      const fromLeft = Math.random() < 0.5
      return {
        x: fromLeft ? -20 : W + 20, y: Math.random() * H,
        vx: fromLeft ? Math.random() * 6 + 4 : -(Math.random() * 6 + 4),
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 50 + 20, life: 0, maxLife: Math.random() * 50 + 30,
      }
    }

    /* ── Psychic ── */
    case 'psychic': {
      const angle = Math.random() * Math.PI * 2
      const r = Math.random() * Math.min(W, H) * 0.45
      return {
        x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r,
        angle, r,
        vr: (Math.random() < 0.5 ? 1 : -1) * (Math.random() * 0.03 + 0.01),
        size: Math.random() * 8 + 3, life: 0, maxLife: Math.random() * 100 + 50,
        isStar: Math.random() < 0.4,
      }
    }

    /* ── Bug ── */
    case 'bug': return {
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4,
      size: Math.random() * 5 + 2, life: 0, maxLife: Math.random() * 40 + 20,
      jitter: Math.random() * Math.PI * 2,
    }

    /* ── Rock ── */
    case 'rock': return {
      x: Math.random() * W, y: -10,
      vx: (Math.random() - 0.5) * 3, vy: Math.random() * 5 + 2,
      size: Math.random() * 14 + 6, life: 0, maxLife: Math.random() * 60 + 30,
      rotation: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 0.08,
      sides: Math.floor(Math.random() * 3) + 4,
    }

    /* ── Ghost ── */
    case 'ghost': return {
      x: Math.random() * W, y: H + 10,
      vx: (Math.random() - 0.5) * 1.5, vy: -(Math.random() * 2 + 0.5),
      size: Math.random() * 18 + 8, life: 0, maxLife: Math.random() * 110 + 50,
      wobble: Math.random() * Math.PI * 2,
    }

    /* ── Dragon ── */
    case 'dragon': {
      const side = Math.floor(Math.random() * 4)
      const px = side === 0 ? 0 : side === 1 ? W : Math.random() * W
      const py = side === 2 ? 0 : side === 3 ? H : Math.random() * H
      const angle = Math.atan2(cy - py, cx - px) + (Math.random() - 0.5) * 0.8
      const speed = Math.random() * 3 + 2
      return {
        x: px, y: py,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        size: Math.random() * 16 + 6, life: 0, maxLife: Math.random() * 80 + 40,
        wobble: Math.random() * Math.PI * 2,
      }
    }

    /* ── Dark ── */
    case 'dark': return {
      x: cx + (Math.random() - 0.5) * W,
      y: cy + (Math.random() - 0.5) * H,
      vx: (Math.random() - 0.5) * 2.5, vy: (Math.random() - 0.5) * 2.5,
      size: Math.random() * 20 + 6, life: 0, maxLife: Math.random() * 90 + 40,
    }

    /* ── Steel ── */
    case 'steel': {
      const a = Math.random() * Math.PI * 2
      const sp = Math.random() * 9 + 4
      return {
        x: cx + (Math.random() - 0.5) * W * 0.5,
        y: cy + (Math.random() - 0.5) * H * 0.5,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        size: Math.random() * 4 + 1.5, life: 0, maxLife: Math.random() * 35 + 15,
        rotation: Math.random() * Math.PI * 2,
      }
    }

    /* ── Fairy ── */
    case 'fairy': return {
      x: Math.random() * W, y: H * 0.8 + Math.random() * H * 0.2,
      vx: (Math.random() - 0.5) * 2, vy: -(Math.random() * 3 + 1),
      size: Math.random() * 8 + 3, life: 0, maxLife: Math.random() * 90 + 40,
      isStar: Math.random() < 0.6, twinkle: Math.random() * Math.PI * 2,
    }

    /* ── Blood ── */
    case 'blood': return {
      x: Math.random() * W, y: -8,
      vx: (Math.random() - 0.5) * 0.8, vy: Math.random() * 6 + 3,
      size: Math.random() * 4 + 1.5, life: 0, maxLife: Math.random() * 50 + 25,
    }

    /* ── Normal ── */
    case 'normal': return {
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 1.5, vy: (Math.random() - 0.5) * 1.5,
      size: Math.random() * 5 + 2, life: 0, maxLife: Math.random() * 80 + 40,
    }

    default: return null
  }
}

// ─── Update ───────────────────────────────────────────────────────────────────
function updateP(p, effect, W, H) {
  p.life++
  const cx = W / 2, cy = H / 2
  switch (effect) {
    case 'fire':
      p.wobble += 0.08; p.vx += Math.sin(p.wobble) * 0.12
      p.x += p.vx; p.y += p.vy
      break
    case 'water':
      p.wave += 0.05; p.vx = Math.sin(p.wave) * 1.2
      p.x += p.vx; p.y += p.vy
      break
    case 'grass':
      p.rotation += p.rotSpeed
      p.vx += Math.sin(p.life * 0.04) * 0.06
      p.x += p.vx; p.y += p.vy
      break
    case 'ice':
      p.rotation += p.rotSpeed
      p.vx += Math.sin(p.life * 0.03) * 0.04
      p.x += p.vx; p.y += p.vy
      break
    case 'lightning':
      p.vx += (Math.random() - 0.5) * 1.5; p.vy += (Math.random() - 0.5) * 1.5
      p.x += p.vx; p.y += p.vy
      break
    case 'fighting':
      p.vy += 0.3
      p.x += p.vx; p.y += p.vy
      break
    case 'poison':
      p.vx += Math.sin(p.life * 0.06) * 0.08
      p.x += p.vx; p.y += p.vy
      break
    case 'ground':
      p.vy -= 0.08; if (p.vy < 0 && p.y < cy) p.vy += 0.12
      p.rotation += 0.03
      p.x += p.vx; p.y += p.vy
      break
    case 'flying':
      p.vy += Math.sin(p.life * 0.08) * 0.1
      p.x += p.vx; p.y += p.vy
      break
    case 'psychic':
      p.angle += p.vr
      p.r += Math.sin(p.life * 0.04) * 0.5
      p.x = cx + Math.cos(p.angle) * p.r
      p.y = cy + Math.sin(p.angle) * p.r
      break
    case 'bug':
      p.jitter += 0.3
      p.vx += Math.cos(p.jitter) * 0.5; p.vy += Math.sin(p.jitter) * 0.5
      p.vx *= 0.95; p.vy *= 0.95
      p.x += p.vx; p.y += p.vy
      break
    case 'rock':
      p.vy += 0.2; p.rotation += p.rotSpeed
      p.x += p.vx; p.y += p.vy
      break
    case 'ghost':
      p.wobble += 0.05; p.vx = Math.sin(p.wobble) * 0.8
      p.x += p.vx; p.y += p.vy
      break
    case 'dragon':
      p.wobble += 0.07; p.vx += Math.sin(p.wobble) * 0.1
      p.x += p.vx; p.y += p.vy
      break
    case 'dark': {
      const dx = cx - p.x, dy = cy - p.y, d = Math.sqrt(dx*dx+dy*dy)||1
      p.vx += (dx/d)*0.04; p.vy += (dy/d)*0.04
      p.vx *= 0.97; p.vy *= 0.97
      p.x += p.vx; p.y += p.vy
      break
    }
    case 'steel':
      p.vy += 0.25; p.rotation += 0.12
      p.x += p.vx; p.y += p.vy
      break
    case 'fairy':
      p.twinkle += 0.1; p.vx += Math.sin(p.twinkle*0.5)*0.04
      p.x += p.vx; p.y += p.vy
      break
    case 'blood':
      p.vy += 0.25; p.x += p.vx; p.y += p.vy
      break
    case 'normal':
      p.x += p.vx; p.y += p.vy
      break
  }
}

// ─── Draw helpers ─────────────────────────────────────────────────────────────
function drawStar(ctx, x, y, r, points = 5) {
  ctx.beginPath()
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? r : r * 0.45
    const a = (i * Math.PI) / points - Math.PI / 2
    i === 0 ? ctx.moveTo(x + Math.cos(a)*radius, y + Math.sin(a)*radius)
             : ctx.lineTo(x + Math.cos(a)*radius, y + Math.sin(a)*radius)
  }
  ctx.closePath()
}

function drawPolygon(ctx, x, y, r, sides, rotation = 0) {
  ctx.beginPath()
  for (let i = 0; i < sides; i++) {
    const a = (i / sides) * Math.PI * 2 + rotation
    const ir = r * (0.7 + Math.sin(i * 1.3) * 0.3)
    i === 0 ? ctx.moveTo(x + Math.cos(a)*ir, y + Math.sin(a)*ir)
             : ctx.lineTo(x + Math.cos(a)*ir, y + Math.sin(a)*ir)
  }
  ctx.closePath()
}

function drawLeaf(ctx, x, y, size, rotation) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rotation)
  ctx.beginPath()
  ctx.ellipse(0, 0, size * 0.35, size, 0, 0, Math.PI * 2)
  ctx.restore()
}

function drawBolt(ctx, W, H) {
  ctx.save()
  ctx.strokeStyle = 'rgba(255,240,80,0.9)'; ctx.lineWidth = 2
  ctx.shadowBlur = 25; ctx.shadowColor = '#ffe040'
  ctx.beginPath()
  let x = Math.random() * W, y = 0
  ctx.moveTo(x, y)
  while (y < H) { x += (Math.random()-0.5)*100; y += Math.random()*70+20; ctx.lineTo(Math.min(Math.max(x,0),W),y) }
  ctx.stroke(); ctx.restore()
}

// ─── Draw ─────────────────────────────────────────────────────────────────────
function drawP(ctx, p, effect) {
  const t = p.life / p.maxLife
  const alpha = t < 0.15 ? t/0.15 : Math.max(0, 1-(t-0.15)/0.85)
  if (alpha <= 0) return
  ctx.save(); ctx.globalAlpha = alpha

  switch (effect) {

    case 'fire': {
      const hue = 45 - t*40, lit = 65 - t*30
      ctx.shadowBlur=28; ctx.shadowColor=`hsl(${hue},100%,${lit}%)`
      ctx.fillStyle=`hsl(${hue},100%,${lit}%)`
      ctx.beginPath(); ctx.arc(p.x,p.y,Math.max(0.5,p.size*(1-t*0.65)),0,Math.PI*2); ctx.fill()
      break
    }

    case 'water': {
      ctx.shadowBlur=15; ctx.shadowColor='#44aaff'
      ctx.fillStyle=`hsl(210,90%,${55+t*20}%)`
      ctx.beginPath()
      ctx.arc(p.x, p.y, Math.max(0.5, p.size*(1-t*0.3)), 0, Math.PI*2)
      ctx.fill()
      // highlight
      ctx.fillStyle=`rgba(255,255,255,0.35)`
      ctx.beginPath(); ctx.arc(p.x-p.size*0.25, p.y-p.size*0.25, p.size*0.22, 0, Math.PI*2); ctx.fill()
      break
    }

    case 'grass': {
      ctx.shadowBlur=12; ctx.shadowColor='#44ff66'
      ctx.fillStyle=`hsl(${130-t*20},80%,${40+t*10}%)`
      drawLeaf(ctx, p.x, p.y, p.size*(1-t*0.3), p.rotation)
      ctx.fill()
      break
    }

    case 'ice': {
      ctx.translate(p.x,p.y); ctx.rotate(p.rotation)
      ctx.strokeStyle=`hsl(200,85%,${65+t*25}%)`; ctx.lineWidth=1.5
      ctx.shadowBlur=14; ctx.shadowColor='#99d6ff'
      for(let i=0;i<6;i++){
        ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(p.size,0); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(p.size*0.5,0); ctx.lineTo(p.size*0.5,-p.size*0.3); ctx.stroke()
        ctx.rotate(Math.PI/3)
      }
      break
    }

    case 'lightning': {
      ctx.shadowBlur=22; ctx.shadowColor='#ffe060'
      ctx.fillStyle=`hsl(55,100%,${70+t*25}%)`
      ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2); ctx.fill()
      break
    }

    case 'fighting': {
      ctx.shadowBlur=18; ctx.shadowColor='#ff8800'
      ctx.fillStyle=`hsl(${20-t*15},100%,${55-t*20}%)`
      ctx.beginPath(); ctx.arc(p.x,p.y,Math.max(0.5,p.size*(1-t*0.5)),0,Math.PI*2); ctx.fill()
      break
    }

    case 'poison': {
      const s=Math.max(0.5,p.size*(1+Math.sin(p.pulse+p.life*0.1)*0.15)*(1-t*0.3))
      ctx.shadowBlur=16; ctx.shadowColor='#aa00ff'
      ctx.strokeStyle=`hsl(280,80%,55%)`; ctx.lineWidth=1.5
      ctx.beginPath(); ctx.arc(p.x,p.y,s,0,Math.PI*2); ctx.stroke()
      ctx.fillStyle=`hsl(280,100%,70%)`
      ctx.beginPath(); ctx.arc(p.x,p.y,Math.max(0.3,s*0.35),0,Math.PI*2); ctx.fill()
      break
    }

    case 'ground': {
      ctx.shadowBlur=8; ctx.shadowColor='#aa7700'
      ctx.fillStyle=`hsl(${35-t*10},70%,${38-t*15}%)`
      if(p.isChunk){ ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rotation); ctx.fillRect(-p.size/2,-p.size/3,p.size,p.size*0.6); ctx.restore() }
      else { ctx.beginPath(); ctx.arc(p.x,p.y,Math.max(0.5,p.size*(1-t*0.4)),0,Math.PI*2); ctx.fill() }
      break
    }

    case 'flying': {
      ctx.strokeStyle=`hsla(205,80%,80%,${alpha*0.7})`
      ctx.lineWidth=Math.max(0.5,2*(1-t))
      ctx.shadowBlur=10; ctx.shadowColor='#aaddff'
      ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(p.x-p.vx*p.size*0.6,p.y-p.vy*p.size*0.3); ctx.stroke()
      break
    }

    case 'psychic': {
      const twinkSize = p.size*(1+Math.sin(p.life*0.15)*0.2)*(1-t*0.3)
      ctx.shadowBlur=20; ctx.shadowColor='#ff44aa'
      ctx.fillStyle=`hsl(${330-t*30},90%,${60+t*10}%)`
      if(p.isStar){ drawStar(ctx,p.x,p.y,Math.max(1,twinkSize),4); ctx.fill() }
      else { ctx.beginPath(); ctx.arc(p.x,p.y,Math.max(0.5,twinkSize*0.6),0,Math.PI*2); ctx.fill() }
      break
    }

    case 'bug': {
      ctx.shadowBlur=8; ctx.shadowColor='#88ee00'
      ctx.fillStyle=`hsl(${90+t*20},90%,${50-t*10}%)`
      ctx.beginPath(); ctx.arc(p.x,p.y,Math.max(0.5,p.size*(1-t*0.3)),0,Math.PI*2); ctx.fill()
      break
    }

    case 'rock': {
      ctx.shadowBlur=5; ctx.shadowColor='#887755'
      ctx.fillStyle=`hsl(35,35%,${45-t*20}%)`
      ctx.strokeStyle=`hsl(35,25%,30%)`; ctx.lineWidth=1
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rotation)
      drawPolygon(ctx,0,0,Math.max(1,p.size*(1-t*0.2)),p.sides,0); ctx.fill(); ctx.stroke()
      ctx.restore()
      break
    }

    case 'ghost': {
      ctx.globalAlpha=1
      const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.size*(1-t*0.2))
      g.addColorStop(0,`hsla(280,80%,60%,${alpha*0.8})`)
      g.addColorStop(0.5,`hsla(280,60%,35%,${alpha*0.4})`)
      g.addColorStop(1,`hsla(280,60%,20%,0)`)
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(p.x,p.y,p.size*(1-t*0.2),0,Math.PI*2); ctx.fill()
      break
    }

    case 'dragon': {
      const hue = 240 + t*30, lit = 50-t*20
      ctx.shadowBlur=30; ctx.shadowColor=`hsl(${hue},100%,60%)`
      ctx.fillStyle=`hsl(${hue},100%,${lit+10}%)`
      ctx.beginPath(); ctx.arc(p.x,p.y,Math.max(0.5,p.size*(1-t*0.6)),0,Math.PI*2); ctx.fill()
      break
    }

    case 'dark': {
      ctx.globalAlpha=1
      const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.size)
      g.addColorStop(0,`hsla(270,80%,22%,${alpha})`); g.addColorStop(1,`hsla(270,80%,5%,0)`)
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2); ctx.fill()
      break
    }

    case 'steel': {
      ctx.shadowBlur=20; ctx.shadowColor='#ddeeff'
      ctx.fillStyle=`hsl(210,30%,${75+t*20}%)`
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rotation)
      ctx.fillRect(-p.size,- p.size*0.4, p.size*2, p.size*0.8)
      ctx.restore()
      break
    }

    case 'fairy': {
      const ts = p.size*(1+Math.sin(p.twinkle)*0.25)*(1-t*0.3)
      ctx.shadowBlur=18; ctx.shadowColor='#ffaaee'
      ctx.fillStyle=`hsl(${320-t*20},100%,${70+t*10}%)`
      if(p.isStar){ drawStar(ctx,p.x,p.y,Math.max(1,ts),4); ctx.fill() }
      else { ctx.beginPath(); ctx.arc(p.x,p.y,Math.max(0.5,ts*0.55),0,Math.PI*2); ctx.fill() }
      break
    }

    case 'blood': {
      ctx.shadowBlur=6; ctx.shadowColor='#ff2200'
      ctx.fillStyle=`hsl(355,90%,${38-t*15}%)`
      ctx.beginPath(); ctx.ellipse(p.x,p.y+p.size*0.5,p.size*0.55,p.size*1.6,0,0,Math.PI*2); ctx.fill()
      break
    }

    case 'normal': {
      ctx.fillStyle=`hsl(50,20%,${70-t*20}%)`
      ctx.beginPath(); ctx.arc(p.x,p.y,Math.max(0.5,p.size*(1-t*0.3)),0,Math.PI*2); ctx.fill()
      break
    }
  }
  ctx.restore()
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function HoverEffect({ effect, active }) {
  const canvasRef = useRef(null)
  const activeRef = useRef(active)
  const frameRef  = useRef(null)
  const stateRef  = useRef({ particles: [], opacity: 0 })

  useEffect(() => { activeRef.current = active }, [active])

  useEffect(() => {
    if (!effect || effect === 'none') return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const cfg = CONFIGS[effect]
    if (!cfg) return

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)

    const S = stateRef.current
    S.particles = []; S.opacity = 0

    for (let i = 0; i < cfg.init; i++) {
      const p = makeParticle(effect, canvas.width, canvas.height)
      if (p) { p.life = Math.floor(Math.random() * p.maxLife * 0.5); S.particles.push(p) }
    }

    function loop() {
      const W = canvas.width, H = canvas.height
      S.opacity = activeRef.current ? Math.min(1, S.opacity+0.06) : Math.max(0, S.opacity-0.05)
      canvas.style.opacity = S.opacity

      if (S.opacity > 0) {
        ctx.clearRect(0,0,W,H)
        ctx.fillStyle = cfg.tint; ctx.fillRect(0,0,W,H)

        if (activeRef.current) {
          for (let i=0; i<cfg.spawn; i++) {
            if (S.particles.length < 250) {
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
    return () => { cancelAnimationFrame(frameRef.current); window.removeEventListener('resize', resize); S.particles = [] }
  }, [effect])

  if (!effect || effect === 'none') return null

  return (
    <canvas
      ref={canvasRef}
      style={{ position:'fixed', inset:0, width:'100vw', height:'100vh', pointerEvents:'none', zIndex:50, opacity:0 }}
    />
  )
}
