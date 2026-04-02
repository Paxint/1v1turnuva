import { useEffect, useRef, useState } from 'react'

const COLORS = [
  { border: '#53fc18', shadow: 'rgba(83,252,24,0.5)'   }, // pax
  { border: '#00c2ff', shadow: 'rgba(0,194,255,0.5)'   }, // raku
  { border: '#d42020', shadow: 'rgba(212,32,32,0.5)'   }, // redjangu
]

export default function CursorGlow() {
  const dotRef  = useRef(null)
  const posRef  = useRef({ x: -200, y: -200 })
  const [idx,     setIdx]     = useState(0)
  const [visible, setVisible] = useState(false)
  const [fading,  setFading]  = useState(false)

  // Mouse takibi
  useEffect(() => {
    const onMove = (e) => {
      posRef.current = { x: e.clientX, y: e.clientY }
      setVisible(true)
    }
    const onLeave = () => setVisible(false)
    window.addEventListener('mousemove', onMove)
    document.addEventListener('mouseleave', onLeave)
    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  // Pozisyon animasyonu (rAF)
  useEffect(() => {
    let raf
    const tick = () => {
      if (dotRef.current) {
        dotRef.current.style.left = posRef.current.x + 'px'
        dotRef.current.style.top  = posRef.current.y + 'px'
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  // Renk döngüsü — 2 saniyede bir fade out → renk değiş → fade in
  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true)
      setTimeout(() => {
        setIdx(i => (i + 1) % COLORS.length)
        setFading(false)
      }, 500)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  // Dokunmatik cihazlarda gösterme
  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) return null

  const { border, shadow } = COLORS[idx]

  return (
    <div
      ref={dotRef}
      style={{
        position:      'fixed',
        pointerEvents: 'none',
        zIndex:        9999,
        width:         18,
        height:        18,
        borderRadius:  '50%',
        border:        `1.5px solid ${border}`,
        boxShadow:     `0 0 6px ${shadow}, 0 0 14px ${shadow}`,
        transform:     'translate(-50%, -50%)',
        opacity:       !visible || fading ? 0 : 0.85,
        transition:    'opacity 0.5s ease, border-color 0.5s ease, box-shadow 0.5s ease',
        borderColor:   border,
      }}
    />
  )
}
